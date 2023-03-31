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

    app.post("/student-signup", controller.studentSignup);

    app.post("/student-login", controller.studentSignin);

    app.post("/tutor-signup", controller.tutorSignup);

    app.post("/tutor-login", controller.tutorSignin);

    app.post("/profile", controller.studentProfile);

    app.post("/tutorProfile", controller.tutorProfile);
    
    app.post("/searchTutor", async (req,res) => {
        const queryString = req.body.query
        const queryStrings = queryString.split(" ")
        allFirst = []
        allLast = []
        allSubject = []
        queryStrings.forEach(element => {
            allFirst.push({firstName : {$regex : String(element), $options : "i"}})
            allLast.push({lastName : {$regex : String(element), $options : "i"}})
            allSubject.push({subjects : [{$regex : String(element), $options : "i"}]})
        });
        const allTutors = await Tutor.find({$or : allSubject, $or : allFirst, $or : allLast})
        if(!allTutors || allTutors.length === 0) res.status(400).send({error : "No tutor was found"})
        res.status(200).send(allTutors)
    })

    app.post("/logout", controller.signout);
}
