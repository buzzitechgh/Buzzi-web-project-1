require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
const connectDB = require('../config/db');

// Sample Data (Subset of your frontend data)
const products = [
  {
    id: "sl-std-v4",
    name: "Starlink Standard Kit (Gen 3)",
    price: 8500,
    category: "Starlink",
    image: "https://images.unsplash.com/photo-1697558628043-410a56828519?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "The standard for high-speed, low-latency internet. Includes Kickstand, Gen 3 Router, and Cables.",
    features: ["Dual-band WiFi 6", "Weather Resistant", "Easy Self-Install"],
    stock: 25
  },
  {
    id: "hik-2mp-colorvu",
    name: "Hikvision 2MP ColorVu IP Camera",
    price: 550,
    category: "CCTV IP",
    image: "https://images.unsplash.com/photo-1589980757782-b75cb6e93892?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "DS-2CD1027G2H-LIUF Full color night vision with 2-way audio.",
    features: ["ColorVu Technology", "2-Way Audio", "IP67 Weatherproof"],
    stock: 30
  }
  // Add more from data/products.ts as needed
];

const seedData = async () => {
  await connectDB();

  try {
    await Product.deleteMany();
    await User.deleteMany();

    await Product.insertMany(products);

    const adminUser = await User.create({
        name: 'Buzzitech Admin',
        email: 'admin@buzzitech.com',
        password: 'password123', // Change immediately
        isAdmin: true
    });

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();