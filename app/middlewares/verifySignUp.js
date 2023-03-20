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
            res.status(500).send({ error: err });
            return;
        }
        else if (user != null) {
            res.status(401).send({ error: "Failed! Email is already in use!" });
            return;
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
            return;
        }
        else if (tutor) {
            res.status(401).send({ error: "Failed! Email is already in use!" });
            return;
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