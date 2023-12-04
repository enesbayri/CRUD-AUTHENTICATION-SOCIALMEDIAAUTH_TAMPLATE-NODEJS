const {body}= require('express-validator');

const validateNewUser=()=>{
    return[
		body('email')
			.trim()   //baştaki sondaki boşlukları temizler.
			.isEmail().withMessage('Geçerli bir mail giriniz!'),

		body('sifre').trim()
			.isLength({min:6}).withMessage('Sifre en az 6 karakter olmalı!')
			.isLength({max:20}).withMessage('Sifre en fazla 20 karakter olmalı!'),

		body('ad').trim()
			.isLength({min:3}).withMessage('ad en az 3 karakter olmalı!')
			.isLength({max:30}).withMessage('ad en fazla 30 karakter olmalı!'),


		body('soyad').trim()
			.isLength({min:3}).withMessage('soyad en az 3 karakter olmalı!')
			.isLength({max:30}).withMessage('soyad en fazla 30 karakter olmalı!'),

		body('resifre').trim()
			.custom( (value,{req}) => {  //BURADA MODÜL KENDİ BİZE CUSTOM FONKSİYONU İÇİN gelen değeri ve isteği(istekteki diğer bilgilere ulaşabilmek için) verir/custom ile istediğimiz türde bir validation yazabiliriz.
				if( value!== req.body.sifre ){
					throw new Error('Sifreler aynı degil!');
				}
				return true;
			} )
        ];        
}

const loginValidation=()=>{
	return [
		body('email')
			.trim()   //baştaki sondaki boşlukları temizler.
			.isEmail().withMessage('Geçerli bir mail giriniz!'),

		body('sifre').trim()
			.isLength({min:6}).withMessage('Sifre en az 6 karakter olmalı!')
			.isLength({max:20}).withMessage('Sifre en fazla 20 karakter olmalı!'),
	];

}

module.exports={
    validateNewUser,
	loginValidation,
}