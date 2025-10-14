# 🚀 Jarvis Bot - MERN Stack Voice Assistant

A modern voice-activated AI assistant built with React, Express, and cutting-edge AI services. Speak to Jarvis and get intelligent responses with natural voice synthesis.

## 🎯 Features

- **🎤 Voice Recording**: Browser-based audio recording with real-time status indicators
- **🧠 AI Processing**: OpenAI GPT-3.5 for intelligent, contextual responses
- **📝 Speech-to-Text**: Deepgram for accurate audio transcription
- **🔊 Text-to-Speech**: ElevenLabs for natural voice synthesis
- **💬 Real-time Chat**: Live conversation display with automatic updates
- **🎨 Modern UI**: Beautiful React interface with dark theme and responsive design
- **🔄 Live Updates**: Conversation updates every 500ms for real-time experience

## 📋 Prerequisites

Before running this project, ensure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **API Keys** for the following services:
   - OpenAI API key
   - Deepgram API key
   - ElevenLabs API key

## 🔑 Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up/Login to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key for your `.env` file

### Deepgram API Key
1. Go to [Deepgram Console](https://console.deepgram.com/)
2. Sign up/Login to your account
3. Create a new project
4. Generate an API key from the project dashboard
5. Copy the key for your `.env` file

### ElevenLabs API Key
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up/Login to your account
3. Navigate to Profile Settings
4. Go to API Keys section
5. Copy your API key for your `.env` file

## ⚙️ Local Setup Instructions

### 1. Clone/Navigate to Project Directory
```bash
cd "C:\Users\rudra\Desktop\Jarvis Bot\JARVIS"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the JARVIS directory:

```env
# API Keys for Jarvis Bot MERN Stack
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Server Configuration (optional)
PORT=3001
NODE_ENV=development
```

**Important**: Replace the placeholder values with your actual API keys.

### 4. Start the Application
Run the development server:
```bash
npm run dev
```

This command will start both servers simultaneously:
- **Backend server** on http://localhost:3001
- **React frontend** on http://localhost:3000

### 5. Access Your Application
Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🎤 How to Use

1. **Open the application** in your browser (http://localhost:3000)
2. **Allow microphone access** when prompted by your browser
3. **Click "Start Recording"** and speak your message clearly
4. **Click "Stop Recording"** when you're finished speaking
5. **Wait for processing** - Jarvis will:
   - Transcribe your speech using Deepgram
   - Generate an intelligent response using OpenAI GPT-3.5
   - Convert the response to speech using ElevenLabs
   - Play the audio response automatically
   - Display the conversation in real-time

## 🔧 Available Scripts

```bash
# Start both frontend and backend servers
npm run dev

# Start only the backend server
npm run server

# Start only the React frontend
npm start

# Build the React app for production
npm run build

# Run tests
npm test
```

## 🌐 API Endpoints

### Backend Endpoints (Port 3001)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/process-audio` | Process voice recording and return AI response |
| `GET` | `/conv.txt` | Get conversation history |
| `GET` | `/status.txt` | Get current system status |
| `POST` | `/clear-conversation` | Clear conversation history |
| `POST` | `/toggle-listening` | Update listening status |
| `GET` | `/audio/:filename` | Serve audio files |

### Frontend Routes (Port 3000)
- `/` - Main application interface

## 📁 Project Structure

```
JARVIS/
├── src/
│   ├── App.js          # Main React component with voice controls
│   ├── App.css         # Application styles and theme
│   ├── index.js        # React application entry point
│   └── index.css       # Global styles
├── public/
│   └── index.html      # HTML template
├── audio/              # Audio files storage directory
│   ├── recording.wav   # User voice recordings
│   └── response.wav    # AI response audio
├── server.js           # Express backend server
├── package.json        # Dependencies and scripts
├── .env               # Environment variables (create this)
├── conv.txt           # Conversation history
├── status.txt         # Current system status
├── start.bat          # Windows batch file for easy startup
└── README.md          # This file
```

## 🔄 How It Works

### Voice Processing Pipeline
1. **Audio Recording**: Browser captures microphone input using MediaRecorder API
2. **Speech-to-Text**: Audio is sent to Deepgram for accurate transcription
3. **AI Processing**: Transcription is processed by OpenAI GPT-3.5 for intelligent responses
4. **Text-to-Speech**: AI response is converted to speech using ElevenLabs
5. **Audio Playback**: Generated speech is played through the browser
6. **Real-time Updates**: Conversation is displayed and updated every 500ms

### Technology Stack
- **Frontend**: React 18.2.0 with modern hooks
- **Backend**: Express.js with CORS and file upload handling
- **AI Services**: OpenAI GPT-3.5, Deepgram Nova-2, ElevenLabs
- **Audio Processing**: MediaRecorder API, FormData for file uploads
- **Development**: Concurrently for running multiple servers

## 🚨 Troubleshooting

### Common Issues

#### 1. Microphone Permission Denied
- **Solution**: Check browser permissions for microphone access
- **Note**: Application requires HTTPS or localhost for microphone access

#### 2. API Key Errors
- **Solution**: Verify all API keys are correct in your `.env` file
- **Check**: Ensure API keys have proper permissions and quotas
- **Test**: Try API calls individually to isolate issues

#### 3. Audio Not Playing
- **Solution**: Check browser audio settings and volume
- **Check**: Ensure audio files are being generated in the `audio/` directory
- **Test**: Try playing audio files directly from the file system

#### 4. Port Already in Use
```bash
# Kill existing Node.js processes (Windows)
taskkill /F /IM node.exe

# Then restart the application
npm run dev
```

#### 5. Dependencies Installation Issues
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 6. Environment Variables Not Loading
- **Check**: Ensure `.env` file is in the JARVIS directory (same level as package.json)
- **Verify**: File format is correct (no spaces around = sign)
- **Restart**: Restart the development server after creating/modifying `.env`

### Browser Compatibility
- ✅ **Chrome** (recommended) - Full support
- ✅ **Firefox** - Full support
- ✅ **Edge** - Full support
- ⚠️ **Safari** - Limited support (some audio features may not work)

## 🚀 Development Workflow

### Backend Development
1. Modify `server.js` for API changes
2. Add new endpoints as needed
3. Test with Postman, curl, or browser developer tools
4. Restart server to apply changes

### Frontend Development
1. Modify `src/App.js` for UI changes
2. Update `src/App.css` for styling
3. Changes are automatically reflected with hot reload
4. Test voice functionality in browser

### Testing Checklist
- [ ] Voice recording starts and stops correctly
- [ ] Audio transcription is accurate
- [ ] AI responses are relevant and contextual
- [ ] Audio playback works properly
- [ ] Conversation history updates in real-time
- [ ] Clear conversation functionality works

## 🔒 Security Notes

- **Never commit** the `.env` file to version control
- **Keep API keys secure** and private
- **Use environment variables** for all sensitive configuration
- **Regularly rotate** API keys for security

## 📞 Support

If you encounter issues not covered in this guide:

1. **Check the console** for error messages in both browser and terminal
2. **Verify API keys** and their permissions
3. **Test each component** individually (recording, transcription, AI, TTS)
4. **Check browser compatibility** and permissions
5. **Review the troubleshooting section** above

## 🎉 Getting Started

Once everything is set up:

1. Run `npm run dev`
2. Open http://localhost:3000
3. Allow microphone access
4. Click "Start Recording" and say "Hello Jarvis!"
5. Enjoy your AI voice assistant!

---

**Built with ❤️ using React, Express, OpenAI, Deepgram, and ElevenLabs**
