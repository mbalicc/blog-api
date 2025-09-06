const express = require('express');
const router = express.Router();
const userController =require("../controllers/userController")
const {mustBeLoggedIn}=require("../middleware/authMiddleware")


router.get("/register",userController.showRegisterForm);
router.post("/register",userController.register);

router.get("/login",userController.showLoginForm);
router.post("/login",userController.login);

router.get("/logout",mustBeLoggedIn, userController.logout);



module.exports=router;