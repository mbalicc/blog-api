const express = require('express');
const router = express.Router();
const postController =require("../controllers/postContoller")
const {mustBeLoggedIn}=require("../middleware/authMiddleware")
const {showSinglePost} = require("../controllers/postContoller");

router.get("/createPost",mustBeLoggedIn, postController.showCreatePostForm);

router.post("/createPost", postController.createPost);

router.get("/post:id",postController.showSinglePost)

router.get("/editpost:id", mustBeLoggedIn, postController.showEditPost)
router.post("/editpost:id",mustBeLoggedIn,postController.editPost);

router.get("/dashboard",mustBeLoggedIn,postController.showDashboard)

router.post("/deletePost:id",mustBeLoggedIn,postController.deletePost);
module.exports=router;