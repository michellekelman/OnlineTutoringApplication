// represents appointments collections in MongoDB database

// after initializing Mongoose, we don't need to write CRUD functions because Mongoose supports all of them
    // create a new Appointment: object.save()
    // find an Appointment by id: Appointment.findById(id)
    // find a Appointment by date: Appointment.findOne({ date: ... })

    const mongoose = require("mongoose");

    const Appointment = mongoose.model(
        "Appointment",
        new mongoose.Schema({
            userID: {
                type: mongoose.Types.ObjectId, 
                ref: 'User',
                required: true
            },
            tutorID: {
                type: mongoose.Types.ObjectId, 
                ref: 'Tutor',
                required: true
            },
            userFirstName: {
                type: String,
                required: true
            },
            userLastName: {
                type: String,
                required: true
            },
            userEmail: {
                type: String,
                required: true
            },
            tutorFirstName: {
                type: String,
                required: true
            },
            tutorLastName: {
                type: String,
                required: true
            },
            tutorEmail: {
                type: String,
                required: true
            },
            subject: String,
            day: {
                type: String,
                required: true
            },
            start: {
                type: String,
                required: true
            }, 
            end: {
                type: String,
                required: true
            },
            start24: {
                type: String,
                required: true
            }, 
            end24: {
                type: String,
                required: true
            },
            meetingLink: String
        })
    );
    
    module.exports = Appointment;