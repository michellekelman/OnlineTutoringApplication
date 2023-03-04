const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.tutor = require("./tutor.model");
db.appointment = require("./appointment.model");

db.COLLECTIONS = ["user", "tutor", "admin"];

module.exports = db;
