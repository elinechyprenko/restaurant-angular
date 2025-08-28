const {con} = require('../db/db.config');
let express = require('express');
const app = express();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/create-payment-intent', async (req, res) => {
    const { total_price } = req.body;
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: total_price * 100,
        currency: 'usd',
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  module.exports = app;