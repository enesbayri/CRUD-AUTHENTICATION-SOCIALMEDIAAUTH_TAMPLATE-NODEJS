


const yonetimPaneldenErisimKontrol=(istek,cevap,next)=>{
    if(istek.isAuthenticated()){
        cevap.render('yonetimAnaSayfa',{layout:"./layout/yonetim-layout.ejs",mesaj:`Zaten giriş yaptınız!!!`,});
    }else{
        next()
    }
}

module.exports=yonetimPaneldenErisimKontrol;