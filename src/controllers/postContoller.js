const express = require('express');
const bcrypt=require('bcrypt')
const app = express();
const jwt=require('jsonwebtoken')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { sql, pool, poolConnect } = require("../db");


exports.showCreatePostForm=(req,res)=>{
res.render("createPost",{errors:[]})
}

exports.createPost=async (req,res)=>{
const errors=[];
    if(typeof req.body.title !=="string") req.body.title=""
    if(typeof req.body.body !=="string") req.body.body=""

    if (!req.body.title.trim().length) errors.push("You must enter a title!")
    if (!req.body.body.trim().length) errors.push("You must enter a body!")
    if(errors.length) return res.render("createPost",{errors})

    if(req.body.title.length<3) errors.push("Title is too short!")
    if(req.body.body.length<3) errors.push("Body is too short!")
    if(req.body.title.length>99) errors.push("Title is too long!")
    if(errors.length) return res.render("createPost",{errors})

    await poolConnect;

    const postSave=await pool.request()
        .input("title",sql.NVarChar,req.body.title)
        .input("body",sql.NVarChar, req.body.body)
        .input("id",sql.Int,   req.user.userid)
        .query('insert into posts (title,body,userid) output inserted.id values(@title,@body,@id)')

    const postID=postSave.recordset[0].id

    res.redirect(`/post/post${postID}`)

}

exports.showSinglePost=async (req,res)=>{
await  poolConnect;
const result= await pool.request()
    .input("id",sql.Int,req.params.id)
    .query(`select p.id,p.title,u.name,p.body,p.userID,
       convert(varchar,p.createdDate,104) as createdDate,
       convert(varchar,p.editedDate,104) as editedDate
from posts as p join users as u on p.userid=u.id 
where p.id=@id`)

    if(!result.recordset.length){
         return res.redirect(req.get("Referer") || "/")

    }
    res.render("singlePost",{post:result.recordset[0]})
}

exports.showEditPost= async (req,res)=>{
    await  poolConnect;
    const result= await pool.request()
        .input("id",sql.Int,req.params.id)
        .query(`select p.id,p.title,u.name,p.body,p.userID,
       convert(varchar,p.createdDate,104) as createdDate,
       convert(varchar,p.editedDate,104) as editedDate
from posts as p join users as u on p.userid=u.id 
where p.id=@id`)

    if(!result.recordset.length){
        return res.status(404).send("Post not found");
    }
    if(req.user.userid!==result.recordset[0].userID) return res.redirect(req.get("Referer") || "/")
    res.render("editPost",{post:result.recordset[0],errors:[]})
}

exports.editPost= async (req,res)=>{
    const errors=[];
    if(typeof req.body.title !=="string") req.body.title=""
    if(typeof req.body.body !=="string") req.body.body=""

    if (!req.body.title.trim().length) errors.push("You must enter a title!")
    if (!req.body.body.trim().length) errors.push("You must enter a body!")


    if(req.body.title && req.body.title.length<3) errors.push("Title is too short!")
    if(req.body.body && req.body.body.length<3) errors.push("Body is too short!")
    if(req.body.title && req.body.title.length>99) errors.push("Title is too long!")
    if (errors.length) {
        const result = await pool.request()
            .input("id", sql.Int, req.params.id)
            .query("SELECT * FROM Posts WHERE id = @id");

        return res.render("editPost", {
            post: result.recordset[0],
            errors
        });
    }
    await poolConnect;

    const postSave=await pool.request()
        .input("title",sql.NVarChar,req.body.title)
        .input("body",sql.NVarChar, req.body.body)
        .input("id",sql.Int,   req.params.id)
        .query(`update Posts
                set title=@title,body=@body,editedDate=getDate()
                where id=@id
                `)

    const postID=req.params.id

    res.redirect(`/post/post${postID}`)
}


exports.showDashboard=async (req,res)=>{
    await poolConnect;

    const result=await pool.request()
        .input("id",sql.Int,req.user.userid)
        .query(`select p.*, u.id AS userid,u.name from posts as p join users as u on p.userID=u.id where p.userID=@id order by p.createdDate desc`)

    const posts=result.recordset;

    const adminResult=await pool.request()
        .query(`select p.*, u.id as userid, u.name from posts as p join users as u on p.userID=u.id order by p.createdDate desc`)

    const allPosts=adminResult.recordset

    res.render("dashboard",{posts,allPosts})
}

exports.deletePost=async (req,res)=>{
    await poolConnect;
    const result=await  pool.request()
        .input("id",sql.Int,req.params.id)
        .query(`delete from Posts
                where id=@id
                `)
res.redirect("/")

}