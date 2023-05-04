// handle signup, signin, and signout actions
const mongoose = require('mongoose');
const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Tutor = db.tutor;
const Appointment = db.appointment;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.studentSignup = (req, res) => {
    User.findOne({
        email: req.body.email
    }).exec((err, user) => {
        if (err) {
            return res.status(500).send({ error: err });
        }
        else if (user != null) {

            return res.render("student-signup", {message: "Student Sign Up failed. Email is already in use."});
        }
        else {
            const user = new User ({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                tutoringHours: 0
            });
            User.create(user);
            res.redirect("/student-login");
            //return res.status(200).json(user);
        }
    });
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
        else if (!user) {
            return res.render("student-login", {message: "Student Login failed. Student account with email does not exist."});
        }
        else {
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );
            if (!passwordIsValid) {
                return res.render("student-login", {message: "Student Login failed. Incorrect Password."});
            }
            var token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
            });
            req.session.token = token;
            res.redirect("/home");
            /*return res.status(200).send({
                id: user._id,
                firstName: user.firstName,
                email: user.email,
            });
            */
        }
    });
};

exports.studentProfile = async (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayPastAppointments = await Appointment.find({ userID : decoded , day : {$eq : date}, end24 : {$lte : time}}).sort({start24 : 1});
    const pastAppointments = await Appointment.find({ userID : decoded , day : {$lt : date}}).sort({start24 : 1});

    var totalTime = 0;
    todayPastAppointments.forEach(element => {
        var startDate = new Date(element.day+"T"+element.start24);
        var endDate = new Date(element.day+"T"+element.end24);
        var duration = endDate - startDate;
        totalTime += (duration / (60*1000));
    });
    pastAppointments.forEach(element => {
        var startDate = new Date(element.day+"T"+element.start24);
        var endDate = new Date(element.day+"T"+element.end24);
        var duration = endDate - startDate;
        totalTime += (duration / (60*1000));
    });
    var totalHours = Math.floor(totalTime / 60);
    var totalMinutes = totalTime % 60;
    var totalStr = totalHours + " hours and " + totalMinutes + " minutes";

    User.findOne({
        _id: decoded,
    })
    .exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        } else if (!user) {
            return res.render("./home", {message: "Profile does not exist."});
        } else {
            const favoriteTutors = user.favorites
            Tutor.find({_id: {$in: favoriteTutors}})
            .exec((err, tutors) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    res.render("profile", { 'userProfile': user, 'tutors': tutors, 'hours': totalStr});
                }
            });
        }
    });
};

exports.tutorSignup = (req, res) => {
    Tutor.findOne({
        email: req.body.email
    }).exec((err, tutor) => {
        if (err) {
            res.status(500).send({ error: err });
            return;
        }
        else if (tutor != null) {
            return res.render("./tutor-signup", {message: "Tutor Sign Up failed. Email is already in use."});
        }
        else {
            var avail = [];
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const starts = ["suns", "mons", "tues", "weds", "thus", "fris", "sats"];
            const ends = ["sune", "mone", "tuee", "wede", "thue", "frie", "sate"];
            for (let i = 0; i < 7; i++) {
                var startval = req.body[starts[i]];
                var endval = req.body[ends[i]];
                if ((startval!=="") && (endval!=="")) {
                    var starthour = parseInt(startval.substring(0,2));
                    var endhour = parseInt(endval.substring(0,2));
                    var startmin = startval.substring(3,5);
                    var endmin = endval.substring(3,5);
                    var start12 = "";
                    var end12 = "";
                    // calculate 12 hour version of start
                    if (starthour == 0) {
                        start12 = "12:" + startmin + " AM";
                    }
                    else if (starthour < 12) {
                        start12 = starthour + ":" + startmin + " AM";
                    }
                    else if (starthour == 12) {
                        start12 = "12:" + startmin + " PM";
                    }
                    else {
                        start12 = (starthour-12) + ":" + startmin + " PM";
                    }
                    // calculate 12 hour version of end
                    if (endhour == 0) {
                        end12 = "12:" + endmin + " AM";
                    }
                    else if (endhour < 12) {
                        end12 = endhour + ":" + endmin + " AM";
                    }
                    else if (endhour == 12) {
                        end12 = "12:" + endmin + " PM";
                    }
                    else {
                        end12 = (endhour-12) + ":" + endmin + " PM";
                    }
                    // add to availability array
                    if (endval.localeCompare(startval)>0) {
                        avail.push({day: days[i], start: start12, end: end12, start24: startval, end24: endval});
                    }
                    else {
                        return res.render("./tutor-signup", {message: "Tutor Sign Up failed. Incorrect availability intervals."});
                    }
                }
                else if ((startval!=="") || (endval!=="")) {
                    return res.render("./tutor-signup", {message: "Tutor Sign Up failed. Incomplete availability intervals."});
                }
            }
            if (avail.length==0) {
                return res.render("./tutor-signup", {message: "Tutor Sign Up failed. No availability entered."});
            }
            const {profilePic} = req.files;
            if (!profilePic) {
                return res.status(400).send({ error: "No profile picture uploaded" });
            }
            const tutor = new Tutor({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 8),
                aboutMe: req.body.aboutMe,
                profilePic: '.' + profilePic.name.split(".").pop(),
                subjects: req.body.subjects.split(", "),
                //availability: req.body.availability.split(", "),
                availability: avail,
                tutoringHours: 0
            });
            Tutor.create(tutor);
            profilePic.mv(__dirname + '/../../templates/photos/' + tutor._id + tutor.profilePic);
            res.redirect("/tutor-login");
            //return res.status(200).json(tutor);
        }
    });
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
        else if (!tutor) {
            return res.render("tutor-login", {message: "Tutor Login failed. Tutor account with email does not exist."});
        }
        else {
            var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                tutor.password
            );
            if (!passwordIsValid) {
                return res.render("tutor-login", {message: "Tutor Login failed. Incorrect Password."});
            }
            var token = jwt.sign({ id: tutor.id }, config.secret, {
                expiresIn: 86400, // token lasts for 24 hours (or signout, whichever comes first)
            });
            req.session.token = token;
            res.redirect("/home-tutor");
            /*res.status(200).send({
                id: tutor._id,
                firstName: tutor.firstName,
                email: tutor.email,
            });*/
        }
    });
};

exports.tutorProfile = async (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;

    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayPastAppointments = await Appointment.find({ tutorID : decoded , day : {$eq : date}, end24 : {$lte : time}}).sort({start24 : 1});
    const pastAppointments = await Appointment.find({ tutorID : decoded , day : {$lt : date}}).sort({start24 : 1});
    
    var totalTime = 0;
    todayPastAppointments.forEach(element => {
        var startDate = new Date(element.day+"T"+element.start24);
        var endDate = new Date(element.day+"T"+element.end24);
        var duration = endDate - startDate;
        totalTime += (duration / (60*1000));
    });
    pastAppointments.forEach(element => {
        var startDate = new Date(element.day+"T"+element.start24);
        var endDate = new Date(element.day+"T"+element.end24);
        var duration = endDate - startDate;
        totalTime += (duration / (60*1000));
    });
    var totalHours = Math.floor(totalTime / 60);
    var totalMinutes = totalTime % 60;
    var totalStr = totalHours + " hours and " + totalMinutes + " minutes";

    Tutor.findOne({
        _id: decoded,
    })
    .exec((err, tutor) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!tutor) {
            return res.render("home-authernticated-tutor", {message: "Profile does not exist."});
        }
        else {
            tutor.tutoringHours = totalTime;
            res.render("profile-tutor", {'tutorProfile' : tutor, 'hours': totalStr});
        }
    });
};

exports.signout = async (req, res) => {
    try {
        req.session = null;
        res.redirect("/");
        //return res.status(200).send({ message: "Successfully signed out."});
    } catch (err) {
        this.next(err);
    }
};

exports.searchTutor = async (req,res) => {
    const queryString = req.query.query;
    var queryStrings = [];
    if (queryString != null) {
        queryStrings = queryString.split(" ");
    }
    allFirst = [];
    allLast = [];
    allSubject = [];
    queryStrings.forEach(element => {
        allFirst.push({firstName : {$regex : String(element), $options : "i"}});
        allLast.push({lastName : {$regex : String(element), $options : "i"}});
        allSubject.push({subjects : {$regex : String(element), $options : "i"}});
    });
    const allTutors = await Tutor.find({$or: [{$or: allFirst}, {$or: allLast}, {$or: allSubject}]});
    if(!allTutors || allTutors.length === 0) {
        return res.render("home", {message: "No tutors found."});
    }
    else {
        res.render("home", {'tutors': allTutors});
        // res.status(200).send(allTutors);
    }
};

exports.searchTutorHome = async (req,res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;

    // loads upcoming appointments
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayAppointments = await Appointment.find({ userID : decoded , day : {$eq : date}, end24 : {$gte : time}}).sort({start24 : 1});
    const appointments = await Appointment.find({ userID : decoded , day : {$gt : date}}).sort({day : 1, start24 : 1});
    
    // reformat appointment dates
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    todayAppointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    appointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });

    var message2 = "";
    if ((!todayAppointments || todayAppointments.length === 0) && (!appointments || appointments.length === 0)) {
        message2 = "No appointments scheduled. To schedule an appointment, select a tutor above.";
    }
    
    const queryString = req.query.query;
    var queryStrings = [];
    if (queryString != null) {
        queryStrings = queryString.split(" ");
    }
    allFirst = [];
    allLast = [];
    allSubject = [];
    queryStrings.forEach(element => {
        allFirst.push({firstName : {$regex : String(element), $options : "i"}});
        allLast.push({lastName : {$regex : String(element), $options : "i"}});
        allSubject.push({subjects : {$regex : String(element), $options : "i"}});
    });
    const allTutors = await Tutor.find({$or: [{$or: allFirst}, {$or: allLast}, {$or: allSubject}]});
    if(!allTutors || allTutors.length === 0) {
        // return res.render("home-authenticated", {message: "No tutors found."});
        return res.render("home-authenticated", {'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message1': "No tutors found.", 'message2': message2})
    }
    else {
        User.findOne({
            _id: decoded,
        })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            } else {
                //res.status(200).send(appointments);
                res.render("home-authenticated", {'tutors': allTutors, 'allFavorites': user.favorites, 'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message2': message2});
            }
        });
    }
};

exports.modifyFavoritesSearch = (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    const tutorId = req.body.tid;
    const tutorObjectId = mongoose.Types.ObjectId(tutorId); // convert tutorId to ObjectId
    User.findOne({ _id: decoded })
      .exec((err, user) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        const favorites = user.favorites || [];
        const index = favorites.indexOf(tutorObjectId); // use the ObjectId in the favorites array
        if (index === -1) {
          favorites.push(tutorObjectId); // use the ObjectId in the favorites array
        } else {
          favorites.splice(index, 1);
        }
        User.updateOne(
          { _id: decoded },
          { $set: { favorites: favorites } }
        ).exec((err, result) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            res.redirect("/home");
        });
    });
};

exports.modifyFavoritesList = (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    const tutorId = req.body.tid;
    const tutorObjectId = mongoose.Types.ObjectId(tutorId); // convert tutorId to ObjectId
    User.findOne({ _id: decoded })
      .exec((err, user) => {
        if (err) {
          return res.status(500).json({ error: err });
        }
        const favorites = user.favorites || [];
        const index = favorites.indexOf(tutorObjectId); // use the ObjectId in the favorites array
        if (index === -1) {
          favorites.push(tutorObjectId); // use the ObjectId in the favorites array
        } else {
          favorites.splice(index, 1);
        }
        User.updateOne(
          { _id: decoded },
          { $set: { favorites: favorites } }
        ).exec((err, result) => {
            if (err) {
              return res.status(500).json({ error: err });
            }
            res.redirect("/favorites");
        });
    });
};

exports.favoritesList = async (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;

    // loads upcoming appointments
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayAppointments = await Appointment.find({ userID : decoded , day : {$eq : date}, end24 : {$gte : time}}).sort({start24 : 1});
    const appointments = await Appointment.find({ userID : decoded , day : {$gt : date}}).sort({day : 1, start24 : 1});
    
    // reformat appointment dates
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    todayAppointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    appointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    var message2 = "";
    if ((!todayAppointments || todayAppointments.length === 0) && (!appointments || appointments.length === 0)) {
        message2 = "No appointments scheduled. To schedule an appointment, select a tutor above.";
    }

    User.findOne({
        _id: decoded,
    })
    .exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        } else if (!user) {
            return res.render("./home", {message: "Profile does not exist."});
        } else {
            const favoriteTutors = user.favorites;
            Tutor.find({_id: {$in: favoriteTutors}})
            .exec((err, tutors) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                } else {
                    var message1 = "";
                    if (tutors.length == 0) {
                        message1 = "Add a tutor as a favorite to see them listed here! Use the searchbar to continue.";
                    }
                    res.render("home-authenticated", {'favtutors': tutors, 'allFavorites': user.favorites, 'message1': message1, 'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message2': message2})
                }
            });
        }
    });
};

exports.appointmentForm = async (req,res) => {
    const tid = req.body.tid;
    const date = req.body.date;
    var durVal = req.body.duration;
    const time = req.body.time;
    const subject = req.body.subject;
    Tutor.findOne({
        _id: tid,
    })
    .exec(async (err, tutor) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }
        else if (!tutor) {
            return res.render("home-authenticated", {message: "Profile does not exist."});
        }
        else if (time!=null) {
            // create new appointment in database
            // get student info
            const decoded = jwt.verify(req.session.token, config.secret).id;
            var user = await User.findOne({_id: decoded});
            if (!user) {
                return res.render("home-authenticated", {message: "Profile does not exist."});
            }
            var uid = user.id;
            var ufn = user.firstName;
            var uln = user.lastName;
            var uem = user.email;
            // get tutor info
            var tid = tutor.id;
            var tfn = tutor.firstName;
            var tln = tutor.lastName;
            var tem = tutor.email;
            // get appointment times
            var durInt = parseInt(durVal);
            var apstart = new Date(date+"T"+time);
            var apend = new Date(apstart.getTime() + durInt*60000);
            var start = apstart.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: true});
            var end = apend.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: true});
            var start24 = apstart.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: false});
            var end24 = apend.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: false});
            // make sure time is still available *****************************
            const allAppts = await Appointment.find({$and: [{tutorID: tutor.id}, {day: date}]});
            var valid = true;
            allAppts.forEach(appt => {
                var curstart = new Date(date+"T"+appt.start24);
                var curend = new Date(date+"T"+appt.end24);
                if (!(apend<=curstart || curend<=apstart)) {
                    valid = false;
                }
            });
            if (!valid) {
                var message = "Time unavailable. Please check availability again.";
                var durStr = "";
                if (durVal==="30") {
                    durStr = "30 minutes";
                }
                else if (durVal==="60") {
                    durStr = "1 hour";
                }
                else if (durVal==="90") {
                    durStr = "1 hour 30 minutes";
                }
                else if (durVal==="120") {
                    durStr = "2 hours";
                }
                else {
                    durVal = "60";
                    durStr = "1 hour";
                }
                return res.render("make-appointment", {'tutor': tutor, 'date': date, 'durVal': durVal, 'durStr': durStr, 'message': message, 'message2': message2, 'times': times});
            }
            // add appointment to database
            const appt = new Appointment ({
                userID: uid,
                tutorID: tid,
                userFirstName: ufn,
                userLastName: uln,
                userEmail: uem,
                tutorFirstName: tfn,
                tutorLastName: tln,
                tutorEmail: tem,
                subject: subject,
                day: date,
                start: start, 
                end: end,
                start24: start24, 
                end24: end24
            });
            Appointment.create(appt);
            return res.redirect("/home");
        }
        else {
            // reload form
            var durStr = "";
            var message = "";
            var message2 = "";
            var times = [];
            // duration defaults
            if (durVal==="30") {
                durStr = "30 minutes";
            }
            else if (durVal==="60") {
                durStr = "1 hour";
            }
            else if (durVal==="90") {
                durStr = "1 hour 30 minutes";
            }
            else if (durVal==="120") {
                durStr = "2 hours";
            }
            else {
                durVal = "60";
                durStr = "1 hour";
            }
            // check for date and return availability
            if (date==="") {
                message = "Enter a valid date.";
            }
            else if (date!=null) {
                const d = new Date(date);
                const weekdays = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
                const weekday = weekdays[d.getDay()];
                const allAppts = await Appointment.find({$and: [{tutorID: tutor.id}, {day: date}]});
                tutor.availability.forEach(element => {
                    // find availability for given day
                    if (element.day===weekday) {
                        var avstart = new Date(date+"T"+element.start24);
                        var avend = new Date(date+"T"+element.end24);
                        var durInt = parseInt(durVal);
                        var apstart = avstart;
                        var apend = new Date(avstart.getTime() + durInt*60000);
                        while (avstart<=apstart && apend<=avend) {
                            // check against upcoming appts
                            var valid = true;
                            allAppts.forEach(appt => {
                                var curstart = new Date(date+"T"+appt.start24);
                                var curend = new Date(date+"T"+appt.end24);
                                if (!(apend<=curstart || curend<=apstart)) {
                                    valid = false;
                                }
                            });
                            if (valid) {
                                var start12 = apstart.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: true});
                                var end12 = apend.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: true});
                                var start24 = apstart.toLocaleTimeString("en-US", {timeZone: "America/Chicago", hour: 'numeric', minute: 'numeric', hour12: false});
                                times.push({'start' : start12, 'end' : end12, 'start24' : start24});
                            }
                            apstart = new Date(apstart.getTime() + 30*60000);
                            apend = new Date(apend.getTime() + 30*60000);
                        }
                    }
                });
                if (times.length==0) {
                    message = "No available times for this date and duration.";
                }
                else {
                    message2 = "Choose an available time."
                }
            }
            return res.render("make-appointment", {'tutor': tutor, 'date': date, 'durVal': durVal, 'durStr': durStr, 'message': message, 'message2': message2, 'times': times});
        }
    });
};

exports.homeTutor = async (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;

    // loads upcoming appointments
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayAppointments = await Appointment.find({ tutorID : decoded , day : {$eq : date}, end24 : {$gte : time}}).sort({start24 : 1});
    const appointments = await Appointment.find({ tutorID : decoded , day : {$gt : date}}).sort({day : 1, start24 : 1});

    // reformat appointment dates
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    todayAppointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    appointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });

    var message1 = "";
    if ((!todayAppointments || todayAppointments.length === 0) && (!appointments || appointments.length === 0)) {
        message1 = "No appointments scheduled.";
    }

    res.render("home-authenticated-tutor", {'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message1': message1});
}

exports.cancelAppt = async (req,res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    const apptid = req.body.apptid;

    // loads upcoming appointments
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayAppointments = await Appointment.find({ userID : decoded , day : {$eq : date}, end24 : {$gte : time}}).sort({start24 : 1});
    const appointments = await Appointment.find({ userID : decoded , day : {$gt : date}}).sort({day : 1, start24 : 1});
    
    // reformat appointment dates
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    todayAppointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    appointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    var message2 = "";
    if ((!todayAppointments || todayAppointments.length === 0) && (!appointments || appointments.length === 0)) {
        message2 = "No appointments scheduled. To schedule an appointment, select a tutor above.";
    }
    
    const allTutors = await Tutor.find({$or: [{$or: allFirst}, {$or: allLast}, {$or: allSubject}]});
    if(!allTutors || allTutors.length === 0) {
        // return res.render("home-authenticated", {message: "No tutors found."});
        return res.render("home-authenticated", {'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message1': "No tutors found.", 'message2': message2})
    }
    else {
        User.findOne({
            _id: decoded,
        })
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            } 
            else {
                Appointment.findOne({
                    _id: apptid,
                })
                .exec((err, appointment) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    } 
                    else {
                        // check if the appointment is within 24 hours
                        var apptDate = new Date(appointment.day + "T" + appointment.start24);
                        var oneDayLater = new Date(new Date().getTime() + 24*60*60*1000);
                        if (apptDate < oneDayLater) {
                            res.render("home-authenticated", {'tutors': allTutors, 'allFavorites': user.favorites, 'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message2': message2, 'message3': "Appointments can only be cancelled up to 24 hours prior to the scheduled tutoring session."});
                        }
                        else {
                            Appointment.deleteOne({ _id: apptid }, (err, result) => {
                                if (err) {
                                    return res.status(500).json({ error: err });
                                }
                                else {
                                    res.redirect("/home");
                                }
                            });
                        }
                    }
                });
            }
        });
    }
};

exports.cancelApptTutor = async (req, res) => {
    const decoded = jwt.verify(req.session.token, config.secret).id;
    const apptid = req.body.apptid;

    // loads upcoming appointments
    const d = new Date();
    const currentYear = d.getFullYear();
    const currentMonth = ('0' + (d.getMonth() + 1)).slice(-2);
    const currentDate = ('0' + d.getDate()).slice(-2);
    const date = currentYear + "-" + currentMonth + "-" + currentDate;
    const currentHour = ('0' + d.getHours()).slice(-2);
    const currentMinute = ('0' + d.getMinutes()).slice(-2);
    const time = currentHour + ":" + currentMinute;
    const todayAppointments = await Appointment.find({ tutorID : decoded , day : {$eq : date}, end24 : {$gte : time}}).sort({start24 : 1});
    const appointments = await Appointment.find({ tutorID : decoded , day : {$gt : date}}).sort({day : 1, start24 : 1});

    // reformat appointment dates
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    todayAppointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    appointments.forEach(element => {
        var newDate = new Date(element.day);
        newDate = new Date(newDate.getTime() + (newDate.getTimezoneOffset()*60*1000))
        var newDay = days[newDate.getDay()] + ', ' + months[newDate.getMonth()] + ' ' + newDate.getDate() + ', ' + newDate.getFullYear();
        element.day = newDay;
    });
    var message1 = "";
    if ((!todayAppointments || todayAppointments.length === 0) && (!appointments || appointments.length === 0)) {
        message1 = "No appointments scheduled.";
    }

    Appointment.findOne({
        _id: apptid,
    })
    .exec((err, appointment) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        } 
        else {
            // check if the appointment is within 24 hours
            var apptDate = new Date(appointment.day + "T" + appointment.start24);
            var oneDayLater = new Date(new Date().getTime() + 24*60*60*1000);
            if (apptDate < oneDayLater) {
                res.render("home-authenticated-tutor", {'todayAppts' : todayAppointments, 'upcomingAppts': appointments, 'message1': message1, 'message2': "Appointments can only be cancelled up to 24 hours prior to the scheduled tutoring session."});
            }
            else {
                Appointment.deleteOne({ _id: apptid }, (err, result) => {
                    if (err) {
                        return res.status(500).json({ error: err });
                    }
                    else {
                        res.redirect("/home-tutor");
                    }
                });
            }
        }
    });
}