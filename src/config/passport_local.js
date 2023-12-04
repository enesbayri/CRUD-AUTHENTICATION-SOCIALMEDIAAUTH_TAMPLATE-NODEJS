const LocalStrategy=require("passport-local").Strategy;     //giriş stratejisini bu fonk. ile belirliyorsun(email ile mi,google ile mi vs)
const model = require('../models')
const bcrypt=require('bcrypt')


module.exports=function (passport){
    const options={
        usernameField:'email',     //formdaki inputun name i verilir buraya (biz kullanıcı adı yerine maille giriyoruz)
        passwordField:'sifre'
    };
    //done() yapısı=>  done( hata , kullanıcı bilgisi , gönderilmek isteyen mesaj vs.)
    passport.use(new LocalStrategy( options , async(email,sifre,done)=>{
        try {
            const bulunanKisi= await model.Users.findOne({where:{email:email}});  

            
            if(bulunanKisi==null){
                return done(null,false, {message:'E-mail YADA Şifre HATALIDIR!'}); //hata mesajını cokie ye message başlığıyla gönderir biz ordan çekip kullanıcaz
            }
            else if(bulunanKisi.dataValues.emailaktif==0){
                return done(null,false, {message:'Lütfen önce Mailinizi ONAYLAYIN!!!'}); //mail onaylımı kontrolü
            }else{
                bcrypt.compare(sifre, bulunanKisi.dataValues.sifre, function(err, res) {
                    if(res){
                        return done(null, bulunanKisi);
                    }
                    else{
                        return done(null,false, {message:'E-mail YADA Şifre HATALIDIR!'});
                    }
                });
            }
            
            

        } catch (error) {
            return done(error);
        }
    }));

    passport.serializeUser(function(user, cb) {
        process.nextTick(function() {
          cb(null, { id: user.id, username: user.username });
        });
      });
      
      passport.deserializeUser(function(user, cb) {
        process.nextTick(function() {
            const users=model.Users.findOne({where:{id:user.id}}).then((row)=>{

                const user=row.dataValues;

                //istek.user diyip kullanıcı bilgisine erişilebilmesini sağlar.
                return cb(null, user);
            });

            //üstteki yerine direk böyle yapsak istek.user de sadece id bilgisini tutar.
            //return cb(null, user);
            
        });
      });




}
