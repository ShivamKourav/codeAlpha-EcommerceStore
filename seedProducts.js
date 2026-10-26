
require("dotenv").config();

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Product = require("./models/Product");

async function seedProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Seed database:", mongoose.connection.name);
    console.log("Seed collection:", Product.collection.name);

    // Read products from JSON file
    const filePath = path.join(
      __dirname,
      "data",
      "products.json"
    );

    const products = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    if (!Array.isArray(products) || products.length === 0) {
      throw new Error("products.json is empty or invalid");
    }

    // Insert or update each product
    for (const product of products) {
      await Product.updateOne(
        { id: product.id },
        { $set: product },
        { upsert: true, runValidators: true }
      );
    }

    // Verify products in MongoDB
    const allProducts = await Product.find({}).lean();

    console.log("Products in JSON:", products.length);
    console.log("Products in MongoDB:", allProducts.length);
    console.log(
      "Product names:",
      allProducts.map((product) => product.name)
    );

  } catch (error) {
    console.error("Seed error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seedProducts();
