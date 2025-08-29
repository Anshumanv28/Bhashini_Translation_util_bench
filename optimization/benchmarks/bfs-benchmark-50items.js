/**
 * BFS Benchmark Script (50 Items Limit)
 * 
 * This script provides benchmarking for BFS DOM traversal with 50-item limit
 * for screenshot purposes.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 BFS Benchmark Script Loaded (50 Items Limit)');
    
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
        bfs: {
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
        // itemLimit: 50  // Commented out for full DOM testing
    };
    
    /**
     * BFS DOM Traversal Class
     */
    class BFSDOMTraversal {
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
            const queue = [{ node: rootNode, depth: 0 }];
            let processedCount = 0;
            
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

            // BFS Traversal
            while (queue.length > 0) { // && processedCount < config.itemLimit) {
                const { node, depth } = queue.shift();
                
                if (!node || !node.nodeType || depth > maxDepth) {
                    continue;
                }

                // Skip the entire subtree if this node or any of its ancestors are skippable
                if (isNodeOrAncestorsSkippable(node)) {
                    continue;
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
                        processedCount++;
                        
                        // if (processedCount >= config.itemLimit) {
                        //     break;
                        // }
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({
                            type: "placeholder",
                            node: node,
                            content: node.getAttribute("placeholder"),
                        });
                        processedCount++;
                        
                        // if (processedCount >= config.itemLimit) {
                        //     break;
                        // }
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({
                            type: "title",
                            node: node,
                            content: node.getAttribute("title"),
                        });
                        processedCount++;
                        
                        // if (processedCount >= config.itemLimit) {
                        //     break;
                        // }
                    }

                    // Add children to queue for BFS
                    for (let i = 0; i < node.childNodes.length; i++) {
                        queue.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

            // Cache the result
            if (enableCache) {
                this.cache.set(cacheKey, translatableContent);
            }

            return translatableContent;
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
    }

    // Create BFS instance
    const bfsTraversal = new BFSDOMTraversal();
    
    /**
     * Monitored original function
     */
    function monitoredOriginalGetTextNodesToTranslate(rootNode) {
        const startTime = performance.now();
        const result = originalGetTextNodesToTranslate(rootNode); // .slice(0, config.itemLimit);
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
     * Monitored BFS function
     */
    function monitoredBFSGetTextNodesToTranslate(rootNode) {
        const startTime = performance.now();
        const result = bfsTraversal.getTextNodesToTranslate(rootNode);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const itemCount = result ? result.length : 0;
        
        // Update benchmark data
        updateBenchmarkData('bfs', executionTime, itemCount);
        
        // Log if enabled
        if (config.enableLogging && executionTime > config.logThreshold) {
            console.log(`🟢 BFS: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
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
        console.log(`🏁 Running BFS benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            bfsTraversal.clearCache();
            
            // Test original (full DOM)
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body); // .slice(0, config.itemLimit);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test BFS (full DOM)
            const bfsStart = performance.now();
            const bfsResult = bfsTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
            const bfsEnd = performance.now();
            const bfsTime = bfsEnd - bfsStart;
            
            // Calculate improvement
            const improvement = ((originalTime - bfsTime) / originalTime * 100);
            
            const result = {
                run: i + 1,
                original: {
                    time: originalTime,
                    items: originalResult.length
                },
                bfs: {
                    time: bfsTime,
                    items: bfsResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | BFS ${bfsTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | BFS ${bfsResult.length}`);
            
            // Log first 10 items from each for comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items:');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nBFS items:');
                bfsResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                // Check if items match
                const originalContents = originalResult.map(item => item.content);
                const bfsContents = bfsResult.map(item => item.content);
                
                const matchingItems = originalContents.filter(content => bfsContents.includes(content));
                const onlyOriginal = originalContents.filter(content => !bfsContents.includes(content));
                const onlyBFS = bfsContents.filter(content => !originalContents.includes(content));
                
                console.log('\n🔍 Item Analysis:');
                console.log(`  Matching items: ${matchingItems.length}/${originalResult.length}`);
                console.log(`  Only in Original: ${onlyOriginal.length}`);
                console.log(`  Only in BFS: ${onlyBFS.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const bfsAvg = results.reduce((sum, r) => sum + r.bfs.time, 0) / results.length;
        const avgImprovement = ((originalAvg - bfsAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`BFS Average: ${bfsAvg.toFixed(2)}ms`);
        console.log(`Average Improvement: ${avgImprovement.toFixed(1)}% faster`);
        
        return {
            results: results,
            summary: {
                originalAvg: originalAvg,
                bfsAvg: bfsAvg,
                avgImprovement: avgImprovement
            }
        };
    }
    
    /**
     * Print comprehensive benchmark report
     */
    function printBenchmarkReport() {
        console.log('\n📊 Comprehensive BFS Benchmark Report');
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
        
        // BFS stats
        console.log('\n🟢 BFS Performance:');
        console.log(`  Total Calls: ${benchmarkData.bfs.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.bfs.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.bfs.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.bfs.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.bfs.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.bfs.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.bfs.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.bfs.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.bfs.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.bfs.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.bfs.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.bfs.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const bfsAvgItems = benchmarkData.bfs.averageItems;
            const contentAccuracy = (bfsAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${bfsAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = bfsTraversal.getCacheStats();
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
            bfs: {
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
        
        bfsTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.bfsTraversal = bfsTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run BFS vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start BFS benchmarking');

})();
