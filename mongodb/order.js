let { mongoose } = require('./mongodb-connect');

var orderDetailSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        min:0,
    },
    concept: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        min:1,
        required: true,
    },
    quantity: {
        type: Number,
        min:1,
        required: true,
    },
});

let orderSchema = mongoose.Schema({
    id: {
        type: Number,
        required: true,
        min:0,
    },
    summary: {
        type: String,
        required: true,
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
        enum: ['Paid', 'Unpaid', 'Canceled'],
        required: true,
    },
    orderDetails: {
        type: [orderDetailSchema],
        required: true,
    },
});

let Order = mongoose.model('orders', orderSchema);

module.exports = {Order}