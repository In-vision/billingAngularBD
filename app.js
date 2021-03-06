'use strict'

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
let jwt = require('jsonwebtoken');

let {
    Order
} = require('./mongodb/order');
let {
    Payment
} = require('./mongodb/payment');
let {
    User
} = require('./mongodb/user');

const app = express();
const port = process.env.PORT || 3000;

let logins = [];
let jsonParser = bodyParser.json();
app.use(jsonParser);
app.use(cors());
app.use(logger);

//ORDERS
app.route('/orders')
    .get(auth, (req, res) => {
        Order.find({}, (err, docs) => {
            if (err) {
                console.log(err);
                res.status(400).send();
            } else {
                res.json(docs);
            }
        })
    })
    .post(auth, (req, res) => {
        let body = req.body;
        Order.countDocuments({})
            .then(number => {
                body.id = number + 1;
                let anyOrder = Order(body);
                anyOrder.save()
                    .then((doc) => res.json(doc))
                    .catch((err) => {
                        console.log(err);
                        res.status(400).send();
                    });
            });
    })

app.route('/orders/:id')
    .get(auth, (req, res) => {
        let id = req.params.id;
        Order.findOne({
            'id': id
        }, (err, docs) => {
            if (err) {
                console.log(err);
                res.status(404).send();
            } else {
                res.json(docs);
            }
        })
    })

app.route('/orders/:id/payment')
    .post(auth, (req, res) => {
        let body = req.body;
        let orderID = req.params.id;

        Payment.find({}, (err, docs) => {
            if (err) {
                res.status(400).send();
            } else {
                length = docs.length;
            }
        })

        Payment.countDocuments({})
            .then(number => {
                body.id = number + 1;
                body.order = orderID;
                let anyPayment = Payment(body);

                anyPayment.save()
                    .then((doc) => res.json(doc))
                    .catch((err) => {
                        console.log(err);
                        res.status(400).send();
                    });
            });
    })


//PAYMENTS
app.route('/payments')
    .get(auth, (req, res) => {
        Payment.find({}, (err, docs) => {
            if (err) {
                res.status(400).send();
            } else {
                length = docs.length;
            }
        })
    })

app.route('/payments/:id')
    .get(auth, (req, res) => {
        let id = req.params.id;
        Payment.findOne({
            'id': id
        }, (err, docs) => {
            if (err) {
                console.log(err);
                res.status(404).send();
            } else {
                res.json(docs);
            }
        })
    })

//PROFILE
app.route('/profile')
    .get(auth, (req, res) => {
        let user = req.get('x-user');

        User.findOne({
            'email': user
        }, (err, docs) => {
            if (err) {
                console.log(err);
                res.status(404).send();
            } else {
                res.json(docs);
            }
        })
    })

app.route('/profile/edit')
    .patch(auth, (req, res) => {
        let id = req.body.id;
        let body = req.body;
        console.log("bodyProfile: " + body);
        User.findOne({
            'id': id
        }, function (err, user) {
            console.log(id);
            if (err) {
                res.status(404).send();
            } else {
                const firstName = body.firstName.trim();
                const lastName = body.lastName.trim();
                const cards = body.cards;

                user.firstName = firstName;
                user.lastName = lastName;
                user.cards = cards;

                user.save(function (err) {
                    res.redirect('/profile');
                })
                res.json(user);
            }
        })
    })

app.route('/profile/cards')
    .post(auth, (req, res) => {
        console.log("CC Number: " + req.body.cNumber);
        let body = req.body;
        console.log("body: " + body);
        let emailUser = body.userEmail;
        User.findOne({
            'email': emailUser
        }, function (err, user) {
            console.log(body);
            if (err) {
                res.status(404).send();
            } else {
                user.cards.push(body);
                user.save(function (err) {
                    res.redirect('/profile');
                })
            }
        })
    })


//LOGIN
app.route('/login')
    .post((req, res) => {
        let body = req.body;
        if (body.username && body.password) {

            User.findOne({
                'email': body.username
            }, (err, user) => {
                if (err) {
                    console.log(err);
                    res.status(404).send();
                } else {
                    if (user.password === body.password) {
                        let token = user.generateToken();
                        res.status(200).send({
                            usuario: user.email,
                            token: token,
                            acceso: user.acceso
                        });
                    }
                }
                res.status(401).send();
            })
        }
    })

//REGISTER
app.route('/register')
    .post((req, res) => {
        let body = req.body;
        User.countDocuments({})
            .then(number => {
                body.id = number + 1;
                body.acceso = "normal";
                let anyUser = User(body);
                anyUser.save()
                    .then((doc) => res.json(doc))
                    .catch((err) => {
                        console.log(err);
                        res.status(400).send();
                    });
            });
    })




app.listen(port, () => console.log(`Example app listening on port http://127.0.0.1:${port}!`))

function updateProfile(id, profile) {
    let pos = profiles.findIndex(prof => prof.id == id);

    profiles[pos].firstName = (profile.firstName) ? profile.firstName : profiles[pos].firstName;
    profiles[pos].lastName = (profile.lastName) ? profile.lastName : profiles[pos].lastName;

    Object.assign(profiles[pos], profile);
    fs.writeFileSync('profiles.json', JSON.stringify(profiles));
    return true;

}

function deleteProfileCards(id, idCard) {
    let pos = profiles.findIndex(prof => prof.id == id);
    let posCard = profiles.cards.findIndex(card => card.id == idCard);

    profiles[pos].cards[posCard].splice(posCard);

    fs.writeFileSync('profiles.json', JSON.stringify(profiles));
    return true;

}

function auth(req, res, next) {
    let token = req.get('Authorization').split(" ").pop();

    jwt.verify(token, 'claveSecreta', (err, decoded) => {
        if (err) {
            res.status(401).send({
                error: "Unauthorized"
            });
            return;
        }
        next();
    });
}

function logger(req, res, next) {
    console.log("method", req.method);
    console.log("url", req.originalUrl);
    console.log("date", new Date(Date.now()).toString());
    console.log("content-type", req.get('Content-Type'));
    console.log("x-auth", req.get('x-auth'));
    console.log("x-user", req.get('x-user'));
    console.log(logins);
    next();
}