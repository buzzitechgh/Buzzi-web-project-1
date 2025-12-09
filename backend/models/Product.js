const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  id: { type: String, required: true, unique: true }, // Frontend ID compatibility
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
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