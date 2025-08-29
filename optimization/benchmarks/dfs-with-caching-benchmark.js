/**
 * DFS Algorithm with Caching Benchmark
 * 
 * This script implements a DFS (Depth-First Search) algorithm with
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
    
    console.log('🏁 DFS with Caching Benchmark Script Loaded');
    
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
        optimizedDFS: {
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
     * OPTIMIZED DFS DOM Traversal Class
     * 
     * This implements a DFS (Depth-First Search) algorithm with:
     * - Pre-compiled regex patterns
     * - WeakMap caching for expensive operations
     * - Optimized ancestor traversal
     * - Stack-based iterative DFS (no recursion)
     */
    class OptimizedDFSTraversal {
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
            
            // DFS: Use stack for depth-first traversal
            const stack = [{ node: rootNode, depth: 0 }];
            
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

            // OPTIMIZED DFS TRAVERSAL: Stack-based iterative DFS
            while (stack.length > 0) {
                const { node, depth } = stack.pop(); // LIFO: Get the next node from the top of the stack
                
                if (!node || !node.nodeType || depth > maxDepth) {
                    continue;
                }

                if (isNodeOrAncestorsSkippable(node)) {
                    continue;
                }

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

                    // Add children to stack for DFS (in reverse order for proper traversal)
                    for (let i = node.childNodes.length - 1; i >= 0; i--) {
                        stack.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

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

    // Create OPTIMIZED DFS instance
    const optimizedDFSTraversal = new OptimizedDFSTraversal();
    
    /**
     * Run side-by-side benchmark
     */
    function runBenchmark(testRuns = 10) {
        console.log(`🏁 Running OPTIMIZED DFS vs REAL Original (Bhashini Utility) benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            optimizedDFSTraversal.clearCache();
            
            // Test original (full DOM) - REAL BHASHINI UTILITY
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test OPTIMIZED DFS (full DOM)
            const dfsStart = performance.now();
            const dfsResult = optimizedDFSTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
            const dfsEnd = performance.now();
            const dfsTime = dfsEnd - dfsStart;
            
            // Calculate improvement
            const improvement = ((originalTime - dfsTime) / originalTime * 100);
            
            const result = {
                run: i + 1,
                original: {
                    time: originalTime,
                    items: originalResult.length
                },
                optimizedDFS: {
                    time: dfsTime,
                    items: dfsResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | OPTIMIZED DFS ${dfsTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | OPTIMIZED DFS ${dfsResult.length}`);
            
            // Log first 10 items comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items (REAL BHASHINI UTILITY):');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nOPTIMIZED DFS items:');
                dfsResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                // Check if items match
                const originalContents = originalResult.map(item => item.content);
                const dfsContents = dfsResult.map(item => item.content);
                
                const matchingItems = originalContents.filter(content => dfsContents.includes(content));
                const onlyOriginal = originalContents.filter(content => !dfsContents.includes(content));
                const onlyDFS = dfsContents.filter(content => !originalContents.includes(content));
                
                console.log('\n🔍 Item Analysis:');
                console.log(`  Matching items: ${matchingItems.length}/${originalResult.length}`);
                console.log(`  Only in Original: ${onlyOriginal.length}`);
                console.log(`  Only in OPTIMIZED DFS: ${onlyDFS.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const dfsAvg = results.reduce((sum, r) => sum + r.optimizedDFS.time, 0) / results.length;
        const avgImprovement = ((originalAvg - dfsAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`REAL Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`OPTIMIZED DFS Average: ${dfsAvg.toFixed(2)}ms`);
        console.log(`Average Improvement: ${avgImprovement.toFixed(1)}% faster`);
        
        return {
            results: results,
            summary: {
                originalAvg: originalAvg,
                dfsAvg: dfsAvg,
                avgImprovement: avgImprovement
            }
        };
    }
    
    /**
     * Print comprehensive benchmark report
     */
    function printBenchmarkReport() {
        console.log('\n📊 Comprehensive OPTIMIZED DFS Benchmark Report');
        console.log('===============================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // OPTIMIZED DFS stats
        console.log('\n🟢 OPTIMIZED DFS Performance:');
        console.log(`  Total Calls: ${benchmarkData.optimizedDFS.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.optimizedDFS.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.optimizedDFS.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.optimizedDFS.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.optimizedDFS.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.optimizedDFS.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.optimizedDFS.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.optimizedDFS.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.optimizedDFS.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.optimizedDFS.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.optimizedDFS.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.optimizedDFS.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const dfsAvgItems = benchmarkData.optimizedDFS.averageItems;
            const contentAccuracy = (dfsAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${dfsAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = optimizedDFSTraversal.getCacheStats();
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
            optimizedDFS: {
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
        
        optimizedDFSTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.optimizedDFSTraversal = optimizedDFSTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run OPTIMIZED DFS vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start OPTIMIZED DFS benchmarking');
    console.log('\n🔍 Key Features of OPTIMIZED DFS:');
    console.log('  - Stack-based iterative DFS (no recursion)');
    console.log('  - Pre-compiled regex patterns');
    console.log('  - WeakMap caching for expensive operations');
    console.log('  - Optimized ancestor traversal');
    console.log('  - LIFO stack management for depth-first traversal');

})();
