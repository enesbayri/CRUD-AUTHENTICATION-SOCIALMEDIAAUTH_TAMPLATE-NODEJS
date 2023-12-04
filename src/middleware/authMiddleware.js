


const oturumKontrol=(istek,cevap,next)=>{
    if(istek.isAuthenticated()){
        next()
    }else{
        istek.session.messages=['Lütfen önce GİRİŞ YAPIN'];
        cevap.redirect('/login');
    }
}

module.exports=oturumKontrol;