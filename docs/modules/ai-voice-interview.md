# AI Voice Interview Module

## 📋 Overview
The AI Voice Interview module provides real-time conversational interviews using Deepgram's advanced speech technology and custom AI models.

## 🏗️ Architecture

### Core Components
- **DeepgramInterview.jsx** - Main interview interface
- **deepgramVoiceAgent.js** - Voice processing service
- **aiService.js** - AI response generation

### Key Features
- Real-time speech-to-text conversion
- Natural AI interviewer responses
- Multiple interview types (Technical, Behavioral, HR, System Design)
- Audio streaming and playback
- Interview session management

## 🔧 Implementation

### Voice Agent Setup
```javascript
class DeepgramVoiceAgent {
  async startInterview(type, userId, onMessage, onStatusChange, userData) {
    this.connection = this.deepgram.agent();
    
    this.connection.configure({
      audio: {
        input: { encoding: "linear16", sample_rate: 24000 },
        output: { encoding: "linear16", sample_rate: 16000 }
      },
      agent: {
        language: "en",
        think: { provider: { type: "open_ai", model: "gpt-4o-mini" } },
        speak: { provider: { type: "deepgram", model: "aura-2-thalia-en" } },
        greeting: this.getGreeting(type, userData)
      }
    });
  }
}
```

### Audio Processing
```javascript
async setupAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({ 
    audio: { 
      sampleRate: 24000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true
    } 
  });

  const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (event) => {
    const inputBuffer = event.inputBuffer.getChannelData(0);
    const int16Array = new Int16Array(inputBuffer.length);
    
    for (let i = 0; i < inputBuffer.length; i++) {
      int16Array[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768));
    }
    
    this.connection.send(int16Array.buffer);
  };
}
```

## 🎯 Interview Types

### Technical Interview
- Focus on coding problems and technical concepts
- Skill-based questioning adapted to user's profile
- Real-time code discussion capabilities

### Behavioral Interview
- Situational and experience-based questions
- Communication skills assessment
- Leadership and teamwork scenarios

### HR Round
- Career motivation and goals
- Company culture fit assessment
- Salary and benefits discussion

### System Design
- Architecture and scalability problems
- Trade-off discussions
- Real-world system challenges

## 📊 Data Flow

1. **Initialization**: User selects interview type
2. **Audio Setup**: Microphone permissions and audio context
3. **Connection**: Establish Deepgram agent connection
4. **Configuration**: Set AI model parameters and prompts
5. **Interview Loop**: 
   - User speaks → Audio processing → AI response
   - Real-time feedback and conversation flow
6. **Completion**: Session summary and performance metrics

## 🔧 Configuration

### Environment Variables
```env
VITE_DEEPGRAM_API_KEY=your_deepgram_api_key
```

### Audio Settings
- Sample Rate: 24kHz input, 16kHz output
- Encoding: Linear16 PCM
- Channels: Mono (1 channel)
- Buffer Size: 4096 samples

## 🚀 Usage Example

```javascript
import DeepgramInterview from './components/DeepgramInterview';

function InterviewPage() {
  const [showInterview, setShowInterview] = useState(false);
  
  return (
    <div>
      {showInterview ? (
        <DeepgramInterview onClose={() => setShowInterview(false)} />
      ) : (
        <button onClick={() => setShowInterview(true)}>
          Start Interview
        </button>
      )}
    </div>
  );
}
```

## 🔍 Performance Optimizations

- **Audio Buffering**: Efficient audio chunk processing
- **Connection Management**: Automatic reconnection handling
- **Memory Management**: Proper cleanup of audio contexts
- **Error Handling**: Graceful degradation for network issues

## 🧪 Testing

### Unit Tests
- Audio processing functions
- Connection state management
- Interview type configuration

### Integration Tests
- End-to-end interview flow
- Audio quality validation
- AI response accuracy

## 🔮 Future Enhancements

- Multi-language support
- Video interview capabilities
- Advanced emotion detection
- Real-time code sharing
- Interview recording and playback