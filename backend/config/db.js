const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use environment variable if available, otherwise use the provided Atlas connection string.
    // We append '/buzzitech' to the URI to ensure data is stored in the correct database.
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://BuzziTech_db:OiA5YVnBEeVUs8PS@cluster0.kwlpjvf.mongodb.net/buzzitech?appName=Cluster0";
    
    const conn = await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;