// check duplicate Email

const db = require("../models");
const User = db.user;
const Tutor = db.tutor;

// check duplications for email
checkDuplicateEmailStudent = (req, res) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (user) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
            return;
        }
    });
};

const verifyStudentSignUp = {
    checkDuplicateEmailStudent,
};

checkDuplicateEmailTutor = (req, res) => {
    Tutor.findOne({
        email: req.body.email
    }).exec((err, tutor) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (tutor) {
            res.status(400).send({ message: "Failed! Email is already in use!" });
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