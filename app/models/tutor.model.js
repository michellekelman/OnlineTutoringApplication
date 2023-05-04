// represents tutors collections in MongoDB database

// after initializing Mongoose, we don't need to write CRUD functions because Mongoose supports all of them
    // create a new Tutor: object.save()
    // find a Tutor by id: Tutor.findById(id)
    // find a Tutor by email: Tutor.findOne({ email: ... })

    const mongoose = require("mongoose");

    const Tutor = mongoose.model(
        "Tutor",
        new mongoose.Schema({
            firstName: {
                type: String,
                required: true
            },
            lastName: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
            aboutMe: String,
            profilePic: String,
            subjects: [String],
            availability: [{day: String, start: String, end: String, start24: String, end24: String}],
            tutoringHours: Number
        })
    );
    
    module.exports = Tutor;