const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();


// Ensure essential environment variables are present
if (!process.env.MONGO_URI) {
  console.error("Error: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://llov-frontend.vercel.app'],
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if MongoDB fails to connect
  });

// Mongoose Schema and Model
const EntrySchema = new mongoose.Schema({
  yourName: { type: String, required: true },
  partnerName: { type: String, required: true },
  percentage: { type: Number, required: true },
});

const Entry = mongoose.model("Entry", EntrySchema);

// Routes
app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/api/entries", async (req, res) => {
  try {
    const { yourName, partnerName, percentage } = req.body;

    // Basic validation
    if (!yourName || !partnerName || percentage == null) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = new Entry({ yourName, partnerName, percentage });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (error) {
    console.error("Error saving entry:", error);
    res.status(500).json({ message: "Error saving entry", error });
  }
});

app.get("/api/entries", async (req, res) => {
  try {
    const entries = await Entry.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching entries:", error);
    res.status(500).json({ message: "Error fetching entries", error });
  }
});

// app.get("/favicon.ico", (req, res) => {
//   res.status(204).end(); // No Content
// });
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
