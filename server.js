const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const OpenAI = require('openai');
const { createClient } = require('@deepgram/sdk');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON and file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'audio');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'recording.wav');
  }
});

const upload = multer({ storage });

// Function to clean up old audio files (keep only last 10 files)
const cleanupOldAudioFiles = () => {
  try {
    const audioDir = path.join(__dirname, 'audio');
    if (!fs.existsSync(audioDir)) return;
    
    const files = fs.readdirSync(audioDir)
      .filter(file => file.startsWith('response_') && file.endsWith('.wav'))
      .map(file => ({
        name: file,
        path: path.join(audioDir, file),
        stats: fs.statSync(path.join(audioDir, file))
      }))
      .sort((a, b) => b.stats.mtime - a.stats.mtime); // Sort by modification time, newest first
    
    // Keep only the 10 most recent files
    if (files.length > 10) {
      files.slice(10).forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up old audio file: ${file.name}`);
      });
    }
  } catch (error) {
    console.error('Error cleaning up audio files:', error);
  }
};

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

// Context for the AI assistant
let context = "You are Jarvis, Rudra's human assistant. You are witty and full of personality. Your answers should be limited to 1-2 short sentences.";

// Helper function to log status
const logStatus = (message) => {
  console.log(message);
  fs.writeFileSync(path.join(__dirname, 'status.txt'), message);
};

// Helper function to append to conversation
const appendToConversation = (text) => {
  const convPath = path.join(__dirname, 'conv.txt');
  fs.appendFileSync(convPath, text + '\n');
};

// Serve static files from the JARVIS directory
app.use(express.static(path.join(__dirname)));

// Route to serve conv.txt
app.get('/conv.txt', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'conv.txt');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } else {
      res.status(404).send('conv.txt not found');
    }
  } catch (error) {
    console.error('Error reading conv.txt:', error);
    res.status(500).send('Error reading conv.txt');
  }
});

// Route to serve status.txt
app.get('/status.txt', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'status.txt');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } else {
      res.status(404).send('status.txt not found');
    }
  } catch (error) {
    console.error('Error reading status.txt:', error);
    res.status(500).send('Error reading status.txt');
  }
});

// Route to clear conversation
app.post('/clear-conversation', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'conv.txt');
    fs.writeFileSync(filePath, '', 'utf8');
    res.status(200).send('Conversation cleared');
  } catch (error) {
    console.error('Error clearing conversation:', error);
    res.status(500).send('Error clearing conversation');
  }
});

// Route to process audio recording
app.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    logStatus('Processing audio...');
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    
    // Step 1: Transcribe audio using Deepgram
    logStatus('Transcribing audio...');
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      fs.readFileSync(audioPath),
      {
        model: 'nova-2',
        smart_format: true,
      }
    );

    if (error) {
      throw new Error(`Deepgram error: ${error.message}`);
    }

    const transcription = result.results.channels[0].alternatives[0].transcript;
    
    if (!transcription || transcription.trim() === '') {
      logStatus('No speech detected');
      return res.json({ 
        success: false, 
        message: 'No speech detected in audio' 
      });
    }

    // Add transcription to conversation
    appendToConversation(transcription);
    logStatus(`Transcribed: ${transcription}`);

    // Step 2: Generate AI response using OpenAI
    logStatus('Generating AI response...');
    context += `\nAlex: ${transcription}\nJarvis: `;
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Jarvis, Rudra\'s human assistant. You are witty and full of personality. Your answers should be limited to 1-2 short sentences.'
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0].message.content;
    context += aiResponse;
    
    // Add AI response to conversation
    appendToConversation(aiResponse);
    logStatus(`AI Response: ${aiResponse}`);

    // Step 3: Convert response to speech using ElevenLabs
    logStatus('Converting to speech...');
    const timestamp = Date.now();
    const ttsResponse = await convertToSpeech(aiResponse, timestamp);
    
    if (ttsResponse.success) {
      logStatus('Audio generated successfully');
      res.json({
        success: true,
        transcription: transcription,
        response: aiResponse,
        audioUrl: `/audio/response_${timestamp}.wav`
      });
    } else {
      logStatus('TTS failed, returning text response');
      res.json({
        success: true,
        transcription: transcription,
        response: aiResponse,
        audioUrl: null
      });
    }

  } catch (error) {
    console.error('Error processing audio:', error);
    logStatus(`Error: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Function to convert text to speech using ElevenLabs
async function convertToSpeech(text, timestamp) {
  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      },
      {
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY
        },
        responseType: 'arraybuffer'
      }
    );

    // Save the audio file with unique timestamp
    const audioPath = path.join(__dirname, 'audio', `response_${timestamp}.wav`);
    fs.writeFileSync(audioPath, response.data);
    
    // Clean up old audio files
    cleanupOldAudioFiles();
    
    return { success: true, path: audioPath };
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    return { success: false, error: error.message };
  }
}

// Route to get audio file
app.get('/audio/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'audio', filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('Audio file not found');
  }
});

// Route to start/stop listening
app.post('/toggle-listening', (req, res) => {
  const { isListening } = req.body;
  if (isListening) {
    logStatus('Listening...');
  } else {
    logStatus('Idle');
  }
  res.json({ success: true, status: isListening ? 'Listening...' : 'Idle' });
});

app.listen(PORT, () => {
  console.log(`🚀 Jarvis Server running on http://localhost:${PORT}`);
  console.log('📁 Serving files from:', __dirname);
  logStatus('Server started - Ready for commands');
});
