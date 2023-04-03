// GET public and protected resources

const auth = require("../middlewares/authJwt");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/", controller.searchTutor);

    app.get("/student-signup", (req,res)=>{
        res.render("student-signup")
    });
    
    app.get("/student-login", (req,res)=>{
        res.render("student-login")
    });
    
    app.get("/tutor-signup", (req,res)=>{
        res.render("tutor-signup")
    });
    
    app.get("/tutor-login", (req,res)=>{
        res.render("tutor-login")
    });

    app.get("/home", auth.authJwt, controller.searchTutorHome);

    app.get("/home-tutor", auth.authJwt, (req,res)=>{
        res.render("home-authenticated-tutor")
    });

    app.get("/appointment", (req,res)=>{
        res.render("appointment")
    });

    app.get("/logout", (req,res)=>{
        res.redirect("/")
    });
};
