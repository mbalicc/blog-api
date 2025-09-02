const express = require('express');

const app = express();
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
    if(req.body.username && req.body.username.length<3) errors.push("Username too shor!")
    if(req.body.username && req.body.username.length>20) errors.push("Username too long!")
    if(req.body.username && !req.body.username.match(/^[a-zA-Z0-9]+$/ )) errors.push("Username can only contain letters and numbers")

    await poolConnect;

    const usernameResult= await pool.request()
        .input("name",sql.NVarChar,req.body.username)
        .query("Select * from Users where name=@name")

    if (usernameResult.recordset.length) errors.push("That username is already in use!")

    if (errors.length) return res.render("register",{errors})

    res.redirect("/user/login")




}