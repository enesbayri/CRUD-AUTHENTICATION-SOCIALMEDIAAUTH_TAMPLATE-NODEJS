const router=require('express').Router();
const yonetimController=require("../contollers/yonetimController");
const authMiddleware=require('../middleware/authMiddleware');
const multerConfig=require('../config/multer_config');

router.get('/', authMiddleware ,yonetimController.anaSayfaKarsilama);

router.get('/profil', authMiddleware ,yonetimController.profileEditpage);

//multer config middleware ile controller arasına yazılır. Yani giriş yapılmışmı kontrolü çalışır sonra multer config çalışır
//en son yonetimController çalışır yani sırasıyla çalışır router içine verilenler
//multerconfig.single tek resim yükleneceği zaman kullanılır. çoklu resim için multerconfig.array() gibi bir yapı kullanılır(detayına npm multer den bakabilirsin)
//multer.config("buraya istek gönderirkenki formun içindeki input type ı "file" olan inputun "name" i yazılır.")
router.post('/profil-guncelle', authMiddleware , multerConfig.single('resim') ,yonetimController.profilguncelle);


module.exports=router;