/**
 * Application configuration
 */

const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "localhost",
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: 60000, // 1 menit
    maxRequests: 10, // maksimal 10 request per menit per IP
    blockDuration: 300000, // block 5 menit jika melanggar
  },

  // Security configuration
  security: {
    maxMessageLength: 1000,
    enableSecurityHeaders: true,
    logSecurityEvents: true,
  },

  // Gemini AI configuration
  ai: {
    model: "gemini-2.5-flash",
    maxTokens: 250,
  },

  // Environment
  env: process.env.NODE_ENV || "development",

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    enableConsole: true,
  },
};

/**
 * Validate required environment variables
 */
function validateConfig() {
  const required = ["GEMINI_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

module.exports = {
  config,
  validateConfig,
};
