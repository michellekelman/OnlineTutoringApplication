// handle signup, signin, and signout actions

const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Tutor = db.tutor;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.studentSignup = (req, res) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else if (user != null) {

            return res.render("./student-signup", {message: "Student Sign Up failed. Email is already in use."});
        }
        else {
            const user = new User ({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                tutoringHours: 0
            });
            User.create(user);
            res.redirect("/student-login");
            //return res.status(200).json(user);
        }
    });
};

exports.studentSignin = (req, res) => {
    User.findOne({
        email: req.body.email,
    })
    .exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!user) {
            return res.render("./student-login", {message: "Student Login failed. Student account with email does not exist."});
        }
        else {
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.render("./student-login", {message: "Student Login failed. Incorrect Password."});
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
            });
            req.session.token = token;
            res.redirect("/home");
            /*return res.status(200).send({
                id: user._id,
                firstName: user.firstName,
                email: user.email,
            });
            */
        }
    });
};

exports.studentProfile = (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    User.findOne({
        _id: decoded,
    })
    .exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!user) {
            return res.render("./home", {message: "Profile does not exist."});
        }
        else {
            res.render("profile", {'userProfile' : user})
        }
    });
};

exports.tutorSignup = (req, res) => {
    Tutor.findOne({
        email: req.body.email
    }).exec((err, tutor) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        else if (tutor != null) {
            return res.render("./tutor-signup", {message: "Tutor Sign Up failed. Email is already in use."});
        }
        else {
            const {profilePic} = req.files;
            if (!profilePic) {
                return res.status(400).send({ error: "No profile picture uploaded" });
            }
            const tutor = new Tutor({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                aboutMe: req.body.aboutMe,
                profilePic: '.' + profilePic.name.split(".").pop(),
                subjects: req.body.subjects.split(", "),
                availability: req.body.availability.split(", "),
                tutoringHours: 0
            });
            Tutor.create(tutor);
            profilePic.mv(__dirname + '/../../templates/photos/' + tutor._id + tutor.profilePic);
            res.redirect("/tutor-login");
            //return res.status(200).json(tutor);
        }
    });
};

exports.tutorSignin = (req, res) => {
    Tutor.findOne({
        email: req.body.email,
    })
    .exec((err, tutor) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!tutor) {
            return res.render("./tutor-login", {message: "Tutor Login failed. Tutor account with email does not exist."});
        }
        else {
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                tutor.password
            );
            if (!passwordIsValid) {
                return res.render("./student-login", {message: "Tutor Login failed. Incorrect Password."});
            }
            var token = jwt.sign({ id: tutor.id }, config.secret, {
                expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
            });
            req.session.token = token;
            res.redirect("/home-tutor");
            /*res.status(200).send({
                id: tutor._id,
                firstName: tutor.firstName,
                email: tutor.email,
            });*/
        }
    });
};

exports.tutorProfile = (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    Tutor.findOne({
        _id: decoded,
    })
    .exec((err, tutor) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!tutor) {
            return res.render("./home-tutor", {message: "Profile does not exist."});
        }
        else {
            res.render("tutorProfile", {'tutorProfile' : tutor});
        }
    });
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        res.redirect("/");
        //return res.status(200).send({ message: "Successfully signed out."});
    } catch (err) {
        this.next(err);
    }
};

exports.searchTutor = async (req,res) => {
    const queryString = req.body.query;
    const queryStrings = queryString.split(" ");
    allFirst = [];
    allLast = [];
    allSubject = [];
    queryStrings.forEach(element => {
        allFirst.push({firstName : {$regex : String(element), $options : "i"}});
        allLast.push({lastName : {$regex : String(element), $options : "i"}});
        allSubject.push({subjects : {$regex : String(element), $options : "i"}});
    });
    const allTutors = await Tutor.find({$or: [{$or: allFirst}, {$or: allLast}, {$or: allSubject}]});
    if(!allTutors || allTutors.length === 0) {
        return res.render("home", {message: "No tutors found."});
    }
    else {
        res.render("home", {'tutors': allTutors});
        // res.status(200).send(allTutors);
    }
};