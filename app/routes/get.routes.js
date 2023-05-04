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

    app.get("/search", controller.searchTutor);

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

    app.get("/home", auth.authJwtUser, controller.searchTutorHome);

    app.get("/home-search", auth.authJwtUser, controller.searchTutorHome);

    app.get("/favorites", auth.authJwtUser, controller.favoritesList);

    app.get("/profile", auth.authJwtUser, controller.studentProfile);

    app.get("/home-tutor", auth.authJwtTutor, controller.homeTutor);

    app.get("/profile-tutor", auth.authJwtTutor, controller.tutorProfile);

    app.get("/logout", (req,res)=>{
        res.redirect("/")
    });
};
