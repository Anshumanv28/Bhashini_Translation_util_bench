/**
 * Combined Benchmark Script
 * 
 * This script provides comprehensive benchmarking capabilities for both
 * original and optimized DOM traversal functions.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 Combined Benchmark Script Loaded');
    
    // Store original function reference
    const originalGetTextNodesToTranslate = window.getTextNodesToTranslate;
    
    if (!originalGetTextNodesToTranslate) {
        console.log('❌ Original getTextNodesToTranslate function not found. Make sure the Bhashini utility is loaded.');
        return;
    }
    
    // Benchmark data storage
    let benchmarkData = {
        original: {
            totalCalls: 0,
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            totalItems: 0,
            averageItems: 0,
            calls: []
        },
        optimized: {
            totalCalls: 0,
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            totalItems: 0,
            averageItems: 0,
            calls: []
        },
        comparison: {
            totalImprovement: 0,
            averageImprovement: 0,
            bestImprovement: 0,
            worstImprovement: 0
        }
    };
    
    // Configuration
    const config = {
        enableLogging: true,
        logThreshold: 5,
        maxStoredCalls: 100,
        enableRealTimeComparison: false
    };
    
    /**
     * Optimized DOM Traversal Class with corrected filtering
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

        getTextNodesToTranslate(rootNode, options = {}) {
            const {
                maxDepth = 1000,
                batchSize = 100,
                enableCache = true,
                skipProcessed = false
            } = options;

            // Check cache first
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            
            // Pre-compile regex patterns for better performance
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;
            
            // Cache for expensive operations
            const skipElementCache = new WeakMap();
            const ignoredNodeCache = new WeakMap();

            // Optimized isSkippableElement function
            function isSkippableElement(node) {
                if (skipElementCache.has(node)) {
                    return skipElementCache.get(node);
                }
                
                const result = (
                    node.nodeType === Node.ELEMENT_NODE &&
                    (node.classList.contains("dont-translate") ||
                        node.classList.contains("bhashini-skip-translation") ||
                        node.tagName === "SCRIPT" ||
                        node.tagName === "STYLE" ||
                        node.tagName === "NOSCRIPT")
                );
                
                skipElementCache.set(node, result);
                return result;
            }

            // Optimized isNodeOrAncestorsSkippable function
            function isNodeOrAncestorsSkippable(node, maxLevels = 5) {
                let currentNode = node;
                let level = 0;

                while (currentNode && level < maxLevels) {
                    if (isSkippableElement(currentNode)) {
                        return true;
                    }
                    currentNode = currentNode.parentElement;
                    level++;
                }

                return false;
            }

            // Optimized isIgnoredNode function
            function isIgnoredNode(node) {
                if (ignoredNodeCache.has(node)) {
                    return ignoredNodeCache.get(node);
                }
                
                const isValidGovtEmail = (email) => {
                    const normalizedEmail = email.replace(/\[dot]/g, ".").replace(/\[at]/g, "@");
                    return emailRegex.test(normalizedEmail);
                };
                
                const result = (
                    (node.parentNode &&
                        (node.parentNode.tagName === "STYLE" ||
                            node.parentNode.tagName === "SCRIPT" ||
                            node.parentNode.tagName === "NOSCRIPT" ||
                            node.parentNode.classList.contains("dont-translate") ||
                            node.parentNode.classList.contains("bhashini-skip-translation") ||
                            emailRegex.test(node.textContent) ||
                            isValidGovtEmail(node.textContent) ||
                            (window.languageDetection !== "true" &&
                                window.pageSourceLanguage === "en" &&
                                nonEnglishRegex.test(node.textContent)))) ||
                    onlyNewLinesOrWhiteSpaceRegex.test(node.textContent)
                );
                
                ignoredNodeCache.set(node, result);
                return result;
            }

            // Optimized recursive traversal (same logic as original but with caching)
            function traverseNode(node) {
                // Skip the entire subtree if this node or any of its ancestors are skippable
                if (isNodeOrAncestorsSkippable(node)) {
                    return;
                }

                // Process this node
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !isIgnoredNode(node) && !isNumeric) {
                        translatableContent.push({
                            type: "text",
                            node: node,
                            content: text,
                        });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({
                            type: "placeholder",
                            node: node,
                            content: node.getAttribute("placeholder"),
                        });
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({
                            type: "title",
                            node: node,
                            content: node.getAttribute("title"),
                        });
                    }

                    // Process all child nodes
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverseNode(node.childNodes[i]);
                    }
                }
            }

            traverseNode(rootNode);

            // Cache the result
            if (enableCache) {
                this.cache.set(cacheKey, translatableContent);
            }

            return translatableContent;
        }

        /**
         * Check if entire subtree should be skipped (like original isNodeOrAncestorsSkippable)
         */
        shouldSkipEntireSubtree(node) {
            // Check current node
            if (this.shouldSkipElement(node)) {
                return true;
            }

            // Check ancestors (like original isNodeOrAncestorsSkippable)
            let currentNode = node.parentElement;
            let level = 0;
            const maxLevels = 5;

            while (currentNode && level < maxLevels) {
                if (this.shouldSkipElement(currentNode)) {
                    return true;
                }
                currentNode = currentNode.parentElement;
                level++;
            }

            return false;
        }

        shouldSkipElement(node) {
            if (node.nodeType !== Node.ELEMENT_NODE) {
                return false;
            }

            const tagName = node.tagName?.toLowerCase();
            
            // Match original isSkippableElement logic exactly
            return (
                node.classList.contains("dont-translate") ||
                node.classList.contains("bhashini-skip-translation") ||
                tagName === "script" ||
                tagName === "style" ||
                tagName === "noscript"
            );
        }

        extractTextContent(node) {
            const text = node.textContent;
            
            if (!text) {
                return null;
            }
            
            // Match original logic: check for numeric content and ignored nodes
            const isNumeric = /^[\d.]+$/.test(text);
            
            // Use original isIgnoredNode logic
            if (this.isIgnoredNode(node) || isNumeric) {
                return null;
            }
            
            return text;
        }

        /**
         * Match original isIgnoredNode logic exactly
         */
        isIgnoredNode(node) {
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const isValidGovtEmail = (email) => {
                const normalizedEmail = email.replace(/\[dot]/g, ".").replace(/\[at]/g, "@");
                return emailRegex.test(normalizedEmail);
            };
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            
            return (
                (node.parentNode &&
                    (node.parentNode.tagName === "STYLE" ||
                        node.parentNode.tagName === "SCRIPT" ||
                        node.parentNode.tagName === "NOSCRIPT" ||
                        node.parentNode.classList.contains("dont-translate") ||
                        node.parentNode.classList.contains("bhashini-skip-translation") ||
                        emailRegex.test(node.textContent) ||
                        isValidGovtEmail(node.textContent) ||
                        (window.languageDetection !== "true" &&
                            window.pageSourceLanguage === "en" &&
                            nonEnglishRegex.test(node.textContent)))) ||
                onlyNewLinesOrWhiteSpaceRegex.test(node.textContent)
            );
        }

        extractTranslatableAttributes(element, translatableContent, depth) {
            // Match original logic exactly - only placeholder and title
            const translatableAttributes = ['placeholder', 'title'];
            
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
            return `${nodeId}-${optionsStr}`;
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

        debugCompareWithOriginal(rootNode) {
            console.log('🔄 Debugging DOM Traversal Comparison...');
            console.log('----------------------------------------');

            const originalResult = originalGetTextNodesToTranslate(rootNode);
            const optimizedResult = this.getTextNodesToTranslate(rootNode);

            console.log('Original Function Result:');
            console.log(`  Total Items: ${originalResult.length}`);
            console.log(`  First 5 items: ${JSON.stringify(originalResult.slice(0, 5))}`);
            console.log(`  Last 5 items: ${JSON.stringify(originalResult.slice(-5))}`);

            console.log('\nOptimized Function Result:');
            console.log(`  Total Items: ${optimizedResult.length}`);
            console.log(`  First 5 items: ${JSON.stringify(optimizedResult.slice(0, 5))}`);
            console.log(`  Last 5 items: ${JSON.stringify(optimizedResult.slice(-5))}`);

            console.log('\nComparison:');
            const originalItems = new Set(originalResult.map(item => item.content));
            const optimizedItems = new Set(optimizedResult.map(item => item.content));

            console.log(`  Original Unique Items: ${originalItems.size}`);
            console.log(`  Optimized Unique Items: ${optimizedItems.size}`);

            const commonItems = Array.from(originalItems).filter(item => optimizedItems.has(item));
            console.log(`  Common Items (Original and Optimized): ${commonItems.length}`);
            console.log(`  Example Common Item: "${commonItems[0]}"`);

            const onlyOriginalItems = Array.from(originalItems).filter(item => !optimizedItems.has(item));
            console.log(`  Items only in Original: ${onlyOriginalItems.length}`);
            console.log(`  Example Item only in Original: "${onlyOriginalItems[0]}"`);

            const onlyOptimizedItems = Array.from(optimizedItems).filter(item => !originalItems.has(item));
            console.log(`  Items only in Optimized: ${onlyOptimizedItems.length}`);
            console.log(`  Example Item only in Optimized: "${onlyOptimizedItems[0]}"`);

            console.log('\n--- End of Debugging ---');
        }

        /**
         * Quick test to compare results with original
         */
        quickCompare() {
            console.log('🔍 Quick Comparison Test...');
            
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const optimizedResult = this.getTextNodesToTranslate(document.body);
            
            console.log(`Original: ${originalResult.length} items`);
            console.log(`Optimized: ${optimizedResult.length} items`);
            
            if (originalResult.length === optimizedResult.length) {
                console.log('✅ Item counts match!');
            } else {
                console.log('❌ Item counts differ!');
                
                // Show some differences
                const originalContents = originalResult.map(item => item.content).slice(0, 10);
                const optimizedContents = optimizedResult.map(item => item.content).slice(0, 10);
                
                console.log('Original first 10:', originalContents);
                console.log('Optimized first 10:', optimizedContents);
            }
            
            return {
                original: originalResult.length,
                optimized: optimizedResult.length,
                match: originalResult.length === optimizedResult.length
            };
        }
    }

    // Create optimized instance
    const optimizedTraversal = new OptimizedDOMTraversal();
    
    /**
     * Monitored original function
     */
    function monitoredOriginalGetTextNodesToTranslate(rootNode) {
        const startTime = performance.now();
        const result = originalGetTextNodesToTranslate(rootNode);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const itemCount = result ? result.length : 0;
        
        // Update benchmark data
        updateBenchmarkData('original', executionTime, itemCount);
        
        // Log if enabled
        if (config.enableLogging && executionTime > config.logThreshold) {
            console.log(`🔴 Original: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
        }
        
        return result;
    }
    
    /**
     * Monitored optimized function
     */
    function monitoredOptimizedGetTextNodesToTranslate(rootNode) {
        const startTime = performance.now();
        const result = optimizedTraversal.getTextNodesToTranslate(rootNode);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const itemCount = result ? result.length : 0;
        
        // Update benchmark data
        updateBenchmarkData('optimized', executionTime, itemCount);
        
        // Log if enabled
        if (config.enableLogging && executionTime > config.logThreshold) {
            console.log(`🟢 Optimized: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
        }
        
        return result;
    }
    
    /**
     * Update benchmark data
     */
    function updateBenchmarkData(type, executionTime, itemCount) {
        const data = benchmarkData[type];
        
        data.totalCalls++;
        data.totalTime += executionTime;
        data.averageTime = data.totalTime / data.totalCalls;
        data.totalItems += itemCount;
        data.averageItems = data.totalItems / data.totalCalls;
        
        if (executionTime < data.minTime) {
            data.minTime = executionTime;
        }
        if (executionTime > data.maxTime) {
            data.maxTime = executionTime;
        }
        
        // Store call data
        const callData = {
            timestamp: Date.now(),
            executionTime: executionTime,
            itemCount: itemCount
        };
        
        data.calls.push(callData);
        if (data.calls.length > config.maxStoredCalls) {
            data.calls.shift();
        }
    }
    
    /**
     * Run side-by-side benchmark
     */
    function runBenchmark(testRuns = 10) {
        console.log(`🏁 Running benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            optimizedTraversal.clearCache();
            
            // Test original (FULL DOM)
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test optimized (FULL DOM)
            const optimizedStart = performance.now();
            const optimizedResult = optimizedTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
            const optimizedEnd = performance.now();
            const optimizedTime = optimizedEnd - optimizedStart;
            
            // Calculate improvement
            const improvement = ((originalTime - optimizedTime) / originalTime * 100);
            
            const result = {
                run: i + 1,
                original: {
                    time: originalTime,
                    items: originalResult.length
                },
                optimized: {
                    time: optimizedTime,
                    items: optimizedResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | Optimized ${optimizedTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | Optimized ${optimizedResult.length}`);
            
            // Log first 10 items from each for comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items:');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nOptimized items:');
                optimizedResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                // Check if items match
                const originalContents = originalResult.map(item => item.content);
                const optimizedContents = optimizedResult.map(item => item.content);
                
                const matchingItems = originalContents.filter(content => optimizedContents.includes(content));
                const onlyOriginal = originalContents.filter(content => !optimizedContents.includes(content));
                const onlyOptimized = optimizedContents.filter(content => !originalContents.includes(content));
                
                console.log('\n🔍 Item Analysis:');
                console.log(`  Matching items: ${matchingItems.length}/${originalResult.length}`);
                console.log(`  Only in Original: ${onlyOriginal.length}`);
                console.log(`  Only in Optimized: ${onlyOptimized.length}`);
                
                if (onlyOriginal.length > 0) {
                    console.log('  Items only in Original:');
                    onlyOriginal.slice(0, 5).forEach((content, index) => {
                        console.log(`    ${index + 1}. "${content}"`);
                    });
                }
                
                if (onlyOptimized.length > 0) {
                    console.log('  Items only in Optimized:');
                    onlyOptimized.slice(0, 5).forEach((content, index) => {
                        console.log(`    ${index + 1}. "${content}"`);
                    });
                }
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const optimizedAvg = results.reduce((sum, r) => sum + r.optimized.time, 0) / results.length;
        const avgImprovement = ((originalAvg - optimizedAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`Optimized Average: ${optimizedAvg.toFixed(2)}ms`);
        console.log(`Average Improvement: ${avgImprovement.toFixed(1)}% faster`);
        
        return {
            results: results,
            summary: {
                originalAvg: originalAvg,
                optimizedAvg: optimizedAvg,
                avgImprovement: avgImprovement
            }
        };
    }
    
    /**
     * Print comprehensive benchmark report
     */
    function printBenchmarkReport() {
        console.log('\n📊 Comprehensive Benchmark Report');
        console.log('=====================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // Optimized stats
        console.log('\n🟢 Optimized Performance:');
        console.log(`  Total Calls: ${benchmarkData.optimized.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.optimized.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.optimized.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.optimized.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.optimized.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.optimized.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.optimized.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.optimized.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.optimized.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.optimized.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.optimized.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.optimized.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const optimizedAvgItems = benchmarkData.optimized.averageItems;
            const contentAccuracy = (optimizedAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${optimizedAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = optimizedTraversal.getCacheStats();
        console.log('\n💾 Cache Statistics:');
        console.log(`  Cache Size: ${cacheStats.cacheSize}`);
        console.log(`  Processed Nodes: ${cacheStats.processedNodesCount}`);
    }
    
    /**
     * Reset all benchmark data
     */
    function resetBenchmarkData() {
        benchmarkData = {
            original: {
                totalCalls: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0,
                totalItems: 0,
                averageItems: 0,
                calls: []
            },
            optimized: {
                totalCalls: 0,
                totalTime: 0,
                averageTime: 0,
                minTime: Infinity,
                maxTime: 0,
                totalItems: 0,
                averageItems: 0,
                calls: []
            },
            comparison: {
                totalImprovement: 0,
                averageImprovement: 0,
                bestImprovement: 0,
                worstImprovement: 0
            }
        };
        
        optimizedTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }
    
    /**
     * Enable real-time comparison mode
     */
    function enableRealTimeComparison() {
        config.enableRealTimeComparison = true;
        
        // Replace original function with monitored version
        window.getTextNodesToTranslate = monitoredOriginalGetTextNodesToTranslate;
        
        // Create optimized function for comparison
        window.getTextNodesToTranslateOptimized = monitoredOptimizedGetTextNodesToTranslate;
        
        console.log('🔄 Real-time comparison mode enabled');
        console.log('  - Original: getTextNodesToTranslate()');
        console.log('  - Optimized: getTextNodesToTranslateOptimized()');
    }
    
    /**
     * Disable real-time comparison mode
     */
    function disableRealTimeComparison() {
        config.enableRealTimeComparison = false;
        
        // Restore original function
        window.getTextNodesToTranslate = originalGetTextNodesToTranslate;
        delete window.getTextNodesToTranslateOptimized;
        
        console.log('⏹️ Real-time comparison mode disabled');
    }
    
    /**
     * Test cache performance separately
     */
    function testCachePerformance() {
        console.log('💾 Testing Cache Performance...\n');
        
        // Clear cache first
        optimizedTraversal.clearCache();
        
        // First run (no cache)
        const firstStart = performance.now();
        const firstResult = optimizedTraversal.getTextNodesToTranslate(document.body, { enableCache: true });
        const firstEnd = performance.now();
        const firstTime = firstEnd - firstStart;
        
        console.log(`First run (no cache): ${firstTime.toFixed(2)}ms (${firstResult.length} items)`);
        
        // Second run (with cache)
        const secondStart = performance.now();
        const secondResult = optimizedTraversal.getTextNodesToTranslate(document.body, { enableCache: true });
        const secondEnd = performance.now();
        const secondTime = secondEnd - secondStart;
        
        console.log(`Second run (with cache): ${secondTime.toFixed(2)}ms (${secondResult.length} items)`);
        
        const cacheImprovement = ((firstTime - secondTime) / firstTime * 100);
        console.log(`Cache Improvement: ${cacheImprovement.toFixed(1)}% faster`);
        
        const cacheStats = optimizedTraversal.getCacheStats();
        console.log(`Cache stats: ${cacheStats.cacheSize} cached results, ${cacheStats.processedNodesCount} processed nodes`);
        
        return {
            firstRun: firstTime,
            secondRun: secondTime,
            improvement: cacheImprovement,
            cacheStats: cacheStats
        };
    }

    /**
     * Detailed comparison of original vs optimized results
     */
    function detailedComparison() {
        console.log('🔍 Detailed Comparison Analysis...\n');
        
        // Get full results from both versions
        const originalResult = originalGetTextNodesToTranslate(document.body);
        const optimizedResult = optimizedTraversal.getTextNodesToTranslate(document.body);
        
        console.log(`📊 Full Results:`);
        console.log(`  Original: ${originalResult.length} items`);
        console.log(`  Optimized: ${optimizedResult.length} items`);
        
        // Compare content
        const originalContents = originalResult.map(item => item.content);
        const optimizedContents = optimizedResult.map(item => item.content);
        
        const matchingItems = originalContents.filter(content => optimizedContents.includes(content));
        const onlyOriginal = originalContents.filter(content => !optimizedContents.includes(content));
        const onlyOptimized = optimizedContents.filter(content => !originalContents.includes(content));
        
        console.log(`\n🔍 Content Analysis:`);
        console.log(`  Matching items: ${matchingItems.length}`);
        console.log(`  Only in Original: ${onlyOriginal.length}`);
        console.log(`  Only in Optimized: ${onlyOptimized.length}`);
        
        // Show sample differences
        if (onlyOriginal.length > 0) {
            console.log(`\n📋 Sample items only in Original (first 10):`);
            onlyOriginal.slice(0, 10).forEach((content, index) => {
                console.log(`  ${index + 1}. "${content}"`);
            });
        }
        
        if (onlyOptimized.length > 0) {
            console.log(`\n📋 Sample items only in Optimized (first 10):`);
            onlyOptimized.slice(0, 10).forEach((content, index) => {
                console.log(`  ${index + 1}. "${content}"`);
            });
        }
        
        // Show matching items
        if (matchingItems.length > 0) {
            console.log(`\n✅ Sample matching items (first 10):`);
            matchingItems.slice(0, 10).forEach((content, index) => {
                console.log(`  ${index + 1}. "${content}"`);
            });
        }
        
        return {
            original: originalResult.length,
            optimized: optimizedResult.length,
            matching: matchingItems.length,
            onlyOriginal: onlyOriginal.length,
            onlyOptimized: onlyOptimized.length,
            originalItems: originalContents,
            optimizedItems: optimizedContents
        };
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.enableRealTimeComparison = enableRealTimeComparison;
    window.disableRealTimeComparison = disableRealTimeComparison;
    window.optimizedTraversal = optimizedTraversal;
    window.debugCompare = () => optimizedTraversal.debugCompareWithOriginal(document.body);
    window.testCachePerformance = testCachePerformance; // Expose the new function
    window.quickCompare = () => optimizedTraversal.quickCompare(); // Expose quick compare
    window.detailedComparison = detailedComparison; // Expose the new function
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run side-by-side benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('  enableRealTimeComparison() - Enable real-time monitoring');
    console.log('  disableRealTimeComparison() - Disable real-time monitoring');
    console.log('  debugCompare() - Debug comparison with original function');
    console.log('  testCachePerformance() - Test cache performance separately');
    console.log('  quickCompare() - Quick comparison test');
    console.log('  detailedComparison() - Detailed comparison analysis');
    console.log('\n💡 Run: quickCompare() to test if item counts match');
    console.log('💡 Run: runBenchmark(10) to start benchmarking');

})(); 