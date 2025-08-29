/**
 * Multi-Algorithm DOM Traversal Benchmark
 * 
 * This script implements and benchmarks multiple DOM traversal algorithms:
 * 1. Original Recursive DFS
 * 2. True BFS (Breadth-First Search)
 * 3. True DFS (Depth-First Search) 
 * 4. Level-Order Traversal
 * 5. Pre-Order Traversal
 * 6. Post-Order Traversal
 * 7. In-Order Traversal (for DOM)
 * 8. Hybrid Approach
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to compare all algorithms
 */

(function() {
    'use strict';
    
    console.log('🏁 Multi-Algorithm DOM Traversal Benchmark Loaded');
    
    // Store original function reference
    const originalGetTextNodesToTranslate = window.getTextNodesToTranslate;
    
    if (!originalGetTextNodesToTranslate) {
        console.log('❌ Original getTextNodesToTranslate function not found. Make sure the Bhashini utility is loaded.');
        return;
    }
    
    // Benchmark data storage
    let benchmarkData = {
        original: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        bfs: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        dfs: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        levelOrder: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        preOrder: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        postOrder: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        inOrder: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] },
        hybrid: { totalCalls: 0, totalTime: 0, averageTime: 0, minTime: Infinity, maxTime: 0, totalItems: 0, averageItems: 0, calls: [] }
    };
    
    // Configuration
    const config = {
        enableLogging: true,
        logThreshold: 5,
        maxStoredCalls: 100
    };
    
    /**
     * Base Traversal Class with common functionality
     */
    class BaseTraversal {
        constructor() {
            this.cache = new Map();
        }

        // Common helper functions (same logic as original for fair comparison)
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
        }

        getCacheStats() {
            return {
                cacheSize: this.cache.size
            };
        }

        // Abstract method to be implemented by subclasses
        getTextNodesToTranslate(rootNode, options = {}) {
            throw new Error('getTextNodesToTranslate must be implemented by subclass');
        }
    }
    
    /**
     * 1. BFS (Breadth-First Search) - Queue-based level-by-level traversal
     */
    class BFSTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const queue = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (queue.length > 0) {
                const { node, depth } = queue.shift(); // FIFO
                
                if (!node || !node.nodeType || depth > maxDepth) continue;
                if (this.isNodeOrAncestorsSkippable(node)) continue;

                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                        translatableContent.push({ type: "text", node: node, content: text });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                    }

                    // Add all children to queue
                    for (let i = 0; i < node.childNodes.length; i++) {
                        queue.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 2. DFS (Depth-First Search) - Stack-based depth-first traversal
     */
    class DFSTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const stack = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (stack.length > 0) {
                const { node, depth } = stack.pop(); // LIFO
                
                if (!node || !node.nodeType || depth > maxDepth) continue;
                if (this.isNodeOrAncestorsSkippable(node)) continue;

                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                        translatableContent.push({ type: "text", node: node, content: text });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                    }

                    // Add children in reverse order for proper DFS
                    for (let i = node.childNodes.length - 1; i >= 0; i--) {
                        stack.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 3. Level-Order Traversal - Similar to BFS but with explicit level tracking
     */
    class LevelOrderTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const levels = [[{ node: rootNode, depth: 0 }]];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            for (let level = 0; level < levels.length && level <= maxDepth; level++) {
                const currentLevel = levels[level];
                const nextLevel = [];

                for (const { node, depth } of currentLevel) {
                    if (!node || !node.nodeType) continue;
                    if (this.isNodeOrAncestorsSkippable(node)) continue;

                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
                        const isNumeric = numericRegex.test(text);
                        if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                            translatableContent.push({ type: "text", node: node, content: text });
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute("placeholder")) {
                            translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                        }
                        if (node.hasAttribute("title")) {
                            translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                        }

                        // Add children to next level
                        for (let i = 0; i < node.childNodes.length; i++) {
                            nextLevel.push({ node: node.childNodes[i], depth: depth + 1 });
                        }
                    }
                }

                if (nextLevel.length > 0) {
                    levels.push(nextLevel);
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 4. Pre-Order Traversal - Process node before children
     */
    class PreOrderTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const stack = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (stack.length > 0) {
                const { node, depth } = stack.pop();
                
                if (!node || !node.nodeType || depth > maxDepth) continue;
                if (this.isNodeOrAncestorsSkippable(node)) continue;

                // Process node first (pre-order)
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                        translatableContent.push({ type: "text", node: node, content: text });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                    }

                    // Add children in reverse order
                    for (let i = node.childNodes.length - 1; i >= 0; i--) {
                        stack.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 5. Post-Order Traversal - Process children before node
     */
    class PostOrderTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const stack = [{ node: rootNode, depth: 0, processed: false }];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (stack.length > 0) {
                const item = stack.pop();
                const { node, depth, processed } = item;
                
                if (!node || !node.nodeType || depth > maxDepth) continue;
                if (this.isNodeOrAncestorsSkippable(node)) continue;

                if (processed) {
                    // Process node after children (post-order)
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
                        const isNumeric = numericRegex.test(text);
                        if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                            translatableContent.push({ type: "text", node: node, content: text });
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.hasAttribute("placeholder")) {
                            translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                        }
                        if (node.hasAttribute("title")) {
                            translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                        }
                    }
                } else {
                    // Mark as processed and add back to stack
                    stack.push({ node, depth, processed: true });
                    
                    // Add children in reverse order
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        for (let i = node.childNodes.length - 1; i >= 0; i--) {
                            stack.push({ node: node.childNodes[i], depth: depth + 1, processed: false });
                        }
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 6. In-Order Traversal - Process left subtree, node, right subtree
     */
    class InOrderTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const stack = [];
            let current = { node: rootNode, depth: 0 };
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (current.node || stack.length > 0) {
                // Go to leftmost node
                while (current.node && current.depth <= maxDepth) {
                    if (!this.isNodeOrAncestorsSkippable(current.node)) {
                        stack.push(current);
                    }
                    if (current.node.nodeType === Node.ELEMENT_NODE && current.node.childNodes.length > 0) {
                        current = { node: current.node.childNodes[0], depth: current.depth + 1 };
                    } else {
                        current = { node: null, depth: current.depth + 1 };
                    }
                }

                // Process current node
                if (stack.length > 0) {
                    current = stack.pop();
                    
                    if (current.node.nodeType === Node.TEXT_NODE) {
                        const text = current.node.textContent;
                        const isNumeric = numericRegex.test(text);
                        if (text && !this.isIgnoredNode(current.node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                            translatableContent.push({ type: "text", node: current.node, content: text });
                        }
                    } else if (current.node.nodeType === Node.ELEMENT_NODE) {
                        if (current.node.hasAttribute("placeholder")) {
                            translatableContent.push({ type: "placeholder", node: current.node, content: current.node.getAttribute("placeholder") });
                        }
                        if (current.node.hasAttribute("title")) {
                            translatableContent.push({ type: "title", node: current.node, content: current.node.getAttribute("title") });
                        }
                    }

                    // Go to right child
                    if (current.node.nodeType === Node.ELEMENT_NODE && current.node.childNodes.length > 1) {
                        current = { node: current.node.childNodes[1], depth: current.depth + 1 };
                    } else {
                        current = { node: null, depth: current.depth + 1 };
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    /**
     * 7. Hybrid Approach - Combines BFS and DFS based on node characteristics
     */
    class HybridTraversal extends BaseTraversal {
        getTextNodesToTranslate(rootNode, options = {}) {
            const { maxDepth = 1000, enableCache = true } = options;
            
            const cacheKey = this.generateCacheKey(rootNode, options);
            if (enableCache && this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            const translatableContent = [];
            const queue = [{ node: rootNode, depth: 0 }];
            
            // Pre-compile regex patterns
            const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
            const nonEnglishRegex = /^[^A-Za-z0-9]+$/;
            const onlyNewLinesOrWhiteSpaceRegex = /^[\n\s\r\t]*$/;
            const numericRegex = /^[\d.]+$/;

            while (queue.length > 0) {
                const { node, depth } = queue.shift();
                
                if (!node || !node.nodeType || depth > maxDepth) continue;
                if (this.isNodeOrAncestorsSkippable(node)) continue;

                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const isNumeric = numericRegex.test(text);
                    if (text && !this.isIgnoredNode(node, emailRegex, nonEnglishRegex, onlyNewLinesOrWhiteSpaceRegex) && !isNumeric) {
                        translatableContent.push({ type: "text", node: node, content: text });
                    }
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.hasAttribute("placeholder")) {
                        translatableContent.push({ type: "placeholder", node: node, content: node.getAttribute("placeholder") });
                    }
                    if (node.hasAttribute("title")) {
                        translatableContent.push({ type: "title", node: node, content: node.getAttribute("title") });
                    }

                    // Hybrid: Use BFS for shallow nodes, DFS for deep nodes
                    const children = [];
                    for (let i = 0; i < node.childNodes.length; i++) {
                        children.push({ node: node.childNodes[i], depth: depth + 1 });
                    }
                    
                    if (depth < 3) {
                        // BFS for shallow levels
                        queue.push(...children);
                    } else {
                        // DFS for deeper levels (reverse order)
                        for (let i = children.length - 1; i >= 0; i--) {
                            queue.unshift(children[i]);
                        }
                    }
                }
            }

            if (enableCache) this.cache.set(cacheKey, translatableContent);
            return translatableContent;
        }
    }
    
    // Create instances of all algorithms
    const algorithms = {
        original: { name: 'Original Recursive', instance: null, func: originalGetTextNodesToTranslate },
        bfs: { name: 'BFS (Breadth-First)', instance: new BFSTraversal() },
        dfs: { name: 'DFS (Depth-First)', instance: new DFSTraversal() },
        levelOrder: { name: 'Level-Order', instance: new LevelOrderTraversal() },
        preOrder: { name: 'Pre-Order', instance: new PreOrderTraversal() },
        postOrder: { name: 'Post-Order', instance: new PostOrderTraversal() },
        inOrder: { name: 'In-Order', instance: new InOrderTraversal() },
        hybrid: { name: 'Hybrid BFS/DFS', instance: new HybridTraversal() }
    };
    
    /**
     * Run comprehensive multi-algorithm benchmark
     */
    function runMultiAlgorithmBenchmark(testRuns = 5) {
        console.log(`🏁 Running Multi-Algorithm Benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = {};
        const algorithmKeys = Object.keys(algorithms);
        
        // Initialize results
        algorithmKeys.forEach(key => {
            results[key] = [];
        });
        
        for (let run = 0; run < testRuns; run++) {
            console.log(`\n📊 Run ${run + 1}/${testRuns}:`);
            
            // Clear all caches
            algorithmKeys.forEach(key => {
                if (algorithms[key].instance && algorithms[key].instance.clearCache) {
                    algorithms[key].instance.clearCache();
                }
            });
            
            // Test each algorithm
            for (const key of algorithmKeys) {
                const algorithm = algorithms[key];
                const startTime = performance.now();
                
                let result;
                if (key === 'original') {
                    result = algorithm.func(document.body);
                } else {
                    result = algorithm.instance.getTextNodesToTranslate(document.body, { enableCache: false });
                }
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;
                const itemCount = result ? result.length : 0;
                
                results[key].push({
                    time: executionTime,
                    items: itemCount
                });
                
                console.log(`  ${algorithm.name}: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
            }
        }
        
        // Calculate averages and rankings
        const summary = {};
        algorithmKeys.forEach(key => {
            const times = results[key].map(r => r.time);
            const items = results[key].map(r => r.items);
            
            summary[key] = {
                name: algorithms[key].name,
                avgTime: times.reduce((a, b) => a + b, 0) / times.length,
                avgItems: items.reduce((a, b) => a + b, 0) / items.length,
                minTime: Math.min(...times),
                maxTime: Math.max(...times),
                consistency: Math.max(...times) - Math.min(...times)
            };
        });
        
        // Sort by average time (fastest first)
        const rankings = algorithmKeys.sort((a, b) => summary[a].avgTime - summary[b].avgTime);
        
        console.log('\n🏆 ALGORITHM RANKINGS (Fastest to Slowest):');
        console.log('=============================================');
        
        rankings.forEach((key, index) => {
            const algo = summary[key];
            const improvement = ((summary.original.avgTime - algo.avgTime) / summary.original.avgTime * 100);
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
            
            console.log(`${medal} ${index + 1}. ${algo.name}: ${algo.avgTime.toFixed(2)}ms avg | ${improvement.toFixed(1)}% vs Original`);
            console.log(`     Items: ${algo.avgItems.toFixed(1)} | Range: ${algo.minTime.toFixed(2)}-${algo.maxTime.toFixed(2)}ms | Consistency: ${algo.consistency.toFixed(2)}ms`);
        });
        
        // Find the best algorithm
        const bestAlgorithm = rankings[0];
        const bestImprovement = ((summary.original.avgTime - summary[bestAlgorithm].avgTime) / summary.original.avgTime * 100);
        
        console.log('\n🎯 BEST PERFORMING ALGORITHM:');
        console.log(`   ${summary[bestAlgorithm].name} - ${bestImprovement.toFixed(1)}% faster than Original`);
        console.log(`   Average Time: ${summary[bestAlgorithm].avgTime.toFixed(2)}ms`);
        console.log(`   Content Accuracy: ${(summary[bestAlgorithm].avgItems / summary.original.avgItems * 100).toFixed(1)}%`);
        
        return {
            results: results,
            summary: summary,
            rankings: rankings,
            bestAlgorithm: bestAlgorithm
        };
    }
    
    /**
     * Quick single-run comparison
     */
    function quickComparison() {
        console.log('⚡ Quick Single-Run Comparison...\n');
        return runMultiAlgorithmBenchmark(1);
    }
    
    /**
     * Detailed analysis of specific algorithm
     */
    function analyzeAlgorithm(algorithmKey, testRuns = 10) {
        if (!algorithms[algorithmKey]) {
            console.log(`❌ Algorithm '${algorithmKey}' not found. Available: ${Object.keys(algorithms).join(', ')}`);
            return;
        }
        
        console.log(`🔍 Detailed Analysis: ${algorithms[algorithmKey].name}\n`);
        
        const results = [];
        for (let i = 0; i < testRuns; i++) {
            const algorithm = algorithms[algorithmKey];
            const startTime = performance.now();
            
            let result;
            if (algorithmKey === 'original') {
                result = algorithm.func(document.body);
            } else {
                result = algorithm.instance.getTextNodesToTranslate(document.body, { enableCache: false });
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            const itemCount = result ? result.length : 0;
            
            results.push({ time: executionTime, items: itemCount });
            console.log(`Run ${i + 1}: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
        }
        
        const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
        const avgItems = results.reduce((sum, r) => sum + r.items, 0) / results.length;
        const minTime = Math.min(...results.map(r => r.time));
        const maxTime = Math.max(...results.map(r => r.time));
        
        console.log(`\n📊 ${algorithms[algorithmKey].name} Analysis:`);
        console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Average Items: ${avgItems.toFixed(1)}`);
        console.log(`  Time Range: ${minTime.toFixed(2)}-${maxTime.toFixed(2)}ms`);
        console.log(`  Consistency: ${(maxTime - minTime).toFixed(2)}ms`);
        
        return { results, avgTime, avgItems, minTime, maxTime };
    }

    // Expose functions globally
    window.runMultiAlgorithmBenchmark = runMultiAlgorithmBenchmark;
    window.quickComparison = quickComparison;
    window.analyzeAlgorithm = analyzeAlgorithm;
    window.algorithms = algorithms;
    
    console.log('📋 Available Multi-Algorithm Functions:');
    console.log('  quickComparison() - Single-run comparison of all algorithms');
    console.log('  runMultiAlgorithmBenchmark(runs) - Comprehensive benchmark');
    console.log('  analyzeAlgorithm(key, runs) - Detailed analysis of specific algorithm');
    console.log('\n🔍 Available Algorithms:');
    Object.keys(algorithms).forEach(key => {
        console.log(`  - ${key}: ${algorithms[key].name}`);
    });
    console.log('\n💡 Run: quickComparison() to start multi-algorithm benchmarking');

})();
