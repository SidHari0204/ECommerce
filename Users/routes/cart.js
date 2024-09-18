const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const VendorProduct = require('../models/VendorProduct');
const Address = require('../models/Address');
const Order = require('../models/Order')
const authenticateToken = require('../middleware/authenticateToken');
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51PmqBRHtCUiqNOuoxgp6RSiKTJm5i31aH2ujK3W4EV9FfpmFJISjhFNnta0h5Nb0cdgBJ213igwcyQ5Qg9kYmDBM00JQWDiyXv');

// Add item to cart
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.userId;

    const product = await VendorProduct.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingCartItem = await CartItem.findOne({ userId, productId });

    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      res.status(200).json({ message: 'Product quantity updated in cart successfully' });
    } else {
      const newCartItem = new CartItem({
        userId,
        productId: product._id,
        productName: product.productName,
        quantity,
        price: product.price,
      });
      await newCartItem.save();
      res.status(200).json({ message: 'Product added to cart successfully' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cart items for a user
router.get('/items', authenticateToken, async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.user.userId })
      .populate({ path: 'userId', select: 'username' })
      .select('productName price userId quantity');

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No items found in the cart' });
    }

    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'An error occurred while fetching the cart items.' });
  }
});

// Checkout user items
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    const cartItems = await CartItem.find({ userId })
      .populate({ path: 'productId', select: 'productName price' })
      .select('productId productName price quantity');

    if (!cartItems || cartItems.length === 0) {
      return res.status(404).json({ message: 'No items found in the cart' });
    }
    const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    const { addressId, address, phone, paymentMethodId } = req.body;

    if (!addressId && (!address || !phone)) {
      return res.status(400).json({ message: 'Address and phone number are required' });
    }

    let savedAddress;

    if (addressId) {
      savedAddress = await Address.findById(addressId);
      if (!savedAddress) {
        return res.status(400).json({ message: 'Address not found' });
      }
    } else {
      savedAddress = new Address({
        user: userId,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        phone,
      });
      await savedAddress.save();
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), 
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true, 
      automatic_payment_methods: { enabled: true },
      return_url: 'http://localhost:3000/cart/checkout-complete' 
    });

    if (paymentIntent.status === 'succeeded') {
      const newOrder = new Order({
        userId,
        items: cartItems.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totalPrice,
        createdAt: Date.now()
      });

      await newOrder.save();

      await CartItem.deleteMany({ userId });

      res.status(200).json({
        client_secret: paymentIntent.client_secret,
        return_url: paymentIntent.return_url 
      });
    } else {
      res.status(400).json({ message: 'Payment failed, please try again' });
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'An error occurred during checkout.', details: error.message });
  }
});


// Clear cart for a user
router.delete('/clear', authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  try {
    await CartItem.deleteMany({ userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/item/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body; // Quantity to delete
    const userId = req.user.userId;

    const cartItem = await CartItem.findOne({ _id: itemId, userId });

    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    if (quantity >= cartItem.quantity) {
      await CartItem.findByIdAndDelete(itemId);
    } else {
      cartItem.quantity -= quantity;
      await cartItem.save();
    }

    res.status(200).json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'An error occurred while updating the cart item.' });
  }
});

// Handle payment completion
router.get('/checkout-complete', async (req, res) => {
  try {
    const { payment_intent } = req.query;

    if (!payment_intent) {
      return res.status(400).json({ message: 'Missing payment intent ID' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);

    if (paymentIntent.status === 'succeeded') {
      return res.send('Payment successful! Thank you for your purchase.');
    } else {
      return res.send('Payment failed. Please try again.');
    }
  } catch (error) {
    console.error('Error completing checkout:', error);
    res.status(500).send('An error occurred during checkout.');
  }
});

module.exports = router;
