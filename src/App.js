import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [conversation, setConversation] = useState([]);
  const [status, setStatus] = useState('Idle');
  const [selectedRow, setSelectedRow] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Function to read conv.txt file
  const readConversationFile = async () => {
    try {
      const response = await fetch('http://localhost:3001/conv.txt');
      const text = await response.text();
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines;
    } catch (error) {
      console.error('Error reading conv.txt:', error);
      return [];
    }
  };

  // Function to read status.txt file
  const readStatusFile = async () => {
    try {
      const response = await fetch('http://localhost:3001/status.txt');
      const text = await response.text();
      return text.trim();
    } catch (error) {
      console.error('Error reading status.txt:', error);
      return 'Idle';
    }
  };

  // Function to update conversation and status
  const updateConversation = useCallback(async () => {
    const newConversation = await readConversationFile();
    const newStatus = await readStatusFile();
    
    // Only update if conversation has changed
    if (JSON.stringify(newConversation) !== JSON.stringify(conversation)) {
      setConversation(newConversation);
      setSelectedRow(newConversation.length - 1);
    }
    
    setStatus(newStatus);
  }, [conversation]);

  // Function to clear conversation
  const clearConversation = async () => {
    try {
      await fetch('http://localhost:3001/clear-conversation', { method: 'POST' });
      setConversation([]);
      setSelectedRow(0);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  };

  // Function to start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      await fetch('http://localhost:3001/toggle-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isListening: true })
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      await fetch('http://localhost:3001/toggle-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isListening: false })
      });
    }
  };

  // Function to process audio
  const processAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:3001/process-audio', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        // Play the AI response audio if available
        if (result.audioUrl) {
          playAudio(result.audioUrl);
        }
        
        // Update conversation
        await updateConversation();
      } else {
        alert('Error processing audio: ' + (result.error || result.message));
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to play audio
  const playAudio = (audioUrl) => {
    // Pause any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    // Add cache-busting parameter to ensure fresh audio
    const cacheBuster = `?t=${Date.now()}`;
    const audio = new Audio(`http://localhost:3001${audioUrl}${cacheBuster}`);
    
    // Set up event handlers before playing
    audio.onended = () => {
      setCurrentAudio(null);
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      setCurrentAudio(null);
    };
    
    // Set the current audio reference before attempting to play
    setCurrentAudio(audio);
    
    // Wait for audio to be ready and then play
    audio.addEventListener('canplaythrough', () => {
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
        setCurrentAudio(null);
      });
    }, { once: true });
    
    // Fallback: try to play immediately if already loaded
    if (audio.readyState >= 3) { // HAVE_FUTURE_DATA
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
        setCurrentAudio(null);
      });
    }
  };

  // Set up periodic polling
  useEffect(() => {
    // Initial load
    updateConversation();

    // Set up interval for periodic updates (every 500ms like the original)
    intervalRef.current = setInterval(updateConversation, 500);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio, updateConversation]);

  // Function to apply styles based on message index
  const getMessageStyle = (index) => {
    return index % 2 === 0 ? 'user_message' : 'gpt_message';
  };

  return (
    <div className="app">
      <div className="layout">
        {/* Sidebar */}
        <div className="sidebar">
          <h1 className="logo-text">
            React <span className="color-primary">Jarvis</span>
          </h1>
          
          {/* Voice Control Section */}
          <div className="voice-controls">
            <button 
              className={`record-btn ${isRecording ? 'recording' : ''} ${isProcessing ? 'processing' : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
            >
              {isRecording ? (
                <span className="pulse">🎤 Recording...</span>
              ) : isProcessing ? (
                <span>⚙️ Processing...</span>
              ) : (
                <span>🎤 Start Recording</span>
              )}
            </button>
          </div>

          <button 
            className="new-conversation-btn" 
            onClick={clearConversation}
          >
            New Conversation
          </button>
          
          <div className="status">{status}</div>
        </div>

        {/* Main conversation area */}
        <div className="conversation-container">
          <div className="conversation-table">
            {conversation.map((message, index) => (
              <div 
                key={index}
                className={`message-row ${getMessageStyle(index)}`}
                style={{ 
                  backgroundColor: index === selectedRow ? 'rgba(255, 255, 255, 0.1)' : 'transparent' 
                }}
              >
                <div className="message-content">
                  {message}
                </div>
              </div>
            ))}
            {conversation.length === 0 && (
              <div className="empty-state">
                <h3>🎤 Ready to Chat!</h3>
                <p>Click "Start Recording" and speak to begin your conversation with Jarvis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
