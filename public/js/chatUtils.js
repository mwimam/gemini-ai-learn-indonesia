/**
 * Chat utilities untuk mengelola tampilan dan interaksi chat
 */

class ChatUtils {
  constructor(chatBoxElement, inputElement = null, submitButton = null) {
    this.chatBox = chatBoxElement;
    this.inputElement = inputElement;
    this.submitButton = submitButton;
    this.isProcessing = false;
  }

  /**
   * Tambah pesan ke chat box
   * @param {string} text - Teks pesan
   * @param {string} sender - 'user' atau 'bot'
   * @param {string} type - Optional type untuk styling khusus
   * @returns {HTMLElement} - Element pesan yang dibuat
   */
  addMessage(text, sender, type = null) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", sender);
    
    // Add special class for model notifications
    if (type === "model-notification" || (sender === "bot" && text.includes("🤖"))) {
      messageElement.classList.add("model-notification");
    }

    const p = document.createElement("p");

    // Format pesan bot untuk menampilkan bullet points dengan baik
    if (sender === "bot") {
      const formattedText = this.formatBotMessage(text);
      p.innerHTML = formattedText;
    } else {
      p.textContent = text;
    }

    messageElement.appendChild(p);
    this.chatBox.appendChild(messageElement);
    this.scrollToBottom();

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
