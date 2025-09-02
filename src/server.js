const express = require('express');

const cors = require('cors');
const morgan = require('morgan');

const app = express();
app.use(express.urlencoded({ extended: true }));
const bodyParser = require('body-parser');





// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

app.set('view engine', 'ejs');
app.use(express.static('public'));

const userRoutes=require("./routes/userRoutes")
app.use("/user",userRoutes);

app.use(express.urlencoded({ extended: true }));

// Test ruta
app.get('/', (req, res) => {
    res.render("homepage")
});



// Pokretanje servera
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));