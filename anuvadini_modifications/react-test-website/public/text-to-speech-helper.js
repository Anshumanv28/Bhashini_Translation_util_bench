/**
 * TEXT-TO-SPEECH HELPER MODULE
 * 
 * This module provides text-to-speech capabilities for the enhanced Bhashini utility:
 * 1. Speech synthesis for translated text
 * 2. Audio playback controls
 * 3. Language-specific voice selection
 * 4. Speech rate and pitch control
 * 5. Queue management for multiple text items
 */

class TextToSpeechHelper {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.speechQueue = [];
        this.isPlaying = false;
        this.currentUtterance = null;
        this.audioContext = null;
        this.audioBuffer = null;
        
        // Configuration
        this.config = {
            enabled: true,
            autoPlay: false,
            defaultRate: 1.0,
            defaultPitch: 1.0,
            defaultVolume: 1.0,
            queueDelay: 1000, // Delay between queued items
            maxQueueSize: 10
        };
        
        // Language to voice mapping
        this.languageVoices = new Map();
        this.availableVoices = [];
        
        this.initialize();
    }
    
    async initialize() {
        try {
            // Initialize speech synthesis
            if (this.speechSynthesis) {
                this.speechSynthesis.onvoiceschanged = () => {
                    this.loadAvailableVoices();
                };
                
                // Load voices immediately if available
                this.loadAvailableVoices();
                
                console.log('✅ Text-to-Speech initialized');
            } else {
                console.warn('⚠️ Speech synthesis not supported in this browser');
                this.config.enabled = false;
            }
            
            // Initialize Web Audio API for advanced audio features
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ Web Audio API initialized');
            } catch (error) {
                console.warn('⚠️ Web Audio API not supported:', error);
            }
            
        } catch (error) {
            console.error('❌ Error initializing Text-to-Speech:', error);
            this.config.enabled = false;
        }
    }
    
    loadAvailableVoices() {
        if (!this.speechSynthesis) return;
        
        this.availableVoices = this.speechSynthesis.getVoices();
        
        // Map languages to available voices
        this.availableVoices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            if (!this.languageVoices.has(lang)) {
                this.languageVoices.set(lang, []);
            }
            this.languageVoices.get(lang).push(voice);
        });
        
        console.log(`📢 Loaded ${this.availableVoices.length} voices for ${this.languageVoices.size} languages`);
    }
    
    /**
     * Speak text with specified options
     */
    speak(text, options = {}) {
        if (!this.config.enabled || !this.speechSynthesis) {
            console.warn('Text-to-Speech is disabled or not supported');
            return false;
        }
        
        const {
            language = 'en',
            rate = this.config.defaultRate,
            pitch = this.config.defaultPitch,
            volume = this.config.defaultVolume,
            priority = 'normal', // 'high', 'normal', 'low'
            onStart = null,
            onEnd = null,
            onError = null
        } = options;
        
        try {
            // Stop any current speech
            this.stop();
            
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            const voice = this.selectVoice(language);
            if (voice) {
                utterance.voice = voice;
            }
            
            // Set properties
            utterance.lang = this.getLanguageCode(language);
            utterance.rate = rate;
            utterance.pitch = pitch;
            utterance.volume = volume;
            
            // Set event handlers
            utterance.onstart = () => {
                this.isPlaying = true;
                this.currentUtterance = utterance;
                if (onStart) onStart(text);
                console.log(`🔊 Started speaking: "${text.substring(0, 50)}..."`);
            };
            
            utterance.onend = () => {
                this.isPlaying = false;
                this.currentUtterance = null;
                if (onEnd) onEnd(text);
                console.log(`✅ Finished speaking: "${text.substring(0, 50)}..."`);
                
                // Process next item in queue
                this.processQueue();
            };
            
            utterance.onerror = (event) => {
                this.isPlaying = false;
                this.currentUtterance = null;
                if (onError) onError(event);
                console.error(`❌ Speech error:`, event);
                
                // Process next item in queue
                this.processQueue();
            };
            
            // Add to queue based on priority
            this.addToQueue(utterance, priority);
            
            return true;
            
        } catch (error) {
            console.error('Error creating speech utterance:', error);
            return false;
        }
    }
    
    /**
     * Select appropriate voice for language
     */
    selectVoice(language) {
        const lang = language.toLowerCase();
        
        // Try exact language match
        if (this.languageVoices.has(lang)) {
            const voices = this.languageVoices.get(lang);
            // Prefer default voice or first available
            return voices.find(v => v.default) || voices[0];
        }
        
        // Try language family (e.g., 'hi' for 'hi-IN')
        const langFamily = lang.split('-')[0];
        if (this.languageVoices.has(langFamily)) {
            const voices = this.languageVoices.get(langFamily);
            return voices.find(v => v.default) || voices[0];
        }
        
        // Fallback to default voice
        return this.speechSynthesis.getVoices().find(v => v.default) || null;
    }
    
    /**
     * Get proper language code for speech synthesis
     */
    getLanguageCode(language) {
        const langMap = {
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'kn': 'kn-IN',
            'ml': 'ml-IN',
            'gu': 'gu-IN',
            'mr': 'mr-IN',
            'pa': 'pa-IN',
            'or': 'or-IN',
            'as': 'as-IN',
            'ur': 'ur-PK',
            'en': 'en-US',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'es': 'es-ES',
            'pt': 'pt-PT',
            'it': 'it-IT',
            'ru': 'ru-RU',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN',
            'ar': 'ar-SA'
        };
        
        return langMap[language.toLowerCase()] || language;
    }
    
    /**
     * Add utterance to queue
     */
    addToQueue(utterance, priority) {
        const queueItem = { utterance, priority, timestamp: Date.now() };
        
        if (priority === 'high') {
            // Insert at beginning for high priority
            this.speechQueue.unshift(queueItem);
        } else {
            // Add to end for normal/low priority
            this.speechQueue.push(queueItem);
        }
        
        // Limit queue size
        if (this.speechQueue.length > this.config.maxQueueSize) {
            this.speechQueue = this.speechQueue.slice(0, this.config.maxQueueSize);
        }
        
        // Start processing if not currently playing
        if (!this.isPlaying) {
            this.processQueue();
        }
    }
    
    /**
     * Process speech queue
     */
    processQueue() {
        if (this.speechQueue.length === 0 || this.isPlaying) {
            return;
        }
        
        const queueItem = this.speechQueue.shift();
        this.speechSynthesis.speak(queueItem.utterance);
    }
    
    /**
     * Stop current speech
     */
    stop() {
        if (this.speechSynthesis && this.isPlaying) {
            this.speechSynthesis.cancel();
            this.isPlaying = false;
            this.currentUtterance = null;
            console.log('⏹️ Speech stopped');
        }
    }
    
    /**
     * Pause current speech
     */
    pause() {
        if (this.speechSynthesis && this.isPlaying) {
            this.speechSynthesis.pause();
            console.log('⏸️ Speech paused');
        }
    }
    
    /**
     * Resume paused speech
     */
    resume() {
        if (this.speechSynthesis) {
            this.speechSynthesis.resume();
            console.log('▶️ Speech resumed');
        }
    }
    
    /**
     * Clear speech queue
     */
    clearQueue() {
        this.speechQueue = [];
        console.log('🗑️ Speech queue cleared');
    }
    
    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            isPlaying: this.isPlaying,
            queueLength: this.speechQueue.length,
            currentText: this.currentUtterance ? this.currentUtterance.text.substring(0, 50) + '...' : null,
            availableVoices: this.availableVoices.length,
            supportedLanguages: Array.from(this.languageVoices.keys())
        };
    }
    
    /**
     * Speak translated text with automatic language detection
     */
    speakTranslatedText(text, targetLanguage, options = {}) {
        if (!text || !targetLanguage) {
            console.warn('Text and target language are required');
            return false;
        }
        
        // Enhanced options for translated text
        const enhancedOptions = {
            language: targetLanguage,
            rate: 0.9, // Slightly slower for translated text
            pitch: 1.0,
            volume: 1.0,
            priority: 'high',
            onStart: (text) => {
                console.log(`🔊 Speaking translated text in ${targetLanguage}: "${text.substring(0, 50)}..."`);
            },
            onEnd: (text) => {
                console.log(`✅ Finished speaking translated text`);
            },
            onError: (error) => {
                console.error(`❌ Error speaking translated text:`, error);
            },
            ...options
        };
        
        return this.speak(text, enhancedOptions);
    }
    
    /**
     * Speak multiple text items sequentially
     */
    async speakMultiple(texts, targetLanguage, options = {}) {
        if (!Array.isArray(texts) || texts.length === 0) {
            console.warn('Texts array is required and must not be empty');
            return false;
        }
        
        console.log(`📝 Queuing ${texts.length} text items for speech`);
        
        // Add all texts to queue with sequential priority
        texts.forEach((text, index) => {
            const priority = index === 0 ? 'high' : 'normal';
            this.speakTranslatedText(text, targetLanguage, {
                ...options,
                priority,
                onStart: (text) => {
                    console.log(`🔊 Speaking item ${index + 1}/${texts.length}: "${text.substring(0, 50)}..."`);
                }
            });
        });
        
        return true;
    }
    
    /**
     * Test speech synthesis with sample text
     */
    testSpeech(language = 'en') {
        const testTexts = {
            'en': 'Hello, this is a test of the text-to-speech system.',
            'hi': 'नमस्ते, यह टेक्स्ट-टू-स्पीच सिस्टम का परीक्षण है।',
            'ta': 'வணக்கம், இது உரை-க்கு-பேச்சு அமைப்பின் சோதனை.',
            'te': 'నమస్కారం, ఇది టెక్స్ట్-టు-స్పీచ్ సిస్టమ్ యొక్క పరీక్ష.',
            'bn': 'হ্যালো, এটি টেক্সট-টু-স্পিচ সিস্টেমের একটি পরীক্ষা।'
        };
        
        const testText = testTexts[language] || testTexts['en'];
        console.log(`🧪 Testing speech synthesis in ${language}: "${testText}"`);
        
        return this.speak(testText, {
            language,
            priority: 'high',
            onStart: () => console.log('🧪 Test started'),
            onEnd: () => console.log('🧪 Test completed'),
            onError: (error) => console.error('🧪 Test failed:', error)
        });
    }
    
    /**
     * Get available languages and voices
     */
    getAvailableLanguages() {
        const languages = {};
        
        this.availableVoices.forEach(voice => {
            const lang = voice.lang.split('-')[0];
            if (!languages[lang]) {
                languages[lang] = {
                    name: this.getLanguageName(lang),
                    voices: [],
                    defaultVoice: null
                };
            }
            
            languages[lang].voices.push({
                name: voice.name,
                lang: voice.lang,
                default: voice.default,
                localService: voice.localService
            });
            
            if (voice.default) {
                languages[lang].defaultVoice = voice.name;
            }
        });
        
        return languages;
    }
    
    /**
     * Get human-readable language name
     */
    getLanguageName(langCode) {
        const languageNames = {
            'en': 'English',
            'hi': 'Hindi',
            'ta': 'Tamil',
            'te': 'Telugu',
            'kn': 'Kannada',
            'ml': 'Malayalam',
            'gu': 'Gujarati',
            'mr': 'Marathi',
            'pa': 'Punjabi',
            'or': 'Odia',
            'as': 'Assamese',
            'ur': 'Urdu',
            'bn': 'Bengali',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish',
            'pt': 'Portuguese',
            'it': 'Italian',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic'
        };
        
        return languageNames[langCode] || langCode;
    }
    
    /**
     * Destroy the helper and clean up resources
     */
    destroy() {
        this.stop();
        this.clearQueue();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        console.log('🗑️ Text-to-Speech helper destroyed');
    }
}

// Create global instance
const ttsHelper = new TextToSpeechHelper();

// Expose globally for testing
window.ttsHelper = ttsHelper;
window.speakText = (text, lang, options) => ttsHelper.speak(text, { language: lang, ...options });
window.speakTranslated = (text, lang, options) => ttsHelper.speakTranslatedText(text, lang, options);
window.testSpeech = (lang) => ttsHelper.testSpeech(lang);
window.getTTSStatus = () => ttsHelper.getQueueStatus();
window.getAvailableLanguages = () => ttsHelper.getAvailableLanguages();

console.log('🔊 TEXT-TO-SPEECH HELPER LOADED');
console.log('================================');
console.log('Available functions:');
console.log('  speakText(text, lang, options) - Speak text in specified language');
console.log('  speakTranslated(text, lang, options) - Speak translated text');
console.log('  testSpeech(lang) - Test speech synthesis');
console.log('  getTTSStatus() - Get current speech status');
console.log('  getAvailableLanguages() - Get supported languages and voices');
console.log('\n💡 Quick start: testSpeech("en") or speakText("Hello", "en")');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ttsHelper.initialize());
} else {
    ttsHelper.initialize();
}
