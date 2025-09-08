/**
 * ENHANCED BHASHINI UTILITY
 * 
 * Features:
 * - Smart batch processing with debouncing
 * - Enhanced content filtering
 * - DFS with caching for optimized DOM traversal
 * - Navigation monitoring and state persistence
 * - Mutation observer for dynamic content
 * - Direct API calls with enhanced batching
 */

// ============================================================================
// PERFORMANCE CONFIGURATION SECTION
// ============================================================================
// 
// This section contains all configurable performance parameters for the Enhanced Bhashini Utility.
// Modify these values to customize the behavior and performance of the translation system.
// ============================================================================

// Batch Processing Configuration - OPTIMIZED FOR MAXIMUM SPEED
const BATCH_SIZE = 50;                    // Larger batches = fewer API calls = faster overall
const MAX_BATCH_SIZE = 50;                // Hard limit for batch size
const BATCH_SIZE_LONG_TEXT = 40;          // Larger batches for all text types
const BATCH_SIZE_MEDIUM_TEXT = 45;        // Larger batches for all text types
const BATCH_SIZE_SHORT_TEXT = 50;         // Maximum batch size for short text
const BATCH_DELAY_MS = 10;                // Minimal delay between batches

// Debouncing Configuration - OPTIMIZED FOR MAXIMUM SPEED
const DEBOUNCE_DELAY_MS = 200;            // Much faster debounce
const DEBOUNCE_QUEUE_THRESHOLD = 10;      // Process smaller queues immediately
const DEBOUNCE_MAX_WAIT_MS = 1000;        // Much shorter max wait time

// Timing Configuration - OPTIMIZED FOR MAXIMUM SPEED
const INITIALIZATION_DELAY_MS = 500;      // Start much faster
const NAVIGATION_CHECK_INTERVAL_MS = 500; // Check navigation more frequently
const NAVIGATION_TRANSLATION_DELAY_MS = 200; // Minimal delay for navigation translation
const DOM_CONTENT_DELAY_MS = 1000;        // Much faster DOM content observation

// Text Processing Configuration - OPTIMIZED FOR MAXIMUM SPEED
const MAX_DOM_DEPTH = 500;                // Reduced depth for faster traversal
const MIN_TEXT_LENGTH = 1;                // Lower threshold = more items processed
const MEANINGFUL_TEXT_LENGTH = 5;         // Lower threshold = faster processing
const SAMPLE_TEXT_LENGTH = 30;            // Shorter samples = faster logging
const LOG_SAMPLE_SIZE = 2;                // Fewer samples = faster logging
const LANGUAGE_DETECTION_SAMPLE_SIZE = 3; // Smaller sample = faster detection
const CONTENT_ANALYSIS_SAMPLE_SIZE = 5;   // Smaller sample = faster analysis

// Text Length Thresholds - OPTIMIZED FOR MAXIMUM SPEED
const LONG_TEXT_THRESHOLD = 80;           // Lower threshold = more items in larger batches
const MEDIUM_TEXT_THRESHOLD = 40;         // Lower threshold = more items in larger batches
const SHORT_TEXT_THRESHOLD = 15;          // Lower threshold = more items in larger batches

// Translation Detection
const TRANSLATION_RATIO_THRESHOLD = 0.5;  // Ratio of non-Latin characters to consider translated
const CONTENT_HASH_LENGTH = 20;           // Length of content hash for state management

// Caching Configuration
const CACHE_MAX_SIZE = 10000;             // Maximum cache size

// State Management Configuration
const STATE_STORAGE_KEY = 'enhanced_bhashini_translation_state';
const STATE_EXPIRY_HOURS = 24;

// UI Configuration
const OVERLAY_WIDTH = 350;                // Overlay width in pixels
const OVERLAY_TOGGLE_SIZE = 50;           // Toggle button size in pixels
const OVERLAY_POSITION_TOP = 20;          // Top position in pixels
const OVERLAY_POSITION_RIGHT = 20;        // Right position in pixels
const OVERLAY_BORDER_RADIUS = 12;         // Border radius in pixels
const OVERLAY_TOGGLE_BORDER_RADIUS = 50;  // Toggle button border radius

// Feature Flags
const ENABLE_ADVANCED_FILTERING = true;
const ENABLE_SMART_BATCHING = true;

// API Configuration
const API_BASE_URL = "https://translation-plugin.bhashini.co.in/";

// Legacy CONFIG object for backward compatibility
const CONFIG = {
    // API Configuration
    API_BASE_URL: API_BASE_URL,
    
    // Performance Configuration
    BATCH_SIZE: BATCH_SIZE,
    MAX_BATCH_SIZE: MAX_BATCH_SIZE,
    
    // Caching Configuration
    CACHE_MAX_SIZE: CACHE_MAX_SIZE,
  
    // State Management Configuration
    STATE_STORAGE_KEY: STATE_STORAGE_KEY,
    STATE_EXPIRY_HOURS: STATE_EXPIRY_HOURS,
    
    // Feature Flags
    ENABLE_ADVANCED_FILTERING: ENABLE_ADVANCED_FILTERING,
    ENABLE_SMART_BATCHING: ENABLE_SMART_BATCHING,
};


// Content filtering patterns
const FILTER_PATTERNS = {
    iconTexts: [
        "home", "search", "settings", "menu", "info", "contact", "help",
        "logout", "login", "favorite", "add", "edit", "delete", "close",
        "check", "clear", "done", "remove", "refresh", "download", "upload",
        "account_circle", "arrow_back", "arrow_forward", "chevron_left", 
        "chevron_right", "expand_more", "expand_less", "keyboard_arrow_down",
        "keyboard_arrow_up" // Added from anuvadini
    ],
    iconClasses: [
        "material-icons", "fa", "fas", "fab", "far", "fal", "mdi",
        "icon", "glyphicon", "oi", "bi", "feather", "heroicon",
        "msg-icon", "demo-inline-calendar-card", "angular-editor-textarea" // Added from anuvadini
    ],
    unwantedClasses: [
        "no-translate", "dont-translate", "bhashini-skip-translation",
        "skip-translation", "mat-calendar", "ui-icon", "sprite",
        "msg-icon", "demo-inline-calendar-card", "angular-editor-textarea",
        "toggle-class" // Added from anuvadini
    ],
    unwantedTags: [
        "script", "style", "svg", "img", "noscript", "code", "pre",
        "kbd", "samp", "var", "math", "canvas", "video", "audio",
        "iframe", "embed", "object", "applet", "form", "input",
        "textarea", "select", "label", "fieldset", "legend",
        "images" // Added from anuvadini
        // Note: Removed "button" to allow button text translation
    ]
};

// Precompiled regex patterns for better performance
// These are compiled once when the script loads, not on every use
// This provides significant performance benefits during DOM traversal
const REGEX_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/,
    url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
    numeric: /^[\d.,]+$/,
    whitespace: /^[\n\s\r\t]*$/,
    nonEnglish: /^[^A-Za-z0-9]+$/,
    phone: /^[+]?[1-9][\d]{0,15}$/,
    date: /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/,
    time: /^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/,
    currency: /^[$€£¥₹]?\d+([.,]\d{2})?$/,
    // Additional patterns for better filtering
    govtEmail: /\[dot\]|\[at\]/,
    unicode: /[^\u0020-\u007F\u00A0-\u00FF]/,
    // Performance-optimized patterns
    hasContent: /\S/,
    isOnlyNumbers: /^\d+$/,
    isOnlyLetters: /^[A-Za-z]+$/
};

// State manager
class StateManager {
    constructor() {
        this.storageKey = CONFIG.STATE_STORAGE_KEY;
        this.expiryHours = CONFIG.STATE_EXPIRY_HOURS;
    }
    
    generatePageKey() {
        // Create a unique key for the current page
        const pathname = window.location.pathname;
        const search = window.location.search;
        return btoa(pathname + search).replace(/[^a-zA-Z0-9]/g, '').substring(0, CONTENT_HASH_LENGTH);
    }
    
    saveTranslationState(pageKey, targetLang, translatedNodes) {
        if (!CONFIG.ENABLE_PERSISTENT_STATE) return;
        
        try {
            const state = {
                pageKey: pageKey,
                targetLang: targetLang,
                translatedNodes: translatedNodes,
                timestamp: Date.now(),
                url: window.location.href,
                sourceLang: window.enhancedEngine?.currentTargetLanguage || 'en',
                totalItems: translatedNodes.length,
                pageTitle: document.title,
                contentHash: this.generateContentHash()
            };
            
            const existingState = this.getStoredState();
            existingState[pageKey] = state;
            
            localStorage.setItem(this.storageKey, JSON.stringify(existingState));
            console.log(`💾 Saved translation state for page: ${pageKey} (${targetLang}, ${translatedNodes.length} nodes)`);
            
            // Also save a simple flag to indicate this page is translated
            localStorage.setItem(`translated_${pageKey}`, targetLang);
        } catch (error) {
            console.warn('Failed to save translation state:', error);
        }
    }
    
    generateContentHash() {
        // Simple content hash based on page title and URL
        const content = document.title + window.location.href;
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString();
    }
    
    getStoredState() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.warn('Failed to get stored state:', error);
            return {};
        }
    }
    
    getTranslationState(pageKey) {
        if (!CONFIG.ENABLE_PERSISTENT_STATE) return null;
        
        try {
            const storedState = this.getStoredState();
            const pageState = storedState[pageKey];
            
            if (!pageState) {
                console.log(`📖 No saved state found for page: ${pageKey}`);
                return null;
            }
            
            // Check if state is expired
            const ageHours = (Date.now() - pageState.timestamp) / (1000 * 60 * 60);
            if (ageHours > this.expiryHours) {
                console.log(`🗑️ Translation state expired for page: ${pageKey} (${ageHours.toFixed(1)} hours old)`);
                this.clearPageState(pageKey);
                return null;
            }
            
            // Check if URL has changed significantly
            if (pageState.url !== window.location.href) {
                console.log(`🔄 URL changed, clearing state for page: ${pageKey}`);
                this.clearPageState(pageKey);
                return null;
            }
            
            // Check if content has changed (using content hash)
            if (pageState.contentHash && pageState.contentHash !== this.generateContentHash()) {
                console.log(`🔄 Content changed, clearing state for page: ${pageKey}`);
                this.clearPageState(pageKey);
                return null;
            }
            
            console.log(`📖 Found valid saved translation state for page: ${pageKey} (${pageState.targetLang}, ${pageState.totalItems} items)`);
            return pageState;
        } catch (error) {
            console.warn('Failed to get translation state:', error);
            return null;
        }
    }
    
    clearPageState(pageKey) {
        try {
            const storedState = this.getStoredState();
            delete storedState[pageKey];
            localStorage.setItem(this.storageKey, JSON.stringify(storedState));
        } catch (error) {
            console.warn('Failed to clear page state:', error);
        }
    }
    
    clearAllState() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('🧹 Cleared all translation state');
        } catch (error) {
            console.warn('Failed to clear all state:', error);
        }
    }
    
    getStateStats() {
        try {
            const storedState = this.getStoredState();
            const pages = Object.keys(storedState);
            const totalSize = JSON.stringify(storedState).length;
            
            return {
                totalPages: pages.length,
                totalSize: totalSize,
                pages: pages.map(pageKey => ({
                    pageKey: pageKey,
                    targetLang: storedState[pageKey].targetLang,
                    age: (Date.now() - storedState[pageKey].timestamp) / (1000 * 60 * 60)
                }))
            };
        } catch (error) {
            return { totalPages: 0, totalSize: 0, pages: [] };
        }
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {
            domTraversal: { totalTime: 0, calls: 0, averageTime: 0 },
            translation: { totalTime: 0, calls: 0, averageTime: 0 },
            lazyLoading: { visibleElements: 0, batchesProcessed: 0 },
            cache: { hits: 0, misses: 0, size: 0, hitRate: 0 },
            memory: { peakUsage: 0, currentUsage: 0 },
            api: { totalCalls: 0, successCalls: 0, errorCalls: 0, averageResponseTime: 0 }
        };
        this.startTime = performance.now();
    }
    
    startTimer(operation) {
        return performance.now();
    }
    
    endTimer(operation, startTime) {
        const duration = performance.now() - startTime;
        this.metrics[operation].totalTime += duration;
        this.metrics[operation].calls++;
        this.metrics[operation].averageTime = this.metrics[operation].totalTime / this.metrics[operation].calls;
        return duration;
    }
    
    updateCacheStats(hit) {
        if (hit) {
            this.metrics.cache.hits++;
        } else {
            this.metrics.cache.misses++;
        }
        this.metrics.cache.hitRate = (this.metrics.cache.hits / (this.metrics.cache.hits + this.metrics.cache.misses)) * 100;
    }
    
    updateMemoryUsage() {
        if (performance.memory) {
            this.metrics.memory.currentUsage = performance.memory.usedJSHeapSize / 1024 / 1024;
            this.metrics.memory.peakUsage = Math.max(this.metrics.memory.peakUsage, this.metrics.memory.currentUsage);
        }
    }
    
    getMetrics() {
        this.updateMemoryUsage();
        return { ...this.metrics };
    }
    
    printMetrics() {
        const metrics = this.getMetrics();
        console.log('📊 ENHANCED PERFORMANCE METRICS:');
        console.log('================================');
        console.log(`DOM Traversal: ${metrics.domTraversal.averageTime.toFixed(2)}ms avg (${metrics.domTraversal.calls} calls)`);
        console.log(`Translation: ${metrics.translation.averageTime.toFixed(2)}ms avg (${metrics.translation.calls} calls)`);
        console.log(`Cache: ${metrics.cache.hitRate.toFixed(1)}% hit rate (${metrics.cache.size} items)`);
        console.log(`Memory: ${metrics.memory.currentUsage.toFixed(2)}MB current, ${metrics.memory.peakUsage.toFixed(2)}MB peak`);
        console.log(`API: ${metrics.api.successCalls}/${metrics.api.totalCalls} successful calls`);
        console.log(`Total Runtime: ${((performance.now() - this.startTime) / 1000).toFixed(1)}s`);
    }
}

// DFS traversal with caching
class DFSTraversal {
    constructor() {
        this.cache = new Map();
        this.processedNodes = new WeakSet();
        this.skipElementCache = new WeakMap();
        this.ignoredNodeCache = new WeakMap();
        this.performanceMonitor = new PerformanceMonitor();
    }
    
    getTextNodesToTranslate(rootNode, options = {}) {
        const startTime = this.performanceMonitor.startTimer('domTraversal');
        
        const {
            maxDepth = MAX_DOM_DEPTH,
            enableCache = true,
            enableAdvancedFiltering = CONFIG.ENABLE_ADVANCED_FILTERING
        } = options;
        
        // Check cache first
        const cacheKey = this.generateCacheKey(rootNode, options);
        if (enableCache && this.cache.has(cacheKey)) {
            this.performanceMonitor.updateCacheStats(true);
            return this.cache.get(cacheKey);
        }
        
        const translatableContent = [];
        const stack = [{ node: rootNode, depth: 0 }];
        
        while (stack.length > 0) {
            const { node, depth } = stack.pop();
            
            if (!node || !node.nodeType || depth > maxDepth) {
                continue;
            }
            
            if (this.isSkippableElement(node, enableAdvancedFiltering)) {
                continue;
            }
            
            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text && !this.isIgnoredNode(node, enableAdvancedFiltering)) {
                    // Check if this element has already been translated
                    if (!this.isElementAlreadyTranslated(node, text)) {
                    translatableContent.push({
                        type: "text",
                        node: node,
                        content: text,
                        depth: depth,
                        path: this.generateNodePath(node)
                    });
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                // Handle attributes
                if (node.hasAttribute("placeholder")) {
                    const placeholder = node.getAttribute("placeholder");
                    if (!this.isIgnoredText(placeholder, node, enableAdvancedFiltering)) {
                        translatableContent.push({
                            type: "placeholder",
                            node: node,
                            content: placeholder,
                            depth: depth,
                            path: this.generateNodePath(node)
                        });
                    }
                }
                
                if (node.hasAttribute("title")) {
                    const title = node.getAttribute("title");
                    if (!this.isIgnoredText(title, node, enableAdvancedFiltering)) {
                        translatableContent.push({
                            type: "title",
                            node: node,
                            content: title,
                            depth: depth,
                            path: this.generateNodePath(node)
                        });
                    }
                }
                
                // Handle input button values (for buttons like "Sign Up", "Submit", etc.)
                if (node.tagName === "INPUT" && node.type === "button" && node.hasAttribute("value")) {
                    const value = node.getAttribute("value");
                    if (!this.isIgnoredText(value, node, enableAdvancedFiltering)) {
                        translatableContent.push({
                            type: "value",
                            node: node,
                            content: value,
                            depth: depth,
                            path: this.generateNodePath(node)
                        });
                    }
                }
                
                if (node.hasAttribute("alt")) {
                    const alt = node.getAttribute("alt");
                    if (!this.isIgnoredText(alt, node, enableAdvancedFiltering)) {
                        translatableContent.push({
                            type: "alt",
                            node: node,
                            content: alt,
                            depth: depth,
                            path: this.generateNodePath(node)
                        });
                    }
                }
                
                // Add children to stack
                const children = node.childNodes;
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({ node: children[i], depth: depth + 1 });
                }
            }
        }
        
        // Cache the result
        if (enableCache && this.cache.size < CONFIG.CACHE_MAX_SIZE) {
            this.cache.set(cacheKey, translatableContent);
        }
        
        this.performanceMonitor.endTimer('domTraversal', startTime);
        this.performanceMonitor.updateCacheStats(false);
        
        return translatableContent;
    }
    
    isSkippableElement(node, enableAdvancedFiltering) {
        if (this.skipElementCache.has(node)) {
            return this.skipElementCache.get(node);
        }
        
        let result = (
            node.nodeType === Node.ELEMENT_NODE &&
            (FILTER_PATTERNS.unwantedTags.includes(node.tagName?.toLowerCase()) ||
             FILTER_PATTERNS.unwantedClasses.some(cls => node.classList?.contains(cls)))
        );
        
        if (enableAdvancedFiltering) {
            result = result || FILTER_PATTERNS.iconClasses.some(cls => node.classList?.contains(cls));
        }
        
        this.skipElementCache.set(node, result);
        return result;
    }
    
    isIgnoredNode(node, enableAdvancedFiltering) {
        if (this.ignoredNodeCache.has(node)) {
            return this.ignoredNodeCache.get(node);
        }
        
        const text = node.textContent;
        let result = false;
        
        // Quick checks first (most common cases)
        if (!text) {
            result = true;
        } else if (REGEX_PATTERNS.whitespace.test(text)) {
            result = true;
        } else if (REGEX_PATTERNS.numeric.test(text)) {
            result = true;
        } else if (REGEX_PATTERNS.email.test(text) || this.isValidGovtEmail(text)) {
            result = true;
        } else if (REGEX_PATTERNS.url.test(text)) {
            result = true;
        } else if (node.parentNode && this.isSkippableElement(node.parentNode, enableAdvancedFiltering)) {
            result = true;
        } else if (node.parentNode && (
            node.parentNode.id === "persistent-toast-msg" ||
            node.parentNode.id === "micButton"
        )) {
            result = true;
        } else if (enableAdvancedFiltering) {
            // Advanced filtering
            if (REGEX_PATTERNS.phone.test(text) ||
                REGEX_PATTERNS.date.test(text) ||
                REGEX_PATTERNS.time.test(text) ||
                REGEX_PATTERNS.currency.test(text) ||
                FILTER_PATTERNS.iconTexts.includes(text.trim()) ||
                (window.languageDetection !== "true" &&
                 window.pageSourceLanguage === "en" &&
                 REGEX_PATTERNS.nonEnglish.test(text))) {
                result = true;
            }
        }
        
        this.ignoredNodeCache.set(node, result);
        return result;
    }
    
    isValidGovtEmail(email) {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
        let normalizedEmail = email.replace(/\[dot\]/g, ".").replace(/\[at\]/g, "@");
        return emailRegex.test(normalizedEmail);
    }
    
    isIgnoredText(text, node, enableAdvancedFiltering) {
        if (!text) return true;
        
        // Quick checks first (most common cases)
        if (REGEX_PATTERNS.whitespace.test(text)) return true;
        if (REGEX_PATTERNS.numeric.test(text)) return true;
        if (REGEX_PATTERNS.email.test(text)) return true;
        if (REGEX_PATTERNS.url.test(text)) return true;
        
        // Advanced filtering
        if (enableAdvancedFiltering) {
            if (REGEX_PATTERNS.phone.test(text)) return true;
            if (REGEX_PATTERNS.date.test(text)) return true;
            if (REGEX_PATTERNS.time.test(text)) return true;
            if (REGEX_PATTERNS.currency.test(text)) return true;
            if (FILTER_PATTERNS.iconTexts.includes(text.trim())) return true;
        }
        
        return false;
    }
    
    generateNodePath(node) {
        const path = [];
        let currentNode = node;
        
        while (currentNode && currentNode.nodeType === Node.ELEMENT_NODE) {
            const tagName = currentNode.tagName.toLowerCase();
            const id = currentNode.id ? `#${currentNode.id}` : '';
            const classes = Array.from(currentNode.classList).slice(0, 3).map(c => `.${c}`).join('');
            path.unshift(`${tagName}${id}${classes}`);
            currentNode = currentNode.parentElement;
        }
        
        return path.join(' > ');
    }
    
    generateCacheKey(node, options) {
        const nodeInfo = {
            nodeType: node.nodeType,
            tagName: node.tagName,
            id: node.id,
            className: node.className,
            textLength: node.textContent?.length || 0,
            childCount: node.childNodes?.length || 0,
            options: options
        };
        
        return JSON.stringify(nodeInfo);
    }
    
    clearCache() {
        this.cache.clear();
        this.processedNodes.clear();
        this.skipElementCache.clear();
        this.ignoredNodeCache.clear();
    }
    
    getCacheStats() {
        return {
            cacheSize: this.cache.size,
            processedNodes: this.processedNodes.size,
            skipElementCacheSize: this.skipElementCache.size,
            ignoredNodeCacheSize: this.ignoredNodeCache.size
        };
    }
    
    isElementAlreadyTranslated(node, text) {
        // Don't check element translation state - always process since content reverts to English
        
        // Don't check translation state - always process since content reverts to English
        
        // Check if the text appears to be already translated (non-Latin characters)
        if (text.trim().length > 3 && REGEX_PATTERNS.unicode.test(text.trim())) {
            // This might be already translated content, but we need to be careful
            // Only skip if we're sure it's not original content
            return false; // Let the translation engine decide
        }
        
        return false;
    }
}

// Batch processor
class BatchProcessor {
    constructor() {
        this.batchQueue = [];
        this.isProcessingBatch = false;
        this.performanceMonitor = new PerformanceMonitor();
    }
    
    createSmartBatches(textNodes) {
        console.log(`\n🔍 ===== CREATE SMART BATCHES START =====`);
        console.log(`📊 Input: ${textNodes.length} text nodes`);
        console.log(`⚙️ Smart batching enabled: ${CONFIG.ENABLE_SMART_BATCHING}`);
        
        if (!CONFIG.ENABLE_SMART_BATCHING) {
            console.log(`🔍 DEBUG: Smart batching disabled, returning single batch of ${textNodes.length} items`);
            console.log(`🔍 ===== CREATE SMART BATCHES COMPLETE (DISABLED) =====\n`);
            return [textNodes];
        }
        
        const batches = [];
        const batchSize = this.calculateOptimalBatchSize(textNodes);
        
        console.log(`📊 Calculated batch size: ${batchSize}`);
        console.log(`🔍 DEBUG: Creating batches with size ${batchSize} from ${textNodes.length} items`);
        
        for (let i = 0; i < textNodes.length; i += batchSize) {
            const batch = textNodes.slice(i, i + batchSize);
            batches.push(batch);
            console.log(`🔍 DEBUG: Created batch ${batches.length} with ${batch.length} items (range: ${i}-${i + batch.length - 1})`);
        }
        
        console.log(`🔍 DEBUG: Total batches created: ${batches.length}`);
        console.log(`📊 Batch sizes: [${batches.map(b => b.length).join(', ')}]`);
        console.log(`🔍 ===== CREATE SMART BATCHES COMPLETE =====\n`);
        return batches;
    }
    
    calculateOptimalBatchSize(textNodes) {
        console.log(`\n🔍 ===== CALCULATE BATCH SIZE START =====`);
        console.log(`📊 Input: ${textNodes.length} text nodes`);
        
        if (textNodes.length === 0) {
            console.log(`📊 No text nodes, returning default batch size: ${BATCH_SIZE}`);
            console.log(`🔍 ===== CALCULATE BATCH SIZE COMPLETE =====\n`);
            return BATCH_SIZE;
        }
        
        // FIXED: Set maximum batch size to configured value
        const maxBatchSize = MAX_BATCH_SIZE;
        console.log(`📊 Maximum batch size: ${maxBatchSize}`);
        
        const avgTextLength = textNodes.reduce((sum, node) => {
            // Handle both DOM text nodes (textContent) and processed nodes (content)
            const textLength = node.content ? node.content.length : (node.textContent ? node.textContent.length : 0);
            return sum + textLength;
        }, 0) / textNodes.length;
        console.log(`📊 Average text length: ${avgTextLength.toFixed(1)} characters`);
        
        // Adjust batch size based on text complexity
        let optimalBatchSize = maxBatchSize;
        
        if (avgTextLength > LONG_TEXT_THRESHOLD) {
            // Long text takes more processing time, use smaller batches
            optimalBatchSize = BATCH_SIZE_LONG_TEXT;
            console.log(`📊 Long text detected, using smaller batch size: ${optimalBatchSize}`);
        } else if (avgTextLength > MEDIUM_TEXT_THRESHOLD) {
            // Medium text, moderate batch size
            optimalBatchSize = BATCH_SIZE_MEDIUM_TEXT;
            console.log(`📊 Medium text detected, using medium batch size: ${optimalBatchSize}`);
        } else if (avgTextLength > SHORT_TEXT_THRESHOLD) {
            // Short text, can handle larger batches
            optimalBatchSize = BATCH_SIZE_SHORT_TEXT;
            console.log(`📊 Short text detected, using max batch size: ${optimalBatchSize}`);
        }
        
        // Ensure we don't exceed API limits or total items
        const finalBatchSize = Math.min(optimalBatchSize, textNodes.length);
        console.log(`📊 Final batch size: ${finalBatchSize} items`);
        console.log(`📊 Total items: ${textNodes.length}`);
        console.log(`📊 Will create ${Math.ceil(textNodes.length / finalBatchSize)} batches`);
        console.log(`🔍 ===== CALCULATE BATCH SIZE COMPLETE =====\n`);
        return finalBatchSize;
    }
    
    async processBatches(textNodes, targetLang, onBatchComplete = null, sourceLang = null) {
        const startTime = this.performanceMonitor.startTimer('translation');
        
        console.log(`🔍 DEBUG: Processing ${textNodes.length} text nodes`);
        console.log(`🔍 DEBUG: Target language: ${targetLang}`);
        console.log(`🔍 DEBUG: Source language: ${sourceLang}`);
        
        const batches = this.createSmartBatches(textNodes);
        const results = [];
        
        console.log(`🚀 Starting progressive translation: ${batches.length} batches`);
        console.log(`🔍 DEBUG: Batch sizes:`, batches.map(batch => batch.length));
        
        if (sourceLang) {
            console.log(`📝 Source language: ${sourceLang} → Target language: ${targetLang}`);
        }
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const batchStartTime = performance.now();
            
            console.log(`\n📦 ===== BATCH ${i + 1}/${batches.length} START =====`);
            console.log(`📊 Batch Size: ${batch.length} items`);
            console.log(`🎯 Target Language: ${targetLang}`);
            console.log(`🌍 Source Language: ${sourceLang || 'auto'}`);
            console.log(`⏰ Batch Start Time: ${new Date().toISOString()}`);
            
            // Log sample of batch content
            console.log(`📝 Batch Content Sample (first ${LOG_SAMPLE_SIZE} items):`);
            batch.slice(0, LOG_SAMPLE_SIZE).forEach((item, index) => {
                console.log(`   ${index + 1}. "${item.content.substring(0, SAMPLE_TEXT_LENGTH)}${item.content.length > SAMPLE_TEXT_LENGTH ? '...' : ''}"`);
            });
            if (batch.length > LOG_SAMPLE_SIZE) {
                console.log(`   ... and ${batch.length - LOG_SAMPLE_SIZE} more items in this batch`);
            }
            
            try {
                console.log(`🔄 Calling translateBatch for batch ${i + 1}...`);
                const batchResult = await this.translateBatch(batch, targetLang, sourceLang);
                results.push(...batchResult);
                
                const batchTime = performance.now() - batchStartTime;
                const successCount = batchResult.filter(r => r.translated).length;
                
                console.log(`✅ ===== BATCH ${i + 1} COMPLETED =====`);
                console.log(`⏱️ Batch Time: ${batchTime.toFixed(2)}ms`);
                console.log(`📊 Results: ${batchResult.length} items processed`);
                console.log(`✅ Successful: ${successCount} items`);
                console.log(`⏭️ Skipped: ${batchResult.length - successCount} items`);
                
                // Progressive rendering: Update UI immediately after each batch
                if (onBatchComplete) {
                    onBatchComplete({
                        batchIndex: i,
                        totalBatches: batches.length,
                        batchResult: batchResult,
                        successCount: successCount,
                        batchTime: batchTime,
                        progress: ((i + 1) / batches.length) * 100
                    });
                }
                
                // Small delay between batches to prevent overwhelming the API
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
                }
            } catch (error) {
                console.error(`❌ Error processing batch ${i + 1}:`, error);
                // Continue with next batch
            }
        }
        
        this.performanceMonitor.endTimer('translation', startTime);
        
        // COMPREHENSIVE TRANSLATION SUMMARY
        const totalTranslated = results.filter(r => r.translated).length;
        const totalSkipped = results.filter(r => r.skipped).length;
        const totalSuccessful = results.filter(r => r.success).length;
        const totalTime = performance.now() - startTime;
        
        console.log(`\n🎉 ===== TRANSLATION COMPLETE =====`);
        console.log(`📊 Total Items: ${textNodes.length}`);
        console.log(`✅ Successfully Translated: ${totalTranslated}`);
        console.log(`⏭️ Skipped (Already Translated): ${totalSkipped}`);
        console.log(`✅ Successful API Calls: ${totalSuccessful}`);
        console.log(`⏱️ Total Time: ${totalTime.toFixed(2)}ms`);
        console.log(`📦 Total Batches: ${batches.length}`);
        console.log(`🌍 Source Language: ${sourceLang || 'auto'}`);
        console.log(`🎯 Target Language: ${targetLang}`);
        console.log(`🎉 ===== TRANSLATION COMPLETE =====\n`);
        
        return results;
    }
    
    async translateBatch(textNodes, targetLang, sourceLang = null) {
        console.log(`\n🔍 ===== TRANSLATE BATCH START =====`);
        console.log(`📊 Input: ${textNodes.length} text nodes`);
        console.log(`🎯 Target: ${targetLang}`);
        console.log(`🌍 Source: ${sourceLang || 'auto'}`);
        
        // Process all text nodes - don't filter by translation state
        // since content reverts to English when navigating away
        console.log(`🔍 Processing all text nodes for translation...`);
        const untranslatedNodes = textNodes;
        
        console.log(`📊 Filtering Results:`);
        console.log(`   📝 Total items in batch: ${textNodes.length}`);
        console.log(`   ✅ Already translated: ${textNodes.length - untranslatedNodes.length}`);
        console.log(`   🔄 Needs translation: ${untranslatedNodes.length}`);
        
        if (untranslatedNodes.length === 0) {
            console.log('ℹ️ All elements in batch already translated, skipping API call');
            console.log(`🔍 ===== TRANSLATE BATCH COMPLETE (SKIPPED) =====\n`);
            return textNodes.map(item => ({
                ...item,
                translated: true,
                translation: item.content,
                success: true,
                skipped: true
            }));
        }
        
        console.log(`🔄 Proceeding with ${untranslatedNodes.length} untranslated items`);
        
        const texts = untranslatedNodes.map(node => node.content);
        
        try {
            const translations = await this.callTranslationAPI(texts, targetLang, sourceLang);
            
            // Track translated elements
            untranslatedNodes.forEach((item, index) => {
                if (window.enhancedEngine) {
                    window.enhancedEngine.translatedElements.add(item.node);
                    window.enhancedEngine.translatedTexts.add(item.content.trim());
                }
            });
            
            // Map results back to original textNodes array
            let resultIndex = 0;
            return textNodes.map(item => {
                // Always translate - don't check translation state
                // since content reverts to English when navigating away
                if (resultIndex < translations.length) {
                    const translation = translations[resultIndex++];
                    if (translation && translation.target) {
                        this.updateDOMNode(item, translation.target);
                        return { ...item, translated: true, translation: translation.target, success: true };
                    }
                }
                return { ...item, translated: true, translation: item.content, success: true, skipped: true };
            });
        } catch (error) {
            console.log(`❌ ===== TRANSLATE BATCH FAILED =====`);
            console.error('Batch translation error:', error);
            console.log(`❌ ===== TRANSLATE BATCH FAILED =====\n`);
            throw error;
        }
    }
    
    async callTranslationAPI(texts, targetLang, sourceLang = null) {
        const startTime = performance.now();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // COMPREHENSIVE API REQUEST LOGGING
            console.log(`\n🚀 ===== API REQUEST START =====`);
            console.log(`📋 Request ID: ${requestId}`);
            console.log(`📊 Items Count: ${texts.length}`);
            console.log(`🌍 Source Language: ${sourceLang || 'auto'}`);
            console.log(`🎯 Target Language: ${targetLang}`);
            console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
            console.log(`🔗 API Endpoint: ${window.TRANSLATION_PLUGIN_API_BASE_URL || 'https://translation-plugin.bhashini.co.in'}/v2/translate-text`);
            
            // Log sample of texts being sent
            console.log(`📝 Sample Texts (first ${LOG_SAMPLE_SIZE}):`);
            texts.slice(0, LOG_SAMPLE_SIZE).forEach((text, index) => {
                console.log(`   ${index + 1}. "${text.substring(0, SAMPLE_TEXT_LENGTH)}${text.length > SAMPLE_TEXT_LENGTH ? '...' : ''}"`);
            });
            if (texts.length > LOG_SAMPLE_SIZE) {
                console.log(`   ... and ${texts.length - LOG_SAMPLE_SIZE} more items`);
            }
            
            // Make direct API call to Bhashini (not using original utility)
            const apiUrl = `${window.TRANSLATION_PLUGIN_API_BASE_URL || 'https://translation-plugin.bhashini.co.in'}/v2/translate-text`;
            
            const requestPayload = {
                sourceLanguage: sourceLang || 'en',
                targetLanguage: targetLang,
                textData: texts
            };
            
            console.log(`📡 Making direct API call to: ${apiUrl}`);
            console.log(`📋 Request payload:`, {
                sourceLanguage: requestPayload.sourceLanguage,
                targetLanguage: requestPayload.targetLanguage,
                textDataCount: requestPayload.textData.length
            });
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            const result = await response.json();
                this.performanceMonitor.metrics.api.successCalls++;
            
            const responseTime = performance.now() - startTime;
            
            console.log(`✅ ===== API RESPONSE SUCCESS =====`);
            console.log(`📋 Request ID: ${requestId}`);
            console.log(`⏱️ Response Time: ${responseTime.toFixed(2)}ms`);
            console.log(`📊 Translations Received: ${result ? result.length : 0}`);
            console.log(`🎯 Target Language: ${targetLang}`);
            console.log(`🌍 Source Language: ${sourceLang || 'auto'}`);
            
            // Log sample of translations received
            if (result && result.length > 0) {
                console.log(`📝 Sample Translations (first ${LOG_SAMPLE_SIZE}):`);
                result.slice(0, LOG_SAMPLE_SIZE).forEach((translation, index) => {
                    if (translation && translation.target) {
                        console.log(`   ${index + 1}. "${translation.target.substring(0, SAMPLE_TEXT_LENGTH)}${translation.target.length > SAMPLE_TEXT_LENGTH ? '...' : ''}"`);
                    }
                });
            }
            
            console.log(`🚀 ===== API REQUEST COMPLETE =====\n`);
            return result;
        } catch (error) {
            const responseTime = performance.now() - startTime;
            
            console.log(`❌ ===== API REQUEST FAILED =====`);
            console.log(`📋 Request ID: ${requestId}`);
            console.log(`⏱️ Failed After: ${responseTime.toFixed(2)}ms`);
            console.log(`📊 Items Count: ${texts.length}`);
            console.log(`🌍 Source Language: ${sourceLang || 'auto'}`);
            console.log(`🎯 Target Language: ${targetLang}`);
            console.error(`❌ Error Details:`, error);
            console.log(`❌ ===== API REQUEST FAILED =====\n`);
            
            this.performanceMonitor.metrics.api.errorCalls++;
            throw error;
        } finally {
            this.performanceMonitor.metrics.api.totalCalls++;
            const responseTime = performance.now() - startTime;
            this.performanceMonitor.metrics.api.averageResponseTime = 
                (this.performanceMonitor.metrics.api.averageResponseTime + responseTime) / 2;
        }
    }
    
    updateDOMNode(node, translatedText) {
        try {
            switch (node.type) {
                case "text":
                    node.node.nodeValue = translatedText;
                    break;
                case "placeholder":
                    node.node.setAttribute("placeholder", translatedText);
                    break;
                case "title":
                    node.node.setAttribute("title", translatedText);
                    break;
                case "value":
                    node.node.setAttribute("value", translatedText);
                    break;
                case "alt":
                    node.node.setAttribute("alt", translatedText);
                    break;
                default:
                    console.warn(`Unknown node type: ${node.type}`);
            }
        } catch (error) {
            console.error('Error updating DOM node:', error);
        }
    }
}


// Main translation engine
class TranslationEngine {
    constructor() {
        this.dfsTraversal = new DFSTraversal();
        this.batchProcessor = new BatchProcessor();
        this.performanceMonitor = new PerformanceMonitor();
        this.stateManager = new StateManager();
        this.isInitialized = false;
        this.isTranslating = false;
        this.currentTargetLanguage = null;
        this.translationInProgress = false;
        this.autoTranslationEnabled = false;
        this.initializationDelay = INITIALIZATION_DELAY_MS;
        
        // Translation tracking to prevent duplicate API calls
        this.translatedElements = new WeakSet();
        this.translatedTexts = new Set();
        this.translationCache = new Map();
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Translation Engine...');
        
        // Reset translation state on fresh initialization
        this.resetTranslationState();
        
        // Create intersection observer for lazy loading (following anuvadini pattern)
        this.lazyObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    const node = entry.target;
                    // Use getTextNodesToTranslate to get properly formatted text nodes
                    const textNodes = this.dfsTraversal.getTextNodesToTranslate(node, {
                        enableCache: false,
                        enableAdvancedFiltering: true
                    });
                    // Process text nodes directly - check current language dynamically
                    const currentLang = localStorage.getItem("selectedLanguage");
                    if (textNodes.length > 0 && currentLang && currentLang !== "en-IN" && currentLang !== "en") {
                        console.log(`👁️ Intersection observer found ${textNodes.length} text nodes, translating to:`, currentLang);
                        // Update current target language if it changed
                        if (this.currentTargetLanguage !== currentLang) {
                            this.currentTargetLanguage = currentLang;
                        }
                        this.addToDebounceQueue(textNodes);
                    }
                    observer.unobserve(node);
                }
            });
        });
        
        // Set up mutation observer for new content detection
        this.setupMutationObserver();
        
        // Set up automatic translation triggers
        this.setupAutoTranslationTriggers();
        
        this.isInitialized = true;
        console.log('✅ Translation Engine initialized');
    }
    
    // Get text nodes from an element (following anuvadini pattern)
    getTextNodes(node) {
        const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        const textNodes = [];
        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }
        return textNodes;
    }
    
    // Translate a single text node (following anuvadini pattern)
    async translateTextNode(node) {
        try {
            const unwantedTags = [
                "script",
                "images", 
                "style",
                "svg",
                "img",
                "noscript",
            ];
            const unwantedClasses = [
                "no-translate",
                "msg-icon",
                "demo-inline-calendar-card",
                "angular-editor-textarea",
                "mat-calendar",
                "toggle-class",
            ];
            const parentElement = node.parentNode;

            // Check if the element or its parent has an unwanted tag or class
            if (
                parentElement == null ||
                unwantedTags.includes(parentElement.nodeName.toLowerCase()) ||
                unwantedClasses.some(
                    (cls) =>
                        parentElement.classList?.contains(cls) ||
                        node.classList?.contains(cls)
                )
            ) {
                return;
            }

            if (
                parentElement.id === "persistent-toast-msg" ||
                parentElement.id === "micButton"
            ) {
                return;
            }

            const sourceText = node.textContent.trim();
            const selectedLanguage = localStorage.getItem("selectedLanguage");

            if (sourceText.trim() && selectedLanguage && selectedLanguage !== "en-IN" && selectedLanguage !== "en") {
                // Update current target language if it changed
                if (this.currentTargetLanguage !== selectedLanguage) {
                    this.currentTargetLanguage = selectedLanguage;
                }
                // Add to debounce queue for translation
                this.addToDebounceQueue([node]);
            }
        } catch (error) {
            console.error("Error translating text node:", error);
        }
    }
    
    // Function to observe initial content (following anuvadini pattern)
    observeInitialContent() {
        try {
            // Use getTextNodesToTranslate to get properly formatted text nodes
            const textNodes = this.dfsTraversal.getTextNodesToTranslate(document.body, {
                enableCache: false,
                enableAdvancedFiltering: true
            });
            
            textNodes.forEach((textNodeData) => {
                try {
                    this.lazyObserver.observe(textNodeData.node.parentNode);
                } catch (e) {
                    // Ignore errors like anuvadini does
                }
            });
        } catch (error) {
            console.error("Error observing initial content:", error);
        }
    }
    
    setupAutoTranslationTriggers() {
        console.log('🔧 Setting up auto-translation triggers...');
        
        // Note: Auto-translation logic is now handled in the global initialization
        // to prevent duplicate auto-translation calls
        
        // Listen for language changes (like both utilities)
        this.setupLanguageChangeListeners();
        
        // Setup navigation monitoring (like Bhashini)
        this.setupNavigationMonitoring();
        
        // Setup mutation observer (like Bhashini)
        this.setupMutationObserver();
        
        console.log('✅ Auto-translation triggers setup complete');
    }
    
    async autoTranslatePage(targetLang) {
        if (this.isTranslating || this.translationInProgress) {
            console.log('⚠️ Auto-translation skipped: translation already in progress');
            return;
        }
        
        console.log(`🤖 Auto-translating page to ${targetLang}...`);
        
        try {
            const result = await this.translatePage(targetLang);
            if (result.success) {
                console.log(`✅ Auto-translation completed: ${result.itemsTranslated} items translated`);
            }
        } catch (error) {
            console.error('❌ Auto-translation failed:', error);
        }
    }
    
    setupLanguageChangeListeners() {
        // Listen for localStorage changes (like Anuvadini)
        window.addEventListener('storage', (event) => {
            if (event.key === 'selectedLanguage' && event.newValue) {
                console.log(`🔄 Language changed via localStorage: ${event.newValue}`);
                this.handleLanguageChange(event.newValue);
            }
        });
        
        // Listen for sessionStorage changes (like Bhashini)
        window.addEventListener('storage', (event) => {
            if (event.key === 'selectedLang' && event.newValue) {
                console.log(`🔄 Language changed via sessionStorage: ${event.newValue}`);
                this.handleLanguageChange(event.newValue);
            }
        });
        
        // Listen for custom language change events
        window.addEventListener('languageChanged', (event) => {
            if (event.detail && event.detail.language) {
                console.log(`🔄 Language changed via custom event: ${event.detail.language}`);
                this.handleLanguageChange(event.detail.language);
            }
        });
        
        // Listen for overlay language selection (integrate with enhanced overlay)
        this.setupOverlayIntegration();
    }
    
    handleLanguageChange(newLanguage, userInitiated = true) {
        console.log('🔄 Language changed to:', newLanguage, 'userInitiated:', userInitiated);
        
        // If English is selected, clear all translation state and reload to original state
        if (newLanguage === 'en' || newLanguage === 'en-IN') {
            console.log('🔄 English selected - clearing translation state');
            localStorage.removeItem("selectedLanguage");
            sessionStorage.removeItem("selectedLang");
            localStorage.removeItem("preferredLanguage");
            // Clear all translation states
            this.clearAllPersistentState();
            
            // Only reload if this was user-initiated (clicked by user)
            if (userInitiated) {
                console.log('🔄 User clicked English - reloading to original state');
                window.location.reload();
            } else {
                console.log('🔄 System set English - not reloading');
            }
            return;
        }
        
        // For other languages, save and reload
        localStorage.setItem("selectedLanguage", newLanguage);
        sessionStorage.setItem("selectedLang", newLanguage);
        localStorage.setItem("preferredLanguage", newLanguage);
        window.location.reload();
    }
    
    revertToOriginal() {
        console.log('🔄 Reverting page to original language...');
        
        // Use handleLanguageChange with userInitiated=true since this is a user action
        this.handleLanguageChange('en', true);
    }
    
    setupNavigationMonitoring() {
        console.log('🧭 Setting up navigation monitoring...');
        
        // Monitor for page navigation and trigger translation if needed
        let lastUrl = window.location.href;
        
        // Check for navigation at configured interval
        setInterval(() => {
            const currentUrl = window.location.href;
            if (currentUrl !== lastUrl) {
                console.log('🧭 Page navigation detected:', lastUrl, '->', currentUrl);
                lastUrl = currentUrl;
                
                // Check if we should translate this page
                const currentLang = localStorage.getItem("selectedLanguage");
                if (currentLang && currentLang !== "en-IN" && currentLang !== "en") {
                    console.log('🔄 Navigation detected with translation language, triggering translation:', currentLang);
                    // Delay to allow page to load
                    setTimeout(() => {
                        this.autoTranslatePage(currentLang);
                    }, NAVIGATION_TRANSLATION_DELAY_MS);
                }
            }
        }, NAVIGATION_CHECK_INTERVAL_MS);
        
        console.log('✅ Navigation monitoring setup complete');
    }
    
    setupMutationObserver() {
        console.log('👁️ Setting up mutation observer...');
        
        // Create mutation observer that handles both anuvadini pattern and bhashini auto-translation
        this.mutationObserver = new MutationObserver((mutations) => {
            console.log('🔍 Mutation observer triggered with', mutations.length, 'mutations');
            
            // Check if we should be translating on this page
            const currentLang = localStorage.getItem("selectedLanguage");
            const shouldTranslate = currentLang && currentLang !== "en-IN" && currentLang !== "en";
            
            if (!shouldTranslate) {
                console.log('⏭️ Skipping mutation processing - no translation needed');
                return;
            }
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    console.log('📝 childList mutation detected, added nodes:', mutation.addedNodes.length);
                    mutation.addedNodes.forEach((addedNode) => {
                        if (addedNode.nodeType === Node.TEXT_NODE) {
                            try {
                                this.lazyObserver.observe(addedNode.parentNode);
                            } catch (e) {
                                // Ignore errors like anuvadini does
                            }
                        } else if (addedNode.nodeType === Node.ELEMENT_NODE) {
                            console.log('🏷️ Element node detected:', addedNode.tagName, addedNode.textContent?.substring(0, SAMPLE_TEXT_LENGTH));
                            // Check for current language (like anuvadini does)
                            const currentLang = localStorage.getItem("selectedLanguage");
                            console.log('🌐 Current language from localStorage:', currentLang);
                            
                            // Only translate if we have a target language and the page should be translated
                            if (currentLang && currentLang !== "en-IN" && currentLang !== "en") {
                                // Check if this element contains meaningful text that needs translation
                                const elementText = addedNode.textContent?.trim();
                                if (elementText && elementText.length > MEANINGFUL_TEXT_LENGTH) { // Only process elements with substantial text
                                    console.log('🔄 New content detected, translating to:', currentLang);
                                    // Update current target language if it changed
                                    if (this.currentTargetLanguage !== currentLang) {
                                        this.currentTargetLanguage = currentLang;
                                    }
                                    this.translateNewElement(addedNode);
                                } else {
                                    console.log('⏭️ Skipping element - no meaningful text content');
                                }
                            } else {
                                console.log('❌ No translation needed - language is English or not set');
                            }
                            
                            // Also observe for lazy loading
                            const textNodes = this.getTextNodes(addedNode);
                            textNodes.forEach((textNode) => {
                                try {
                                    this.lazyObserver.observe(textNode.parentNode);
                                } catch (e) {
                                    // Ignore errors like anuvadini does
                                }
                            });
                        }
                    });
                } else if (mutation.type === 'characterData') {
                    try {
                        this.lazyObserver.observe(mutation.target.parentNode);
                    } catch (e) {
                        // Ignore errors like anuvadini does
                    }
                }
            });
        });
        
        // Start observing
        this.mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        
        console.log('✅ Mutation observer setup complete');
    }
    
    handleNavigationChange() {
        console.log('🧭 Handling navigation change...');
        // Simplified navigation handling - just reload page like anuvadini
        // This ensures clean state and proper translation restart
        window.location.reload();
    }
    
    async translateNewElement(element) {
        try {
            console.log('🎯 translateNewElement called for:', element.tagName, element.textContent?.substring(0, SAMPLE_TEXT_LENGTH));
            
            // Get text nodes from the new element
            const textNodes = this.dfsTraversal.getTextNodesToTranslate(element, {
                enableCache: false,
                enableAdvancedFiltering: true
            });
            
            console.log(`🔍 Found ${textNodes.length} text nodes in new element`);
            if (textNodes.length > 0) {
                console.log(`👁️ Found ${textNodes.length} new text nodes, adding to debounce queue`);
                
                // Add to debounce queue instead of immediate translation
                this.addToDebounceQueue(textNodes);
            } else {
                // If no text nodes found, try a deeper search for nested text
                const allTextNodes = this.getTextNodes(element);
                const meaningfulTextNodes = allTextNodes.filter(node => {
                    const text = node.textContent?.trim();
                    return text && text.length > MIN_TEXT_LENGTH; // Remove translation state check
                });
                
                if (meaningfulTextNodes.length > 0) {
                    console.log(`🔍 Found ${meaningfulTextNodes.length} meaningful text nodes in nested content`);
                    // Convert to proper format and add to queue
                    const formattedNodes = meaningfulTextNodes.map(node => ({
                        type: "text",
                        node: node,
                        content: node.textContent
                    }));
                    this.addToDebounceQueue(formattedNodes);
                } else {
                    console.log('⚠️ No meaningful text nodes found in new element');
                }
            }
        } catch (error) {
            console.error('❌ Error processing new element:', error);
        }
    }
    
    addToDebounceQueue(textNodes) {
        // Initialize debounce queue if not exists
        if (!this.debounceQueue) {
            this.debounceQueue = [];
            this.debounceTimer = null;
        }
        
        // Filter out whitespace-only text nodes and ensure proper format
        const meaningfulNodes = textNodes.filter(node => {
            const text = node.textContent || node.content || '';
            const trimmedText = text.trim();
            // Only include nodes with meaningful content (more than just whitespace/newlines)
            return trimmedText.length > 0 && trimmedText.length > MIN_TEXT_LENGTH;
        }).map(node => {
            // Ensure all nodes have the proper format for batch processing
            if (node.type && node.node && node.content) {
                // Already properly formatted
                return node;
            } else {
                // Convert raw DOM node to proper format
                return {
                    type: "text",
                    node: node,
                    content: node.textContent || node.content || ''
                };
            }
        });
        
        if (meaningfulNodes.length > 0) {
            // Add only meaningful text nodes to queue
            this.debounceQueue.push(...meaningfulNodes);
            console.log(`📝 Debounce queue now has ${this.debounceQueue.length} items (filtered ${textNodes.length - meaningfulNodes.length} whitespace nodes)`);
        } else {
            console.log(`📝 Skipped ${textNodes.length} whitespace-only text nodes`);
        }
        
        // Clear existing timer
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        
        // Set new timer for debounced translation
        this.debounceTimer = setTimeout(() => {
            this.processDebounceQueue();
        }, DEBOUNCE_DELAY_MS);
    }
    
    async processDebounceQueue() {
        if (!this.debounceQueue || this.debounceQueue.length === 0) {
            return;
        }
        
        const queueSize = this.debounceQueue.length;
        console.log(`⏰ Processing debounce queue with ${queueSize} items`);
        
        // Only process if we have enough elements OR if it's been a long time
        if (queueSize >= DEBOUNCE_QUEUE_THRESHOLD) {
            console.log(`✅ Queue size (${queueSize}) >= ${DEBOUNCE_QUEUE_THRESHOLD}, processing immediately`);
            await this.processQueuedElements();
        } else {
            console.log(`⏳ Queue size (${queueSize}) < ${DEBOUNCE_QUEUE_THRESHOLD}, waiting for more elements...`);
            // Set a longer timer to process even small batches after configured time
            this.debounceTimer = setTimeout(() => {
                console.log(`⏰ ${DEBOUNCE_MAX_WAIT_MS/1000} seconds elapsed, processing ${this.debounceQueue.length} items anyway`);
                this.processQueuedElements();
            }, DEBOUNCE_MAX_WAIT_MS);
        }
    }
    
    async processQueuedElements() {
        if (!this.debounceQueue || this.debounceQueue.length === 0) {
            return;
        }
        
        const textNodes = [...this.debounceQueue];
        this.debounceQueue = []; // Clear the queue
        
        console.log(`🔄 Processing ${textNodes.length} queued text nodes`);
        
        try {
            // Translate the queued content
            const results = await this.batchProcessor.processBatches(
                textNodes, 
                this.currentTargetLanguage, 
                null, 
                this.determineSourceLanguage(this.currentTargetLanguage)
            );
            
            const successCount = results.filter(r => r.translated).length;
            console.log(`👁️ Successfully translated ${successCount}/${textNodes.length} queued nodes`);
        } catch (error) {
            console.error('❌ Error translating queued elements:', error);
        }
    }
    
    processIframeContent(iframe) {
        try {
            // Make sure we can access the iframe's content (same-origin check)
            if (iframe.contentDocument && iframe.contentDocument.body) {
                console.log('👁️ Processing iframe content...');
                
                // Translate all text nodes within the iframe
                this.translateNewElement(iframe.contentDocument.body);
                
                // Set up mutation observer for the iframe to handle dynamic content
                const iframeObserver = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                            mutation.addedNodes.forEach((node) => {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    this.translateNewElement(node);
                                }
                            });
                        }
                    });
                });
                
                // Start observing the iframe's document
                iframeObserver.observe(iframe.contentDocument.body, {
                    childList: true,
                    subtree: true,
                });
            }
        } catch (e) {
            console.error("❌ Error accessing iframe content:", e);
        }
    }
    
    setupOverlayIntegration() {
        // Override the enhanced overlay's language selection to trigger translation
        const originalSelectLanguage = window.selectLanguage;
        if (originalSelectLanguage) {
            window.selectLanguage = (language) => {
                console.log(`🎯 Language selected via overlay: ${language}`);
                
                // Trigger language change using our enhanced system (handles English specially)
                this.handleLanguageChange(language);
                
                // DON'T call original function - it bypasses our enhanced batching system
                // The original function calls translateAllTextNodes which sends all items in one request
                console.log(`🚫 Skipping original selectLanguage to use enhanced batching system`);
            };
        }
        
        // Also listen for direct overlay button clicks
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (target && target.hasAttribute('data-lang')) {
                const language = target.getAttribute('data-lang');
                console.log(`🎯 Language selected via overlay button: ${language}`);
                
                // Trigger language change (handles English specially)
                this.handleLanguageChange(language);
            }
        });
    }
    
    async translatePage(targetLang = 'hi', onProgress = null) {
        await this.initialize();
        
        // Prevent infinite loops and concurrent translations
        if (this.isTranslating || this.translationInProgress) {
            console.log('⚠️ Translation already in progress, skipping...');
            return { success: false, error: 'Translation already in progress' };
        }
        
        // Check if page is already translated by looking at actual DOM state, not just currentTargetLanguage
        // Always translate - don't check for previous translation state
        // since content reverts to English when navigating away
        console.log('🔄 Starting translation regardless of previous state');
        
        // Save the target language to localStorage (like anuvadini does)
        console.log('💾 Saving target language to localStorage:', targetLang);
        localStorage.setItem("selectedLanguage", targetLang);
        sessionStorage.setItem("selectedLang", targetLang);
        localStorage.setItem("preferredLanguage", targetLang);
        
        // Check for saved translation state
        const pageKey = this.stateManager.generatePageKey();
        const savedState = this.stateManager.getTranslationState(pageKey);
        
        if (savedState && savedState.targetLang === targetLang) {
            console.log(`🔄 Restoring saved translation state for ${targetLang}...`);
            this.currentTargetLanguage = targetLang;
            
            // Save the target language to localStorage (like anuvadini does)
            localStorage.setItem("selectedLanguage", targetLang);
            sessionStorage.setItem("selectedLang", targetLang);
            localStorage.setItem("preferredLanguage", targetLang);
            
            // Actually restore the translations to the DOM
            const restoredCount = this.restoreTranslationsToDOM(savedState.translatedNodes);
            
            // Update source language from saved state
            if (savedState.sourceLang) {
                localStorage.setItem('enhanced_source_language', savedState.sourceLang);
                window.pageSourceLanguage = savedState.sourceLang;
            }
            
            return {
                success: true,
                itemsTranslated: restoredCount,
                totalItems: savedState.translatedNodes.length,
                totalTime: 0,
                message: 'Restored from saved state',
                restored: true
            };
        }
        
        // Check if page is already translated to this language (quick check)
        const quickCheck = localStorage.getItem(`translated_${pageKey}`);
        if (quickCheck === targetLang) {
            console.log(`⚠️ Page already translated to ${targetLang}, but no saved state found. Clearing flag.`);
            localStorage.removeItem(`translated_${pageKey}`);
        }
        
        // Determine source language for translation
        let sourceLang = this.determineSourceLanguage(targetLang);
        console.log(`🔄 Translation direction: ${sourceLang} → ${targetLang}`);
        
        // Save source language for future use
        localStorage.setItem('enhanced_source_language', sourceLang);
        
        this.isTranslating = true;
        this.translationInProgress = true;
        this.currentTargetLanguage = targetLang;
        
        console.log(`🚀 Starting enhanced page translation to ${targetLang}...`);
        const startTime = performance.now();
        
        try {
            // Get all text nodes using enhanced DFS traversal
            const textNodes = this.dfsTraversal.getTextNodesToTranslate(document.body, {
                enableCache: true,
                enableAdvancedFiltering: true
            });
            
            console.log(`📊 Found ${textNodes.length} translatable items`);
            
            if (textNodes.length === 0) {
                console.log('ℹ️ No translatable content found');
                return { success: true, itemsTranslated: 0 };
            }
            
            // Progressive batch processing with real-time updates
            const results = await this.batchProcessor.processBatches(textNodes, targetLang, (batchInfo) => {
                // Real-time progress updates
                if (onProgress) {
                    onProgress({
                        ...batchInfo,
                        totalItems: textNodes.length,
                        totalTranslated: results.filter(r => r.translated).length + batchInfo.successCount
                    });
                }
                
                // Visual feedback for users
                console.log(`📈 Progress: ${batchInfo.progress.toFixed(1)}% (${batchInfo.successCount} items translated in batch ${batchInfo.batchIndex + 1})`);
            }, sourceLang);
            
            // Note: Lazy loading removed for simplicity
            
            const totalTime = performance.now() - startTime;
            const successCount = results.filter(r => r.translated).length;
            
            console.log(`✅ Enhanced translation completed in ${totalTime.toFixed(2)}ms`);
            console.log(`📊 Successfully translated ${successCount}/${textNodes.length} items`);
            
            // Save translation state for future navigation
            if (successCount > 0) {
                const translatedNodes = results.filter(r => r.translated).map(r => ({
                    path: r.path,
                    content: r.content,
                    translation: r.translation,
                    type: r.type,
                    nodeId: r.node.id || null,
                    nodeClass: r.node.className || null,
                    nodeTagName: r.node.tagName || null
                }));
                this.stateManager.saveTranslationState(pageKey, targetLang, translatedNodes);
            }
            
            // Print performance metrics
            this.performanceMonitor.printMetrics();
            
            return {
                success: true,
                itemsTranslated: successCount,
                totalItems: textNodes.length,
                totalTime: totalTime,
                performanceMetrics: this.performanceMonitor.getMetrics()
            };
            
        } catch (error) {
            console.error('❌ Enhanced translation failed:', error);
            return {
                success: false,
                error: error.message,
                totalTime: performance.now() - startTime
            };
        } finally {
            // Always reset translation state
            this.isTranslating = false;
            this.translationInProgress = false;
            console.log('🔄 Translation state reset');
        }
    }
    
    getPerformanceMetrics() {
        return this.performanceMonitor.getMetrics();
    }
    
    clearCache() {
        this.dfsTraversal.clearCache();
        console.log('🧹 Cache cleared');
    }
    
    getCacheStats() {
        return this.dfsTraversal.getCacheStats();
    }
    
    resetTranslationState() {
        this.isTranslating = false;
        this.translationInProgress = false;
        this.currentTargetLanguage = null;
        this.batchProcessor.isProcessingBatch = false;
        
        // Clear translation tracking
        this.translatedElements = new WeakSet();
        this.translatedTexts = new Set();
        this.translationCache.clear();
        
        // Clear debounce queue
        if (this.debounceQueue) {
            this.debounceQueue = [];
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = null;
        }
        
        console.log('🔄 Translation state reset');
    }
    
    getStateStats() {
        return this.stateManager.getStateStats();
    }
    
    clearAllPersistentState() {
        this.stateManager.clearAllState();
    }
    
    clearCurrentPageState() {
        const pageKey = this.stateManager.generatePageKey();
        this.stateManager.clearPageState(pageKey);
    }
    
    getCurrentSourceLanguage() {
        return this.currentTargetLanguage || window.pageSourceLanguage || 'en';
    }
    
    getCurrentTargetLanguage() {
        return this.currentTargetLanguage;
    }
    
    determineSourceLanguage(targetLang) {
        console.log(`🔍 Determining source language for target: ${targetLang}`);
        console.log(`🔍 Current target language: ${this.currentTargetLanguage}`);
        console.log(`🔍 Window page source language: ${window.pageSourceLanguage}`);
        
        // PRIORITY 1: If we're already translated to a different language, use that as source
        if (this.currentTargetLanguage && this.currentTargetLanguage !== targetLang) {
            console.log(`✅ Using current translated language as source: ${this.currentTargetLanguage}`);
            return this.currentTargetLanguage;
        }
        
        // PRIORITY 2: Check if page content appears to be already translated (non-English)
        if (this.isPageContentTranslated()) {
            const detectedLang = this.detectCurrentPageLanguage();
            if (detectedLang && detectedLang !== 'en' && detectedLang !== targetLang) {
                console.log(`✅ Detected translated content, using as source: ${detectedLang}`);
                return detectedLang;
            }
        }
        
        // PRIORITY 3: Use window.pageSourceLanguage if it's set and not English
        if (window.pageSourceLanguage && window.pageSourceLanguage !== 'en' && window.pageSourceLanguage !== targetLang) {
            console.log(`✅ Using window.pageSourceLanguage: ${window.pageSourceLanguage}`);
            return window.pageSourceLanguage;
        }
        
        // PRIORITY 4: Check localStorage for previously set source language
        const savedSourceLang = localStorage.getItem('enhanced_source_language');
        if (savedSourceLang && savedSourceLang !== 'en' && savedSourceLang !== targetLang) {
            console.log(`✅ Using saved source language: ${savedSourceLang}`);
            return savedSourceLang;
        }
        
        // DEFAULT: Use English as source
        console.log(`✅ Defaulting to English as source language`);
        return 'en';
    }
    
    isPageContentTranslated() {
        console.log(`\n🔍 ===== PAGE CONTENT ANALYSIS START =====`);
        
        // Sample some text nodes to check if content appears translated
        const textNodes = this.dfsTraversal.getTextNodesToTranslate(document.body, {
            maxDepth: 3,
            enableCache: false,
            enableAdvancedFiltering: false
        });
        
        console.log(`📊 Found ${textNodes.length} text nodes for analysis`);
        
        if (textNodes.length === 0) {
            console.log(`🔍 No text nodes found, assuming not translated`);
            console.log(`🔍 ===== PAGE CONTENT ANALYSIS COMPLETE (NO NODES) =====\n`);
            return false;
        }
        
        // Check more text nodes for better accuracy
        const sampleSize = Math.min(CONTENT_ANALYSIS_SAMPLE_SIZE, textNodes.length);
        let nonLatinCount = 0;
        let totalChars = 0;
        let sampleTexts = [];
        
        console.log(`📊 Analyzing ${sampleSize} sample nodes`);
        
        for (let i = 0; i < sampleSize; i++) {
            const text = textNodes[i].content.trim();
            if (text.length > MIN_TEXT_LENGTH) { // Only check meaningful text
                totalChars += text.length;
                sampleTexts.push(text.substring(0, SAMPLE_TEXT_LENGTH));
                
                // Check for Devanagari (Hindi) characters specifically
                if (/[\u0900-\u097F]/.test(text)) {
                    nonLatinCount++;
                    console.log(`✅ Found Hindi text: "${text.substring(0, SAMPLE_TEXT_LENGTH)}..."`);
                }
                // Also check for other Indian scripts
                else if (/[\u0980-\u09FF\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0D80-\u0DFF]/.test(text)) {
                    nonLatinCount++;
                    console.log(`✅ Found Indian script text: "${text.substring(0, SAMPLE_TEXT_LENGTH)}..."`);
                }
            }
        }
        
        const translatedRatio = sampleSize > 0 ? nonLatinCount / sampleSize : 0;
        
        console.log(`📝 Sample texts (first 5):`);
        sampleTexts.slice(0, 5).forEach((text, index) => {
            console.log(`   ${index + 1}. "${text}..."`);
        });
        
        console.log(`📊 Analysis Results:`);
        console.log(`   📝 Total characters analyzed: ${totalChars}`);
        console.log(`   🔤 Non-Latin text nodes: ${nonLatinCount}/${sampleSize}`);
        console.log(`   📊 Translation ratio: ${(translatedRatio * 100).toFixed(1)}%`);
        console.log(`   ✅ Is translated (>${(TRANSLATION_RATIO_THRESHOLD * 100)}% non-Latin): ${translatedRatio > TRANSLATION_RATIO_THRESHOLD}`);
        
        console.log(`🔍 ===== PAGE CONTENT ANALYSIS COMPLETE =====\n`);
        
        // If more than configured threshold of sampled text contains non-Latin characters, likely translated
        return translatedRatio > TRANSLATION_RATIO_THRESHOLD;
    }
    
    detectCurrentPageLanguage() {
        console.log(`\n🔍 ===== LANGUAGE DETECTION START =====`);
        
        // Simple language detection based on character ranges
        const textNodes = this.dfsTraversal.getTextNodesToTranslate(document.body, {
            maxDepth: 2,
            enableCache: false,
            enableAdvancedFiltering: false
        });
        
        console.log(`📊 Found ${textNodes.length} text nodes for language detection`);
        
        if (textNodes.length === 0) {
            console.log(`🔍 No text nodes found, defaulting to English`);
            console.log(`🔍 ===== LANGUAGE DETECTION COMPLETE (NO NODES) =====\n`);
            return 'en';
        }
        
        // Sample text for language detection
        const sampleText = textNodes.slice(0, LANGUAGE_DETECTION_SAMPLE_SIZE).map(node => node.content).join(' ');
        console.log(`📝 Sample text for detection: "${sampleText.substring(0, SAMPLE_TEXT_LENGTH * 2)}..."`);
        
        // Check for specific language character ranges
        if (/[\u0900-\u097F]/.test(sampleText)) {
            console.log(`✅ Detected language: Hindi (Devanagari script)`);
            console.log(`🔍 ===== LANGUAGE DETECTION COMPLETE =====\n`);
            return 'hi';
        }
        if (/[\u0980-\u09FF]/.test(sampleText)) {
            console.log(`✅ Detected language: Bengali`);
            console.log(`🔍 ===== LANGUAGE DETECTION COMPLETE =====\n`);
            return 'bn';
        }
        if (/[\u0A00-\u0A7F]/.test(sampleText)) return 'pa'; // Gurmukhi (Punjabi)
        if (/[\u0A80-\u0AFF]/.test(sampleText)) return 'gu'; // Gujarati
        if (/[\u0B00-\u0B7F]/.test(sampleText)) return 'or'; // Odia
        if (/[\u0B80-\u0BFF]/.test(sampleText)) return 'ta'; // Tamil
        if (/[\u0C00-\u0C7F]/.test(sampleText)) return 'te'; // Telugu
        if (/[\u0C80-\u0CFF]/.test(sampleText)) return 'kn'; // Kannada
        if (/[\u0D00-\u0D7F]/.test(sampleText)) return 'ml'; // Malayalam
        if (/[\u0D80-\u0DFF]/.test(sampleText)) return 'si'; // Sinhala
        if (/[\u0E00-\u0E7F]/.test(sampleText)) return 'th'; // Thai
        if (/[\u0E80-\u0EFF]/.test(sampleText)) return 'lo'; // Lao
        if (/[\u0F00-\u0FFF]/.test(sampleText)) return 'bo'; // Tibetan
        if (/[\u1000-\u109F]/.test(sampleText)) return 'my'; // Myanmar
        if (/[\u1100-\u11FF]/.test(sampleText)) return 'ko'; // Korean
        if (/[\u1200-\u137F]/.test(sampleText)) return 'am'; // Amharic
        if (/[\u1380-\u139F]/.test(sampleText)) return 'am'; // Amharic
        if (/[\u13A0-\u13FF]/.test(sampleText)) return 'chr'; // Cherokee
        if (/[\u1400-\u167F]/.test(sampleText)) return 'iu'; // Inuktitut
        if (/[\u1680-\u169F]/.test(sampleText)) return 'ga'; // Irish
        if (/[\u16A0-\u16FF]/.test(sampleText)) return 'non'; // Runic
        if (/[\u1700-\u171F]/.test(sampleText)) return 'tl'; // Tagalog
        if (/[\u1720-\u173F]/.test(sampleText)) return 'tl'; // Tagalog
        if (/[\u1740-\u175F]/.test(sampleText)) return 'tl'; // Tagalog
        if (/[\u1760-\u177F]/.test(sampleText)) return 'tl'; // Tagalog
        if (/[\u1780-\u17FF]/.test(sampleText)) return 'km'; // Khmer
        if (/[\u1800-\u18AF]/.test(sampleText)) return 'mn'; // Mongolian
        if (/[\u18B0-\u18FF]/.test(sampleText)) return 'mn'; // Mongolian
        if (/[\u1900-\u194F]/.test(sampleText)) return 'lmy'; // Limbu
        if (/[\u1950-\u197F]/.test(sampleText)) return 'tdd'; // Tai Le
        if (/[\u1980-\u19DF]/.test(sampleText)) return 'tdd'; // Tai Le
        if (/[\u19E0-\u19FF]/.test(sampleText)) return 'km'; // Khmer
        if (/[\u1A00-\u1A1F]/.test(sampleText)) return 'bug'; // Buginese
        if (/[\u1A20-\u1AAF]/.test(sampleText)) return 'lmy'; // Limbu
        if (/[\u1AB0-\u1AFF]/.test(sampleText)) return 'lmy'; // Limbu
        if (/[\u1B00-\u1B7F]/.test(sampleText)) return 'ban'; // Balinese
        if (/[\u1B80-\u1BBF]/.test(sampleText)) return 'ban'; // Balinese
        if (/[\u1BC0-\u1BFF]/.test(sampleText)) return 'ban'; // Balinese
        if (/[\u1C00-\u1C4F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1C50-\u1C7F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1C80-\u1C8F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1C90-\u1CBF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1CC0-\u1CCF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1CD0-\u1CFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1D00-\u1D7F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1D80-\u1DBF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1DC0-\u1DFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1E00-\u1EFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u1F00-\u1FFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2000-\u206F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2070-\u209F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u20A0-\u20CF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u20D0-\u20FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2100-\u214F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2150-\u218F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2190-\u21FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2200-\u22FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2300-\u23FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2400-\u243F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2440-\u245F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2460-\u24FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2500-\u257F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2580-\u259F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u25A0-\u25FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2600-\u26FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2700-\u27BF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u27C0-\u27EF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u27F0-\u27FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2800-\u28FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2900-\u297F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2980-\u29FF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2A00-\u2AFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2B00-\u2BFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2C00-\u2C5F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2C60-\u2C7F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2C80-\u2CFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2D00-\u2D2F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2D30-\u2D7F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2D80-\u2DDF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2DE0-\u2DFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2E00-\u2E7F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2E80-\u2EFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2F00-\u2FDF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u2FF0-\u2FFF]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u3000-\u303F]/.test(sampleText)) return 'lep'; // Lepcha
        if (/[\u3040-\u309F]/.test(sampleText)) return 'ja'; // Hiragana (Japanese)
        if (/[\u30A0-\u30FF]/.test(sampleText)) return 'ja'; // Katakana (Japanese)
        if (/[\u3100-\u312F]/.test(sampleText)) return 'zh'; // Bopomofo (Chinese)
        if (/[\u3130-\u318F]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u3190-\u319F]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u31A0-\u31BF]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u31C0-\u31EF]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u31F0-\u31FF]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u3200-\u32FF]/.test(sampleText)) return 'ko'; // Hangul (Korean)
        if (/[\u3300-\u33FF]/.test(sampleText)) return 'ja'; // CJK Compatibility (Japanese)
        if (/[\u3400-\u4DBF]/.test(sampleText)) return 'zh'; // CJK Extension A (Chinese)
        if (/[\u4DC0-\u4DFF]/.test(sampleText)) return 'zh'; // CJK Extension A (Chinese)
        if (/[\u4E00-\u9FFF]/.test(sampleText)) return 'zh'; // CJK Unified Ideographs (Chinese)
        if (/[\uA000-\uA48F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA490-\uA4CF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA4D0-\uA4FF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA500-\uA63F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA640-\uA69F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA6A0-\uA6FF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA700-\uA71F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA720-\uA7FF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA800-\uA82F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA830-\uA83F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA840-\uA87F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA880-\uA8DF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA8E0-\uA8FF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA900-\uA92F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA930-\uA95F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA960-\uA97F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA980-\uA9DF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uA9E0-\uA9FF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAA00-\uAA5F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAA60-\uAA7F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAA80-\uAADF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAAE0-\uAAFF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAB00-\uAB2F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAB30-\uAB6F]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAB70-\uABBF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uABC0-\uABFF]/.test(sampleText)) return 'ii'; // Yi
        if (/[\uAC00-\uD7AF]/.test(sampleText)) return 'ko'; // Hangul Syllables (Korean)
        if (/[\uD7B0-\uD7FF]/.test(sampleText)) return 'ko'; // Hangul Jamo Extended-B (Korean)
        if (/[\uD800-\uDB7F]/.test(sampleText)) return 'ko'; // High Surrogates (Korean)
        if (/[\uDB80-\uDBFF]/.test(sampleText)) return 'ko'; // High Private Use Surrogates (Korean)
        if (/[\uDC00-\uDFFF]/.test(sampleText)) return 'ko'; // Low Surrogates (Korean)
        if (/[\uE000-\uF8FF]/.test(sampleText)) return 'ko'; // Private Use Area (Korean)
        if (/[\uF900-\uFAFF]/.test(sampleText)) return 'zh'; // CJK Compatibility Ideographs (Chinese)
        if (/[\uFB00-\uFB4F]/.test(sampleText)) return 'ar'; // Alphabetic Presentation Forms (Arabic)
        if (/[\uFB50-\uFDFF]/.test(sampleText)) return 'ar'; // Arabic Presentation Forms-A (Arabic)
        if (/[\uFE00-\uFE0F]/.test(sampleText)) return 'ar'; // Variation Selectors (Arabic)
        if (/[\uFE10-\uFE1F]/.test(sampleText)) return 'ar'; // Vertical Forms (Arabic)
        if (/[\uFE20-\uFE2F]/.test(sampleText)) return 'ar'; // Combining Half Marks (Arabic)
        if (/[\uFE30-\uFE4F]/.test(sampleText)) return 'zh'; // CJK Compatibility Forms (Chinese)
        if (/[\uFE50-\uFE6F]/.test(sampleText)) return 'ar'; // Small Form Variants (Arabic)
        if (/[\uFE70-\uFEFF]/.test(sampleText)) return 'ar'; // Arabic Presentation Forms-B (Arabic)
        if (/[\uFF00-\uFFEF]/.test(sampleText)) return 'ja'; // Halfwidth and Fullwidth Forms (Japanese)
        if (/[\uFFF0-\uFFFF]/.test(sampleText)) return 'ja'; // Specials (Japanese)
        
        // Default to English if no specific script detected
        console.log(`✅ No Indian script detected, defaulting to English`);
        console.log(`🔍 ===== LANGUAGE DETECTION COMPLETE =====\n`);
        return 'en';
    }
    
    restoreTranslationsToDOM(translatedNodes) {
        let restoredCount = 0;
        
        try {
            console.log(`🔄 Attempting to restore ${translatedNodes.length} translations...`);
            
            translatedNodes.forEach((nodeData, index) => {
                try {
                    // Find the node using multiple methods
                    const node = this.findNodeByPath(nodeData);
                    if (node) {
                        // Check if the content matches (to avoid overwriting changed content)
                        const currentContent = this.getNodeContent(node, nodeData.type);
                        if (currentContent === nodeData.content || 
                            (nodeData.translation && currentContent === nodeData.translation)) {
                            
                            // Apply the saved translation
                            this.updateDOMNode({
                                type: nodeData.type,
                                node: node
                            }, nodeData.translation);
                            
                            // Mark as translated to prevent duplicate API calls
                            this.translatedElements.add(node);
                            this.translatedTexts.add(nodeData.content.trim());
                            
                            restoredCount++;
                            
                            if (index < 5) { // Log first few for debugging
                                console.log(`✅ Restored: "${nodeData.content}" -> "${nodeData.translation}"`);
                            }
                        } else {
                            console.log(`⚠️ Content mismatch for node ${index}: expected "${nodeData.content}", found "${currentContent}"`);
                        }
                    } else {
                        if (index < 5) { // Log first few for debugging
                            console.warn(`❌ Could not find node for restoration:`, nodeData);
                        }
                    }
                } catch (error) {
                    console.warn(`❌ Failed to restore translation for node ${index}:`, error);
                }
            });
            
            console.log(`✅ Successfully restored ${restoredCount}/${translatedNodes.length} translations to DOM`);
        } catch (error) {
            console.error('❌ Error restoring translations to DOM:', error);
        }
        
        return restoredCount;
    }
    
    getNodeContent(node, type) {
        switch (type) {
            case "text":
                return node.textContent || node.nodeValue || '';
            case "placeholder":
                return node.placeholder || node.getAttribute('placeholder') || '';
            case "title":
                return node.title || node.getAttribute('title') || '';
            case "value":
                return node.value || node.getAttribute('value') || '';
            case "alt":
                return node.alt || node.getAttribute('alt') || '';
            default:
                return node.textContent || '';
        }
    }
    
    findNodeByPath(nodeData) {
        try {
            // Try multiple methods to find the node
            
            // Method 1: Use ID if available
            if (nodeData.nodeId) {
                const nodeById = document.getElementById(nodeData.nodeId);
                if (nodeById) return nodeById;
            }
            
            // Method 2: Use path string
            if (nodeData.path) {
                const pathParts = nodeData.path.split(' > ');
                let currentElement = document.body;
                
                for (const part of pathParts) {
                    if (part.includes('#')) {
                        // Element with ID
                        const id = part.split('#')[1].split('.')[0];
                        currentElement = currentElement.querySelector(`#${id}`);
                    } else if (part.includes('.')) {
                        // Element with class
                        const className = part.split('.')[1];
                        currentElement = currentElement.querySelector(`.${className}`);
                    } else {
                        // Tag name
                        currentElement = currentElement.querySelector(part);
                    }
                    
                    if (!currentElement) break;
                }
                
                if (currentElement) return currentElement;
            }
            
            // Method 3: Search by content and type
            if (nodeData.content && nodeData.type) {
                const allNodes = document.querySelectorAll('*');
                for (const node of allNodes) {
                    if (nodeData.type === 'text' && node.textContent === nodeData.content) {
                        return node;
                    } else if (nodeData.type === 'placeholder' && node.placeholder === nodeData.content) {
                        return node;
                    } else if (nodeData.type === 'title' && node.title === nodeData.content) {
                        return node;
                    } else if (nodeData.type === 'value' && node.value === nodeData.content) {
                        return node;
                    } else if (nodeData.type === 'alt' && node.alt === nodeData.content) {
                        return node;
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Error finding node:', nodeData, error);
            return null;
        }
    }
    
    updateDOMNode(node, translatedText) {
        try {
            switch (node.type) {
                case "text":
                    node.node.nodeValue = translatedText;
                    break;
                case "placeholder":
                    node.node.setAttribute("placeholder", translatedText);
                    break;
                case "title":
                    node.node.setAttribute("title", translatedText);
                    break;
                case "value":
                    node.node.setAttribute("value", translatedText);
                    break;
                case "alt":
                    node.node.setAttribute("alt", translatedText);
                    break;
                default:
                    console.warn(`Unknown node type: ${node.type}`);
            }
        } catch (error) {
            console.error('Error updating DOM node:', error);
        }
    }
    
    destroy() {
        this.lazyLoader.disconnect();
        
        // Disconnect mutation observer
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            console.log('👁️ Mutation observer disconnected');
        }
        
        this.clearCache();
        this.resetTranslationState();
        this.isInitialized = false;
        console.log('🗑️ Translation Engine destroyed');
    }
}

// Overlay Component
class OverlayComponent {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
        this.currentLanguage = 'hi';
        this.createOverlay();
    }
    
    createOverlay() {
        // Create overlay container
        this.overlay = document.createElement('div');
        this.overlay.id = 'enhanced-bhashini-overlay';
        this.overlay.className = 'enhanced-bhashini-overlay';
        
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'overlay-toggle';
        toggleButton.innerHTML = '🌐';
        toggleButton.title = 'Enhanced Bhashini Utility';
        toggleButton.onclick = () => this.toggleOverlay();
        
        // Create overlay content
        this.overlay.innerHTML = `
            <div class="overlay-header">
                <h3>Enhanced Bhashini</h3>
                <button class="close-btn" title="Close">×</button>
            </div>
            <div class="overlay-content">
                <div class="language-section">
                    <label for="language-select">Target Language:</label>
                    <select id="language-select" class="language-select">
                        <option value="en">English (Original)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="bn">Bengali (বাংলা)</option>
                        <option value="ta">Tamil (தமிழ்)</option>
                        <option value="te">Telugu (తెలుగు)</option>
                        <option value="kn">Kannada (ಕನ್ನಡ)</option>
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                        <option value="mr">Marathi (मराठी)</option>
                        <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                        <option value="or">Odia (ଓଡ଼ିଆ)</option>
                        <option value="as">Assamese (অসমীয়া)</option>
                        <option value="ur">Urdu (اردو)</option>
                        <option value="sa">Sanskrit (संस्कृत)</option>
                        <option value="sat">Santali (সংতালী)</option>
                        <option value="sd">Sindhi (سنڌي)</option>
                        <option value="brx">Bodo (बड़ो)</option>
                        <option value="doi">Dogri (डोगरी)</option>
                        <option value="gom">Goan Konkani (गोवा कोंकणी)</option>
                        <option value="ks">Kashmiri (कश्मीरी)</option>
                        <option value="mai">Maithili (मैथिली)</option>
                        <option value="mni">Manipuri (মণিপুরী)</option>
                        <option value="ne">Nepali (नेपाली)</option>
                    </select>
                </div>
                
                <div class="action-section">
                    <button class="translate-btn primary" id="translate-btn">🌐 Translate Page</button>
                </div>
                
                <div class="status-section">
                    <div class="status-text">Ready to translate</div>
                </div>
                
                <div class="metrics-section">
                    <h4>Quick Metrics</h4>
                    <div class="metric">
                        <span class="metric-label">Cache Hit:</span>
                        <span class="metric-value" id="cache-hit">0%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Items Found:</span>
                        <span class="metric-value" id="items-found">0</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Memory:</span>
                        <span class="metric-value" id="memory-usage">0MB</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Add event listeners
        this.addEventListeners();
        
        // Append to body
        document.body.appendChild(toggleButton);
        document.body.appendChild(this.overlay);
        
        console.log('✅ Overlay component created');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .enhanced-bhashini-overlay {
                position: fixed;
                top: ${OVERLAY_POSITION_TOP}px;
                right: ${OVERLAY_POSITION_RIGHT}px;
                width: ${OVERLAY_WIDTH}px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: ${OVERLAY_BORDER_RADIUS}px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: white;
                transform: translateX(100%);
                transition: transform 0.3s ease;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .enhanced-bhashini-overlay.show {
                transform: translateX(0);
            }
            
            .overlay-toggle {
                position: fixed;
                top: ${OVERLAY_POSITION_TOP}px;
                right: ${OVERLAY_POSITION_RIGHT}px;
                width: ${OVERLAY_TOGGLE_SIZE}px;
                height: ${OVERLAY_TOGGLE_SIZE}px;
                border-radius: ${OVERLAY_TOGGLE_BORDER_RADIUS}%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                z-index: 10001;
                box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
                transition: transform 0.2s ease;
            }
            
            .overlay-toggle:hover {
                transform: scale(1.1);
            }
            
            .overlay-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .overlay-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s ease;
            }
            
            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .overlay-content {
                padding: 20px;
            }
            
            .language-section {
                margin-bottom: 20px;
            }
            
            .language-section label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 14px;
            }
            
            .language-select {
                width: 100%;
                padding: 10px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 6px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 14px;
            }
            
            .language-select option {
                background: #333;
                color: white;
            }
            
            .action-section {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 20px;
            }
            
            .translate-btn, .action-btn {
                padding: 12px 16px;
                border: none;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-align: center;
            }
            
            .translate-btn.primary {
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
            }
            
            
            .translate-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }
            
            .status-section {
                margin-bottom: 20px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                text-align: center;
            }
            
            .status-text {
                font-size: 14px;
                font-weight: 500;
            }
            
            .metrics-section h4 {
                margin: 0 0 15px 0;
                font-size: 16px;
                font-weight: 600;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .metric-label {
                opacity: 0.8;
            }
            
            .metric-value {
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
    }
    
    addEventListeners() {
        // Close button
        this.overlay.querySelector('.close-btn').onclick = () => this.hideOverlay();
        
        // Translate button
        this.overlay.querySelector('#translate-btn').onclick = () => {
            const selectedLang = this.overlay.querySelector('#language-select').value;
            this.translatePage(selectedLang);
        };
        
        
        // Language selection
        this.overlay.querySelector('#language-select').onchange = (e) => {
            this.currentLanguage = e.target.value;
        };
    }
    
    toggleOverlay() {
        if (this.isVisible) {
            this.hideOverlay();
        } else {
            this.showOverlay();
        }
    }
    
    showOverlay() {
        this.overlay.classList.add('show');
        this.isVisible = true;
    }
    
    hideOverlay() {
        this.overlay.classList.remove('show');
        this.isVisible = false;
    }
    
    async translatePage(language) {
        const translateBtn = this.overlay.querySelector('#translate-btn');
        const statusText = this.overlay.querySelector('.status-text');
        
        try {
            translateBtn.disabled = true;
            translateBtn.textContent = '🔄 Translating...';
            statusText.textContent = 'Translation in progress...';
            
            const result = await window.enhancedEngine.translatePage(language);
            
            if (result.success) {
                statusText.textContent = 'Translation completed successfully!';
                this.updateMetrics();
            } else {
                statusText.textContent = `Translation failed: ${result.error || 'Unknown error'}`;
            }
        } catch (error) {
            statusText.textContent = `Translation error: ${error.message}`;
        } finally {
            translateBtn.disabled = false;
            translateBtn.textContent = '🌐 Translate Page';
        }
    }
    
    
    updateMetrics() {
        const metrics = window.enhancedEngine.getPerformanceMetrics();
        const cacheStats = window.enhancedEngine.getCacheStats();
        
        this.overlay.querySelector('#cache-hit').textContent = `${metrics.cache.hitRate.toFixed(1)}%`;
        this.overlay.querySelector('#items-found').textContent = cacheStats.cacheSize || 0;
        this.overlay.querySelector('#memory-usage').textContent = `${metrics.memory.currentUsage.toFixed(1)}MB`;
    }
}

// Global instance
const translationEngine = new TranslationEngine();
new OverlayComponent(); // Initialize overlay

// Expose globally for testing
window.enhancedEngine = translationEngine;
window.enhancedTranslatePage = (lang, onProgress) => translationEngine.translatePage(lang, onProgress);
window.enhancedGetMetrics = () => translationEngine.getPerformanceMetrics();
window.enhancedClearCache = () => translationEngine.clearCache();
window.enhancedGetCacheStats = () => translationEngine.getCacheStats();
window.enhancedResetState = () => translationEngine.resetTranslationState();
window.enhancedGetStateStats = () => translationEngine.getStateStats();
window.enhancedClearAllState = () => translationEngine.clearAllPersistentState();
window.enhancedClearPageState = () => translationEngine.clearCurrentPageState();
window.enhancedGetCurrentSourceLang = () => translationEngine.getCurrentSourceLanguage();
window.enhancedGetCurrentTargetLang = () => translationEngine.getCurrentTargetLanguage();


console.log('🚀 ENHANCED BHASHINI UTILITY LOADED');
console.log('====================================');
console.log('Available functions:');
console.log('  enhancedTranslatePage(lang) - Translate page');
console.log('  enhancedGetMetrics() - Get performance metrics');
console.log('  enhancedClearCache() - Clear all caches');
console.log('  enhancedResetState() - Reset translation state');
console.log('  enhancedGetStateStats() - Get persistent state statistics');
console.log('  enhancedClearAllState() - Clear all saved translation states');
console.log('\n💡 Quick start: enhancedTranslatePage("hi")');
console.log('🔧 If infinite loops occur: enhancedResetState()');
console.log('💾 Translation states are automatically saved and restored!');


// Global setTimeout that always runs (following anuvadini pattern)
setTimeout(() => {
    console.log('🔄 Global initialization starting...');
    console.log('🔍 Current localStorage selectedLanguage:', localStorage.getItem("selectedLanguage"));
    console.log('🔍 Current sessionStorage selectedLang:', sessionStorage.getItem("selectedLang"));
    console.log('🔍 Current localStorage preferredLanguage:', localStorage.getItem("preferredLanguage"));
    
    translationEngine.initialize();
    
    // Always set up mutation observer and observe initial content
    translationEngine.observeInitialContent();
    
    // Only auto-translate if explicitly requested by user (not on page load)
    // Clear any stale language settings to prevent unwanted auto-translation
    const lang = localStorage.getItem("selectedLanguage");
    if (lang && lang !== "en-IN" && lang !== "en") {
        // Check if this is a fresh page load (no translation state)
        const hasTranslationState = localStorage.getItem(`translationState_${window.location.pathname}_${lang}`);
        console.log('🔍 Translation state check:', `translationState_${window.location.pathname}_${lang}`, '=', hasTranslationState);
        
        if (!hasTranslationState) {
            console.log('🧹 Clearing stale language setting - no translation state found');
            localStorage.removeItem("selectedLanguage");
            sessionStorage.removeItem("selectedLang");
            localStorage.removeItem("preferredLanguage");
        } else {
            console.log('🎯 Found saved language with translation state, starting auto-translation:', lang);
            translationEngine.autoTranslatePage(lang);
        }
    } else if (lang === "en" || lang === "en-IN") {
        console.log('ℹ️ English selected - page should be in original state');
        // Clear any translation state if English is selected (system-initiated, no reload)
        translationEngine.handleLanguageChange(lang, false);
    } else {
        console.log('ℹ️ No saved language found, mutation observer will be ready for future language selection');
    }
}, INITIALIZATION_DELAY_MS);

// Auto-initialize when DOM is ready (following anuvadini pattern)
document.addEventListener("DOMContentLoaded", () => {
    console.log('📄 DOMContentLoaded - setting up initial content observation');
    // Only observe initial content here - auto-translation is handled by global setTimeout
    setTimeout(() => {
        translationEngine.observeInitialContent();
    }, DOM_CONTENT_DELAY_MS);
});
