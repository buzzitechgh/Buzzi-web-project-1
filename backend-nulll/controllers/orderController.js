const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendEmail } = require('../services/emailService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const addOrderItems = async (req, res) => {
  const { items, total, customer, deliveryMode, paymentMethod, id } = req.body;

  if (items && items.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const order = new Order({
    orderId: id,
    items,
    customer,
    total,
    deliveryMode,
    paymentMethod,
    isPaid: paymentMethod === 'paystack', // Simplified logic
    status: 'Pending'
  });

  const createdOrder = await order.save();

  // Decrease Stock
  // (In a real app, use transactions)
  for (const item of items) {
     const product = await Product.findOne({ id: item.id });
     if(product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();
     }
  }

  // Send Notification Email
  await sendEmail(
      process.env.ADMIN_EMAIL, 
      `New Order Received: ${id}`,
      `<p>New order from <strong>${customer.name}</strong> for GHS ${total}.</p>`
  );

  res.status(201).json({ success: true, transactionId: createdOrder.orderId, order: createdOrder });
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
};

module.exports = { addOrderItems, getOrders };