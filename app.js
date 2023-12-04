const dotenv=require('dotenv').config();
const express=require('express');
const app=express();



//session işlemleri için gerekli paket
const session=require('express-session');


//giriş işlemlerini kontrol eden yardımcı paket
const passport=require('passport')



//template engine ayarları
const ejs=require('ejs');
const expressLayouts=require('express-ejs-layouts');
const path=require('path')
app.use(expressLayouts);
app.set('view engine','ejs');
app.set("views",path.resolve(__dirname,'./src/views'));

//public klasörünü statik şekilde erişilebilir yapar
app.use(express.static("public"));

//src içindeki uploadsdaki resimlere de erişebilmek için src içindeki uploads klasörünü erişilebilir yapar
app.use('/uploads',express.static(path.join(__dirname,"/src/uploads")));



//router ve middlewareler include edildi
const homeRouter=require('./src/routers/homeRouter');
const yonetimRouter=require('./src/routers/yonetimRouter');
const hataMiddleware=require("./src/middleware/hataMiddleware");



//formdan gelen değerlerin okunabilmesi için  "istek.body" şeklinde
app.use(express.json());
app.use( express.urlencoded({extended: true}) );





//veritabanına session ları kaydetmek için kullanılan paket
const MySQLStore = require('express-mysql-session')(session);



//sessionların kaydedileceği veritabanı bilgileri ve ayarları
const options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: null,
	database: 'yonetimpanelli_giris'
};
const sessionStore = new MySQLStore(options);




//işlemlerde session yapısının oluşmasını(cokie) sağlayan yapı 
app.use(session({
    secret:process.env.SECRET_SESSION,
    resave:false,
    saveUninitialized:true,
    store:sessionStore,
    cookie:{
        //maxAge:1000*15
    }
}));



//giriş işlemlerinde session yapısı kullanılmasını sağlar
app.use(passport.authenticate('session'));   



//linklere gelen istekleri kontrol eden ve ona göre yönlendiren yapı
app.use("/",homeRouter);
app.use("/yonetim",yonetimRouter);



//gelen isteklerde oluşabilecek hataları alıp yöneten yapı
app.use(hataMiddleware);




//serveri verilen portta başlatan yapı 
app.listen(process.env.PORT,()=>{
    console.log('SERVER AKTİF');
})