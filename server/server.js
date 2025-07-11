// filepath: server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://renatoperas36:adventuretime36@cluster0.iluvg0w.mongodb.net/SiniLikhainDB")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/products");

app.use("/users", userRoutes);
app.use("/products", productRoutes);

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
