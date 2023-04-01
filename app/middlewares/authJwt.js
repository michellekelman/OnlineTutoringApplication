// verify Token 

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

module.exports.authJwt = function(req, res, next) {
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
                return next();
            }
        }
    });
};