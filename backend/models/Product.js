const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Frontend ID compatibility
  name: { type: String, required: true },
  brand: { type: String }, // Manufacturer/Brand
  price: { type: Number, required: true, default: 0 },
  originalPrice: { type: Number }, // For discounts
  category: { type: String, required: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  features: [{ type: String }],
  stock: { type: Number, required: true, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);