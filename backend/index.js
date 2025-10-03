/**
 * Sahabat Nusantara - Chat Application Backend
 * Modular architecture dengan separation of concerns
 */

// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");

// Import custom modules
const { config, validateConfig } = require("./config/app");
const { rateLimitMiddleware } = require("./middleware/rateLimit");
const {
  validateMessageMiddleware,
  securityHeadersMiddleware,
} = require("./middleware/security");
const { handleChatRequest, handleHealthCheck, handleClearConversation } = require("./routes/chat");

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error("Configuration error:", error.message);
  process.exit(1);
}

// Initialize Express app
const app = express();

// Global middleware
app.use(securityHeadersMiddleware);
app.use(cors(config.cors));
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

// Routes
app.get("/health", handleHealthCheck);
app.post(
  "/chat",
  rateLimitMiddleware,
  validateMessageMiddleware,
  handleChatRequest
);
app.post("/clear-conversation", handleClearConversation);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
const port = config.server.port;
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🛡️  Security: Rate limiting & input validation enabled`);
  console.log(`🤖 AI Model: ${config.ai.model}`);
});
