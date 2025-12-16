const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    // Return all products. Frontend Store component filters by isActive=true, 
    // while Admin Dashboard needs to see everything.
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { id, name, brand, price, originalPrice, category, image, description, features, stock, isActive } = req.body;

  const productExists = await Product.findOne({ id });
  if (productExists) {
    res.status(400);
    throw new Error('Product already exists');
  }

  const product = await Product.create({
    id, name, brand, price, originalPrice, category, image, description, features, stock, isActive
  });

  if (product) {
    res.status(201).json(product);
  } else {
    res.status(400).json({ message: 'Invalid product data' });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });

  if (product) {
    product.name = req.body.name || product.name;
    product.brand = req.body.brand !== undefined ? req.body.brand : product.brand;
    product.price = req.body.price !== undefined ? req.body.price : product.price;
    product.originalPrice = req.body.originalPrice !== undefined ? req.body.originalPrice : product.originalPrice;
    product.category = req.body.category || product.category;
    product.image = req.body.image || product.image;
    product.description = req.body.description || product.description;
    product.features = req.body.features || product.features;
    product.stock = req.body.stock !== undefined ? req.body.stock : product.stock;
    product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const product = await Product.findOne({ id: req.params.id });

  if (product) {
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };