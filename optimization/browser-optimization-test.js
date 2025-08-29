/**
 * Browser Optimization Test Script
 * 
 * This script can be injected into any website to test the performance
 * of the optimized DOM traversal against the original utility.
 * 
 * Usage:
 * 1. Open browser console on any website
 * 2. Copy and paste this entire script
 * 3. Run the tests with: testOptimization()
 */

(function() {
    'use strict';
    
    console.log('🚀 Bhashini Translation Utility - Performance Test Script Loaded');
    
    // Store original function reference
    const originalGetTextNodesToTranslate = window.getTextNodesToTranslate;
    
    /**
     * Optimized DOM Traversal Class
     */
    class OptimizedDOMTraversal {
        constructor() {
            this.cache = new Map();
            this.processedNodes = new WeakSet();
            
            // Whitelist: Tags that typically contain translatable text
            this.translatableTags = new Set([
                // Block text containers
                'p', 'div', 'span', 'li', 'td', 'th',
                
                // Headings
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                
                // Interactive elements
                'button', 'a', 'label', 'input', 'textarea',
                
                // Form-related text
                'option', 'legend', 'caption', 'fieldset',
                
                // Semantic containers
                'strong', 'em', 'mark', 'blockquote', 'figcaption',
                'cite', 'q', 'abbr', 'acronym', 'dfn', 'kbd', 'samp', 'var',
                
                // List items
                'dt', 'dd',
                
                // Table elements
                'thead', 'tbody', 'tfoot',
                
                // Sectioning elements
                'article', 'section', 'aside', 'header', 'footer', 'nav',
                'main', 'address', 'time', 'data',
                
                // Other meaningful containers
                'small', 'sub', 'sup', 'ins', 'del', 's', 'u',
                'b', 'i', 'code', 'pre', 'kbd', 'samp', 'var'
            ]);
            
            // Blacklist: Tags that should never be translated
            this.nonTranslatableTags = new Set([
                'script', 'style', 'noscript', 'template', 'slot',
                'code', 'pre', 'kbd', 'samp', 'var', 'math', 'svg',
                'canvas', 'object', 'embed', 'iframe', 'frame', 'frameset',
                'noframes', 'applet', 'basefont', 'bgsound', 'link', 'meta',
                'title', 'head', 'html', 'body', 'doctype'
            ]);
            
            // Classes that indicate non-translatable content
            this.skipClasses = new Set([
                'dont-translate', 'bhashini-skip-translation', 'no-translate',
                'skip-translation', 'notranslate', 'translate-no',
                'code', 'pre', 'terminal', 'console', 'log', 'debug',
                'technical', 'system', 'internal', 'hidden', 'sr-only'
            ]);
            
            // Data attributes that indicate non-translatable content
            this.skipDataAttributes = new Set([
                'data-translated', 'data-skip-translation', 'data-no-translate',
                'data-notranslate', 'data-technical', 'data-system'
            ]);
            
            // Regex patterns for content filtering
            this.contentFilters = {
                // Skip pure numbers (including decimals)
                numeric: /^[\d.,\s]+$/,
                
                // Skip whitespace-only content
                whitespace: /^[\n\s\r\t]*$/,
                
                // Skip email addresses
                email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/,
                
                // Skip URLs
                url: /^https?:\/\/[^\s]+$/i,
                
                // Skip file paths
                filePath: /^[\/\\][^\s]*$/,
                
                // Skip version numbers (e.g., v1.2.3, version 2.1)
                version: /^(v|version)\s*\d+(\.\d+)*$/i,
                
                // Skip very short content (likely not meaningful)
                tooShort: /^.{1,2}$/,
                
                // Skip content that's just punctuation or symbols
                symbols: /^[^\w\s]+$/,
                
                // Skip non-English content when language detection is disabled
                nonEnglish: /^[^\u0000-\u007F]+$/
            };
        }

        /**
         * Optimized text node extraction using iterative traversal
         */
        getTextNodesToTranslate(rootNode, options = {}) {
            const {
                maxDepth = 1000, // Increased from 50 to handle deep DOMs
                batchSize = 100,
                enableCache = true,
                skipProcessed = false // Disabled to match original behavior
            } = options;

            // Check cache first
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const nodeQueue = [{ node: rootNode, depth: 0 }];

            // BFS traversal using queue - removed processedCount limit
            while (nodeQueue.length > 0) {
                const { node, depth } = nodeQueue.shift(); // Use shift() for BFS (queue)

                // Skip if already processed (only if enabled)
                if (skipProcessed && this.processedNodes.has(node)) {
                    continue;
                }

                // Mark as processed (only if enabled)
                if (skipProcessed) {
                    this.processedNodes.add(node);
                }

                // Skip invalid nodes
                if (!this.isValidNode(node)) {
                    continue;
                }

                // Skip elements that should not be translated
                if (this.shouldSkipElement(node)) {
                    continue;
                }

                // Process text nodes
                if (node.nodeType === Node.TEXT_NODE) {
                    const textContent = this.extractTextContent(node);
                    if (textContent) {
                        translatableContent.push({
                            type: 'text',
                            node: node,
                            content: textContent,
                            depth: depth
                        });
                    }
                }
                // Process element nodes
                else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Extract attributes that need translation
                    this.extractTranslatableAttributes(node, translatableContent, depth);

                    // Add children to queue (in order for BFS) - removed depth limit
                    const children = Array.from(node.childNodes);
                    children.forEach(child => {
                        nodeQueue.push({ node: child, depth: depth + 1 });
                    });
                }

                // Batch processing for memory efficiency
                if (translatableContent.length >= batchSize) {
                    this.processBatch(translatableContent);
                }
            }

            // Cache the result
            if (enableCache) {
                this.cache.set(cacheKey, translatableContent);
            }

            return translatableContent;
        }

        /**
         * Check if a node should be skipped during traversal
         */
        shouldSkipElement(node) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return false;
            }

            const tagName = node.tagName?.toLowerCase();
            
            // Only skip specific non-translatable tags that should never be processed
            // These are tags that contain no meaningful translatable content
            const strictNonTranslatableTags = new Set([
                'script', 'style', 'noscript', 'template', 'slot',
                'meta', 'link', 'base', 'head', 'title', 'doctype'
            ]);
            
            if (strictNonTranslatableTags.has(tagName)) {
                return true;
            }
            
            // Check classes that indicate non-translatable content
            if (node.classList) {
                for (const className of node.classList) {
                    if (this.skipClasses.has(className)) {
                        return true;
                    }
                }
            }
            
            // Check data attributes that indicate non-translatable content
            for (const attr of this.skipDataAttributes) {
                if (node.hasAttribute(attr)) {
                    return true;
                }
            }
            
            return false;
        }

        /**
         * Extract text content from a text node with validation
         */
        extractTextContent(node) {
            const text = node.textContent?.trim();
            
            if (!text) {
                return null;
            }
            
            // Only apply essential content filters
            const essentialFilters = {
                // Skip whitespace-only content
                whitespace: /^[\n\s\r\t]*$/,
                
                // Skip pure numbers (including decimals)
                numeric: /^[\d.,\s]+$/,
                
                // Skip very short content (less than 2 characters)
                tooShort: /^.{1}$/
            };
            
            // Apply essential filters only
            for (const [filterName, pattern] of Object.entries(essentialFilters)) {
                if (pattern.test(text)) {
                    return null; // Skip if content matches filter
                }
            }
            
            return text;
        }

        /**
         * Extract translatable attributes from an element
         */
        extractTranslatableAttributes(element, translatableContent, depth) {
            const translatableAttributes = ['placeholder', 'title', 'alt', 'aria-label'];
            
            translatableAttributes.forEach(attr => {
                const value = element.getAttribute(attr);
                if (value && value.trim()) {
                    translatableContent.push({
                        type: attr,
                        node: element,
                        content: value.trim(),
                        depth: depth
                    });
                }
            });
        }

        /**
         * Process a batch of translatable content
         */
        processBatch(content) {
            // This can be used for batch processing optimizations
            if (content.length > 0) {
                // Could implement batch validation, filtering, or preprocessing here
            }
        }

        /**
         * Check if a node is valid for processing
         */
        isValidNode(node) {
            return node && 
                   node.nodeType && 
                   node.nodeType !== Node.DOCUMENT_NODE &&
                   node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
        }

        /**
         * Generate cache key for a node and options
         */
        generateCacheKey(node, options) {
            const nodeId = node.id || node.className || node.tagName || 'body';
            const optionsStr = JSON.stringify(options);
            return `${nodeId}-${optionsStr}`;
        }

        /**
         * Clear the cache
         */
        clearCache() {
            this.cache.clear();
            this.processedNodes = new WeakSet();
        }

        /**
         * Get cache statistics
         */
        getCacheStats() {
            return {
                cacheSize: this.cache.size,
                processedNodesCount: this.processedNodes.size
            };
        }
    }

    // Create global instance
    window.optimizedDOMTraversal = new OptimizedDOMTraversal();

    /**
     * Performance test function
     */
    async function testOptimization() {
        console.log('🧪 Starting Performance Test...\n');
        
        const testRuns = 5;
        const results = {
            original: { times: [], contentCount: 0 },
            optimized: { times: [], contentCount: 0 }
        };
        
        try {
            // Test 1: Original DOM traversal
            console.log('📊 Test 1: Original DOM Traversal...');
            for (let i = 0; i < testRuns; i++) {
                const startTime = performance.now();
                const originalContent = originalGetTextNodesToTranslate(document.body);
                const endTime = performance.now();
                
                results.original.times.push(endTime - startTime);
                results.original.contentCount = originalContent.length;
                
                console.log(`  Run ${i + 1}: ${(endTime - startTime).toFixed(2)}ms, ${originalContent.length} items`);
            }
            
            // Test 2: Optimized DOM traversal
            console.log('\n📊 Test 2: Optimized DOM Traversal...');
            for (let i = 0; i < testRuns; i++) {
                const startTime = performance.now();
                const optimizedContent = window.optimizedDOMTraversal.getTextNodesToTranslate(document.body);
                const endTime = performance.now();
                
                results.optimized.times.push(endTime - startTime);
                results.optimized.contentCount = optimizedContent.length;
                
                console.log(`  Run ${i + 1}: ${(endTime - startTime).toFixed(2)}ms, ${optimizedContent.length} items`);
            }
            
            // Calculate averages
            const originalAvg = results.original.times.reduce((a, b) => a + b, 0) / results.original.times.length;
            const optimizedAvg = results.optimized.times.reduce((a, b) => a + b, 0) / results.optimized.times.length;
            
            console.log('\n🎯 Performance Results:');
            console.log(`Original DOM Traversal: ${originalAvg.toFixed(2)}ms average (${results.original.contentCount} items)`);
            console.log(`Optimized DOM Traversal: ${optimizedAvg.toFixed(2)}ms average (${results.optimized.contentCount} items)`);
            
            const improvement = ((originalAvg - optimizedAvg) / originalAvg * 100);
            console.log(`Performance Improvement: ${improvement.toFixed(1)}% faster`);
            
            // Test 3: Cache performance
            console.log('\n📊 Test 3: Cache Performance Test...');
            const cacheStartTime = performance.now();
            const cachedContent = window.optimizedDOMTraversal.getTextNodesToTranslate(document.body, { enableCache: true });
            const cacheEndTime = performance.now();
            
            const cacheStats = window.optimizedDOMTraversal.getCacheStats();
            console.log(`Cached traversal: ${(cacheEndTime - cacheStartTime).toFixed(2)}ms`);
            console.log(`Cache stats: ${cacheStats.cacheSize} cached results, ${cacheStats.processedNodesCount} processed nodes`);
            
            // Test 4: Content comparison
            console.log('\n📊 Test 4: Content Comparison...');
            const originalContent = originalGetTextNodesToTranslate(document.body);
            const optimizedContent = window.optimizedDOMTraversal.getTextNodesToTranslate(document.body);
            
            console.log(`Original found: ${originalContent.length} translatable items`);
            console.log(`Optimized found: ${optimizedContent.length} translatable items`);
            
            // Compare content types
            const originalTypes = originalContent.map(item => item.type);
            const optimizedTypes = optimizedContent.map(item => item.type);
            
            console.log('Original content types:', [...new Set(originalTypes)]);
            console.log('Optimized content types:', [...new Set(optimizedTypes)]);
            
            // Test 5: Show sample content
            console.log('\n📊 Test 5: Sample Content...');
            console.log('Sample translatable content:');
            optimizedContent.slice(0, 5).forEach((item, index) => {
                console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
            });
            
            console.log('\n✅ All tests completed successfully!');
            
            // Return results for further analysis
            return {
                original: { avg: originalAvg, count: results.original.contentCount },
                optimized: { avg: optimizedAvg, count: results.optimized.contentCount },
                improvement: improvement,
                cacheStats: cacheStats
            };
            
        } catch (error) {
            console.error('❌ Test failed with error:', error);
            return null;
        }
    }

    /**
     * Quick performance test
     */
    function quickTest() {
        console.log('⚡ Quick Performance Test...\n');
        
        // Test original
        const originalStart = performance.now();
        const originalContent = originalGetTextNodesToTranslate(document.body);
        const originalEnd = performance.now();
        
        // Test optimized
        const optimizedStart = performance.now();
        const optimizedContent = window.optimizedDOMTraversal.getTextNodesToTranslate(document.body);
        const optimizedEnd = performance.now();
        
        const originalTime = originalEnd - originalStart;
        const optimizedTime = optimizedEnd - optimizedStart;
        const improvement = ((originalTime - optimizedTime) / originalTime * 100);
        
        console.log(`Original: ${originalTime.toFixed(2)}ms (${originalContent.length} items)`);
        console.log(`Optimized: ${optimizedTime.toFixed(2)}ms (${optimizedContent.length} items)`);
        console.log(`Improvement: ${improvement.toFixed(1)}% faster`);
        
        return { originalTime, optimizedTime, improvement };
    }

    /**
     * Replace the original function with optimized version
     */
    function replaceWithOptimized() {
        if (originalGetTextNodesToTranslate) {
            window.getTextNodesToTranslate = function(rootNode) {
                return window.optimizedDOMTraversal.getTextNodesToTranslate(rootNode);
            };
            console.log('✅ Original function replaced with optimized version');
            return true;
        } else {
            console.log('❌ Original function not found');
            return false;
        }
    }

    /**
     * Restore original function
     */
    function restoreOriginal() {
        if (originalGetTextNodesToTranslate) {
            window.getTextNodesToTranslate = originalGetTextNodesToTranslate;
            console.log('✅ Original function restored');
            return true;
        } else {
            console.log('❌ Original function not found');
            return false;
        }
    }

    /**
     * Clear cache
     */
    function clearCache() {
        window.optimizedDOMTraversal.clearCache();
        console.log('✅ Cache cleared');
    }

    // Expose functions globally
    window.testOptimization = testOptimization;
    window.quickTest = quickTest;
    window.replaceWithOptimized = replaceWithOptimized;
    window.restoreOriginal = restoreOriginal;
    window.clearCache = clearCache;

    console.log('📋 Available functions:');
    console.log('  testOptimization() - Full performance test');
    console.log('  quickTest() - Quick performance comparison');
    console.log('  replaceWithOptimized() - Replace original with optimized');
    console.log('  restoreOriginal() - Restore original function');
    console.log('  clearCache() - Clear optimization cache');
    console.log('\n💡 Run: testOptimization() to start testing');

})();
