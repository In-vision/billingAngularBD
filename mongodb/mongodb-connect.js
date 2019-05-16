'use strict'

let mongoose = require('mongoose');
let mongoDB = "mongodb+srv://cluster0-ori37.mongodb.net/dbBilling?retryWrites=true"

mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    "auth":
        { "authSource": "admin" },
    "user": "dbDelivery",
    "pass": "WYc7O2jzmXdE6geP"
});

let db = mongoose.connection;

module.exports = { mongoose }