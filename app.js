'use strict'
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

let profiles = JSON.parse(fs.readFileSync('profiles.JSON'));
let payments = JSON.parse(fs.readFileSync('payments.json'));
let orders = JSON.parse(fs.readFileSync('orders.json'));
let logins = [];
let jsonParser = bodyParser.json();

app.use(jsonParser);
app.use(cors());
app.use(logger)

//ORDERS
app.route('/orders')
    .get((req, res) => {
        res.json(orders);
    })

app.route('/orders/new')
    .post((req, res) => {
        let body = req.body;
        body.id = orders.length + 1;

        if (body.summary && body.amount > 0 && body.client && body.provider && body.status && body.orderDetails) {
            orders.push(body);
            fs.writeFileSync('orders.json', JSON.stringify(orders));
            res.status(201).send(body);
            return;
        }

        res.status(400).send({
            error: "Missing body data"
        })

    })

app.route('/orders/:id')
    .get((req, res) => {
        let id = req.params.id;
        let order = orders.find(ord => ord.id == id);

        if (order) {
            res.json(order);
            return;
        }

        res.json({
            error: "Non-existent"
        });
    })

app.route('/orders/:id/payment')
    .post((req, res) => {
        let body = req.body;
        let orderPayment = orders.find(ord => ord.id == body.id);

        if (body.paymentForm && orderPayment) {
            let newPayment = {
                "id": orderPayment.id,
                "amount": orderPayment.amount,
                "provider": orderPayment.provider,
                "status": "paid",
                "transactionId": new Date().getTime(),
                "paymentForm": body.paymentForm
            }
            payments.push(newPayment);
            fs.writeFileSync('payments.json', JSON.stringify(payments));
            res.status(201).send(body);
            return;
        }

        res.status(400).send({
            error: "Missing body data"
        })

    })


//PAYMENTS
app.route('/payments')
    .get((req, res) => {
        res.json(payments);
    })

app.route('/payments/:id')
    .get((req, res) => {
        let id = req.params.id;
        let payment = payments.find(paym => paym.id == id);

        if (payment) {
            res.json(payment);
            return;
        }

        res.json({
            error: "Non-existent"
        });
    })

//PROFILE
app.route('/profile')
    .get((req, res) => {
        res.json(profile);
    })

app.route('/profile/edit')
    .patch(auth, (req, res) => {
        let id = req.params.id;
        let body = req.body;
        if (updateProfile(id, body)) {
            res.send();
        } else {
            res.status(400).send({
                error: "Incorrect id or missing data"
            })
        }
    })

app.route('/profile/cards')
    .patch(auth, (req, res) => {
        let id = req.params.id;
        let body = req.body;
        if (deleteProfileCards(id, body)) {
            res.send();
        } else {
            res.status(400).send({
                error: "Incorrect id or missing data"
            })
        }
    })
    .post(auth, (req, res) => {
        let body = req.body;

        if (body.number && body.cvc && body.month > 0 && body.month < 13 && body.year > 2019 && body.year < 2030) {
            orders.push(body);
            fs.writeFileSync('orders.json', JSON.stringify(orders));
            res.status(201).send(body);
            return;
        }

        res.status(400).send({
            error: "Missing body data"
        })

    })


//LOGIN
app.route('/login')
    .post((req, res) => {
        let body = req.body;

        if (body.username && body.password) {
            let profile = profiles.find(prof => prof.username === body.username);
            if (profile && profile.password === body.password) {
                var d = new Date();
                let token = {
                    token: Math.random().toString(36),
                    expiration: d,
                    usuario: body.username
                };
                logins.push(token);
                res.header("x-auth", token.token);
                res.status(200).send({
                    usuario: body.username
                });
                return;
            }
            res.status(401).send({
                error: "Failed"
            })
            return;
        }

        res.status(400).send({
            error: "Missing body data"
        })
    })

//REGISTER
app.route('/register')
    .post((req, res) => {
        let body = req.body;
        body.id = profiles.length + 1;
        body.cards = [];

        if (body.firstName && body.lastName && body.city && body.username && body.password && body.gender) {
            profiles.push(body);
            fs.writeFileSync('profiles.json', JSON.stringify(profiles));
            res.status(200).send("Success!");
        } else {
            res.status(400).send({
                error: "Missing body data"
            })
        }
    })




app.listen(port, () => console.log(`Example app listening on port http://127.0.0.1:${port}!`))

function updateProducto(id, producto) {
    let pos = productos.findIndex(product => product.id == id);

    productos[pos].nombre = (producto.nombre) ? producto.nombre : productos[pos].nombre;
    productos[pos].marca = (producto.marca) ? producto.marca : productos[pos].marca;
    productos[pos].precio = (producto.precio) ? producto.precio : productos[pos].precio;
    productos[pos].descripcion = (producto.descripcion) ? producto.descripcion : productos[pos].descripcion;
    productos[pos].existencia = (producto.existencia) ? producto.existencia : productos[pos].existencia;

    Object.assign(productos[pos], producto);
    fs.writeFileSync('productos.json', JSON.stringify(productos));
    return true;

}

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
    let tokenAuth = req.get('x-auth');
    let user = req.get('x-user');

    let login = logins.find(login => login.token == tokenAuth && login.user == user);

    if (login) {
        var tokenDate = new Date(login.expiration)
        var currentDate = new Date();

        let timeDiff = Math.abs(currentDate.getTime() - tokenDate.getTime());
        let difference = Math.ceil(timeDiff / (1000 * 60));

        if (difference < 5) {
            next();
        } else {
            var index = logins.indexOf(login);

            if (index > -1) {
                logins.splice(index, 1);
            }
            res.status(401).send({
                error: "Unauthorized"
            });
            return;
        }
    } else {
        res.status(401).send({
            error: "Unauthorized"
        });
        return;
    }
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