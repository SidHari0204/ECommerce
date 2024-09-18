const mongoose = require('mongoose');

const VendorProductSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    unique: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  imageUrl: {  // New field for the image URL
    type: String,
    required: true // You can make this optional if needed
  }
});

const VendorProduct = mongoose.model('VendorProduct', VendorProductSchema);

module.exports = VendorProduct;
