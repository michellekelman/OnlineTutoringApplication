// verify Token 

const db = require("../models");
const User = db.user;
const Tutor = db.tutor;
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

module.exports.authJwtUser = function(req, res, next) {
    let token = req.session.token;

    if (!token) {
        const error = "Unauthorized! Please login or create an account to access."
        return next(error);
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return next(err);
        }
        else {
            if (decoded === null) {
                const error = "Unauthorized! Please login or create an account to access."
                return next(error);
            }
            else {
                const decoded = jwt.verify(req.session.token, config.secret).id;
                    User.findOne({
                        _id: decoded,
                    })
                    .exec((err, user) => {
                        if (err) {
                            return next(err);
                        }
                        else if (!user) {
                            const error = "Unauthorized! Please login or create an account to access."
                            return next(error);
                        }
                        else {
                            return next();
                        }
                    });
            }
        }
    });
};

module.exports.authJwtTutor = function(req, res, next) {
    let token = req.session.token;

    if (!token) {
        const error = "Unauthorized! Please login or create an account to access."
        return next(error);
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return next(err);
        }
        else {
            if (decoded === null) {
                const error = "Unauthorized! Please login or create an account to access."
                return next(error);
            }
            else {
                const decoded = jwt.verify(req.session.token, config.secret).id;
                    Tutor.findOne({
                        _id: decoded,
                    })
                    .exec((err, tutor) => {
                        if (err) {
                            return next(err);
                        }
                        else if (!tutor) {
                            const error = "Unauthorized! Please login or create an account to access."
                            return next(error);
                        }
                        else {
                            return next();
                        }
                    });
            }
        }
    });
};