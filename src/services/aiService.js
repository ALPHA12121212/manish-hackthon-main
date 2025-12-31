import axios from 'axios';
import Bytez from 'bytez.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

class AIService {
  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    this.defaultModel = 'nvidia/nemotron-nano-12b-v2-vl:free';
    this.bytezKey = 'bf43daff764f5b932521fa1573be3f31';
    this.sdk = new Bytez(this.bytezKey);
    this.whisperModel = this.sdk.model('openai/whisper-large-v3');
    this.currentInterview = null;
    this.speechSynthesis = window.speechSynthesis;
  }

  async generateResponse(prompt, model = this.defaultModel) {
    try {
      const response = await axios.post(
        OPENROUTER_API_URL,
        {
          model: model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'SkillSync AI Platform'
          },
          timeout: 30000
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(prompt);
    }
  }

  getFallbackResponse(prompt) {
    if (prompt.toLowerCase().includes('skill')) {
      return `🎯 **Skill Development Advice**\n\nHey there! Based on your current skills, here's what I'd recommend:\n\n📚 **Focus Areas:**\n• Build practical projects to showcase your abilities\n• Contribute to open source projects for real-world experience\n• Practice coding challenges daily (even 15-30 minutes helps!)\n\n💡 **Next Steps:**\n• Pick one skill to focus on this week\n• Build something small but complete\n• Share your progress with the community\n\nWhat specific skill would you like to work on first? 🚀`;
    }
    if (prompt.toLowerCase().includes('learn')) {
      return `📚 **Learning Strategy**\n\nGreat question! Here's my friendly advice:\n\n🎯 **The Learning Formula:**\n• Start with hands-on projects (learning by doing!)\n• Follow structured tutorials, but don't get stuck in "tutorial hell"\n• Practice consistently - even 30 minutes daily beats 5 hours once a week\n\n💡 **Pro Tips:**\n• Build something you're excited about\n• Join communities for support and motivation\n• Celebrate small wins along the way\n\nWhat's one thing you'd love to build? Let's start there! 🚀`;
    }
    return `👋 **Hey there!**\n\nI'm here to help with your learning journey! While I'm currently offline, here's some quick advice:\n\n🎯 **Focus on:**\n• Practical projects over theory\n• Consistent daily practice\n• Building things you're passionate about\n\n💡 **Remember:**\n• Every expert was once a beginner\n• Progress > Perfection\n• Community support makes the journey easier\n\nWhat would you like to work on today? 🚀`;
  }

  async analyzeSkills(skillsData) {
    const prompt = `Analyze these skills and provide recommendations: ${JSON.stringify(skillsData)}`;
    return await this.generateResponse(prompt);
  }

  async generateLearningPath(skills, goals) {
    const prompt = `Create a learning path for skills: ${skills.join(', ')} with goals: ${goals}`;
    return await this.generateResponse(prompt);
  }

  async chatWithAI(message, context = '', userId = null) {
    let prompt = message;
    
    if (userId) {
      const userContext = await this.buildSmartUserContext(message, userId);
      prompt = `${userContext}\n\nUser: ${message}`;
    } else if (context) {
      prompt = `Context: ${context}\n\nUser: ${message}`;
    }
    
    return await this.generateResponse(prompt);
  }

  async buildSmartUserContext(message, userId) {
    const context = [];
    
    if (!userId) {
      return 'You are SkillSync AI, a friendly learning mentor.';
    }
    
    try {
      const firebaseService = (await import('../services/firebaseService')).default;
      const userData = await Promise.race([
        firebaseService.getUserStats(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (userData.name) context.push(`User: ${userData.name}`);
      if (userData.experience) context.push(`Experience Level: ${userData.experience}`);
      if (userData.education) context.push(`Education: ${userData.education}`);
      
      if (userData.careerGoals) context.push(`Career Goals: ${userData.careerGoals}`);
      if (userData.interests && userData.interests.length > 0) {
        context.push(`Interests: ${userData.interests.join(', ')}`);
      }
      if (userData.jobReadiness) context.push(`Job Readiness: ${userData.jobReadiness}%`);
      
      if (userData.skills && Object.keys(userData.skills).length > 0) {
        const skillsList = Object.entries(userData.skills)
          .map(([skill, data]) => `${skill} (${data.current}% proficiency, target: ${data.target}%)`)
          .join(', ');
        context.push(`Current Skills: ${skillsList}`);
        
        const skillEntries = Object.entries(userData.skills);
        const strongestSkill = skillEntries.reduce((max, [skill, data]) => 
          data.current > (max.data?.current || 0) ? {skill, data} : max, {});
        const weakestSkill = skillEntries.reduce((min, [skill, data]) => 
          data.current < (min.data?.current || 100) ? {skill, data} : min, {});
        
        if (strongestSkill.skill) context.push(`Strongest Skill: ${strongestSkill.skill} (${strongestSkill.data.current}%)`);
        if (weakestSkill.skill) context.push(`Needs Improvement: ${weakestSkill.skill} (${weakestSkill.data.current}%)`);
      }
      
      if (userData.daysStreak) context.push(`Learning Streak: ${userData.daysStreak} days`);
      if (userData.interviewsPassed) context.push(`Interviews Passed: ${userData.interviewsPassed}`);
      if (userData.lastSkillUpdate) {
        context.push(`Recent Activity: ${userData.lastSkillUpdate.activity} on ${userData.lastSkillUpdate.skill}`);
      }
      
    } catch (error) {
      console.error('Error building user context:', error);
      context.push('User: Learning enthusiast');
    }
    
    return `You are SkillSync AI, a friendly learning mentor. You have access to this user's complete profile:\n\n${context.join('\n')}\n\nIMPORTANT INSTRUCTIONS:\n- Use the user's profile data to give highly personalized advice\n- Reference their specific skills, experience level, and career goals\n- Suggest projects that match their current skill level and interests\n- Don't ask for information you already have in their profile\n- When they start a task, provide step-by-step guidance based on their skill level\n- Format responses with 🎯, 📚, 💡 emojis and clear sections\n- Keep tone encouraging and supportive\n- Provide specific, actionable advice based on their actual data\n- If they're working on a skill they're weak in, provide extra guidance and resources\n- If they're working on their strongest skill, suggest advanced techniques and best practices`;
  }

  async startMockInterview(type = 'technical', userId = null) {
    const userContext = userId ? await this.buildSmartUserContext('', userId) : '';
    
    this.currentInterview = {
      type,
      questions: [],
      currentQuestion: 0,
      feedback: [],
      startTime: Date.now()
    };

    const prompt = `${userContext}\n\nYou are a professional ${type} interviewer. Start the interview with a brief greeting and ask ONE clear, direct question. Be professional but friendly. Don't use emojis or formatting - speak naturally like a real interviewer.`;
    const response = await this.generateResponse(prompt);
    
    this.currentInterview.questions.push(response);
    this.speakText(this.cleanTextForSpeech(response));
    return response;
  }

  async processInterviewAnswer(answer, audioBlob = null) {
    if (!this.currentInterview) {
      return 'Please start an interview first.';
    }

    let processedAnswer = answer;
    
    if (audioBlob) {
      try {
        processedAnswer = await this.transcribeAudio(audioBlob);
      } catch (error) {
        console.error('Audio transcription failed:', error);
      }
    }

    const prompt = `You are a professional ${this.currentInterview.type} interviewer. The candidate just answered: "${processedAnswer}". Give brief feedback (2-3 sentences) and ask the next relevant question. Be professional, constructive, and speak naturally without emojis or formatting.`;
    
    const response = await this.generateResponse(prompt);
    
    this.currentInterview.feedback.push({
      question: this.currentInterview.questions[this.currentInterview.currentQuestion],
      answer: processedAnswer,
      feedback: response
    });
    
    this.currentInterview.currentQuestion++;
    this.currentInterview.questions.push(response);
    this.speakText(this.cleanTextForSpeech(response));
    
    return response;
  }

  async transcribeAudio(audioBlob) {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
        method: 'POST',
        headers: {
          'x-gladia-key': '39957804-6b7d-4478-a40f-5ad3bf89942c'
        },
        body: formData
      });
      
      const result = await response.json();
      return result.prediction || 'Could not transcribe audio';
    } catch (error) {
      console.error('Gladia transcription error:', error);
      return 'Audio transcription failed';
    }
  }

  async endInterview() {
    if (!this.currentInterview) return 'No active interview to end.';

    const prompt = `As a professional interviewer, provide final feedback for this ${this.currentInterview.type} interview. The candidate answered ${this.currentInterview.currentQuestion} questions. Give constructive feedback and a score out of 10. Be encouraging but honest.`;
    
    const finalFeedback = await this.generateResponse(prompt);
    
    const summary = {
      ...this.currentInterview,
      finalFeedback,
      duration: Date.now() - this.currentInterview.startTime,
      completed: true
    };

    this.currentInterview = null;
    return summary;
  }

  getInterviewTypes() {
    return [
      { id: 'technical', name: 'Technical Interview', icon: 'Code' },
      { id: 'behavioral', name: 'Behavioral Interview', icon: 'Users' },
      { id: 'hr', name: 'HR Round', icon: 'Briefcase' },
      { id: 'system-design', name: 'System Design', icon: 'Network' }
    ];
  }

  speakText(text) {
    if (!this.speechSynthesis) return;
    
    this.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    const voices = this.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.name.includes('Microsoft')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    
    this.speechSynthesis.speak(utterance);
  }

  cleanTextForSpeech(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/[🎯📚💡💻🤝👔🏗️⏸️🔁🚀🤖]/g, '')
      .replace(/&gt;/g, '')
      .replace(/&quot;/g, '')
      .replace(/---/g, '')
      .replace(/AI is asking:/g, '')
      .replace(/\*\*.*?\*\*:/g, '')
      .replace(/\*.*?\*:/g, '')
      .replace(/First Interview Question/g, '')
      .replace(/Question \d+:/g, '')
      .replace(/Q\d+:/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .replace(/^[\s\.:]+/, '')
      .trim();
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }
}

export default new AIService();