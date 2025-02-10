const express = require("express");
const session = require("express-session");
const cors = require("cors")

require('dotenv').config()

const generateBlog = require("../routes/generateBlog");


const app = express();


app.use(cors())
app.use(session({ secret: "cat", resave: false, saveUninitialized: true, cookie: { maxAge: 3600000 } }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json())

app.use("/gen", generateBlog);


app.listen(8080, () => console.log("app listening!"));

module.exports = app