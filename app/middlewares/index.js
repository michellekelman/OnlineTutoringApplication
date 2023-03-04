const authJwt = require("./authJwt");
const {verifyStudentSignUp, verifyTutorSignUp} = require("./verifySignUp");

module.exports = {
    authJwt,
    verifyStudentSignUp,
    verifyTutorSignUp
};