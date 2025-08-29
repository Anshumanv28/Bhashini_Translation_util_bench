/**
 * Simple Original Algorithm Benchmark
 * 
 * This script provides a lightweight way to benchmark the original 
 * getTextNodesToTranslate function directly from the Bhashini utility.
 * 
 * Usage:
 * 1. Make sure Bhashini utility is loaded on the page
 * 2. Copy and paste this script into browser console
 * 3. Run the benchmark functions
 */

(function() {
    'use strict';
    
    console.log('🏁 Simple Original Algorithm Benchmark Loaded');
    
    // Check if original function exists
    if (!window.getTextNodesToTranslate) {
        console.log('❌ getTextNodesToTranslate function not found. Make sure Bhashini utility is loaded.');
        return;
    }
    
    // Simple benchmark data
    let benchmarkResults = [];
    
    /**
     * Simple benchmark function
     */
    function benchmarkOriginal(runs = 10) {
        console.log(`🏁 Running Original Algorithm Benchmark (${runs} runs)...\n`);
        
        const results = [];
        
        for (let i = 0; i < runs; i++) {
            const start = performance.now();
            const result = window.getTextNodesToTranslate(document.body);
            const end = performance.now();
            
            const time = end - start;
            const items = result ? result.length : 0;
            
            results.push({ time, items });
            
            // Simple performance indicator
            let indicator = '🟡';
            if (time < 8) indicator = '🟢';
            else if (time > 12) indicator = '🔴';
            
            console.log(`${indicator} Run ${i + 1}: ${time.toFixed(2)}ms | ${items} items`);
            
            // Log first 10 items on first run
            if (i === 0 && result && result.length > 0) {
                console.log('\n📋 First 10 items found:');
                result.slice(0, 10).forEach((item, index) => {
                    console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
                });
                if (result.length > 10) {
                    console.log(`  ... and ${result.length - 10} more items`);
                }
            }
        }
        
        // Calculate summary
        const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
        const avgItems = results.reduce((sum, r) => sum + r.items, 0) / results.length;
        const minTime = Math.min(...results.map(r => r.time));
        const maxTime = Math.max(...results.map(r => r.time));
        
        console.log('\n📊 Summary:');
        console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${maxTime.toFixed(2)}ms`);
        console.log(`  Average Items: ${avgItems.toFixed(1)}`);
        console.log(`  Time Range: ${(maxTime - minTime).toFixed(2)}ms`);
        
        // Store results
        benchmarkResults = results;
        
        return { results, avgTime, avgItems, minTime, maxTime };
    }
    
    /**
     * Quick test (5 runs)
     */
    function quickTest() {
        return benchmarkOriginal(5);
    }
    
    /**
     * Detailed test (20 runs)
     */
    function detailedTest() {
        return benchmarkOriginal(20);
    }
    
    /**
     * Get last benchmark results
     */
    function getResults() {
        if (benchmarkResults.length === 0) {
            console.log('❌ No benchmark results available. Run a benchmark first.');
            return null;
        }
        
        const avgTime = benchmarkResults.reduce((sum, r) => sum + r.time, 0) / benchmarkResults.length;
        const avgItems = benchmarkResults.reduce((sum, r) => sum + r.items, 0) / benchmarkResults.length;
        
        console.log('📊 Last Benchmark Results:');
        console.log(`  Runs: ${benchmarkResults.length}`);
        console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Average Items: ${avgItems.toFixed(1)}`);
        
        return { results: benchmarkResults, avgTime, avgItems };
    }
    
    /**
     * Clear results
     */
    function clearResults() {
        benchmarkResults = [];
        console.log('✅ Benchmark results cleared');
    }
    
    /**
     * Test single run
     */
    function singleTest() {
        console.log('🏁 Single Run Test...\n');
        
        const start = performance.now();
        const result = window.getTextNodesToTranslate(document.body);
        const end = performance.now();
        
        const time = end - start;
        const items = result ? result.length : 0;
        
        console.log(`⏱️  Execution Time: ${time.toFixed(2)}ms`);
        console.log(`📊 Items Found: ${items}`);
        
        // Log first 10 items
        if (result && result.length > 0) {
            console.log('\n📋 First 10 items found:');
            result.slice(0, 10).forEach((item, index) => {
                console.log(`  ${index + 1}. [${item.type}] "${item.content}"`);
            });
            if (result.length > 10) {
                console.log(`  ... and ${result.length - 10} more items`);
            }
        }
        
        if (performance.memory) {
            const memory = performance.memory.usedJSHeapSize / 1024 / 1024;
            console.log(`💾 Memory Used: ${memory.toFixed(2)}MB`);
        }
        
        return { time, items };
    }
    
    // Expose functions
    window.benchmarkOriginal = benchmarkOriginal;
    window.quickTest = quickTest;
    window.detailedTest = detailedTest;
    window.getResults = getResults;
    window.clearResults = clearResults;
    window.singleTest = singleTest;
    
    console.log('📋 Available Functions:');
    console.log('  singleTest() - Single run test');
    console.log('  quickTest() - Quick benchmark (5 runs)');
    console.log('  benchmarkOriginal(runs) - Custom benchmark');
    console.log('  detailedTest() - Detailed benchmark (20 runs)');
    console.log('  getResults() - Get last results');
    console.log('  clearResults() - Clear stored results');
    console.log('\n💡 Run: quickTest() to start benchmarking');

})();
