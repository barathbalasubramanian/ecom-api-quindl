const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const categoryRoutes = require('./routes/categoryRoutes');
const variantRoutes = require('./routes/variantRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const connectDB = require('./config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
connectDB();
app.use(
    cors({
      origin: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    })
);
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/categories', categoryRoutes);
app.use('/variants', variantRoutes);
app.use('/products', productRoutes);
app.use('/marketing', marketingRoutes);
app.use('/orders', orderRoutes);
app.use('/coupons', couponRoutes);

app.use('/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get("/checkout-session/:id", async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.retrieve(req.params.id);
      res.status(200).json(session);
    } catch (err) {
      console.error(err);
      res.status(400).send({
        error: {
          message: err.message,
        },
      });
    }
  });
  
  app.post("/create-checkout-session", async (req, res) => {
    try {
      const { productName, price, quantity, customerEmail } = req.body;
      console.log(req.body);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "inr",
              unit_amount: price * 100,
              product_data: {
                name: productName,
              },
            },
            quantity: quantity,
          },
        ],
        mode: "payment",
        billing_address_collection: "required",
        customer_creation: "always",
        success_url: `${process.env.REACT_APP_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REACT_APP_BASE_URL}/cancel`,
      });
  
      res.status(200).json({ url: session.url });
    } catch (err) {
      console.error(err);
      res.status(400).send({
        error: {
          message: err.message,
        },
      });
    }
  });
  
  app.post("/webhook", bodyParser.raw({ type: "application/json" }), (req, res) => {
    // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const endpointSecret = "whsec_2bdb0e284ff190c489d8f81e4f754b205449d866bf34278ccbb4648d3f9c5de9";
  
    const sig = req.headers["stripe-signature"];
  
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.log(`Webhook signature verification failed: ${err.message}`);
      return res.sendStatus(400);
    }
  
    // Handle specific events
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
  
      // Fulfill the purchase
      console.log("Payment was successful!");
      console.log("Customer Email:", session.customer_email);
  
      // TODO: Save payment status in your database or notify your client
    }
  
    res.status(200).send("Webhook received");
  });
  
  app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Something went wrong!' });
  });

app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
});
module.exports = app;
