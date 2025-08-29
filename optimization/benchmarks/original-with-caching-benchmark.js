/**
 * Original Recursive Algorithm with Caching Benchmark
 * 
 * This script implements the original recursive algorithm but with
 * optimized caching and performance improvements, comparing against
 * the original Bhashini utility.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 Original Recursive with Caching Benchmark Script Loaded');
    
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
        optimizedOriginal: {
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
        maxStoredCalls: 100
    };
    
    /**
     * OPTIMIZED ORIGINAL RECURSIVE DOM Traversal Class
     * 
     * This implements the original recursive algorithm but with:
     * - Pre-compiled regex patterns
     * - WeakMap caching for expensive operations
     * - Optimized ancestor traversal
     * - Same logic as original but with performance improvements
     */
    class OptimizedOriginalRecursiveTraversal {
        constructor() {
            this.cache = new Map();
            this.processedNodes = new WeakSet();
        }

        getTextNodesToTranslate(rootNode, options = {}) {
            const {
                maxDepth = 1000,
                enableCache = true
            } = options;

            // Check cache first
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            
            // Pre-compile regex patterns (same as original for fair comparison)
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

            // OPTIMIZED ORIGINAL RECURSIVE TRAVERSAL (same logic as original but with caching)
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

                    // Process all child nodes (recursive like original)
                    for (let i = 0; i < node.childNodes.length; i++) {
                        traverseNode(node.childNodes[i]);
                    }
                }
            }

            traverseNode(rootNode);

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

    // Create OPTIMIZED ORIGINAL instance
    const optimizedOriginalTraversal = new OptimizedOriginalRecursiveTraversal();
    
    /**
     * Run side-by-side benchmark
     */
    function runBenchmark(testRuns = 10) {
        console.log(`🏁 Running OPTIMIZED ORIGINAL RECURSIVE vs REAL Original (Bhashini Utility) benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            optimizedOriginalTraversal.clearCache();
            
            // Test original (full DOM) - REAL BHASHINI UTILITY
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test OPTIMIZED ORIGINAL RECURSIVE (full DOM)
            const optimizedStart = performance.now();
            const optimizedResult = optimizedOriginalTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
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
                optimizedOriginal: {
                    time: optimizedTime,
                    items: optimizedResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | OPTIMIZED ORIGINAL ${optimizedTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | OPTIMIZED ORIGINAL ${optimizedResult.length}`);
            
            // Log first 10 items comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items (REAL BHASHINI UTILITY):');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nOPTIMIZED ORIGINAL RECURSIVE items:');
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
                console.log(`  Only in OPTIMIZED ORIGINAL: ${onlyOptimized.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const optimizedAvg = results.reduce((sum, r) => sum + r.optimizedOriginal.time, 0) / results.length;
        const avgImprovement = ((originalAvg - optimizedAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`REAL Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`OPTIMIZED ORIGINAL RECURSIVE Average: ${optimizedAvg.toFixed(2)}ms`);
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
        console.log('\n📊 Comprehensive OPTIMIZED ORIGINAL RECURSIVE Benchmark Report');
        console.log('============================================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // OPTIMIZED ORIGINAL stats
        console.log('\n🟢 OPTIMIZED ORIGINAL RECURSIVE Performance:');
        console.log(`  Total Calls: ${benchmarkData.optimizedOriginal.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.optimizedOriginal.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.optimizedOriginal.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.optimizedOriginal.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.optimizedOriginal.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.optimizedOriginal.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.optimizedOriginal.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.optimizedOriginal.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.optimizedOriginal.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.optimizedOriginal.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.optimizedOriginal.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.optimizedOriginal.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const optimizedAvgItems = benchmarkData.optimizedOriginal.averageItems;
            const contentAccuracy = (optimizedAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${optimizedAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = optimizedOriginalTraversal.getCacheStats();
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
            optimizedOriginal: {
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
        
        optimizedOriginalTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.optimizedOriginalTraversal = optimizedOriginalTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run OPTIMIZED ORIGINAL vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start OPTIMIZED ORIGINAL benchmarking');
    console.log('\n🔍 Key Features of OPTIMIZED ORIGINAL RECURSIVE:');
    console.log('  - Same recursive logic as original');
    console.log('  - Pre-compiled regex patterns');
    console.log('  - WeakMap caching for expensive operations');
    console.log('  - Optimized ancestor traversal');
    console.log('  - 100% functional compatibility with original');

})();
