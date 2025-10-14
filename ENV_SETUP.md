# Environment Setup

Create a `.env` file in the JARVIS directory with the following content:

```
OPENAI_API_KEY=your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Replace the placeholder values with your actual API keys:

1. **OpenAI API Key**: Get from https://platform.openai.com/api-keys
2. **Deepgram API Key**: Get from https://console.deepgram.com/
3. **ElevenLabs API Key**: Get from https://elevenlabs.io/app/settings/api-keys

## Important Security Notes:
- Never commit the `.env` file to version control
- Keep your API keys secure and private
- The `.env` file should only exist on your local machine

