require("dotenv").config()
const express = require('express');

const cors = require('cors');
const morgan = require('morgan');
const cookieParser =require("cookie-parser")
const app = express();
app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');
app.use(cookieParser())
const {checkUser} =require("./middleware/authMiddleware")



// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(checkUser)
const userRoutes=require("./routes/userRoutes")
app.use("/user",userRoutes);

const postRoutes=require("./routes/postRoutes")
app.use("/post",postRoutes)

app.use(express.urlencoded({ extended: true }));

// Test ruta
app.get('/', (req, res) => {
    if(res.locals.user){
        return res.redirect("/post/dashboard")
    }
    res.render("homepage")
});




// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));