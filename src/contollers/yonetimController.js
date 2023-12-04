//user model ile veritabanı işlemleri için
const model = require('../models')
const path=require("path");


const anaSayfaKarsilama=(istek,cevap,next)=>{
    try {
        cevap.render('yonetimAnaSayfa',{layout:"./layout/yonetim-layout.ejs",user:istek.user});
    } catch (hata) {
        next(hata);
    }
}

const profileEditpage=async(istek,cevap,next)=>{
    try {
        
        //console.log(istek.user);    //istek.user passport_local.js dosyası deserilaze fonk. sayesinde isteklerde user bilgisini de tutar.
        //const bulunanKisi= await model.Users.findOne({where:{id:istek.user.id}}); 
        cevap.render('profile',{layout:"./layout/yonetim-layout.ejs",user:istek.user});
    } catch (hata) {
        next(hata);
    }
}

const profilguncelle=async(istek,cevap,next)=>{
    try {
        
        //console.log(istek.user);
        //const bulunanKisi= await model.Users.findOne({where:{id:istek.user.id}}); 

        //istekte gonderilen file dosya resim vs bilgisine istek.file üzerinden erişilir her zaman!!!
        const user=model.Users.update({
            ad:istek.body.ad,
            soyad:istek.body.soyad,
            avatar: istek.file==undefined ? istek.user.avatar : ("/uploads/avatars/"+istek.user.id+"_"+path.extname(istek.file.originalname))
        },{
            where:{
                id:istek.user.id
            }
        }
        
        ).then((rows)=>{console.log("guncelleme basarili")})

        cevap.redirect('/yonetim/profil');
    } catch (hata) {
        next(hata);
    }
}



module.exports={
    anaSayfaKarsilama,
    profileEditpage,
    profilguncelle,
}