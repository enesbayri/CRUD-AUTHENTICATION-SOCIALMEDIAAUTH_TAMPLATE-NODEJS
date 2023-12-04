const express =require('express');


const hataYakalayici=(hata,istek,cevap,next)=>{
    cevap.render("anaSayfa",{icerik:hata.response});
    console.log(hata);
}

module.exports=hataYakalayici;