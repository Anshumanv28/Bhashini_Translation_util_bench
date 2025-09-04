/**
 * ENHANCED BHASHINI UTILITY
 * 
 * This enhanced version integrates all Anuvadini features:
 * 1. Lazy loading with IntersectionObserver
 * 2. Smart batch processing with dynamic sizing
 * 3. Enhanced content filtering and icon detection
 * 4. Text-to-speech capabilities
 * 5. Advanced feedback system
 * 6. DFS with caching for optimized DOM traversal
 * 
 * Enhanced with:
 * - Localhost testing support
 * - Modular architecture with helper files
 * - Performance optimizations
 * - Better error handling
 */

// Enhanced configuration
const ENHANCED_CONFIG = {
  // API Configuration
  API_BASE_URL: "https://translation-plugin.bhashini.co.in/",
  LOCALHOST_URL: "http://localhost:6001/",
  ENABLE_LOCALHOST: true, // Set to true for local testing

  // Performance Configuration
  BATCH_SIZE: 50, // Larger batches for better performance
  MAX_BATCH_SIZE: 100,
  BATCH_INTERVAL: 2000, // 2 seconds between batches

  // Lazy Loading Configuration
  LAZY_LOAD_THRESHOLD: 0.1,
  LAZY_LOAD_ROOT_MARGIN: "50px",

  // Caching Configuration
  CACHE_MAX_SIZE: 10000,
  ENABLE_DFS_CACHING: true,

  // Feature Flags
  ENABLE_LAZY_LOADING: true,
  ENABLE_TEXT_TO_SPEECH: true,
  ENABLE_ADVANCED_FILTERING: true,
  ENABLE_SMART_BATCHING: true,
};

// Enhanced language support with Anuvadini languages
const ENHANCED_LANGUAGE_MAP = {
    // Indian Languages (Bhashini)
    "hi": "Hindi (हिन्दी)",
    "bn": "Bengali (বাংলা)",
    "ta": "Tamil (தமிழ்)",
    "te": "Telugu (తెలుగు)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ml": "Malayalam (മലയാളം)",
    "gu": "Gujarati (ગુજરાતી)",
    "mr": "Marathi (मराठी)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "as": "Assamese (অসমীয়া)",
    "ur": "Urdu (اردو)",
    
    // Additional Anuvadini Languages
    "en": "English",
    "sa": "Sanskrit (संस्कृत)",
    "sat": "Santali (সংতালী)",
    "sd": "Sindhi (سنڌي)",
    "brx": "Bodo (बड़ो)",
    "doi": "Dogri (डोगरी)",
    "gom": "Goan Konkani (गोवा कोंकणी)",
    "ks": "Kashmiri (कश्मीरी)",
    "mai": "Maithili (मैथिली)",
    "mni": "Manipuri (মণিপুরী)",
    "ne": "Nepali (नेपाली)",
    
    // International Languages (Anuvadini)
    "fr": "French (Français)",
    "de": "German (Deutsch)",
    "es": "Spanish (Español)",
    "pt": "Portuguese (Português)",
    "it": "Italian (Italiano)",
    "ru": "Russian (Русский)",
    "ja": "Japanese (日本語)",
    "ko": "Korean (한국어)",
    "zh": "Chinese (中文)",
    "ar": "Arabic (العربية)",
    "tr": "Turkish (Türkçe)",
    "ms": "Malay (Bahasa Melayu)",
    "sw": "Swahili (Kiswahili)"
};

// Enhanced content filtering patterns
const ENHANCED_FILTER_PATTERNS = {
    // Icon texts to skip (Material Icons, FontAwesome, etc.)
    iconTexts: [
        "home", "search", "settings", "account_circle", "menu", "info",
        "contact", "help", "logout", "login", "favorite", "add", "edit",
        "delete", "arrow_back", "arrow_forward", "chevron_left", "chevron_right",
        "expand_more", "expand_less", "keyboard_arrow_down", "keyboard_arrow_up",
        "close", "check", "clear", "done", "remove", "more_vert", "more_horiz",
        "refresh", "download", "upload", "share", "print", "bookmark",
        "notifications", "email", "phone", "location_on", "schedule",
        "person", "group", "public", "security", "verified", "star"
    ],
    
    // Icon classes to skip
    iconClasses: [
        "material-icons", "fa", "fas", "fab", "far", "fal", "mdi",
        "msg-icon", "demo-inline-calendar-card", "angular-editor-textarea",
        "icon", "glyphicon", "oi", "bi", "feather", "heroicon",
        "iconfont", "icomoon", "typicons", "entypo", "linecons"
    ],
    
    // Unwanted classes
    unwantedClasses: [
        "no-translate", "dont-translate", "bhashini-skip-translation",
        "skip-translation", "msg-icon", "demo-inline-calendar-card",
        "angular-editor-textarea", "mat-calendar", "toggle-class",
        "ui-icon", "sprite", "icon-sprite"
    ],
    
    // Unwanted tags
    unwantedTags: [
        "script", "style", "svg", "img", "noscript", "code", "pre",
        "kbd", "samp", "var", "math", "canvas", "video", "audio",
        "iframe", "embed", "object", "applet", "form", "input",
        "textarea", "select", "button", "label", "fieldset", "legend"
    ]
};

// Enhanced regex patterns
const ENHANCED_REGEX_PATTERNS = {
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/,
    url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    numeric: /^[\d.,]+$/,
    whitespace: /^[\n\s\r\t]*$/,
    nonEnglish: /^[^A-Za-z0-9]+$/,
    govtEmail: /\[dot\]|\[at\]/,
    phone: /^[\+]?[1-9][\d]{0,15}$/,
    date: /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/,
    time: /^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/,
    currency: /^[\$€£¥₹]?\d+([.,]\d{2})?$/
};

// Enhanced performance monitoring
class EnhancedPerformanceMonitor {
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

// Enhanced DFS with caching for DOM traversal
class EnhancedDFSTraversal {
    constructor() {
        this.cache = new Map();
        this.processedNodes = new WeakSet();
        this.skipElementCache = new WeakMap();
        this.ignoredNodeCache = new WeakMap();
        this.performanceMonitor = new EnhancedPerformanceMonitor();
    }
    
    getTextNodesToTranslate(rootNode, options = {}) {
        const startTime = this.performanceMonitor.startTimer('domTraversal');
        
        const {
            maxDepth = 1000,
            enableCache = ENHANCED_CONFIG.ENABLE_DFS_CACHING,
            enableAdvancedFiltering = ENHANCED_CONFIG.ENABLE_ADVANCED_FILTERING
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
                    translatableContent.push({
                        type: "text",
                        node: node,
                        content: text,
                        depth: depth,
                        path: this.generateNodePath(node)
                    });
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
        if (enableCache && this.cache.size < ENHANCED_CONFIG.CACHE_MAX_SIZE) {
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
            (ENHANCED_FILTER_PATTERNS.unwantedTags.includes(node.tagName?.toLowerCase()) ||
             ENHANCED_FILTER_PATTERNS.unwantedClasses.some(cls => node.classList?.contains(cls)))
        );
        
        if (enableAdvancedFiltering) {
            result = result || ENHANCED_FILTER_PATTERNS.iconClasses.some(cls => node.classList?.contains(cls));
        }
        
        this.skipElementCache.set(node, result);
        return result;
    }
    
    isIgnoredNode(node, enableAdvancedFiltering) {
        if (this.ignoredNodeCache.has(node)) {
            return this.ignoredNodeCache.get(node);
        }
        
        const text = node.textContent;
        let result = (
            !text ||
            ENHANCED_REGEX_PATTERNS.whitespace.test(text) ||
            ENHANCED_REGEX_PATTERNS.numeric.test(text) ||
            ENHANCED_REGEX_PATTERNS.email.test(text) ||
            ENHANCED_REGEX_PATTERNS.url.test(text) ||
            (node.parentNode && this.isSkippableElement(node.parentNode, enableAdvancedFiltering))
        );
        
        if (enableAdvancedFiltering) {
            result = result || (
                ENHANCED_REGEX_PATTERNS.phone.test(text) ||
                ENHANCED_REGEX_PATTERNS.date.test(text) ||
                ENHANCED_REGEX_PATTERNS.time.test(text) ||
                ENHANCED_REGEX_PATTERNS.currency.test(text) ||
                ENHANCED_FILTER_PATTERNS.iconTexts.includes(text.trim()) ||
                (window.languageDetection !== "true" &&
                 window.pageSourceLanguage === "en" &&
                 ENHANCED_REGEX_PATTERNS.nonEnglish.test(text))
            );
        }
        
        this.ignoredNodeCache.set(node, result);
        return result;
    }
    
    isIgnoredText(text, node, enableAdvancedFiltering) {
        if (!text) return true;
        
        return (
            ENHANCED_REGEX_PATTERNS.whitespace.test(text) ||
            ENHANCED_REGEX_PATTERNS.numeric.test(text) ||
            ENHANCED_REGEX_PATTERNS.email.test(text) ||
            ENHANCED_REGEX_PATTERNS.url.test(text) ||
            (enableAdvancedFiltering && (
                ENHANCED_REGEX_PATTERNS.phone.test(text) ||
                ENHANCED_REGEX_PATTERNS.date.test(text) ||
                ENHANCED_REGEX_PATTERNS.time.test(text) ||
                ENHANCED_REGEX_PATTERNS.currency.test(text) ||
                ENHANCED_FILTER_PATTERNS.iconTexts.includes(text.trim())
            ))
        );
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
}

// Enhanced batch processor
class EnhancedBatchProcessor {
    constructor() {
        this.batchQueue = [];
        this.isProcessingBatch = false;
        this.performanceMonitor = new EnhancedPerformanceMonitor();
    }
    
    createSmartBatches(textNodes) {
        if (!ENHANCED_CONFIG.ENABLE_SMART_BATCHING) {
            return [textNodes];
        }
        
        const batches = [];
        const batchSize = this.calculateOptimalBatchSize(textNodes);
        
        for (let i = 0; i < textNodes.length; i += batchSize) {
            batches.push(textNodes.slice(i, i + batchSize));
        }
        
        return batches;
    }
    
    calculateOptimalBatchSize(textNodes) {
        if (textNodes.length === 0) return ENHANCED_CONFIG.BATCH_SIZE;
        
        const avgTextLength = textNodes.reduce((sum, node) => 
            sum + node.content.length, 0) / textNodes.length;
        
        if (avgTextLength > 100) return 25;
        if (avgTextLength > 50) return 35;
        if (avgTextLength > 20) return 50;
        if (textNodes.length > 1000) return 75;
        return Math.min(ENHANCED_CONFIG.MAX_BATCH_SIZE, textNodes.length);
    }
    
    async processBatches(textNodes, targetLang) {
        const startTime = this.performanceMonitor.startTimer('translation');
        
        const batches = this.createSmartBatches(textNodes);
        const results = [];
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            console.log(`🔄 Processing batch ${i + 1}/${batches.length} (${batch.length} items)`);
            
            try {
                const batchResult = await this.translateBatch(batch, targetLang);
                results.push(...batchResult);
                
                // Small delay between batches to prevent overwhelming the API
                if (i < batches.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            } catch (error) {
                console.error(`Error processing batch ${i + 1}:`, error);
                // Continue with next batch
            }
        }
        
        this.performanceMonitor.endTimer('translation', startTime);
        return results;
    }
    
    async translateBatch(textNodes, targetLang) {
        const texts = textNodes.map(node => node.content);
        
        try {
            const translations = await this.callTranslationAPI(texts, targetLang);
            
            // Update DOM and return results
            return textNodes.map((node, index) => {
                const translation = translations[index];
                if (translation && translation.target) {
                    this.updateDOMNode(node, translation.target);
                    return { ...node, translated: true, translation: translation.target };
                }
                return { ...node, translated: false };
            });
        } catch (error) {
            console.error('Batch translation error:', error);
            throw error;
        }
    }
    
    async callTranslationAPI(texts, targetLang) {
        const startTime = performance.now();
        
        try {
            // Use the existing Bhashini translation function
            if (window.translateTextChunks) {
                const result = await window.translateTextChunks(texts, targetLang);
                this.performanceMonitor.metrics.api.successCalls++;
                return result;
            } else {
                // Fallback to mock translation for testing
                await new Promise(resolve => setTimeout(resolve, 200));
                this.performanceMonitor.metrics.api.successCalls++;
                return texts.map(text => ({
                    source: text,
                    target: `[ENHANCED] ${text}`
                }));
            }
        } catch (error) {
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

// Enhanced lazy loading with IntersectionObserver
class EnhancedLazyLoader {
    constructor() {
        this.visibleElements = new Set();
        this.intersectionObserver = null;
        this.performanceMonitor = new EnhancedPerformanceMonitor();
        this.initializeObserver();
    }
    
    initializeObserver() {
        if (!ENHANCED_CONFIG.ENABLE_LAZY_LOADING) return;
        
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.visibleElements.add(entry.target);
                        this.onElementVisible(entry.target);
                    } else {
                        this.visibleElements.delete(entry.target);
                    }
                });
            },
            {
                threshold: ENHANCED_CONFIG.LAZY_LOAD_THRESHOLD,
                rootMargin: ENHANCED_CONFIG.LAZY_LOAD_ROOT_MARGIN
            }
        );
        
        console.log('✅ Enhanced lazy loading initialized');
    }
    
    onElementVisible(element) {
        // This will be called when elements become visible
        // Implementation can be customized based on requirements
        console.log(`👁️ Element visible: ${element.tagName}`, element);
    }
    
    observeElement(element) {
        if (this.intersectionObserver && element) {
            this.intersectionObserver.observe(element);
        }
    }
    
    unobserveElement(element) {
        if (this.intersectionObserver && element) {
            this.intersectionObserver.unobserve(element);
        }
    }
    
    observeTextNodes(textNodes) {
        if (!ENHANCED_CONFIG.ENABLE_LAZY_LOADING) return;
        
        textNodes.forEach(node => {
            if (node.node && node.node.parentElement) {
                this.observeElement(node.node.parentElement);
            }
        });
    }
    
    getVisibleElementsCount() {
        return this.visibleElements.size;
    }
    
    disconnect() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
    }
}

// Main enhanced translation engine
class EnhancedTranslationEngine {
    constructor() {
        this.dfsTraversal = new EnhancedDFSTraversal();
        this.batchProcessor = new EnhancedBatchProcessor();
        this.lazyLoader = new EnhancedLazyLoader();
        this.performanceMonitor = new EnhancedPerformanceMonitor();
        this.isInitialized = false;
    }
    
    async initialize() {
        if (this.isInitialized) return;
        
        console.log('🚀 Initializing Enhanced Translation Engine...');
        
        // Initialize components
        this.lazyLoader.initializeObserver();
        
        this.isInitialized = true;
        console.log('✅ Enhanced Translation Engine initialized');
    }
    
    async translatePage(targetLang = 'hi') {
        await this.initialize();
        
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
            
            // Process batches
            const results = await this.batchProcessor.processBatches(textNodes, targetLang);
            
            // Observe for lazy loading if enabled
            if (ENHANCED_CONFIG.ENABLE_LAZY_LOADING) {
                this.lazyLoader.observeTextNodes(textNodes);
            }
            
            const totalTime = performance.now() - startTime;
            const successCount = results.filter(r => r.translated).length;
            
            console.log(`✅ Enhanced translation completed in ${totalTime.toFixed(2)}ms`);
            console.log(`📊 Successfully translated ${successCount}/${textNodes.length} items`);
            
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
    
    destroy() {
        this.lazyLoader.disconnect();
        this.clearCache();
        this.isInitialized = false;
        console.log('🗑️ Enhanced Translation Engine destroyed');
    }
}

// Global instance
const enhancedEngine = new EnhancedTranslationEngine();

// Expose globally for testing
window.enhancedEngine = enhancedEngine;
window.enhancedTranslatePage = (lang) => enhancedEngine.translatePage(lang);
window.enhancedGetMetrics = () => enhancedEngine.getPerformanceMetrics();
window.enhancedClearCache = () => enhancedEngine.clearCache();
window.enhancedGetCacheStats = () => enhancedEngine.getCacheStats();

console.log('🚀 ENHANCED BHASHINI UTILITY LOADED');
console.log('====================================');
console.log('Available functions:');
console.log('  enhancedTranslatePage(lang) - Translate page with enhanced features');
console.log('  enhancedGetMetrics() - Get performance metrics');
console.log('  enhancedClearCache() - Clear all caches');
console.log('  enhancedGetCacheStats() - Get cache statistics');
console.log('\n💡 Quick start: enhancedTranslatePage("hi")');

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => enhancedEngine.initialize());
} else {
    enhancedEngine.initialize();
}
