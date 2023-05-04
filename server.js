// import and initialize necessary modules and routes
// listen for connections

// for building the Rest APIs
const express = require("express");
// provides Express middleware to enable CORS 
// const cors = require("cors");
// helps store session data on the client within a cookie without requiring any database/resources on the server side
const cookieSession = require("cookie-session");
// for getting database string
const dbConfig = require("./app/config/db.config");
const fileUpload = require('express-fileupload');

const app = express();
const hbs = require("hbs");

// give name of template (html) files
const path = require("path");
const templatePath = path.join(__dirname, './templates');

// connects hbs and MongoDB files
app.use(express.json());
app.use(express.static(templatePath));
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(fileUpload());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({
    extended: true
}));

app.use(
    cookieSession({
        name: "admin-session",
        secret: "COOKIE_SECRET", // should use as secret environment variable (ex. .env file) for security
        httpOnly: true // indicates that cookie is only to be sent over HTTP(S), not made available to client JavaScript
    })
);

// open Mongoose connection to MongoDB database
const db = require("./app/models");

db.mongoose
    .connect(`mongodb+srv://${dbConfig.HOST}:${dbConfig.PASS}@${dbConfig.PORT}/${dbConfig.DATABASE}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Successfully connected to MongoDB.");
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    });

// for using contains() in hbs
hbs.registerHelper('contains', function(array, value) {
    if (array.includes(value)) {
        return true;
    } else {
        return false;
    }
});

// routes

// other routes
require('./app/routes/get.routes')(app);
require('./app/routes/post.routes')(app);

app.get("/", (req, res) => {
    res.render("home");
});

app.get("*", function (req, res) {
    res.send("PAGE NOT FOUND");   
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});