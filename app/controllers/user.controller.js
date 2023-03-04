// return public and protected content
// four functions:
    // "/api/test/all" for public access
    // "/api/test/user" for student users
    // "/api/test/tutor" for tutor users

exports.allAccess = (req, res) => {
    res.status(200).send("Public content.");
};

exports.userBoard = (req, res) => {
    res.status(200).send("User content.");
};

exports.tutorBoard = (req, res) => {
    res.status(200).send("Tutor content.");
};