// represents users collections in MongoDB database

// after initializing Mongoose, we don't need to write CRUD functions because Mongoose supports all of them
    // create a new User: object.save()
    // find a User by id: User.findById(id)
    // find a User by email: User.findOne({ email: ... })

const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
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
        favorites: [{type: mongoose.Types.ObjectId, ref: 'Tutor'}],
        tutoringHours: Number
    })
);

module.exports = User;