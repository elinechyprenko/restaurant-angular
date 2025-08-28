const { con } = require('../db/db.config');
let express = require('express');
const app = express();

app.post('/order', (req, res) => {
    const { order_method, cartItems, selectedPayment, total_price, fullName, email, phone, date, time, address = '', postcode = '' } = req.body;
    const sqlOrderItems = 'INSERT INTO order_items (product_title, price, quantity, addition, quantityAdditions, additionPrice) VALUES ?';
    const orderItems = cartItems.map(item => [
        item.product_title,
        item.price,
        item.quantityProduct,
        item.addition && item.addition.length > 0 ? JSON.stringify(item.addition) : null,
        item.quantityAddition && item.quantityAddition.length > 0 ? JSON.stringify(item.quantityAddition) : null,
        item.additionPrice && item.additionPrice.length > 0 ? JSON.stringify(item.additionPrice) : null
    ]);

    con.query(sqlOrderItems, [orderItems], (error, result) => {
        if (error) {
            console.error('Error inserting order items:', error);
            return res.status(500).json({ error: 'Error inserting order items' });
        } 
    else {
      const orderId = result.insertId;

      const sqlOrder = `INSERT INTO \`order\`(order_method, full_name, email, phone, date, time, address, postcode, total_price, selected_payment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const orderData = [ order_method, fullName, email, phone, date, time, address, postcode, total_price, selectedPayment];

      con.query(sqlOrder, orderData, (error, result) => {
        if (error) {
          console.error('Error inserting order:', error);
          return res.status(500).json({ error: 'Error inserting order' });
        } else {
          console.log('Order and items saved successfully');
          res.status(201).json({ message: 'Order and items saved successfully' });
        }
      });
    }  })});


module.exports = app;
