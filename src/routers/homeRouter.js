const router=require('express').Router();
const homeController=require("../contollers/homeController");
const validationMiddleware=require('../middleware/validationMiddleware');
const erisimKontrol=require('../middleware/yonetimErisimKisitlamaMiddleware');

router.get('/',homeController.anaSayfaKarsilama);

router.get('/login',erisimKontrol,homeController.loginPage);
router.get('/register',erisimKontrol,homeController.registerPage);
router.get('/forgot-password',erisimKontrol,homeController.forgotPasswordPage);

router.get("/logout",homeController.logout);

router.get('/verify',homeController.mailVerify);
router.get('/passwordverify',homeController.resetPasswordpage);

router.post('/passwordverify',homeController.resetPassword);

router.post('/login',validationMiddleware.loginValidation(),homeController.login);
router.post('/register', validationMiddleware.validateNewUser() ,homeController.register);
router.post('/forgot-password',homeController.forgotPassword);



module.exports=router;