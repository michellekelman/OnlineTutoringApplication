// GET public and protected resources

const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

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
};
