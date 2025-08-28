const { con } = require('../db/db.config');
let express = require('express');
const app = express();

app.get('/get-order-data', (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: 'Email parameter is required'
        });
    }
    const orderDataSQL = 'select * from `order` where email = ?';
    con.query(orderDataSQL, [email], (orderError, orderResult) => {
        if (orderError) {
            console.error('Error fetching data:', orderError);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(orderResult);
    })

})

module.exports = app;