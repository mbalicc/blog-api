const express = require('express');
const router = express.Router();
const userController =require("../controllers/userController")



router.get("/register",userController.showRegisterForm);

router.post("/register",userController.register);


module.exports=router;