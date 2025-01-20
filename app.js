const express = require('express');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const variantRoutes = require('./routes/variantRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
connectDB();
app.use(bodyParser.json());
app.use('/categories', categoryRoutes);
app.use('/variants', variantRoutes);
app.use('/products', productRoutes);
app.use('/marketing', marketingRoutes);

app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});
module.exports = app;
