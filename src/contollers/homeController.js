const dotenv=require('dotenv').config();

//validation middleware ile validation yapabilmek için
const { validationResult } = require("express-validator");

//giriş yapma kontrolü için
const passport = require('passport');
require('../config/passport_local')(passport);  //Giriş strategy burda yazılıymış gibi olur.

//giriş yaparken email kontrolü ,mail gönderme , jwt ve şifre bcrypt için
const bcrypt =require('bcrypt');
const nodemailer=require('nodemailer');
const jwt=require('jsonwebtoken');


//user model ile veritabanı işlemleri için
const model = require('../models')

const anaSayfaKarsilama=(istek,cevap,next)=>{
    try {
        istek.session.messages=[];  //başarılı işlemde cokie mesajlarını sıfırlar
        if(istek.session.sayac){
            istek.session.sayac++;
        }else{
            istek.session.sayac=1;
        }
        cevap.render('anaSayfa',{mesaj:`${process.env.PORT} port serverimize HOŞGELDİNİZ!`,sayac:istek.session.sayac});
    } catch (hata) {
        next(hata);
    }
}
const loginPage=(istek,cevap,next)=>{
    try {
        if(!istek.session.messages){
            istek.session.messages=[];
        }
        cevap.render('login',{layout:"./layout/kullanici-layout.ejs", messages:istek.session.messages});
    } catch (hata) {
        next(hata);
    }
}
const registerPage=(istek,cevap,next)=>{
    try {
        const hatalar=[];
        cevap.render('register',{layout:"./layout/kullanici-layout.ejs",hatalar});
    } catch (hata) {
        next(hata);
    }
}

const forgotPasswordPage=(istek,cevap,next)=>{
    try {
        cevap.render('forgot-password',{layout:"./layout/kullanici-layout.ejs"});
    } catch (hata) {
        next(hata);
    }
}

const login=(istek,cevap,next)=>{
    try {
        //manuel login yapma ve yönlendirmesi
        /*const userControl=model.Users.findOne({where:{email:istek.body.email}}).then((row)=>{
            if(row!=null){
                if(row.dataValues.sifre==istek.body.sifre){
                    cevap.render('anaSayfa',{mesaj:"Tebrikler Giriş başarılı!"})
                }
                else{
                    cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"E-mail YADA Şifre hatalıdır!"})
                }
            }else{
                cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"E-mail YADA Şifre hatalıdır!"})
            }
        }); */

        //passport-local ile username-passport strategy ile giriş  VE ÜSTTE PASSPORT_LOCAL.JS DOSYASINI BURDAYMIŞ GİBİ REQUİRE ET 
        istek.session.messages=[]; //önceki cokie mesajlarını sıfırlar yeni hata verirse diye
        passport.authenticate('local', {
            successRedirect: '/yonetim',
            failureRedirect: '/login',
            failureMessage:true,
            
          })(istek,cevap,next);

    } catch (hata) {
        next(hata);
    }
}
const register=(istek,cevap,next) => {
    try {
        const hatalar=validationResult(istek);
        if(!hatalar.isEmpty()){
            let formValues={};
            hatalar.array().forEach(hata => {
                const deger=hata.param;
                formValues[deger]=hata.param;//hata olan form elemanlarının adlarını buraya doldurduk
            });
            //böylelikle form inputlarının value değerlerini verirken o inputun name i formValues objesinde varsa oraya hatalı bilgi
            //girildiği için value olarak " " gireriz. name i formValues de yoksa demekki onda hata yok onun valuesini 
            //gelenValue. diyip input adını verip valuesinin tutulmasını sağlarız diğer hataların düzeltilmesi için 
            cevap.render('register',{layout:"./layout/kullanici-layout.ejs",hatalar:hatalar.array(),formValues,gelenValues:istek.body});
        }else{
            const mailControl=model.Users.findOne({where:{email:istek.body.email}}).then((row)=>{
                if(row==null){
                    bcrypt.hash(istek.body.sifre,10).then((hashSifre)=>{
                        const newUser=model.Users.build({
                            ad:istek.body.ad,
                            soyad:istek.body.soyad,
                            email:istek.body.email,
                            sifre:hashSifre,
                           
                        });
                        newUser.save().then(async(rows)=>{
                            //jwt işlemi (oluşturma)
                            const jwtBilgileri={id:newUser.id, email:newUser.email}
                            const jwtToken=jwt.sign(jwtBilgileri,process.env.SECRET_JWT_KEY,{expiresIn:"1d"});

                            //mail gönderme işlemi
                            
                            const url=process.env.WEBSITE_URL+ "verify?id=" +jwtToken;

                            let transporter=nodemailer.createTransport({
                                service: 'gmail',
                                auth:{
                                    user:process.env.EMAIL,
                                    pass:process.env.SIFRE
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });
                        

                            await transporter.sendMail({
                                from: 'NODEJS YONETİM PANELİ <info@paneliyonetim.com>',
                                to: newUser.email,
                                subject:'Emailinizi lütfen onaylayın!',
                                text:"Emailinizi onaylamak için şu linki tıklayabilirsiniz: "+url,
                            },(err,info)=>{
                                if(err){
                                    console.log(err);
                                }
                                console.log('mail gonderildi!');
                                transporter.close();
                            });
                            

                            cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msg:"Kayıt başarılı! Mailinizi kontrol ediniz..."});
                        })
                        
                    })
                }else if(row.dataValues.emailaktif==0){
                    const user=model.Users.destroy({
                        where:{
                            id:row.dataValues.id,
                        }
                    }).then((rows)=>{console.log("silme basarili")});

                    //şifre hashleme ile veritabanına kayıt
                    bcrypt.hash(istek.body.sifre,10).then((hashSifre)=>{
                        const newUser=model.Users.build({
                            ad:istek.body.ad,
                            soyad:istek.body.soyad,
                            email:istek.body.email,
                            sifre:hashSifre,
                           
                        });
                        newUser.save().then(async(rows)=>{
                            //jwt işlemi (oluşturma)
                            const jwtBilgileri={id:newUser.id, email:newUser.email}
                            const jwtToken=jwt.sign(jwtBilgileri,process.env.SECRET_JWT_KEY,{expiresIn:"1d"});

                            //mail gönderme işlemi
                            
                            const url=process.env.WEBSITE_URL+ "verify?id=" +jwtToken;

                            let transporter=nodemailer.createTransport({
                                service: 'gmail',
                                auth:{
                                    user:process.env.EMAIL,
                                    pass:process.env.SIFRE
                                },
                                tls: {
                                    rejectUnauthorized: false
                                }
                            });
                        

                            await transporter.sendMail({
                                from: 'NODEJS YONETİM PANELİ <info@paneliyonetim.com>',
                                to: newUser.email,
                                subject:'Emailinizi lütfen onaylayın!',
                                text:"Emailinizi onaylamak için şu linki tıklayabilirsiniz: "+url,
                            },(err,info)=>{
                                if(err){
                                    console.log(err);
                                }
                                console.log('mail gonderildi!');
                                transporter.close();
                            });
                            

                            cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msg:"Kayıt başarılı! Mailinizi kontrol ediniz..."});
                        })
                        
                    })
                    
                }
                else{
                    cevap.render('register',{layout:"./layout/kullanici-layout.ejs",hatalar:[{msg:'Bu E-mail daha önce kullanılmıştır! Lütfen başka bir e-mail adresi giriniz!'}]});
                }

            });
            
        }
        
    } catch (hata) {
        next(hata);
    }
}
const forgotPassword= async(istek,cevap,next)=>{
    try {
        const user=await model.Users.findOne({where:{email:istek.body.email}});
        if(user==null){
            cevap.render('forgot-password',{layout:"./layout/kullanici-layout.ejs",msgDanger:'E-mail sistemde kayıtlı değildir!'});
        }else if(user.dataValues.emailaktif==0){
            cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"Lütfen önce mail adresinizi onaylayın!!!"});
        }
        else{
            //jwt oluşturma:
            const jwtBilgileri={
                id:user.dataValues.id,
                email:user.dataValues.email,
            }

            const jwtToken=jwt.sign(jwtBilgileri,process.env.SECRET_JWT_KEY,{expiresIn:"5m"});

            ////mail gönderme


            const url=process.env.WEBSITE_URL+ "passwordverify?id=" +jwtToken;

            let transporter=nodemailer.createTransport({
                service: 'gmail',
                auth:{
                    user:process.env.EMAIL,
                    pass:process.env.SIFRE
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
        

            await transporter.sendMail({
                from: 'NODEJS YONETİM PANELİ <info@paneliyonetim.com>',
                to: user.email,
                subject:'GÜVENLİĞİNİZ İÇİN KİMSEYLE PAYLAŞMAYIN!',
                text:"Az önce şifrenizi yenilemek için bizden yardım istediniz. Eğer böyle bir talepte bulunmadıysanız hiçbir şey yapmanıza gerek yoktur.(Bu link 5 DK geçerli olacaktır)Bu talep size aitse ŞİFRENİZİ YENİLEMEK İÇİN TIKLAYIN: "+url,
            },(err,info)=>{
                if(err){
                    console.log(err);
                }
                console.log('mail gonderildi!');
                transporter.close();
            });



            cevap.render('login',{layout:"./layout/kullanici-layout.ejs","msg":"Şifrenizi yenilemek için size bir mail gönderdik..."});
        }
    } catch (hata) {
        next(hata);
    }
}

const logout=(istek,cevap,next)=>{
    try {
        istek.logout(function(err) {
            if (err) { return next(err); }
            istek.session.destroy((error)=>{
                cevap.clearCookie('connect.sid');
                cevap.redirect('/login');
           });
          });
       
    } catch (hata) {
        next(hata);
    }
}

const mailVerify=(istek,cevap,next)=>{
    const token=istek.query.id;

    if(token){
        try {
            jwt.verify(token,process.env.SECRET_JWT_KEY,(err,decode)=>{
                if(err){
                    cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN HATALI YADA SÜRESİ DOLMUŞTUR!"});
                }else{
                    const user=model.Users.update({
                        emailaktif:1,
                        
                    },{
                        where:{
                            id:decode.id
                        }
                    }
                    
                    ).then((rows)=>{
                        cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msg:"Email onaylanmıştır! GİRİŞ YAPABİLİRSİNİZ..."});
                    })
                }
            })
        } catch (error) {
            next(error);
        }
    }else{
        cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN GİRİLMEMİŞTİR!"});
    }
}

const resetPasswordpage=async(istek,cevap,next)=>{
    const token=istek.query.id;

    if(token){
        try {
            jwt.verify(token,process.env.SECRET_JWT_KEY,(err,decode)=>{
                if(err){
                    cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN HATALI YADA SÜRESİ DOLMUŞTUR!"});
                }else{
                    cevap.render('reset-password',{layout:"./layout/kullanici-layout.ejs",token});
                }
            });
        } catch (error) {
            next(error)
        }
    }else{
        cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN GİRİLMEMİŞTİR!"});
    }
}
const resetPassword=async(istek,cevap,next)=>{
    const token=istek.body.token;

    if(token){
        try {
            jwt.verify(token,process.env.SECRET_JWT_KEY,(err,decode)=>{
                if(err){
                    cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN HATALI YADA SÜRESİ DOLMUŞTUR!"});
                }else{
                    bcrypt.hash(istek.body.sifre,10).then((hashSifre)=>{
                        const user=model.Users.update({
                            sifre:hashSifre,
                        },{
                            where:{
                                id:decode.id
                            }
                        }
                        
                        ).then((rows)=>{
                            console.log("Sifre guncelleme basarili")
                            cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msg:"Şifre başarıyla değiştirildi! GİRİŞ YAPABİLİRSİNİZ!!"});
                        })
                    });
                    
                }
            });
        } catch (error) {
            next(error)
        }
    }else{
        cevap.render('login',{layout:"./layout/kullanici-layout.ejs",msgDanger:"TOKEN HATASI!"});
    }
}

module.exports={
    anaSayfaKarsilama,
    loginPage,
    registerPage,
    forgotPasswordPage,
    login,
    register,
    forgotPassword,
    logout,
    mailVerify,
    resetPasswordpage,
    resetPassword,
}