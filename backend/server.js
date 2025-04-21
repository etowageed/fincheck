const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// setup app instance
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Routes
app.get("/", (req, res) => {
  res.send("Fincheck API running...");
});

// MongoDB connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connection successful");
    app.listen(PORT, () => {
      console.log(`...Server is running on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });
