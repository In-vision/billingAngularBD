'use strict'

let mongoose = require('mongoose');
let mongoDB = process.env.MONGODB_URL

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    "auth":
        { "authSource": "admin" },
    "user": process.env.MONGODB_USER,
    "pass": process.env.MONGODB_PASSWORD
});

let db = mongoose.connection;

module.exports = { mongoose }