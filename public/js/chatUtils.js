/**
 * Chat utilities untuk mengelola tampilan dan interaksi chat
 */

class ChatUtils {
  constructor(chatBoxSelector, inputSelector, sendButtonSelector) {
    this.chatBox = document.querySelector(chatBoxSelector);
    this.inputElement = document.querySelector(inputSelector);
    this.submitButton = document.querySelector(sendButtonSelector);
    this.endConversationButton = document.querySelector('#clear-chat-btn');
    this.isProcessing = false;
    
    
    // Initialize chat storage
    this.storage = new ChatStorage();
    
    // Load existing chat history on initialization
    this.loadChatHistory();
  }

  /**
   * Tambah pesan ke chat box
   * @param {string} text - Teks pesan
   * @param {string} sender - 'user' atau 'bot'
   * @returns {HTMLElement} - Element pesan yang dibuat
   */
  addMessage(text, sender, type = null) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);

    if (type) {
      messageElement.classList.add(type);
    }

    const p = document.createElement("p");

    if (sender === "bot") {
      // Format bot messages dengan markdown-like formatting
      p.innerHTML = this.formatBotMessage(text);
    } else {
      p.textContent = text;
    }

    messageElement.appendChild(p);
    this.chatBox.appendChild(messageElement);
    this.scrollToBottom();

    // Save to localStorage (skip loading messages and notifications)
    if (type !== 'loading' && type !== 'model-notification') {
      this.storage.addMessage(text, sender, type || 'normal');
    }

    return messageElement;
  }

  /**
   * Format pesan bot dengan markdown-like formatting
   * @param {string} text - Teks yang akan diformat
   * @returns {string} - HTML yang sudah diformat
   */
  formatBotMessage(text) {
    // Step 1: Handle bold text first (double asterisk)
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    
    // Step 2: Handle italic text (single asterisk) - avoid conflicts with bold
    // Use placeholder to avoid conflicts
    formatted = formatted.replace(/<strong>(.*?)<\/strong>/g, "BOLD_PLACEHOLDER_$1_BOLD_PLACEHOLDER");
    formatted = formatted.replace(/\*([^*\n]+?)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/BOLD_PLACEHOLDER_(.*?)_BOLD_PLACEHOLDER/g, "<strong>$1</strong>");
    
    // Step 3: Handle other formatting
    return formatted
      // Hapus numbering (1. 2. 3. dll) di awal baris
      .replace(/^\d+\.\s+/gm, "") 
      // Bullet points dengan * di awal baris
      .replace(/^• /gm, "• ") // Preserve existing bullets
      .replace(/^\* /gm, "• ") // Convert * bullets to •
      // Line breaks
      .replace(/\n/g, "<br>");
  }

  /**
   * Scroll chat box ke bawah
   */
  scrollToBottom() {
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      this.chatBox.scrollTop = this.chatBox.scrollHeight;
    });
  }

  /**
   * Scroll ke bawah dengan delay (untuk loading messages)
   */
  scrollToBottomDelayed() {
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  /**
   * Load chat history dari localStorage
   */
  loadChatHistory() {
    if (!this.storage.isLocalStorageSupported()) {
      return;
    }

    const messages = this.storage.getChatHistory();
    
    if (messages.length === 0) {
      // Show welcome message for new users
      this.addWelcomeMessage();
      return;
    }

    // Clear current chat box
    this.chatBox.innerHTML = '';

    // Load messages from storage
    messages.forEach(msg => {
      this.displayStoredMessage(msg);
    });

    this.scrollToBottom();
  }

  /**
   * Display message dari storage tanpa menyimpan lagi
   * @param {Object} message - Message object dari storage
   */
  displayStoredMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", message.sender);

    if (message.type && message.type !== 'normal') {
      messageElement.classList.add(message.type);
    }

    const p = document.createElement("p");

    if (message.sender === "bot") {
      p.innerHTML = this.formatBotMessage(message.content);
    } else {
      p.textContent = message.content;
    }

    messageElement.appendChild(p);
    this.chatBox.appendChild(messageElement);
  }

  /**
   * Add welcome message untuk user baru
   */
  addWelcomeMessage() {
    this.displayStoredMessage({
      content: "Halo! Aku Sahabat Nusantara. Yuk, tanya apa saja tentang Indonesia kepadaku!",
      sender: "bot",
      type: "normal"
    });
  }

  /**
   * Clear chat history
   */
  clearChatHistory() {
    this.storage.clearChatHistory();
    this.chatBox.innerHTML = '';
    this.addWelcomeMessage();
  }

  /**
   * Get storage info untuk debugging
   * @returns {Object} - Storage information
   */
  getStorageInfo() {
    return this.storage.getStorageInfo();
  }

  /**
   * Disable input saat bot sedang memproses
   */
  disableInput() {
    this.isProcessing = true;

    if (this.inputElement) {
      this.inputElement.disabled = true;
      this.inputElement.placeholder = "Bot sedang mengetik...";
    }

    if (this.submitButton) {
      this.submitButton.disabled = true;
      this.submitButton.textContent = "Menunggu...";
    }

    if (this.endConversationButton) {
      this.endConversationButton.disabled = true;
    }
  }

  /**
   * Enable input setelah bot selesai memproses
   */
  enableInput() {
    this.isProcessing = false;

    if (this.inputElement) {
      this.inputElement.disabled = false;
      this.inputElement.placeholder = "Ketik pesanmu di sini...";
      this.inputElement.focus(); // Auto focus untuk UX yang lebih baik
    }

    if (this.submitButton) {
      this.submitButton.disabled = false;
      this.submitButton.textContent = "Kirim";
    }

    if (this.endConversationButton) {
      this.endConversationButton.disabled = false;
    }
  }

  /**
   * Cek apakah sedang dalam proses
   * @returns {boolean}
   */
  isInputDisabled() {
    return this.isProcessing;
  }

  /**
   * Tambah loading indicator dan disable input
   * @param {string} message - Pesan loading (default: "Sedang mengetik")
   * @param {Function} onCancel - Callback function saat cancel diklik
   * @returns {HTMLElement} - Element loading
   */
  addLoadingMessage(message = "Sedang mengetik", onCancel = null) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", "bot", "loading");

    const p = document.createElement("p");
    
    // Create message content with typing dots
    const messageContent = document.createElement("span");
    messageContent.innerHTML = `${message}<span class="typing-dots"><span></span><span></span><span></span></span>`;
    
    p.appendChild(messageContent);
    
    // Add cancel button if callback provided
    if (onCancel && typeof onCancel === 'function') {
      const cancelButton = document.createElement("button");
      cancelButton.className = "cancel-btn";
      cancelButton.innerHTML = "×";
      cancelButton.title = "Batalkan";
      cancelButton.setAttribute('aria-label', 'Batalkan request');
      cancelButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      };
      p.appendChild(cancelButton);
    }

    messageElement.appendChild(p);
    this.chatBox.appendChild(messageElement);
    this.scrollToBottom();
    
    this.disableInput(); // Disable input saat loading
    this.scrollToBottomDelayed(); // Scroll dengan delay untuk loading
    return messageElement;
  }

  /**
   * Hapus loading indicator dan enable input
   * @param {HTMLElement} loadingElement - Element loading yang akan dihapus
   */
  removeLoadingMessage(loadingElement) {
    if (loadingElement && loadingElement.parentNode) {
      loadingElement.remove();
    }
    this.enableInput(); // Enable input setelah loading selesai
  }

  /**
   * Clear semua pesan di chat
   */
  clearChat() {
    this.chatBox.innerHTML = "";
  }

  /**
   * Tambah pesan error
   * @param {string} errorMessage - Pesan error
   */
  addErrorMessage(errorMessage) {
    this.addMessage(errorMessage, "bot");
  }
}

// Export untuk digunakan di file lain
window.ChatUtils = ChatUtils;
