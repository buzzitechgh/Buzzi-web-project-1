const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
  orderId: { type: String, required: true },
  customer: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    region: { type: String },
    gpsCoordinates: { type: String }
  },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
    }
  ],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  deliveryMode: { type: String, required: true },
  isPaid: { type: Boolean, required: true, default: false },
  status: { 
    type: String, 
    required: true, 
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Completed', 'Cancelled'] 
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);