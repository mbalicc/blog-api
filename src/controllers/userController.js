const express = require('express');
const bcrypt=require('bcrypt')
const app = express();
const jwt=require('jsonwebtoken')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { sql, pool, poolConnect } = require("../db");




exports.showRegisterForm=(req,res)=>{
    res.render("register",{errors:[]})
}

exports.register= async (req,res)=>{
    const errors=[]
    if(typeof  req.body.username!=='string') req.body.username=""
    if(typeof  req.body.email!=='string') req.body.email=""
    if(typeof  req.body.password!=='string') req.body.password=""

    req.body.username=req.body.username.trim()
    if(!req.body.username.length) errors.push("You must enter username!")
    if(req.body.username && req.body.username.length<3) errors.push("Username too short!")
    if(req.body.username && req.body.username.length>20) errors.push("Username too long!")
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/ )) errors.push("Username can only contain letters and numbers")

    await poolConnect;
    const usernameResult= await pool.request()
        .input("name",sql.NVarChar,req.body.username)
        .query("Select * from Users where name=@name")
    if (usernameResult.recordset.length) errors.push("That username is already in use!")


    req.body.email=req.body.email.trim()
    if(!req.body.email.length) errors.push("You must enter an email!")
    if(req.body.email && req.body.email.length<10) {errors.push("Email too short!") ;req.body.email="" }
    if(req.body.email && req.body.email.length>80) {errors.push("Email too long!") ;req.body.email=""}
    if (req.body.email &&  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        errors.push("Email is invalid!");
    }
    const emailResult= await pool.request()
        .input("email",sql.NVarChar,req.body.email)
        .query("Select * from Users where email=@email")
    if (usernameResult.recordset.length) errors.push("That email is already in use!")



    req.body.password=req.body.password.trim()
    if(!req.body.password) errors.push("You must enter a password!")
    if(req.body.password && req.body.password.length<5) errors.push("Password too short!")
    if(req.body.password && req.body.password.length>30) errors.push("Password too long!")

    if (errors.length) return res.render("register",{errors})
    //db save
    const hashedPassword=await bcrypt.hash(req.body.password,10)
    try {
        const userSave = await pool.request()
            .input("username", sql.NVarChar, req.body.username)
            .input("password", sql.NVarChar, hashedPassword)
            .input("email", sql.NVarChar, req.body.email)
            .query(`insert into Users(name, email, password)
                    values (@username, @email, @password)
            `)
    }catch (e){ console.error("Data base error: ",e);return res.render("register",{errors:["Database error occurred!"]})}
    res.redirect("/user/login")
}

exports.showLoginForm=(req,res)=>{
    res.render("login",{errors:[]})
}

exports.login=async (req,res)=>{
    const errors=[]
    if(typeof  req.body.username!=='string') req.body.username=""
    if(typeof  req.body.password!=='string') req.body.password=""

    if(req.body.username.trim()=="") {errors.push("Invalid username / password")
        return res.render("login",{errors})
    }
    else if(req.body.password.trim()==""){ errors.push("Invalid username / password")
    return  res.render("login",{errors})
    }

        await poolConnect;
        const userResult = await pool.request()
        .input("name", sql.NVarChar, req.body.username)
        .query("Select * from Users where name=@name")
    if(!userResult.recordset.length) {errors.push("Invalid username / password")
    return res.render("login",{errors})}

    const matchOrNo=await  bcrypt.compare(req.body.password,userResult.recordset[0].password)
    if(!matchOrNo) {
        errors.push("Invalid username / password")
        return  res.render("login",{errors})
    }
    const token= jwt.sign(
        {userid:userResult.recordset[0].id,username:userResult.recordset[0].name,role:userResult.recordset[0].role},
        process.env.JWTSECRET
    )
    res.cookie('userinfo',token,{
        httpOnly:true,
        secure:false,
        sameSite:"strict",
        maxAge:1000*60*60*24
    })


    res.redirect("/")

}

exports.logout=(req,res)=>{
    res.clearCookie("userinfo")
res.redirect("/");
}

exports.showAllUsers=async (req,res)=>{
    res.render("users")
}




