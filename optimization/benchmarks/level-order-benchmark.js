/**
 * Level-Order DOM Traversal Benchmark
 * 
 * This script implements a level-order traversal that processes nodes
 * level by level with explicit level tracking, comparing against the original recursive approach.
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare performance
 */

(function() {
    'use strict';
    
    console.log('🏁 Level-Order Algorithm Benchmark Script Loaded');
    
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
        levelOrder: {
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
     * LEVEL-ORDER DOM Traversal Class
     * 
     * This implements a level-order traversal with explicit level tracking:
     * - Processes all nodes at current level before moving to next level
     * - Uses arrays to track levels explicitly
     * - Similar to BFS but with more structured level management
     */
    class LevelOrderTraversal {
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
            
            // LEVEL-ORDER: Use arrays to track levels explicitly
            const levels = [[{ node: rootNode, depth: 0 }]];
            
            // Pre-compile regex patterns (same as original for fair comparison)
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            // LEVEL-ORDER TRAVERSAL: Process level by level
            for (let level = 0; level < levels.length && level <= maxDepth; level++) {
                const currentLevel = levels[level];
                const nextLevel = [];

                // Process all nodes at current level
                for (const { node, depth } of currentLevel) {
                    if (!node || !node.nodeType) {
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

                        // Add children to next level
                        for (let i = 0; i < node.childNodes.length; i++) {
                            nextLevel.push({ node: node.childNodes[i], depth: depth + 1 });
                        }
                    }
                }

                // Add next level if it has nodes
                if (nextLevel.length > 0) {
                    levels.push(nextLevel);
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

    // Create LEVEL-ORDER instance
    const levelOrderTraversal = new LevelOrderTraversal();
    
    /**
     * Run side-by-side benchmark
     */
    function runBenchmark(testRuns = 10) {
        console.log(`🏁 Running LEVEL-ORDER vs REAL Original (Bhashini Utility) benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            // Clear cache before each run to ensure fair comparison
            levelOrderTraversal.clearCache();
            
            // Test original (full DOM) - REAL BHASHINI UTILITY
            const originalStart = performance.now();
            const originalResult = originalGetTextNodesToTranslate(document.body);
            const originalEnd = performance.now();
            const originalTime = originalEnd - originalStart;
            
            // Test LEVEL-ORDER (full DOM)
            const levelOrderStart = performance.now();
            const levelOrderResult = levelOrderTraversal.getTextNodesToTranslate(document.body, { enableCache: false });
            const levelOrderEnd = performance.now();
            const levelOrderTime = levelOrderEnd - levelOrderStart;
            
            // Calculate improvement
            const improvement = ((originalTime - levelOrderTime) / originalTime * 100);
            
            const result = {
                run: i + 1,
                original: {
                    time: originalTime,
                    items: originalResult.length
                },
                levelOrder: {
                    time: levelOrderTime,
                    items: levelOrderResult.length
                },
                improvement: improvement
            };
            
            results.push(result);
            
            console.log(`Run ${i + 1}: Original ${originalTime.toFixed(2)}ms | LEVEL-ORDER ${levelOrderTime.toFixed(2)}ms | ${improvement.toFixed(1)}% faster`);
            console.log(`  Items: Original ${originalResult.length} | LEVEL-ORDER ${levelOrderResult.length}`);
            
            // Log first 10 items comparison (only on first run)
            if (i === 0) {
                console.log('\n📋 First 10 items comparison:');
                console.log('Original items (REAL BHASHINI UTILITY):');
                originalResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                console.log('\nLEVEL-ORDER items:');
                levelOrderResult.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                
                // Check if items match
                const originalContents = originalResult.map(item => item.content);
                const levelOrderContents = levelOrderResult.map(item => item.content);
                
                const matchingItems = originalContents.filter(content => levelOrderContents.includes(content));
                const onlyOriginal = originalContents.filter(content => !levelOrderContents.includes(content));
                const onlyLevelOrder = levelOrderContents.filter(content => !originalContents.includes(content));
                
                console.log('\n🔍 Item Analysis:');
                console.log(`  Matching items: ${matchingItems.length}/${originalResult.length}`);
                console.log(`  Only in Original: ${onlyOriginal.length}`);
                console.log(`  Only in LEVEL-ORDER: ${onlyLevelOrder.length}`);
            }
        }
        
        // Calculate summary
        const originalAvg = results.reduce((sum, r) => sum + r.original.time, 0) / results.length;
        const levelOrderAvg = results.reduce((sum, r) => sum + r.levelOrder.time, 0) / results.length;
        const avgImprovement = ((originalAvg - levelOrderAvg) / originalAvg * 100);
        
        console.log('\n📊 Benchmark Summary:');
        console.log(`REAL Original Average: ${originalAvg.toFixed(2)}ms`);
        console.log(`LEVEL-ORDER Average: ${levelOrderAvg.toFixed(2)}ms`);
        console.log(`Average Improvement: ${avgImprovement.toFixed(1)}% faster`);
        
        return {
            results: results,
            summary: {
                originalAvg: originalAvg,
                levelOrderAvg: levelOrderAvg,
                avgImprovement: avgImprovement
            }
        };
    }
    
    /**
     * Print comprehensive benchmark report
     */
    function printBenchmarkReport() {
        console.log('\n📊 Comprehensive LEVEL-ORDER Benchmark Report');
        console.log('============================================');
        
        // Original stats
        console.log('\n🔴 Original Performance:');
        console.log(`  Total Calls: ${benchmarkData.original.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.original.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.original.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.original.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.original.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.original.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.original.averageItems.toFixed(1)}`);
        
        // LEVEL-ORDER stats
        console.log('\n🟢 LEVEL-ORDER Performance:');
        console.log(`  Total Calls: ${benchmarkData.levelOrder.totalCalls}`);
        console.log(`  Total Time: ${benchmarkData.levelOrder.totalTime.toFixed(2)}ms`);
        console.log(`  Average Time: ${benchmarkData.levelOrder.averageTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${benchmarkData.levelOrder.minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${benchmarkData.levelOrder.maxTime.toFixed(2)}ms`);
        console.log(`  Total Items: ${benchmarkData.levelOrder.totalItems}`);
        console.log(`  Average Items: ${benchmarkData.levelOrder.averageItems.toFixed(1)}`);
        
        // Comparison
        if (benchmarkData.original.totalCalls > 0 && benchmarkData.levelOrder.totalCalls > 0) {
            const totalImprovement = ((benchmarkData.original.totalTime - benchmarkData.levelOrder.totalTime) / benchmarkData.original.totalTime * 100);
            const avgImprovement = ((benchmarkData.original.averageTime - benchmarkData.levelOrder.averageTime) / benchmarkData.original.averageTime * 100);
            
            console.log('\n⚡ Performance Comparison:');
            console.log(`  Total Time Saved: ${(benchmarkData.original.totalTime - benchmarkData.levelOrder.totalTime).toFixed(2)}ms`);
            console.log(`  Total Improvement: ${totalImprovement.toFixed(1)}%`);
            console.log(`  Average Improvement: ${avgImprovement.toFixed(1)}%`);
            console.log(`  Time per Call Saved: ${(benchmarkData.original.averageTime - benchmarkData.levelOrder.averageTime).toFixed(2)}ms`);
            
            // Content accuracy comparison
            const originalAvgItems = benchmarkData.original.averageItems;
            const levelOrderAvgItems = benchmarkData.levelOrder.averageItems;
            const contentAccuracy = (levelOrderAvgItems / originalAvgItems * 100);
            console.log(`  Content Accuracy: ${contentAccuracy.toFixed(1)}% (${levelOrderAvgItems.toFixed(1)} vs ${originalAvgItems.toFixed(1)} items)`);
        }
        
        // Cache stats
        const cacheStats = levelOrderTraversal.getCacheStats();
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
            levelOrder: {
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
        
        levelOrderTraversal.clearCache();
        console.log('✅ Benchmark data reset');
    }

    // Expose functions globally
    window.runBenchmark = runBenchmark;
    window.printBenchmarkReport = printBenchmarkReport;
    window.resetBenchmarkData = resetBenchmarkData;
    window.levelOrderTraversal = levelOrderTraversal;
    
    console.log('📋 Available functions:');
    console.log('  runBenchmark(runs) - Run LEVEL-ORDER vs Original benchmark');
    console.log('  printBenchmarkReport() - Print comprehensive report');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('\n💡 Run: runBenchmark(10) to start LEVEL-ORDER benchmarking');
    console.log('\n🔍 Key Features of LEVEL-ORDER:');
    console.log('  - Explicit level tracking with arrays');
    console.log('  - Processes all nodes at current level before moving deeper');
    console.log('  - Structured level-by-level traversal');
    console.log('  - Similar to BFS but with more organized level management');

})();
