/**
 * True DFS (Depth-First Search) DOM Traversal Benchmark
 * 
 * This script implements a genuine DFS traversal using a stack-based approach
 * to process DOM nodes depth-first, comparing against the original recursive approach.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 True DFS (Depth-First Search) Benchmark Script Loaded');
    
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
        dfs: {
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
     * TRUE DFS DOM Traversal Class
     * 
     * This implements a genuine Depth-First Search using a stack:
     * - Processes nodes depth-first (goes as deep as possible before backtracking)
     * - Uses stack.pop() to get next node (LIFO - Last In, First Out)
     * - Adds children to stack in reverse order for proper traversal
     */
    class TrueDFSDOMTraversal {
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
            
            // TRUE DFS: Use a stack for depth-first traversal
            const stack = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns (same as original for fair comparison)
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            // TRUE DFS TRAVERSAL: Process depth-first
            while (stack.length > 0) {
                // LIFO: Get the next node from the top of the stack
                const { node, depth } = stack.pop();
                
                if (!node || !node.nodeType || depth > maxDepth) {
                    continue;
                }

                // Check if this node or its ancestors should be skipped
                if (this.isNodeOrAncestorsSkippable(node)) {
                    continue;
                }

                // Process this node
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
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

                    // TRUE DFS: Add children to stack in reverse order for proper traversal
                    // This ensures we process the first child first (depth-first)
                    for (let i = node.childNodes.length - 1; i >= 0; i--) {
                        stack.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

            // Cache the result
            if (enableCache) {
                this.cache.set(cacheKey, translatableContent);
            }

            return translatableContent;
        }

        // Helper functions (same logic as original for fair comparison)
        isSkippableElement(node) {
            return (
                node.nodeType === Node.ELEMENT_NODE &&
                (node.classList.contains("dont-translate") ||
                    node.classList.contains("bhashini-skip-translation") ||
                    node.tagName === "SCRIPT" ||
                    node.tagName === "STYLE" ||
                    node.tagName === "NOSCRIPT")
            );
        }

        isNodeOrAncestorsSkippable(node, maxLevels = 5) {
            let currentNode = node;
            let level = 0;

            while (currentNode && level < maxLevels) {
                if (this.isSkippableElement(currentNode)) {
                    return true;
                }
                currentNode = currentNode.parentElement;
                level++;
            }

            return false;
        }

        isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) {
            const isValidGovtEmail = (email) => {
                const normalizedEmail = email.replace(/\[dot]/g, ".").replace(/\[at]/g, "@");
                return emailRegex.test(normalizedEmail);
            };
            
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

    // Create TRUE DFS instance
    const trueDfsTraversal = new TrueDFSDOMTraversal();
    
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
     * Monitored TRUE DFS function
     */
    function monitoredTrueDFSGetTextNodesToTranslate(rootNode) {
        const startTime = performance.now();
        const result = trueDfsTraversal.getTextNodesToTranslate(rootNode);
        const endTime = performance.now();
        
        const executionTime = endTime - startTime;
        const itemCount = result ? result.length : 0;
        
        // Update benchmark data
        updateBenchmarkData('dfs', executionTime, itemCount);
        
        // Log if enabled
        if (config.enableLogging && executionTime > config.logThreshold) {
            console.log(`🟢 TRUE DFS: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
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
        console.log(`🏁 Running TRUE DFS vs REAL Original (Bhashini Utility) benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            trueDfsTraversal.clearCache();
            
            // Test original (full DOM) - REAL BHASHINI UTILITY
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test TRUE DFS (full DOM)
            const dfsStart = performance.now();
            const dfsResult = trueDfsTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
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
                dfs: {
                    time: dfsTime,
                    items: dfsResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | TRUE DFS ${dfsTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | TRUE DFS ${dfsResult.length}`);
            
            // Log first 10 items comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items (REAL BHASHINI UTILITY):');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nTRUE DFS items:');
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
                console.log(`  Only in TRUE DFS: ${onlyDFS.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const dfsAvg = results.reduce((sum, r) => sum + r.dfs.time, 0) / results.length;
        const avgImprovement = ((originalAvg - dfsAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`REAL Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`TRUE DFS Average: ${dfsAvg.toFixed(2)}ms`);
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
        console.log('\n📊 Comprehensive TRUE DFS Benchmark Report');
        console.log('==========================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // TRUE DFS stats
        console.log('\n🟢 TRUE DFS Performance:');
        console.log(`  Total Calls: ${benchmarkData.dfs.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.dfs.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.dfs.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.dfs.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.dfs.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.dfs.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.dfs.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.dfs.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.dfs.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.dfs.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.dfs.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.dfs.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const dfsAvgItems = benchmarkData.dfs.averageItems;
            const contentAccuracy = (dfsAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${dfsAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = trueDfsTraversal.getCacheStats();
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
            dfs: {
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
        
        trueDfsTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.trueDfsTraversal = trueDfsTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run TRUE DFS vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start TRUE DFS benchmarking');
    console.log('\n🔍 Key Differences in TRUE DFS:');
    console.log('  - Uses stack.pop() for LIFO processing');
    console.log('  - Processes nodes depth-first (goes deep before backtracking)');
    console.log('  - Adds children to stack in reverse order');
    console.log('  - Depth-first traversal (stack-based)');

})();
