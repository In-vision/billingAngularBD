let { mongoose } = require('./mongodb-connect');

var tdcSchema = mongoose.Schema({
    number: {
        type: String,
        required: true,
    },
    month:{
        type: Number,
        min: 0,
        required: true,
    },
    year:{
        type: Number,
        min: 0,
        required: true,
    },
});

let paymentSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        min:0,
    },
    amount: {
        type: Number,
        min:1,
        required: true,
    },
    client: {
        type: String,
        required: true,
    },
    provider:{
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['Paid', 'Pending', 'Rejected'],
        required: true,
    },
    transaction: {
        type: Number,
    },
    tdc: {
        type: tdcSchema,
        required: true,
    },
    order: {
        type: Number,
        min: 1,
        required: true,
    }
});

let Payment = mongoose.model('payments', paymentSchema);

module.exports = {Payment}