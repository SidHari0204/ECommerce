const express = require('express');
const router = express.Router();
const VendorProduct = require('../models/VendorProduct');

router.post('/add-product', async (req, res) => {
  const { productId, productName, quantity, price, imageUrl } = req.body;

  if (!productId || !productName || !quantity || !price || !imageUrl) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const newProduct = new VendorProduct({
      productId,
      productName,
      quantity,
      price,
      imageUrl
    });

    await newProduct.save();
    res.json({ message: 'Product added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/products', async (req, res) => {
  try {
    const products = await VendorProduct.find();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/product/:productId', async (req, res) => {
  try {
    const product = await VendorProduct.findOne({ productId: req.params.productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/update-product/:productId', async (req, res) => {
  const { productName, quantity, price } = req.body;

  try {
    const product = await VendorProduct.findOneAndUpdate(
      { productId: req.params.productId },
      { productName, quantity, price, imageUrl },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/delete-product/:productId', async (req, res) => {
  try {
    const product = await VendorProduct.findOneAndDelete({ productId: req.params.productId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
