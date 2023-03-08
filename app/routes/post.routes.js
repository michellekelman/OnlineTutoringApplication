// POST signup, signin, and signout

const {verifyStudentSignUp, verifyTutorSignUp} = require("../middlewares");
const controller = require("../controllers/auth.controller");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/student-signup",
        verifyStudentSignUp.checkDuplicateEmailStudent,
        controller.studentSignup
    );

    app.post("student-login", controller.studentSignin);

    app.post(
        "/tutor-signup",
        verifyTutorSignUp.checkDuplicateEmailTutor,
        controller.tutorSignup
    );

    app.post("tutor-login", controller.tutorSignin);

    //app.post("signout", controller.signout);
}
