const jwt = require('jsonwebtoken')


exports.checkUser=(req,res,next)=>{
    try{
        const decoded =jwt.verify(req.cookies.userinfo,process.env.JWTSECRET)
        req.user=decoded
    }catch (e) {
        req.user=false
        res.locals.user=false;
    }
    res.locals.user=req.user
    next()
}

exports.mustBeLoggedIn=(req,res,next)=>{
    if(res.locals.user){
        return next()
    }return res.redirect("/")
}