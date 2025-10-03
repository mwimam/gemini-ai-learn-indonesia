# 🇮🇩 Sahabat Nusantara - AI Chat Assistant

![Sahabat Nusantara](public/favicon.svg)

**Sahabat Nusantara** adalah aplikasi chat AI yang dirancang khusus untuk membantu pengguna belajar tentang Indonesia. Dengan menggunakan teknologi Google Gemini AI, aplikasi ini memberikan informasi mendalam tentang budaya, sejarah, geografi, dan berbagai aspek kehidupan di Indonesia.

## ✨ Fitur Utama

### 🤖 **AI-Powered Chat**

- **Multiple AI Models**: Gemini 2.5 Flash, Gemini 2.5 Pro
- **Contextual Conversations**: AI mengingat percakapan sebelumnya
- **Indonesian Focus**: Khusus dilatih untuk topik Indonesia
- **Real-time Responses**: Respons cepat dan akurat

### 💾 **Persistent Chat History**

- **LocalStorage**: Riwayat chat tersimpan di browser
- **6 Hour TTL**: Data otomatis expire setelah 6 jam
- **Cross-session**: Chat history tetap ada setelah refresh
- **Memory Management**: Automatic cleanup dan size limiting

### 🎨 **Modern UI/UX**

- **Responsive Design**: Optimal di semua device (320px - desktop)
- **Material Design**: Interface yang clean dan modern
- **Dark/Light Mode**: Automatic theme detection (currently light-only)
- **Smooth Animations**: Transisi yang halus dan natural

### 🔒 **Security & Performance**

- **Input Validation**: Sanitasi dan validasi input pengguna
- **Rate Limiting**: Perlindungan dari spam dan abuse
- **XSS Protection**: Security headers dan input sanitization
- **Error Handling**: Graceful error handling dan recovery

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 atau lebih baru)
- NPM atau Yarn
- Google Gemini API Key

### Installation

1. **Clone Repository**

   ```bash
   git clone https://github.com/yourusername/sahabat-nusantara.git
   cd sahabat-nusantara
   ```

2. **Install Dependencies**

   ```bash
   npm run install-deps
   ```

3. **Environment Setup**

   ```bash
   cd backend
   cp .env.example .env
   ```

   Edit `backend/.env` file:

   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```

4. **Start Application**

   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

5. **Open Browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
gemini-ai-learn-indonesia/
├── backend/                    # Backend Node.js application
│   ├── config/
│   │   └── app.js             # Application configuration
│   ├── middleware/
│   │   ├── rateLimit.js       # Rate limiting middleware
│   │   └── security.js        # Security middleware
│   ├── routes/
│   │   └── chat.js            # Chat API routes
│   ├── services/
│   │   └── gemini.js          # Gemini AI service
│   ├── .env.example           # Environment variables template
│   ├── index.js               # Main server file
│   └── package.json           # Backend dependencies
├── public/                     # Frontend static files
│   ├── js/
│   │   ├── apiClient.js       # API communication
│   │   ├── chatStorage.js     # LocalStorage management
│   │   ├── chatUtils.js       # Chat UI utilities
│   │   ├── rateLimit.js       # Client-side rate limiting
│   │   └── securityUtils.js   # Input validation
│   ├── favicon.svg            # Garuda Indonesia favicon
│   ├── index.html             # Main HTML file
│   ├── manifest.json          # PWA manifest
│   └── style-new.css          # Main stylesheet
└── README.md                  # This file
```

## 🛠️ Technology Stack

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Google Gemini AI**: AI language model
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

### Frontend

- **Vanilla JavaScript**: No framework dependencies
- **CSS3**: Modern styling with flexbox/grid
- **HTML5**: Semantic markup
- **PWA**: Progressive Web App features

### Features

- **Responsive Design**: Mobile-first approach
- **LocalStorage**: Client-side data persistence
- **Rate Limiting**: Both client and server-side
- **Security**: Input sanitization and validation

## 🎯 API Endpoints

### `GET /api/health`

Health check endpoint

```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "activeConversations": 0
}
```

### `POST /api/chat`

Send message to AI

```json
{
  "message": "Apa itu Borobudur?",
  "model": "gemini-2.5-flash"
}
```

Response:

```json
{
  "success": true,
  "data": "Borobudur adalah candi Buddha terbesar di dunia..."
}
```

### `POST /api/clear-conversation`

Clear conversation history

```json
{
  "success": true,
  "message": "Conversation cleared"
}
```

## 🔧 Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
PORT=3000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```

### AI Models

- **gemini-2.5-flash**: Fastest response, good for quick questions
- **gemini-2.5-pro**: Most accurate, best for complex topics and reasoning

## 📱 Responsive Breakpoints

- **Extra Small**: ≤320px (iPhone SE)
- **Small Mobile**: 321px - 479px
- **Large Mobile**: 480px - 575px
- **Tablet Portrait**: 576px - 767px
- **Tablet Landscape**: 768px - 991px
- **Desktop**: 992px - 1199px
- **Large Desktop**: ≥1200px

## 🔒 Security Features

### Input Validation

- XSS protection
- HTML sanitization
- Message length limiting
- Pattern detection for malicious content

### Rate Limiting

- Server-side: 10 requests per minute per IP
- Client-side: 5 requests per minute per session
- Automatic cooldown periods

### CORS Configuration

- Restricted origins in production
- Secure headers implementation
- Content Security Policy

## 🎨 Customization

### Themes

Currently supports light theme only. Dark mode is commented out but can be enabled by uncommenting the dark mode CSS in `style-new.css`.

### Colors

Main brand colors:

- Primary: `#d9534f` (Red)
- Secondary: `#6c757d` (Gray)
- Success: `#28a745` (Green)
- Info: `#007bff` (Blue)

### Fonts

- Primary: Segoe UI, Tahoma, Geneva, Verdana, sans-serif
- Fallback: System fonts

## 🚀 Deployment

### Production Build

1. Set environment to production:

   ```env
   NODE_ENV=production
   ```

2. Configure production API key and settings

3. Deploy to your preferred platform:
   - **Heroku**: `git push heroku main`
   - **Vercel**: `vercel --prod`
   - **Netlify**: Drag and drop or Git integration
   - **VPS**: PM2 or Docker deployment

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/ .
COPY public/ ./public/
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for the powerful language model
- **Indonesian Culture** for the rich content inspiration
- **Open Source Community** for the tools and libraries used

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/gemini-ai-learn-indonesia/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gemini-ai-learn-indonesia/discussions)
- **Email**: imamsyafiisatu@gmail.com

## 🗺️ Roadmap

### v2.0 (Planned)

- [ ] User authentication
- [ ] Chat export/import
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Advanced AI model selection
- [ ] Chat sharing features

### v1.1 (Current)

- [x] Responsive design
- [x] LocalStorage persistence
- [x] Multiple AI models
- [x] Security enhancements
- [x] PWA features

---

**Made with ❤️ for Indonesia** 🇮🇩

_Sahabat Nusantara - Your AI companion to explore the beauty of Indonesia_
