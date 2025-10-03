/**
 * Chat routes untuk handling chat requests
 */

const { GoogleGenAI } = require("@google/genai");

// Inisialisasi Gemini Client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

// Memory storage untuk conversation history
// Dalam production, gunakan database seperti Redis atau MongoDB
const conversationMemory = new Map();
const MAX_CONVERSATION_LENGTH = 10; // Maksimal 10 exchange (20 messages)
const MEMORY_CLEANUP_INTERVAL = 30 * 60 * 1000; // 30 menit

/**
 * System prompt untuk Sahabat Nusantara
 */
const SYSTEM_PROMPT = `
Kamu adalah "Sahabat Nusantara", seorang asisten AI yang ramah dan ahli tentang Indonesia.
Tugasmu adalah membantu pengguna belajar bahasa Indonesia dan mengenal budaya, sejarah, kuliner, serta pariwisata Indonesia.
- Jawablah selalu dalam bahasa Indonesia yang baik dan benar, kecuali jika pengguna memintamu untuk menerjemahkan atau menggunakan bahasa lain.
- Gunakan gaya bahasa yang santai dan bersahabat, seperti berbicara dengan teman.
- Jika kamu tidak tahu jawabannya, katakan terus terang bahwa kamu tidak tahu, jangan mengarang.
- Jaga agar jawaban tetap relevan dengan konteks Indonesia.
`;

/**
 * Generate session ID dari IP dan User-Agent
 * @param {object} req - Express request object
 * @returns {string} - Session ID
 */
function generateSessionId(req) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  return Buffer.from(`${ip}-${userAgent}`).toString('base64').substring(0, 16);
}

/**
 * Get conversation history untuk session
 * @param {string} sessionId - Session ID
 * @returns {Array} - Array of conversation messages
 */
function getConversationHistory(sessionId) {
  if (!conversationMemory.has(sessionId)) {
    conversationMemory.set(sessionId, {
      messages: [],
      lastActivity: Date.now()
    });
  }
  return conversationMemory.get(sessionId);
}

/**
 * Add message ke conversation history
 * @param {string} sessionId - Session ID
 * @param {string} role - 'user' atau 'assistant'
 * @param {string} content - Message content
 */
function addToConversationHistory(sessionId, role, content) {
  const conversation = getConversationHistory(sessionId);
  
  conversation.messages.push({
    role: role,
    content: content,
    timestamp: Date.now()
  });
  
  // Limit conversation length
  if (conversation.messages.length > MAX_CONVERSATION_LENGTH * 2) {
    conversation.messages = conversation.messages.slice(-MAX_CONVERSATION_LENGTH * 2);
  }
  
  conversation.lastActivity = Date.now();
}

/**
 * Build conversation context untuk Gemini
 * @param {Array} messages - Array of conversation messages
 * @returns {string} - Formatted conversation context
 */
function buildConversationContext(messages) {
  if (messages.length === 0) return '';
  
  let context = '\n\nKonteks percakapan sebelumnya:\n';
  
  // Ambil maksimal 8 pesan terakhir untuk konteks
  const recentMessages = messages.slice(-8);
  
  recentMessages.forEach(msg => {
    if (msg.role === 'user') {
      context += `Pengguna: ${msg.content}\n`;
    } else {
      context += `Sahabat Nusantara: ${msg.content}\n`;
    }
  });
  
  context += '\nPertanyaan pengguna saat ini: ';
  return context;
}

/**
 * Cleanup old conversations
 */
function cleanupOldConversations() {
  const now = Date.now();
  const cutoff = now - MEMORY_CLEANUP_INTERVAL;
  
  for (const [sessionId, conversation] of conversationMemory.entries()) {
    if (conversation.lastActivity < cutoff) {
      conversationMemory.delete(sessionId);
    }
  }
}

/**
 * Extract response text dari Gemini response
 * @param {object} resp - Response dari Gemini API
 * @returns {string} - Extracted text
 */
function extractResponseText(resp) {
  return resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
         resp?.candidates?.[0]?.content?.parts?.[0]?.text ?? 
         resp?.response?.candidates?.[0]?.content?.text ?? 
         "Maaf, terjadi kesalahan dalam memproses permintaan Anda.";
}

/**
 * Validasi model yang dipilih
 * @param {string} model - Model yang dipilih user
 * @returns {string} - Model yang valid
 */
function validateSelectedModel(model) {
  const validModels = [
    "gemini-2.5-flash",
    "gemini-1.5-pro", 
    "gemini-1.5-flash"
  ];
  
  return validModels.includes(model) ? model : GEMINI_MODEL;
}

/**
 * Handle chat request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
async function handleChatRequest(req, res) {
  try {
    // Gunakan sanitized message dari security middleware
    const sanitizedMessage = req.sanitizedMessage;
    
    // Ambil model yang dipilih user (default ke GEMINI_MODEL)
    const selectedModel = validateSelectedModel(req.body.model);

    // Generate session ID untuk conversation tracking
    const sessionId = generateSessionId(req);
    
    // Get conversation history
    const conversation = getConversationHistory(sessionId);
    
    // Build conversation context
    const conversationContext = buildConversationContext(conversation.messages);
    
    // Build full prompt dengan conversation context
    const fullPrompt = SYSTEM_PROMPT + conversationContext + sanitizedMessage;

    const resp = await genAI.models.generateContent({
      model: selectedModel,
      contents: fullPrompt,
    });

    // Extract response text
    const botMessage = extractResponseText(resp);

    // Add messages to conversation history
    addToConversationHistory(sessionId, 'user', sanitizedMessage);
    addToConversationHistory(sessionId, 'assistant', botMessage);

    // Cleanup old conversations periodically
    if (Math.random() < 0.1) { // 10% chance
      cleanupOldConversations();
    }

    // Kirim balasan dari Gemini ke frontend dengan info model
    res.json({ 
      reply: botMessage,
      model: selectedModel,
      sessionId: sessionId // Optional: untuk debugging
    });
  } catch (error) {
    console.error("Error in chat handler:", error);
    res.status(500).json({ error: "Terjadi kesalahan di server." });
  }
}

/**
 * Clear conversation history untuk session
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function handleClearConversation(req, res) {
  try {
    const sessionId = generateSessionId(req);
    
    if (conversationMemory.has(sessionId)) {
      conversationMemory.delete(sessionId);
    }
    
    res.json({ 
      success: true,
      message: "Conversation history cleared",
      sessionId: sessionId
    });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat menghapus riwayat percakapan." });
  }
}

/**
 * Health check endpoint
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
function handleHealthCheck(req, res) {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Sahabat Nusantara Chat API",
    activeConversations: conversationMemory.size
  });
}

module.exports = {
  handleChatRequest,
  handleHealthCheck,
  handleClearConversation,
  SYSTEM_PROMPT,
  GEMINI_MODEL
};
