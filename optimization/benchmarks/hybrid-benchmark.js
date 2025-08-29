/**
 * Hybrid BFS/DFS DOM Traversal Benchmark
 * 
 * This script implements a hybrid approach that switches between BFS and DFS
 * based on DOM depth, comparing against the original recursive approach.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 Hybrid BFS/DFS Algorithm Benchmark Script Loaded');
    
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
        hybrid: {
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
     * HYBRID BFS/DFS DOM Traversal Class
     * 
     * This implements a smart hybrid approach:
     * - Uses BFS for shallow levels (depth < 3) for better locality
     * - Switches to DFS for deeper levels to avoid queue bloat
     * - Optimizes memory usage and traversal efficiency
     */
    class HybridBFSDFSTraversal {
        constructor() {
            this.cache = new Map();
            this.processedNodes = new WeakSet();
        }

        getTextNodesToTranslate(rootNode, options = {}) {
            const {
                maxDepth = 1000,
                enableCache = true,
                bfsThreshold = 3  // Switch to DFS after this depth
            } = options;

            // Check cache first
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            
            // HYBRID: Use queue but with smart insertion strategy
            const queue = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns (same as original for fair comparison)
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            // HYBRID TRAVERSAL: Smart BFS/DFS switching
            while (queue.length > 0) {
                const { node, depth } = queue.shift();
                
                if (!node || !node.nodeType || depth > maxDepth) {
                    continue;
                }

                if (this.isNodeOrAncestorsSkippable(node)) {
                    continue;
                }

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

                    // HYBRID STRATEGY: Smart child insertion based on depth
                    const children = [];
                    for (let i = 0; i < node.childNodes.length; i++) {
                        children.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                    
                    if (depth < bfsThreshold) {
                        // BFS for shallow levels: Add children to end of queue
                        queue.push(...children);
                    } else {
                        // DFS for deeper levels: Add children to front of queue (reverse order)
                        for (let i = children.length - 1; i >= 0; i--) {
                            queue.unshift(children[i]);
                        }
                    }
                }
            }

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

    // Create HYBRID instance
    const hybridTraversal = new HybridBFSDFSTraversal();
    
    /**
     * Run side-by-side benchmark
     */
    function runBenchmark(testRuns = 10) {
        console.log(`🏁 Running HYBRID BFS/DFS vs REAL Original (Bhashini Utility) benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            hybridTraversal.clearCache();
            
            // Test original (full DOM) - REAL BHASHINI UTILITY
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test HYBRID (full DOM)
            const hybridStart = performance.now();
            const hybridResult = hybridTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
            const hybridEnd = performance.now();
            const hybridTime = hybridEnd - hybridStart;
            
            // Calculate improvement
            const improvement = ((originalTime - hybridTime) / originalTime * 100);
            
            const result = {
                run: i + 1,
                original: {
                    time: originalTime,
                    items: originalResult.length
                },
                hybrid: {
                    time: hybridTime,
                    items: hybridResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | HYBRID ${hybridTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | HYBRID ${hybridResult.length}`);
            
            // Log first 10 items comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items (REAL BHASHINI UTILITY):');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nHYBRID BFS/DFS items:');
                hybridResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                // Check if items match
                const originalContents = originalResult.map(item => item.content);
                const hybridContents = hybridResult.map(item => item.content);
                
                const matchingItems = originalContents.filter(content => hybridContents.includes(content));
                const onlyOriginal = originalContents.filter(content => !hybridContents.includes(content));
                const onlyHybrid = hybridContents.filter(content => !originalContents.includes(content));
                
                console.log('\n🔍 Item Analysis:');
                console.log(`  Matching items: ${matchingItems.length}/${originalResult.length}`);
                console.log(`  Only in Original: ${onlyOriginal.length}`);
                console.log(`  Only in HYBRID: ${onlyHybrid.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const hybridAvg = results.reduce((sum, r) => sum + r.hybrid.time, 0) / results.length;
        const avgImprovement = ((originalAvg - hybridAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`REAL Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`HYBRID BFS/DFS Average: ${hybridAvg.toFixed(2)}ms`);
        console.log(`Average Improvement: ${avgImprovement.toFixed(1)}% faster`);
        
        return {
            results: results,
            summary: {
                originalAvg: originalAvg,
                hybridAvg: hybridAvg,
                avgImprovement: avgImprovement
            }
        };
    }
    
    /**
     * Print comprehensive benchmark report
     */
    function printBenchmarkReport() {
        console.log('\n📊 Comprehensive HYBRID BFS/DFS Benchmark Report');
        console.log('================================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // HYBRID stats
        console.log('\n🟢 HYBRID BFS/DFS Performance:');
        console.log(`  Total Calls: ${benchmarkData.hybrid.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.hybrid.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.hybrid.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.hybrid.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.hybrid.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.hybrid.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.hybrid.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.hybrid.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.hybrid.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.hybrid.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.hybrid.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.hybrid.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const hybridAvgItems = benchmarkData.hybrid.averageItems;
            const contentAccuracy = (hybridAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${hybridAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = hybridTraversal.getCacheStats();
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
            hybrid: {
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
        
        hybridTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.hybridTraversal = hybridTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run HYBRID vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start HYBRID benchmarking');
    console.log('\n🔍 Key Features of HYBRID BFS/DFS:');
    console.log('  - Uses BFS for shallow levels (depth < 3)');
    console.log('  - Switches to DFS for deeper levels');
    console.log('  - Optimizes memory usage and traversal efficiency');
    console.log('  - Smart queue management with unshift() for DFS mode');

})();
