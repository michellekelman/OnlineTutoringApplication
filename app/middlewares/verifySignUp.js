// check duplicate Email

const db = require("../models");
const User = db.user;
const Tutor = db.tutor;

// check duplications for email
checkDuplicateEmailStudent = (req, res, next) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        if (user != null) {
            return res.status(400).send({ error: "Failed! Email is already in use!" });
        }
    });
    next();
};

const verifyStudentSignUp = {
    checkDuplicateEmailStudent,
};

checkDuplicateEmailTutor = (req, res) => {
    Tutor.findOne({
        email: req.body.email
    }).exec((err, tutor) => {
        if (err) {
            res.status(500).send({ error: err });
        }
        if (tutor) {
            res.status(400).send({ error: "Failed! Email is already in use!" });
        }
    });
};

const verifyTutorSignUp = {
    checkDuplicateEmailTutor,
};

module.exports = {
    verifyStudentSignUp,
    verifyTutorSignUp
};