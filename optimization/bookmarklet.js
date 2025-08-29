javascript:(function(){
    // Create script element
    var script = document.createElement('script');
    script.src = 'https://raw.githubusercontent.com/your-repo/browser-optimization-test.js/main/browser-optimization-test.js';
    
    // Alternative: Inline the script for immediate use
    script.textContent = `
        (function() {
            'use strict';
            
            console.log('🚀 Bhashini Translation Utility - Performance Test Script Loaded');
            
            // Store original function reference
            const originalGetTextNodesToTranslate = window.getTextNodesToTranslate;
            
            if (!originalGetTextNodesToTranslate) {
                console.log('❌ Original getTextNodesToTranslate function not found. Make sure the Bhashini utility is loaded.');
                return;
            }
            
            /**
             * Optimized DOM Traversal Class
             */
            class OptimizedDOMTraversal {
                constructor() {
                    this.cache = new Map();
                    this.processedNodes = new WeakSet();
                    this.skipSelectors = [
                        'script', 'style', 'noscript', 
                        '.dont-translate', '.bhashini-skip-translation',
                        '[data-translated]', '[data-skip-translation]'
                    ];
                    this.skipRegex = {
                        email: /\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,7}\\b/,
                        numeric: /^[\\d.]+$/,
                        whitespace: /^[\\n\\s\\r\\t]*$/,
                        nonEnglish: /^[^A-Za-z0-9]+$/
                    };
                }

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

                shouldSkipElement(node) {
                    if (node.nodeType !== Node.ELEMENT_NODE) {
                        return false;
                    }

                    // Check tag name
                    const tagName = node.tagName?.toLowerCase();
                    if (['script', 'style', 'noscript'].includes(tagName)) {
                        return true;
                    }

                    // Check classes
                    if (node.classList) {
                        if (node.classList.contains('dont-translate') || 
                            node.classList.contains('bhashini-skip-translation')) {
                            return true;
                        }
                    }

                    // Check data attributes
                    if (node.hasAttribute('data-translated') || 
                        node.hasAttribute('data-skip-translation')) {
                        return true;
                    }

                    // Check if any parent should be skipped (up to 3 levels)
                    let parent = node.parentElement;
                    let level = 0;
                    while (parent && level < 3) {
                        if (this.shouldSkipElement(parent)) {
                            return true;
                        }
                        parent = parent.parentElement;
                        level++;
                    }

                    return false;
                }

                        extractTextContent(node) {
            const text = node.textContent?.trim();
            
            // Return all non-empty text content without any filtering
            return text || null;
        }

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

                processBatch(content) {
                    if (content.length > 0) {
                        // Could implement batch validation, filtering, or preprocessing here
                    }
                }

                isValidNode(node) {
                    return node && 
                           node.nodeType && 
                           node.nodeType !== Node.DOCUMENT_NODE &&
                           node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE;
                }

                generateCacheKey(node, options) {
                    const nodeId = node.id || node.className || node.tagName || 'body';
                    const optionsStr = JSON.stringify(options);
                    return \`\${nodeId}-\${optionsStr}\`;
                }

                clearCache() {
                    this.cache.clear();
                    this.processedNodes = new WeakSet();
                }

                getCacheStats() {
                    return {
                        cacheSize: this.cache.size,
                        processedNodesCount: this.processedNodes.size
                    };
                }
            }

            // Create global instance
            window.optimizedDOMTraversal = new OptimizedDOMTraversal();

            // Quick performance test function
            function quickTest() {
                console.log('⚡ Quick Performance Test...\\n');
                
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
                
                console.log(\`Original: \${originalTime.toFixed(2)}ms (\${originalContent.length} items)\`);
                console.log(\`Optimized: \${optimizedTime.toFixed(2)}ms (\${optimizedContent.length} items)\`);
                console.log(\`Improvement: \${improvement.toFixed(1)}% faster\`);
                
                return { originalTime, optimizedTime, improvement };
            }

            // Replace function
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

            // Restore function
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

            // Expose functions globally
            window.quickTest = quickTest;
            window.replaceWithOptimized = replaceWithOptimized;
            window.restoreOriginal = restoreOriginal;

            console.log('📋 Available functions:');
            console.log('  quickTest() - Quick performance comparison');
            console.log('  replaceWithOptimized() - Replace original with optimized');
            console.log('  restoreOriginal() - Restore original function');
            console.log('\\n💡 Run: quickTest() to start testing');

        })();
    `;
    
    // Add script to page
    document.head.appendChild(script);
    
    // Remove script after loading
    script.onload = function() {
        document.head.removeChild(script);
    };
    
    console.log('🔧 Bhashini Optimization Test Script Loading...');
})();
