/**
 * Sahabat Nusantara - Chat Application Backend
 * Modular architecture dengan separation of concerns
 */

// Load environment variables
require("dotenv").config();

// Core dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");

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

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")));

// API Routes
app.get("/api/health", handleHealthCheck);
app.post(
  "/api/chat",
  rateLimitMiddleware,
  validateMessageMiddleware,
  handleChatRequest
);
app.post("/api/clear-conversation", handleClearConversation);

// Serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Fallback middleware for SPA routing
app.use((req, res, next) => {
  // If it's an API route, let it go to 404
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  
  // If it's not a static file (doesn't have extension), serve index.html
  if (!req.path.includes(".")) {
    return res.sendFile(path.join(__dirname, "../public/index.html"));
  }
  
  // Let static files be handled by express.static
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
const port = config.server.port;
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
  console.log(`🛡️  Security: Rate limiting & input validation enabled`);
  console.log(`🤖 AI Model: ${config.ai.model}`);
});
