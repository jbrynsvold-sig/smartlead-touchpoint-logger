require("dotenv").config();
const express = require("express");
const { connect } = require("./db/mongo");

const webhookRouter = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Webhook endpoint
app.use("/webhook", webhookRouter);

// Connect to MongoDB then start server
connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SmartLead touchpoint logger running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
