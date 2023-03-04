// handle signup, signin, and signout actions

const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Tutor = db.tutor;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.studentSignup = (req, res) => {
    const user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    db.collection('users').insertOne([user]);
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

        if (!user) {
            return res.status(404).send({ message: "User not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid password!"});
        }

        var token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
        });

        req.session.token = token;

        res.status(200).send({
            id: user._id,
            firstName: user.firstName,
            email: user.email,
        });
    });
};

exports.tutorSignup = (req, res) => {
    const tutor = new Tutor({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        subjects: req.body.subjects,
        password: bcrypt.hashSync(req.body.password, 8),
    });

    db.collection('tutors').insertOne([tutor]);
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

        if (!tutor) {
            return res.status(404).send({ message: "Tutor not found." });
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            tutor.password
        );

        if (!passwordIsValid) {
            return res.status(401).send({ message: "Invalid password!"});
        }

        var token = jwt.sign({ id: tutor.id }, config.secret, {
            expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
        });

        req.session.token = token;

        res.status(200).send({
            id: tutor._id,
            firstName: tutor.firstName,
            email: tutor.email,
        });
    });
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        return res.status(200).send({ message: "Successfully signed out."});
    } catch (err) {
        this.next(err);
    }
};