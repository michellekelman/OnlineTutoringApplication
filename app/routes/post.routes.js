// POST signup, signin, and signout

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
    
    app.post("/student-signup", controller.studentSignup);

    app.post("/student-login", controller.studentSignin);

    app.post("/tutor-signup", controller.tutorSignup);

    app.post("/tutor-login", controller.tutorSignin);

    app.get("/make-appointment", auth.authJwt, controller.makeAppointment);

    app.post("/logout", controller.signout);
}
