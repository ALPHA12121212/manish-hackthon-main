import { createClient, AgentEvents } from "@deepgram/sdk";

class DeepgramVoiceAgent {
  constructor() {
    this.deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY);
    this.connection = null;
    this.audioBuffer = new Uint8Array(0);
    this.isConnected = false;
    this.currentInterview = null;
    this.onMessage = null;
    this.onStatusChange = null;
  }

  async startInterview(type, userId, onMessage, onStatusChange, userData = null) {
    this.currentInterview = { type, userId, startTime: Date.now() };
    this.onMessage = onMessage;
    this.onStatusChange = onStatusChange;
    this.userData = userData;
    this.interviewType = type;

    try {
      await this.connectToDeepgram();
      await this.setupAudio();
      
      console.log('Interview started, agent should greet automatically');
      
      this.onStatusChange?.({ isConnected: true, isListening: true });
      return true;
    } catch (error) {
      console.error('Failed to start interview:', error);
      return false;
    }
  }

  async connectToDeepgram() {
    this.connection = this.deepgram.agent();
    
    return new Promise((resolve, reject) => {
      this.connection.on(AgentEvents.Welcome, () => {
        console.log('Welcome to the Deepgram Voice Agent!');
        
        this.connection.configure({
          audio: {
            input: {
              encoding: "linear16",
              sample_rate: 24000,
            },
            output: {
              encoding: "linear16",
              sample_rate: 16000,
              container: "wav",
            },
          },
          agent: {
            language: "en",
            listen: {
              provider: {
                type: "deepgram",
                model: "nova-3",
              },
            },
            think: {
              provider: {
                type: "open_ai",
                model: "gpt-4o-mini",
              },
              prompt: this.getInterviewPrompt(this.interviewType, this.userData),
            },
            speak: {
              provider: {
                type: "deepgram",
                model: "aura-2-thalia-en",
              },
            },
            greeting: this.getGreeting(this.interviewType, this.userData),
          },
        });
        
        console.log('Agent configured and should start speaking greeting...');
        
        this.isConnected = true;
        
        // Send a small audio chunk to trigger the greeting
        setTimeout(() => {
          if (this.connection) {
            const silentAudio = new ArrayBuffer(1024);
            this.connection.send(silentAudio);
            console.log('Sent silent audio to trigger greeting');
          }
        }, 1000);
        
        resolve();
      });

      this.connection.on(AgentEvents.Open, () => {
        console.log('Connection opened');
      });

      this.connection.on(AgentEvents.Close, () => {
        console.log('Connection closed');
        this.isConnected = false;
        this.onStatusChange?.({ isConnected: false, isListening: false });
      });

      this.connection.on(AgentEvents.ConversationText, (data) => {
        console.log('Conversation text:', data);
        this.handleDeepgramMessage(data);
      });

      this.connection.on(AgentEvents.Audio, (data) => {
        console.log('Audio chunk received');
        const buffer = new Uint8Array(data);
        const newBuffer = new Uint8Array(this.audioBuffer.length + buffer.length);
        newBuffer.set(this.audioBuffer);
        newBuffer.set(buffer, this.audioBuffer.length);
        this.audioBuffer = newBuffer;
      });

      this.connection.on(AgentEvents.AgentAudioDone, () => {
        console.log('Agent finished speaking, playing complete audio');
        if (this.audioBuffer.length > 0) {
          this.playAudio(this.audioBuffer);
          this.audioBuffer = new Uint8Array(0);
        }
      });

      this.connection.on(AgentEvents.Error, (err) => {
        console.error('Deepgram error:', err);
        reject(err);
      });
    });
  }

  handleDeepgramMessage(data) {
    if (data.role === 'assistant') {
      this.onMessage?.({
        role: 'interviewer',
        content: data.content,
        timestamp: Date.now()
      });
    } else if (data.role === 'user') {
      this.onMessage?.({
        role: 'candidate',
        content: data.content,
        timestamp: Date.now()
      });
    }
  }

  async setupAudio() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });

      this.audioContext = new AudioContext({ sampleRate: 24000 });
      const source = this.audioContext.createMediaStreamSource(stream);
      
      // Create audio processor
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      processor.onaudioprocess = (event) => {
        if (this.isConnected && this.connection) {
          const inputBuffer = event.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(inputBuffer.length);
          
          for (let i = 0; i < inputBuffer.length; i++) {
            int16Array[i] = Math.max(-32768, Math.min(32767, inputBuffer[i] * 32768));
          }
          
          this.connection.send(int16Array.buffer);
        }
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);
      
    } catch (error) {
      console.error('Error setting up audio:', error);
      throw error;
    }
  }

  getInterviewPrompt(type, userData) {
    const skillsList = userData?.skills ? Object.keys(userData.skills).join(', ') : 'various skills';
    const userInfo = userData ? `The candidate's name is ${userData.name || 'the candidate'}. Their skills include: ${skillsList}. Their experience level is ${userData.experience || 'not specified'}.` : '';
    
    const prompts = {
      technical: `You are conducting a technical interview. ${userInfo} Since you already know their skills (${skillsList}), start by introducing yourself, then ask specific technical questions about their strongest skill or a challenging project they've worked on. Don't ask them to repeat their background. Keep responses under 25 words.`,
      
      behavioral: `You are conducting a behavioral interview. ${userInfo} Since you know their background, introduce yourself then ask about a specific challenging situation they faced in their work. Don't ask them to repeat their experience. Keep responses brief.`,
      
      hr: `You are an HR interviewer. ${userInfo} Since you know their background, introduce yourself then ask about their motivation for this specific role and career goals. Don't ask them to repeat their experience. Keep responses conversational.`,
      
      'system-design': `You are conducting a system design interview. ${userInfo} Since you know their skills (${skillsList}), introduce yourself then present a system design problem matching their skill level. Don't ask about their background. Guide them through the process.`
    };

    return prompts[type] || prompts.technical;
  }

  getGreeting(type, userData) {
    const name = userData?.name ? ` ${userData.name}` : '';
    const skills = userData?.skills ? Object.keys(userData.skills).slice(0, 2).join(' and ') : 'your skills';
    
    const greetings = {
      technical: `Hello${name}! I'm your technical interviewer. I can see you have experience with ${skills}. Let's dive into a technical challenge - can you walk me through a complex problem you solved using ${skills}?`,
      
      behavioral: `Hi${name}! I'm conducting your behavioral interview. I see you have ${skills} in your profile. Can you tell me about a time when you had to learn a new technology quickly under pressure?`,
      
      hr: `Hello${name}! I'm your HR interviewer. Looking at your background with ${skills}, what drives your passion for technology and where do you see yourself in 3 years?`,
      
      'system-design': `Hi${name}! I'm your system design interviewer. Given your experience with ${skills}, let's design a scalable web application. How would you approach building a social media platform?`
    };

    return greetings[type] || greetings.technical;
  }

  sendMessage(message) {
    // Messages are handled automatically by the agent
    console.log('Sending message:', message);
  }

  endInterview() {
    console.log('Ending interview...');
    
    // Stop the connection
    if (this.connection) {
      try {
        this.connection.removeAllListeners();
        if (typeof this.connection.close === 'function') {
          this.connection.close();
        }
      } catch (error) {
        console.log('Connection already closed');
      }
    }
    
    // Stop audio context
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.log('Audio context already closed');
      }
    }
    
    const summary = {
      duration: Date.now() - (this.currentInterview?.startTime || Date.now()),
      type: this.currentInterview?.type
    };
    
    // Reset all state
    this.connection = null;
    this.currentInterview = null;
    this.isConnected = false;
    this.audioBuffer = new Uint8Array(0);
    
    console.log('Interview ended successfully');
    return summary;
  }

  createWavHeader(audioData) {
    const buffer = new ArrayBuffer(44 + audioData.length);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + audioData.length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 32000, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, audioData.length, true);
    
    // Copy audio data
    const uint8Array = new Uint8Array(buffer);
    uint8Array.set(new Uint8Array(audioData), 44);
    
    return uint8Array;
  }

  async playAudio(audioData) {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Convert Uint8Array to Int16Array
      const int16Array = new Int16Array(audioData.buffer || audioData);
      
      // Create audio buffer
      const audioBuffer = audioContext.createBuffer(1, int16Array.length, 16000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert int16 to float32
      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }
      
      // Play audio
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      
      console.log('Playing audio successfully');
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      isActive: !!this.currentInterview
    };
  }
}

export default new DeepgramVoiceAgent();