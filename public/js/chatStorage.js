/**
 * Chat Storage Manager
 * Mengelola penyimpanan chat history di localStorage dengan TTL
 */

class ChatStorage {
  constructor() {
    this.storageKey = "sahabat_nusantara_chat_history";
    this.ttlHours = 6; // 6 jam
    this.maxMessages = 50; // Maksimal 50 pesan tersimpan

    // Cleanup expired data saat inisialisasi
    this.cleanup();
  }

  /**
   * Get current timestamp
   * @returns {number} - Current timestamp in milliseconds
   */
  getCurrentTimestamp() {
    return Date.now();
  }

  /**
   * Check if data is expired
   * @param {number} timestamp - Timestamp to check
   * @returns {boolean} - True if expired
   */
  isExpired(timestamp) {
    const ttlMs = this.ttlHours * 60 * 60 * 1000; // Convert hours to milliseconds
    return this.getCurrentTimestamp() - timestamp > ttlMs;
  }

  /**
   * Get chat history from localStorage
   * @returns {Array} - Array of chat messages
   */
  getChatHistory() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return [];

      const data = JSON.parse(stored);

      // Check if data is expired
      if (this.isExpired(data.timestamp)) {
        this.clearChatHistory();
        return [];
      }

      return data.messages || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save chat history to localStorage
   * @param {Array} messages - Array of chat messages
   */
  saveChatHistory(messages) {
    try {
      // Limit number of messages
      const limitedMessages = messages.slice(-this.maxMessages);

      const data = {
        messages: limitedMessages,
        timestamp: this.getCurrentTimestamp(),
        version: "1.0",
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      // Handle storage quota exceeded
      if (error.name === "QuotaExceededError") {
        this.clearOldMessages();
        // Try again with fewer messages
        this.saveChatHistory(messages.slice(-25));
      }
    }
  }

  /**
   * Add single message to chat history
   * @param {string} content - Message content
   * @param {string} sender - 'user' or 'bot'
   * @param {string} type - Message type (optional)
   */
  addMessage(content, sender, type = "normal") {
    const messages = this.getChatHistory();

    const newMessage = {
      id: this.generateMessageId(),
      content: content,
      sender: sender,
      type: type,
      timestamp: this.getCurrentTimestamp(),
    };

    messages.push(newMessage);
    this.saveChatHistory(messages);
  }

  /**
   * Generate unique message ID
   * @returns {string} - Unique message ID
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all chat history
   */
  clearChatHistory() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      // Silent fail
    }
  }

  /**
   * Clear old messages to free up space
   */
  clearOldMessages() {
    const messages = this.getChatHistory();
    const recentMessages = messages.slice(-15); // Keep only 15 recent messages
    this.saveChatHistory(recentMessages);
  }

  /**
   * Cleanup expired data
   */
  cleanup() {
    const messages = this.getChatHistory();
    // getChatHistory already handles cleanup, so this will trigger it
  }

  /**
   * Get storage info
   * @returns {Object} - Storage information
   */
  getStorageInfo() {
    const messages = this.getChatHistory();
    const stored = localStorage.getItem(this.storageKey);
    const sizeKB = stored ? (stored.length / 1024).toFixed(2) : 0;

    return {
      messageCount: messages.length,
      sizeKB: sizeKB,
      maxMessages: this.maxMessages,
      ttlHours: this.ttlHours,
      isSupported: this.isLocalStorageSupported(),
    };
  }

  /**
   * Check if localStorage is supported
   * @returns {boolean} - True if supported
   */
  isLocalStorageSupported() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, "test");
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Export chat history as JSON
   * @returns {string} - JSON string of chat history
   */
  exportChatHistory() {
    const messages = this.getChatHistory();
    const exportData = {
      messages: messages,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import chat history from JSON
   * @param {string} jsonData - JSON string to import
   * @returns {boolean} - True if successful
   */
  importChatHistory(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      if (data.messages && Array.isArray(data.messages)) {
        this.saveChatHistory(data.messages);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

// Export untuk digunakan di module lain
window.ChatStorage = ChatStorage;
