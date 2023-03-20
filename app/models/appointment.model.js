// represents appointments collections in MongoDB database

// after initializing Mongoose, we don't need to write CRUD functions because Mongoose supports all of them
    // create a new Appointment: object.save()
    // find an Appointment by id: Appointment.findById(id)
    // find a Appointment by date: Appointment.findOne({ date: ... })

    const mongoose = require("mongoose");

    const Appointment = mongoose.model(
        "Appointment",
        new mongoose.Schema({
            userFirstName: {
                type: String,
                required: true
            },
            userLastName: {
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
            subject: {
                type: String,
                required: true
            },
            startTime: {
                type: String,
                required: true
            },
            endTime: {
                type: String,
                required: true
            },
            meetingLink: String
        })
    );
    
    module.exports = Appointment;