require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const vendorRoutes = require('./routes/vendor');
const addressRoutes = require('./routes/address');
const orderRoutes = require('./routes/order');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);
app.use('/cart', cartRoutes);
app.use('/vendor', vendorRoutes);
app.use('/address', addressRoutes);
app.use('/order', orderRoutes);

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the E-commerce Application</h1><a href="/auth/google">Sign in with Google</a>');
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'An internal server error occurred' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
