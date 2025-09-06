/**
 * ADVANCED FEEDBACK HELPER MODULE
 * 
 * This module provides advanced feedback capabilities for the enhanced Bhashini utility:
 * 1. Multi-language feedback collection
 * 2. Rating system with detailed feedback
 * 3. Translation quality assessment
 * 4. User experience tracking
 * 5. Feedback analytics and reporting
 */

class AdvancedFeedbackHelper {
    constructor() {
        this.feedbackData = [];
        this.currentSession = this.generateSessionId();
        this.feedbackModal = null;
        this.isModalOpen = false;
        
        // Configuration
        this.config = {
            enabled: true,
            autoCollect: false,
            feedbackEndpoint: 'https://translation-plugin.bhashini.co.in/v1/feedback',
            localhostEndpoint: 'http://localhost:6001/v1/feedback',
            enableLocalhost: true,
            maxFeedbackLength: 1000,
            minRatingForFeedback: 3, // Below this rating, feedback is required
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            maxFeedbackPerSession: 10
        };
        
        // Feedback categories
        this.feedbackCategories = {
            translation: {
                id: 'translation',
                name: 'Translation Quality',
                description: 'Issues with translation accuracy, grammar, or meaning',
                subcategories: ['accuracy', 'grammar', 'meaning', 'context', 'style']
            },
            performance: {
                id: 'performance',
                name: 'Performance',
                description: 'Speed, responsiveness, or technical issues',
                subcategories: ['speed', 'loading', 'crashes', 'memory', 'battery']
            },
            ui: {
                id: 'ui',
                name: 'User Interface',
                description: 'Design, layout, or usability issues',
                subcategories: ['design', 'layout', 'accessibility', 'mobile', 'desktop']
            },
            content: {
                id: 'content',
                name: 'Content Issues',
                description: 'Missing translations, wrong content, or formatting',
                subcategories: ['missing', 'wrong', 'formatting', 'duplicate', 'incomplete']
            },
            other: {
                id: 'other',
                name: 'Other',
                description: 'General feedback or suggestions',
                subcategories: ['suggestion', 'bug', 'feature', 'general']
            }
        };
        
        // Rating descriptions
        this.ratingDescriptions = {
            1: 'Very Poor - Unusable',
            2: 'Poor - Major issues',
            3: 'Fair - Some issues',
            4: 'Good - Minor issues',
            5: 'Excellent - No issues'
        };
        
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log('🚀 Initializing Advanced Feedback Helper...');
            
            // Create feedback modal
            this.createFeedbackModal();
            
            // Set up session management
            this.setupSessionManagement();
            
            // Load existing feedback from storage
            this.loadFeedbackFromStorage();
            
            console.log('✅ Advanced Feedback Helper initialized');
            
        } catch (error) {
            console.error('❌ Error initializing Advanced Feedback Helper:', error);
        }
    }
    
    /**
     * Create feedback modal
     */
    createFeedbackModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('enhanced-feedback-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        this.feedbackModal = document.createElement('div');
        this.feedbackModal.id = 'enhanced-feedback-modal';
        this.feedbackModal.className = 'enhanced-feedback-modal';
        this.feedbackModal.style.display = 'none';
        
        this.feedbackModal.innerHTML = this.generateModalHTML();
        document.body.appendChild(this.feedbackModal);
        
        // Add event listeners
        this.setupModalEventListeners();
        
        // Add CSS styles
        this.addModalStyles();
    }
    
    /**
     * Generate modal HTML
     */
    generateModalHTML() {
        return `
            <div class="enhanced-feedback-overlay">
                <div class="enhanced-feedback-content">
                    <div class="enhanced-feedback-header">
                        <h2>📝 Translation Feedback</h2>
                        <button class="enhanced-feedback-close" id="enhanced-feedback-close">✖</button>
                    </div>
                    
                    <div class="enhanced-feedback-body">
                        <!-- Rating Section -->
                        <div class="enhanced-feedback-section">
                            <h3>Rate this translation</h3>
                            <div class="enhanced-feedback-rating">
                                <div class="rating-stars" id="rating-stars">
                                    <span class="star" data-rating="1">⭐</span>
                                    <span class="star" data-rating="2">⭐</span>
                                    <span class="star" data-rating="3">⭐</span>
                                    <span class="star" data-rating="4">⭐</span>
                                    <span class="star" data-rating="5">⭐</span>
                                </div>
                                <div class="rating-description" id="rating-description">
                                    Select a rating to describe your experience
                                </div>
                            </div>
                        </div>
                        
                        <!-- Category Section -->
                        <div class="enhanced-feedback-section">
                            <h3>What type of feedback do you have?</h3>
                            <div class="enhanced-feedback-categories" id="feedback-categories">
                                ${Object.values(this.feedbackCategories).map(category => `
                                    <label class="category-option">
                                        <input type="radio" name="feedback-category" value="${category.id}">
                                        <span class="category-label">
                                            <strong>${category.name}</strong>
                                            <small>${category.description}</small>
                                        </span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Subcategory Section -->
                        <div class="enhanced-feedback-section" id="subcategory-section" style="display: none;">
                            <h3>Specific issue</h3>
                            <div class="enhanced-feedback-subcategories" id="feedback-subcategories">
                                <!-- Dynamically populated based on selected category -->
                            </div>
                        </div>
                        
                        <!-- Feedback Text Section -->
                        <div class="enhanced-feedback-section" id="feedback-text-section" style="display: none;">
                            <h3>Tell us more (optional)</h3>
                            <textarea 
                                id="feedback-text" 
                                placeholder="Please describe your experience or any specific issues you encountered..."
                                maxlength="${this.config.maxFeedbackLength}"
                            ></textarea>
                            <div class="feedback-char-count">
                                <span id="char-count">0</span> / ${this.config.maxFeedbackLength}
                            </div>
                        </div>
                        
                        <!-- Language Section -->
                        <div class="enhanced-feedback-section">
                            <h3>Translation Language</h3>
                            <div class="enhanced-feedback-language">
                                <span id="current-translation-language">Detecting...</span>
                            </div>
                        </div>
                        
                        <!-- Page Information -->
                        <div class="enhanced-feedback-section">
                            <h3>Page Information</h3>
                            <div class="enhanced-feedback-page-info">
                                <div><strong>URL:</strong> <span id="current-page-url">${window.location.href}</span></div>
                                <div><strong>Title:</strong> <span id="current-page-title">${document.title}</span></div>
                                <div><strong>Session:</strong> <span id="current-session-id">${this.currentSession}</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="enhanced-feedback-footer">
                        <button class="enhanced-feedback-submit" id="enhanced-feedback-submit" disabled>
                            Submit Feedback
                        </button>
                        <button class="enhanced-feedback-cancel" id="enhanced-feedback-cancel">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Setup modal event listeners
     */
    setupModalEventListeners() {
        // Close button
        const closeBtn = this.feedbackModal.querySelector('#enhanced-feedback-close');
        closeBtn.addEventListener('click', () => this.closeFeedbackModal());
        
        // Cancel button
        const cancelBtn = this.feedbackModal.querySelector('#enhanced-feedback-cancel');
        cancelBtn.addEventListener('click', () => this.closeFeedbackModal());
        
        // Rating stars
        const ratingStars = this.feedbackModal.querySelector('#rating-stars');
        ratingStars.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const rating = parseInt(e.target.dataset.rating);
                this.setRating(rating);
            }
        });
        
        // Category selection
        const categoryInputs = this.feedbackModal.querySelectorAll('input[name="feedback-category"]');
        categoryInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.onCategoryChange(e.target.value);
            });
        });
        
        // Feedback text
        const feedbackText = this.feedbackModal.querySelector('#feedback-text');
        feedbackText.addEventListener('input', (e) => {
            this.updateCharCount(e.target.value.length);
        });
        
        // Submit button
        const submitBtn = this.feedbackModal.querySelector('#enhanced-feedback-submit');
        submitBtn.addEventListener('click', () => this.submitFeedback());
        
        // Close on overlay click
        const overlay = this.feedbackModal.querySelector('.enhanced-feedback-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeFeedbackModal();
            }
        });
    }
    
    /**
     * Add modal CSS styles
     */
    addModalStyles() {
        const styleId = 'enhanced-feedback-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .enhanced-feedback-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            .enhanced-feedback-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .enhanced-feedback-content {
                background: white;
                border-radius: 12px;
                max-width: 600px;
                width: 100%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: enhanced-feedback-slide-in 0.3s ease-out;
            }
            
            @keyframes enhanced-feedback-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .enhanced-feedback-header {
                padding: 24px 24px 16px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .enhanced-feedback-header h2 {
                margin: 0;
                color: #1f2937;
                font-size: 20px;
                font-weight: 600;
            }
            
            .enhanced-feedback-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            
            .enhanced-feedback-close:hover {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .enhanced-feedback-body {
                padding: 24px;
            }
            
            .enhanced-feedback-section {
                margin-bottom: 24px;
            }
            
            .enhanced-feedback-section h3 {
                margin: 0 0 12px 0;
                color: #374151;
                font-size: 16px;
                font-weight: 600;
            }
            
            .enhanced-feedback-rating {
                text-align: center;
            }
            
            .rating-stars {
                font-size: 32px;
                margin-bottom: 8px;
            }
            
            .rating-stars .star {
                cursor: pointer;
                margin: 0 4px;
                transition: all 0.2s;
                opacity: 0.3;
            }
            
            .rating-stars .star:hover,
            .rating-stars .star.active {
                opacity: 1;
                transform: scale(1.1);
            }
            
            .rating-description {
                color: #6b7280;
                font-size: 14px;
            }
            
            .enhanced-feedback-categories {
                display: grid;
                gap: 12px;
            }
            
            .category-option {
                display: flex;
                align-items: flex-start;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .category-option:hover {
                border-color: #3b82f6;
                background-color: #f8fafc;
            }
            
            .category-option input[type="radio"] {
                margin-right: 12px;
                margin-top: 2px;
            }
            
            .category-label {
                flex: 1;
            }
            
            .category-label strong {
                display: block;
                color: #1f2937;
                margin-bottom: 4px;
            }
            
            .category-label small {
                color: #6b7280;
                font-size: 13px;
                line-height: 1.4;
            }
            
            .enhanced-feedback-subcategories {
                display: grid;
                gap: 8px;
            }
            
            .enhanced-feedback-subcategories label {
                display: flex;
                align-items: center;
                padding: 8px 12px;
                border: 1px solid #e5e7eb;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .enhanced-feedback-subcategories label:hover {
                background-color: #f8fafc;
            }
            
            .enhanced-feedback-subcategories input[type="checkbox"] {
                margin-right: 8px;
            }
            
            #feedback-text {
                width: 100%;
                min-height: 100px;
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                font-family: inherit;
                font-size: 14px;
                line-height: 1.5;
                resize: vertical;
                transition: border-color 0.2s;
            }
            
            #feedback-text:focus {
                outline: none;
                border-color: #3b82f6;
            }
            
            .feedback-char-count {
                text-align: right;
                color: #6b7280;
                font-size: 12px;
                margin-top: 4px;
            }
            
            .enhanced-feedback-language,
            .enhanced-feedback-page-info {
                background-color: #f8fafc;
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                line-height: 1.5;
            }
            
            .enhanced-feedback-page-info div {
                margin-bottom: 4px;
            }
            
            .enhanced-feedback-page-info div:last-child {
                margin-bottom: 0;
            }
            
            .enhanced-feedback-footer {
                padding: 16px 24px 24px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .enhanced-feedback-submit,
            .enhanced-feedback-cancel {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .enhanced-feedback-submit {
                background-color: #3b82f6;
                color: white;
            }
            
            .enhanced-feedback-submit:hover:not(:disabled) {
                background-color: #2563eb;
            }
            
            .enhanced-feedback-submit:disabled {
                background-color: #9ca3af;
                cursor: not-allowed;
            }
            
            .enhanced-feedback-cancel {
                background-color: #f3f4f6;
                color: #374151;
            }
            
            .enhanced-feedback-cancel:hover {
                background-color: #e5e7eb;
            }
            
            @media (max-width: 640px) {
                .enhanced-feedback-content {
                    margin: 10px;
                    max-height: calc(100vh - 20px);
                }
                
                .enhanced-feedback-header,
                .enhanced-feedback-body,
                .enhanced-feedback-footer {
                    padding: 16px;
                }
                
                .enhanced-feedback-footer {
                    flex-direction: column;
                }
                
                .enhanced-feedback-submit,
                .enhanced-feedback-cancel {
                    width: 100%;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Open feedback modal
     */
    openFeedbackModal() {
        if (this.isModalOpen) return;
        
        this.isModalOpen = true;
        this.feedbackModal.style.display = 'block';
        
        // Update current language
        this.updateCurrentLanguage();
        
        // Reset form
        this.resetFeedbackForm();
        
        console.log('📝 Feedback modal opened');
    }
    
    /**
     * Close feedback modal
     */
    closeFeedbackModal() {
        if (!this.isModalOpen) return;
        
        this.isModalOpen = false;
        this.feedbackModal.style.display = 'none';
        
        console.log('📝 Feedback modal closed');
    }
    
    /**
     * Set rating and update UI
     */
    setRating(rating) {
        // Update stars
        const stars = this.feedbackModal.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
        
        // Update description
        const description = this.feedbackModal.querySelector('#rating-description');
        description.textContent = this.ratingDescriptions[rating];
        
        // Show/hide feedback text section based on rating
        const feedbackSection = this.feedbackModal.querySelector('#feedback-text-section');
        if (rating <= this.config.minRatingForFeedback) {
            feedbackSection.style.display = 'block';
        } else {
            feedbackSection.style.display = 'none';
        }
        
        // Enable submit button
        const submitBtn = this.feedbackModal.querySelector('#enhanced-feedback-submit');
        submitBtn.disabled = false;
        
        console.log(`⭐ Rating set to ${rating}`);
    }
    
    /**
     * Handle category change
     */
    onCategoryChange(categoryId) {
        const subcategorySection = this.feedbackModal.querySelector('#subcategory-section');
        const subcategoriesContainer = this.feedbackModal.querySelector('#feedback-subcategories');
        
        if (categoryId && this.feedbackCategories[categoryId]) {
            const category = this.feedbackCategories[categoryId];
            
            // Populate subcategories
            subcategoriesContainer.innerHTML = category.subcategories.map(sub => `
                <label>
                    <input type="checkbox" name="feedback-subcategory" value="${sub}">
                    ${sub.charAt(0).toUpperCase() + sub.slice(1)}
                </label>
            `).join('');
            
            subcategorySection.style.display = 'block';
        } else {
            subcategorySection.style.display = 'none';
        }
    }
    
    /**
     * Update character count
     */
    updateCharCount(count) {
        const charCount = this.feedbackModal.querySelector('#char-count');
        charCount.textContent = count;
        
        // Change color based on count
        if (count > this.config.maxFeedbackLength * 0.9) {
            charCount.style.color = '#dc2626';
        } else if (count > this.config.maxFeedbackLength * 0.7) {
            charCount.style.color = '#ea580c';
        } else {
            charCount.style.color = '#6b7280';
        }
    }
    
    /**
     * Update current language display
     */
    updateCurrentLanguage() {
        const languageSpan = this.feedbackModal.querySelector('#current-translation-language');
        
        // Try to get current language from various sources
        let currentLang = 'Unknown';
        
        if (window.selectedTargetLanguageCode) {
            currentLang = window.selectedTargetLanguageCode;
        } else if (localStorage.getItem('preferredLanguage')) {
            currentLang = localStorage.getItem('preferredLanguage');
        } else if (localStorage.getItem('selectedLanguage')) {
            currentLang = localStorage.getItem('selectedLanguage');
        }
        
        // Get language name
        const languageNames = {
            'hi': 'Hindi',
            'bn': 'Bengali',
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
            'en': 'English'
        };
        
        languageSpan.textContent = languageNames[currentLang] || currentLang;
    }
    
    /**
     * Reset feedback form
     */
    resetFeedbackForm() {
        // Reset rating
        const stars = this.feedbackModal.querySelectorAll('.star');
        stars.forEach(star => star.classList.remove('active'));
        
        // Reset description
        const description = this.feedbackModal.querySelector('#rating-description');
        description.textContent = 'Select a rating to describe your experience';
        
        // Reset category
        const categoryInputs = this.feedbackModal.querySelectorAll('input[name="feedback-category"]');
        categoryInputs.forEach(input => input.checked = false);
        
        // Hide subcategory section
        const subcategorySection = this.feedbackModal.querySelector('#subcategory-section');
        subcategorySection.style.display = 'none';
        
        // Reset feedback text
        const feedbackText = this.feedbackModal.querySelector('#feedback-text');
        feedbackText.value = '';
        this.updateCharCount(0);
        
        // Hide feedback text section
        const feedbackSection = this.feedbackModal.querySelector('#feedback-text-section');
        feedbackSection.style.display = 'none';
        
        // Disable submit button
        const submitBtn = this.feedbackModal.querySelector('#enhanced-feedback-submit');
        submitBtn.disabled = true;
    }
    
    /**
     * Collect feedback data from form
     */
    collectFeedbackData() {
        const rating = this.feedbackModal.querySelector('.star.active')?.dataset.rating;
        const category = this.feedbackModal.querySelector('input[name="feedback-category"]:checked')?.value;
        const subcategories = Array.from(this.feedbackModal.querySelectorAll('input[name="feedback-subcategory"]:checked'))
            .map(input => input.value);
        const feedbackText = this.feedbackModal.querySelector('#feedback-text').value;
        
        if (!rating) {
            throw new Error('Please select a rating');
        }
        
        if (parseInt(rating) <= this.config.minRatingForFeedback && !feedbackText.trim()) {
            throw new Error('Please provide feedback for low ratings');
        }
        
        return {
            rating: parseInt(rating),
            category: category || 'other',
            subcategories: subcategories,
            feedbackText: feedbackText.trim(),
            timestamp: new Date().toISOString(),
            sessionId: this.currentSession,
            pageUrl: window.location.href,
            pageTitle: document.title,
            userAgent: navigator.userAgent,
            language: this.getCurrentLanguage()
        };
    }
    
    /**
     * Get current language
     */
    getCurrentLanguage() {
        if (window.selectedTargetLanguageCode) return window.selectedTargetLanguageCode;
        if (localStorage.getItem('preferredLanguage')) return localStorage.getItem('preferredLanguage');
        if (localStorage.getItem('selectedLanguage')) return localStorage.getItem('selectedLanguage');
        return 'en';
    }
    
    /**
     * Submit feedback
     */
    async submitFeedback() {
        try {
            const feedbackData = this.collectFeedbackData();
            
            console.log('📝 Submitting feedback:', feedbackData);
            
            // Add to local storage
            this.addFeedbackToStorage(feedbackData);
            
            // Send to server
            const success = await this.sendFeedbackToServer(feedbackData);
            
            if (success) {
                this.showSuccessMessage();
                this.closeFeedbackModal();
                
                // Trigger feedback submitted event
                this.triggerFeedbackEvent('submitted', feedbackData);
            } else {
                throw new Error('Failed to send feedback to server');
            }
            
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
            this.showErrorMessage(error.message);
        }
    }
    
    /**
     * Send feedback to server
     */
    async sendFeedbackToServer(feedbackData) {
        try {
            const endpoint = this.config.enableLocalhost ? 
                this.config.localhostEndpoint : 
                this.config.feedbackEndpoint;
            
            const payload = {
                feedbackTimeStamp: Math.floor(new Date().getTime() / 1000),
                feedbackLanguage: "en",
                pipelineInput: {
                    pipelineTasks: [{
                        taskType: "translation",
                        config: {
                            language: {
                                sourceLanguage: "en",
                                targetLanguage: feedbackData.language,
                            },
                            serviceId: "ai4bharat/indictrans-v2-all-gpu--t4",
                        },
                    }],
                    inputData: {
                        input: [{ source: "" }],
                        audio: [],
                    },
                },
                pipelineOutput: {
                    pipelineResponse: [{
                        taskType: "translation",
                        config: null,
                        output: [{ source: "", target: "" }],
                        audio: null,
                    }],
                },
                pipelineFeedback: {
                    commonFeedback: [
                        {
                            question: "Are you satisfied with the pipeline response",
                            feedbackType: "rating",
                            rating: feedbackData.rating,
                        },
                        {
                            question: "Describe your issue",
                            feedbackType: "comment",
                            comment: feedbackData.feedbackText || "No additional feedback provided",
                        },
                        {
                            question: "Feedback Category",
                            feedbackType: "comment",
                            comment: `${feedbackData.category}${feedbackData.subcategories.length > 0 ? ': ' + feedbackData.subcategories.join(', ') : ''}`,
                        },
                    ],
                },
                // Enhanced feedback data
                enhancedFeedback: {
                    category: feedbackData.category,
                    subcategories: feedbackData.subcategories,
                    sessionId: feedbackData.sessionId,
                    pageUrl: feedbackData.pageUrl,
                    pageTitle: feedbackData.pageTitle,
                    userAgent: feedbackData.userAgent,
                    timestamp: feedbackData.timestamp
                }
            };
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('✅ Feedback sent successfully:', result);
            
            return true;
            
        } catch (error) {
            console.error('❌ Error sending feedback to server:', error);
            return false;
        }
    }
    
    /**
     * Show success message
     */
    showSuccessMessage() {
        this.showToast('✅ Feedback submitted successfully!', 'success');
    }
    
    /**
     * Show error message
     */
    showErrorMessage(message) {
        this.showToast(`❌ ${message}`, 'error');
    }
    
    /**
     * Show toast message
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `enhanced-feedback-toast enhanced-feedback-toast-${type}`;
        toast.textContent = message;
        
        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            animation: enhanced-feedback-toast-slide-in 0.3s ease-out;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            info: '#3b82f6'
        };
        
        toast.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'enhanced-feedback-toast-slide-out 0.3s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /**
     * Add feedback to local storage
     */
    addFeedbackToStorage(feedbackData) {
        this.feedbackData.push(feedbackData);
        
        // Limit storage size
        if (this.feedbackData.length > 100) {
            this.feedbackData = this.feedbackData.slice(-100);
        }
        
        // Save to localStorage
        try {
            localStorage.setItem('enhanced-feedback-data', JSON.stringify(this.feedbackData));
        } catch (error) {
            console.warn('Could not save feedback to localStorage:', error);
        }
    }
    
    /**
     * Load feedback from storage
     */
    loadFeedbackFromStorage() {
        try {
            const stored = localStorage.getItem('enhanced-feedback-data');
            if (stored) {
                this.feedbackData = JSON.parse(stored);
                console.log(`📝 Loaded ${this.feedbackData.length} feedback items from storage`);
            }
        } catch (error) {
            console.warn('Could not load feedback from localStorage:', error);
        }
    }
    
    /**
     * Setup session management
     */
    setupSessionManagement() {
        // Check session timeout
        setInterval(() => {
            const lastActivity = localStorage.getItem('enhanced-feedback-last-activity');
            if (lastActivity && Date.now() - parseInt(lastActivity) > this.config.sessionTimeout) {
                this.currentSession = this.generateSessionId();
                console.log('🔄 New feedback session started due to timeout');
            }
        }, 60000); // Check every minute
        
        // Update last activity
        setInterval(() => {
            localStorage.setItem('enhanced-feedback-last-activity', Date.now().toString());
        }, 300000); // Update every 5 minutes
    }
    
    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'enhanced-feedback-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Trigger feedback event
     */
    triggerFeedbackEvent(type, data) {
        const event = new CustomEvent('enhancedFeedback', {
            detail: { type, data }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Get feedback statistics
     */
    getFeedbackStats() {
        const total = this.feedbackData.length;
        const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const categories = {};
        const languages = {};
        
        this.feedbackData.forEach(feedback => {
            ratings[feedback.rating]++;
            
            if (!categories[feedback.category]) {
                categories[feedback.category] = 0;
            }
            categories[feedback.category]++;
            
            if (!languages[feedback.language]) {
                languages[feedback.language] = 0;
            }
            languages[feedback.language]++;
        });
        
        return {
            total,
            ratings,
            categories,
            languages,
            averageRating: total > 0 ? 
                Object.entries(ratings).reduce((sum, [rating, count]) => 
                    sum + (parseInt(rating) * count), 0) / total : 0
        };
    }
    
    /**
     * Export feedback data
     */
    exportFeedbackData() {
        const dataStr = JSON.stringify(this.feedbackData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `enhanced-feedback-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        console.log('📊 Feedback data exported');
    }
    
    /**
     * Clear feedback data
     */
    clearFeedbackData() {
        this.feedbackData = [];
        localStorage.removeItem('enhanced-feedback-data');
        console.log('🗑️ Feedback data cleared');
    }
    
    /**
     * Destroy the helper
     */
    destroy() {
        if (this.feedbackModal) {
            this.feedbackModal.remove();
        }
        
        console.log('🗑️ Advanced Feedback Helper destroyed');
    }
}

// Create global instance
const advancedFeedbackHelper = new AdvancedFeedbackHelper();

// Expose globally for testing
window.advancedFeedbackHelper = advancedFeedbackHelper;
window.openFeedbackModal = () => advancedFeedbackHelper.openFeedbackModal();
window.getFeedbackStats = () => advancedFeedbackHelper.getFeedbackStats();
window.exportFeedbackData = () => advancedFeedbackHelper.exportFeedbackData();
window.clearFeedbackData = () => advancedFeedbackHelper.clearFeedbackData();

console.log('📝 ADVANCED FEEDBACK HELPER LOADED');
console.log('==================================');
console.log('Available functions:');
console.log('  openFeedbackModal() - Open feedback collection modal');
console.log('  getFeedbackStats() - Get feedback statistics');
console.log('  exportFeedbackData() - Export feedback data as JSON');
console.log('  clearFeedbackData() - Clear all feedback data');
console.log('\n💡 Quick start: openFeedbackModal()');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => advancedFeedbackHelper.initialize());
} else {
    advancedFeedbackHelper.initialize();
}
