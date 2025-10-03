/**
 * Main application script
 * Menggunakan utilities yang sudah dipisah ke file terpisah
 */

// Wait for DOM to be ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

function initializeApp() {
  // DOM elements
  const userInput = document.getElementById("user-input");
  const chatForm = document.querySelector(".chat-input-form");
  const modelSelect = document.getElementById("model-select");
  const clearChatBtn = document.getElementById("clear-chat-btn");
  const submitButton = chatForm?.querySelector('button[type="submit"]');

  // Check if required elements exist
  if (
    !userInput ||
    !chatForm ||
    !modelSelect ||
    !clearChatBtn ||
    !submitButton
  ) {
    console.error("Required DOM elements not found");
  }

  // Initialize utilities
  const BACKEND_URL = window.location.origin;
  const apiClient = new ApiClient(BACKEND_URL);
  const chatUtils = new ChatUtils(
    "#chat-box",
    "#user-input",
    '.chat-input-form button[type="submit"]'
  );
  const rateLimiter = new RateLimiter({
    maxRequests: 5,
    timeWindow: 60000, // 1 menit
  });

  // Event handler untuk form submit
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const userMessage = userInput.value.trim();

    // Cek apakah input sedang disabled (bot sedang memproses)
    if (chatUtils.isInputDisabled()) {
      return;
    }

    if (!userMessage) return;

    // Cek rate limit
    const rateLimitCheck = rateLimiter.checkRateLimit();
    if (!rateLimitCheck.allowed) {
      chatUtils.addErrorMessage(rateLimitCheck.message);
      return;
    }

    // Validasi keamanan
    const validation = SecurityUtils.validateMessage(userMessage);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Tampilkan pesan user (yang sudah disanitasi)
    chatUtils.addMessage(validation.sanitizedMessage, "user");
    userInput.value = "";

    // Flag untuk mencegah double cancel message
    let cancelMessageShown = false;

    // Tampilkan loading dengan cancel button
    const loadingMessage = chatUtils.addLoadingMessage(
      "Sedang mengetik",
      () => {
        // Cancel callback
        const cancelled = apiClient.cancelCurrentRequest();
        if (cancelled && !cancelMessageShown) {
          chatUtils.removeLoadingMessage(loadingMessage);
          chatUtils.addMessage(
            "❌ Request dibatalkan",
            "bot",
            "model-notification"
          );
          cancelMessageShown = true;
        }
      }
    );

    try {
      // Ambil model yang dipilih
      const selectedModel = modelSelect.value;

      // Kirim ke backend dengan model selection
      const result = await apiClient.sendMessage(userMessage, selectedModel);

      // Hapus loading jika belum dihapus
      if (loadingMessage && loadingMessage.parentNode) {
        chatUtils.removeLoadingMessage(loadingMessage);
      }

      if (result.success) {
        chatUtils.addMessage(result.data, "bot");
      } else if (result.cancelled && !cancelMessageShown) {
        // Request was cancelled
        chatUtils.addMessage(
          "❌ Request dibatalkan",
          "bot",
          "model-notification"
        );
        cancelMessageShown = true;
      } else if (!result.cancelled) {
        chatUtils.addErrorMessage(result.error);
      }
    } catch (error) {
      // Check if loading message still exists before removing
      if (loadingMessage && loadingMessage.parentNode) {
        chatUtils.removeLoadingMessage(loadingMessage);
      }

      // Only show error if it's not a cancellation and message not shown yet
      if (error.name !== "AbortError" && !cancelMessageShown) {
        chatUtils.addErrorMessage(
          "Maaf, terjadi kesalahan. Coba lagi nanti ya."
        );
      } else if (error.name === "AbortError" && !cancelMessageShown) {
        chatUtils.addMessage(
          "❌ Request dibatalkan",
          "bot",
          "model-notification"
        );
        cancelMessageShown = true;
      }
    }
  });

  // Prevent Enter key submission when input is disabled
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && chatUtils.isInputDisabled()) {
      e.preventDefault();
      return false;
    }
  });

  // Handle model selection change
  modelSelect.addEventListener("change", (e) => {
    const selectedModel = e.target.value;
    const modelName = e.target.options[e.target.selectedIndex].text;

    // Show notification about model change with special styling
    chatUtils.addMessage(
      `🤖 Model diubah ke: ${modelName}`,
      "bot",
      "model-notification"
    );
  });

  // End conversation button event listener
  clearChatBtn.addEventListener("click", () => {
    if (confirm("Apakah Anda yakin ingin mengakhiri percakapan ini? Semua riwayat chat akan dihapus.")) {
      chatUtils.clearChatHistory();
      chatUtils.addMessage("👋 Percakapan telah diakhiri. Terima kasih sudah mengobrol dengan Sahabat Nusantara!", "bot", "model-notification");
    }
  });

  // Initialization complete
}
