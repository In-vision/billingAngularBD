let { mongoose } = require('./mongodb-connect');
let jwt = require('jsonwebtoken');

var tdcSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    month: {
        type: Number,
        min: 0,
        required: true,
    },
    year: {
        type: Number,
        min: 0,
        required: true,
    },
});


let userScheme = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        min: 0,
    },
    username: {
        type: String, required: true, trim: true, minlength: 4, unique: true
    },
    password: {
        type: String, required: true, minlength: 6
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    acceso: {
        type: String,
        enum: ["normal", "admin"],
        required: true,
    },
    cards: {
        type: [tdcSchema]
    }
});

userScheme.methods.generateToken = () => {
    let user = this;
    let token = jwt.sign({
        user: user.email, acceso: user.acceso
    }, 'claveSecreta',
        { expiresIn: 60 * 60 }).toString();
    return token;

};

let User = mongoose.model('users', userScheme);

module.exports = { User }