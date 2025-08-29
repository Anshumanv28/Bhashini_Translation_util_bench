 /**
 * Original Algorithm Performance Benchmark
 * 
 * This script provides comprehensive analysis of the original recursive DOM traversal:
 * - Performance profiling and statistics
 * - Memory usage analysis
 * - Execution time breakdown
 * - Consistency testing
 * - Detailed performance insights
 * 
 * Usage:
 * 1. Open browser console on any website with Bhashini utility
 * 2. Copy and paste this entire script
 * 3. Use the benchmark functions to analyze original algorithm performance
 */

(function() {
    'use strict';
    
    console.log('🏁 Original Algorithm Performance Benchmark Loaded');
    
    // Store original function reference
    const originalGetTextNodesToTranslate = window.getTextNodesToTranslate;
    
    if (!originalGetTextNodesToTranslate) {
        console.log('❌ Original getTextNodesToTranslate function not found. Make sure the Bhashini utility is loaded.');
        return;
    }
    
    // Benchmark data storage
    let benchmarkData = {
        totalRuns: 0,
        totalTime: 0,
        averageTime: 0,
        minTime: Infinity,
        maxTime: 0,
        totalItems: 0,
        averageItems: 0,
        timeDistribution: {
            fast: 0,    // < 8ms
            medium: 0,  // 8-12ms
            slow: 0     // > 12ms
        },
        runs: [],
        memoryUsage: [],
        performanceMetrics: {
            consistency: 0,
            variance: 0,
            standardDeviation: 0
        }
    };
    
    // Configuration
    const config = {
        enableDetailedLogging: true,
        enableMemoryTracking: true,
        enablePerformanceProfiling: true,
        maxStoredRuns: 100,
        timeThresholds: {
            fast: 8,
            slow: 12
        }
    };
    
    /**
     * Enhanced original function with detailed monitoring
     */
    function monitoredOriginalGetTextNodesToTranslate(rootNode, options = {}) {
        const { enableProfiling = true } = options;
        
        // Memory tracking
        let memoryBefore = 0;
        let memoryAfter = 0;
        
        if (config.enableMemoryTracking && performance.memory) {
            memoryBefore = performance.memory.usedJSHeapSize;
        }
        
        // Performance profiling
        const startTime = performance.now();
        const startMark = 'original-start';
        const endMark = 'original-end';
        
        if (enableProfiling) {
            performance.mark(startMark);
        }
        
        // Execute original function
        const result = originalGetTextNodesToTranslate(rootNode);
        
        if (enableProfiling) {
            performance.mark(endMark);
            performance.measure('original-execution', startMark, endMark);
        }
        
        const endTime = performance.now();
        const executionTime = endTime - startTime;
        const itemCount = result ? result.length : 0;
        
        // Memory tracking
        if (config.enableMemoryTracking && performance.memory) {
            memoryAfter = performance.memory.usedJSHeapSize;
        }
        
        // Update benchmark data
        updateBenchmarkData(executionTime, itemCount, memoryAfter - memoryBefore);
        
        return result;
    }
    
    /**
     * Update benchmark data with detailed metrics
     */
    function updateBenchmarkData(executionTime, itemCount, memoryDelta) {
        benchmarkData.totalRuns++;
        benchmarkData.totalTime += executionTime;
        benchmarkData.averageTime = benchmarkData.totalTime / benchmarkData.totalRuns;
        benchmarkData.totalItems += itemCount;
        benchmarkData.averageItems = benchmarkData.totalItems / benchmarkData.totalRuns;
        
        // Update min/max times
        if (executionTime < benchmarkData.minTime) {
            benchmarkData.minTime = executionTime;
        }
        if (executionTime > benchmarkData.maxTime) {
            benchmarkData.maxTime = executionTime;
        }
        
        // Categorize execution time
        if (executionTime < config.timeThresholds.fast) {
            benchmarkData.timeDistribution.fast++;
        } else if (executionTime > config.timeThresholds.slow) {
            benchmarkData.timeDistribution.slow++;
        } else {
            benchmarkData.timeDistribution.medium++;
        }
        
        // Store run data
        const runData = {
            timestamp: Date.now(),
            executionTime: executionTime,
            itemCount: itemCount,
            memoryDelta: memoryDelta,
            memoryInfo: config.enableMemoryTracking && performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
        
        benchmarkData.runs.push(runData);
        if (benchmarkData.runs.length > config.maxStoredRuns) {
            benchmarkData.runs.shift();
        }
        
        // Calculate performance metrics
        calculatePerformanceMetrics();
    }
    
    /**
     * Calculate detailed performance metrics
     */
    function calculatePerformanceMetrics() {
        if (benchmarkData.runs.length < 2) return;
        
        const times = benchmarkData.runs.map(r => r.executionTime);
        const mean = times.reduce((a, b) => a + b, 0) / times.length;
        
        // Calculate variance and standard deviation
        const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Calculate consistency (inverse of coefficient of variation)
        const coefficientOfVariation = standardDeviation / mean;
        const consistency = Math.max(0, 1 - coefficientOfVariation);
        
        benchmarkData.performanceMetrics = {
            consistency: consistency,
            variance: variance,
            standardDeviation: standardDeviation,
            coefficientOfVariation: coefficientOfVariation
        };
    }
    
    /**
     * Run comprehensive original algorithm benchmark
     */
    function runOriginalBenchmark(testRuns = 20) {
        console.log(`🏁 Running Original Algorithm Benchmark with ${testRuns} test runs (FULL DOM)...\n`);
        
        const results = [];
        
        for (let i = 0; i < testRuns; i++) {
            const startTime = performance.now();
            const result = originalGetTextNodesToTranslate(document.body);
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            const itemCount = result ? result.length : 0;
            
            results.push({
                run: i + 1,
                time: executionTime,
                items: itemCount
            });
            
            // Update benchmark data
            updateBenchmarkData(executionTime, itemCount, 0);
            
            // Log with performance indicators
            let performanceIndicator = '🟡'; // medium
            if (executionTime < config.timeThresholds.fast) {
                performanceIndicator = '🟢'; // fast
            } else if (executionTime > config.timeThresholds.slow) {
                performanceIndicator = '🔴'; // slow
            }
            
            console.log(`${performanceIndicator} Run ${i + 1}: ${executionTime.toFixed(2)}ms | ${itemCount} items`);
            
            // Detailed logging for first few runs
            if (i < 3 && config.enableDetailedLogging) {
                console.log(`   📊 Details: ${executionTime.toFixed(3)}ms execution | ${itemCount} translatable items found`);
                if (performance.memory) {
                    console.log(`   💾 Memory: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB used`);
                }
            }
        }
        
        // Calculate and display summary
        displayBenchmarkSummary(results);
        
        return {
            results: results,
            summary: benchmarkData
        };
    }
    
    /**
     * Display comprehensive benchmark summary
     */
    function displayBenchmarkSummary(results) {
        const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;
        const avgItems = results.reduce((sum, r) => sum + r.items, 0) / results.length;
        const minTime = Math.min(...results.map(r => r.time));
        const maxTime = Math.max(...results.map(r => r.time));
        const timeRange = maxTime - minTime;
        
        console.log('\n📊 ORIGINAL ALGORITHM BENCHMARK SUMMARY');
        console.log('=========================================');
        
        // Basic Performance Metrics
        console.log('\n⚡ Performance Metrics:');
        console.log(`  Average Time: ${avgTime.toFixed(2)}ms`);
        console.log(`  Min Time: ${minTime.toFixed(2)}ms`);
        console.log(`  Max Time: ${maxTime.toFixed(2)}ms`);
        console.log(`  Time Range: ${timeRange.toFixed(2)}ms`);
        console.log(`  Average Items: ${avgItems.toFixed(1)}`);
        
        // Performance Distribution
        console.log('\n📈 Performance Distribution:');
        const fastCount = benchmarkData.timeDistribution.fast;
        const mediumCount = benchmarkData.timeDistribution.medium;
        const slowCount = benchmarkData.timeDistribution.slow;
        const totalRuns = results.length;
        
        console.log(`  🟢 Fast (<${config.timeThresholds.fast}ms): ${fastCount}/${totalRuns} (${(fastCount/totalRuns*100).toFixed(1)}%)`);
        console.log(`  🟡 Medium (${config.timeThresholds.fast}-${config.timeThresholds.slow}ms): ${mediumCount}/${totalRuns} (${(mediumCount/totalRuns*100).toFixed(1)}%)`);
        console.log(`  🔴 Slow (>${config.timeThresholds.slow}ms): ${slowCount}/${totalRuns} (${(slowCount/totalRuns*100).toFixed(1)}%)`);
        
        // Consistency Analysis
        if (benchmarkData.performanceMetrics.consistency > 0) {
            console.log('\n🎯 Consistency Analysis:');
            console.log(`  Consistency Score: ${(benchmarkData.performanceMetrics.consistency * 100).toFixed(1)}%`);
            console.log(`  Standard Deviation: ${benchmarkData.performanceMetrics.standardDeviation.toFixed(2)}ms`);
            console.log(`  Coefficient of Variation: ${(benchmarkData.performanceMetrics.coefficientOfVariation * 100).toFixed(1)}%`);
            
            // Consistency rating
            const consistency = benchmarkData.performanceMetrics.consistency;
            let consistencyRating = 'Poor';
            if (consistency > 0.8) consistencyRating = 'Excellent';
            else if (consistency > 0.6) consistencyRating = 'Good';
            else if (consistency > 0.4) consistencyRating = 'Fair';
            else if (consistency > 0.2) consistencyRating = 'Poor';
            
            console.log(`  Rating: ${consistencyRating}`);
        }
        
        // Memory Analysis
        if (config.enableMemoryTracking && performance.memory) {
            console.log('\n💾 Memory Analysis:');
            const currentMemory = performance.memory.usedJSHeapSize / 1024 / 1024;
            const totalMemory = performance.memory.totalJSHeapSize / 1024 / 1024;
            const memoryLimit = performance.memory.jsHeapSizeLimit / 1024 / 1024;
            
            console.log(`  Current Usage: ${currentMemory.toFixed(2)}MB`);
            console.log(`  Total Allocated: ${totalMemory.toFixed(2)}MB`);
            console.log(`  Memory Limit: ${memoryLimit.toFixed(2)}MB`);
            console.log(`  Usage Percentage: ${(currentMemory/memoryLimit*100).toFixed(1)}%`);
        }
        
        // Performance Insights
        console.log('\n🔍 Performance Insights:');
        if (timeRange < 2) {
            console.log('  ✅ Very consistent performance (low variance)');
        } else if (timeRange < 5) {
            console.log('  ⚠️  Moderate performance variance');
        } else {
            console.log('  ❌ High performance variance (inconsistent)');
        }
        
        if (avgTime < 10) {
            console.log('  ✅ Fast average execution time');
        } else if (avgTime < 15) {
            console.log('  ⚠️  Moderate execution time');
        } else {
            console.log('  ❌ Slow average execution time');
        }
        
        if (fastCount > totalRuns * 0.7) {
            console.log('  ✅ Mostly fast executions');
        } else if (slowCount > totalRuns * 0.3) {
            console.log('  ❌ Many slow executions');
        }
    }
    
    /**
     * Quick performance test
     */
    function quickTest(runs = 5) {
        console.log(`⚡ Quick Original Algorithm Test (${runs} runs)...\n`);
        return runOriginalBenchmark(runs);
    }
    
    /**
     * Detailed performance analysis
     */
    function detailedAnalysis(runs = 50) {
        console.log(`🔍 Detailed Original Algorithm Analysis (${runs} runs)...\n`);
        return runOriginalBenchmark(runs);
    }
    
    /**
     * Performance trend analysis
     */
    function analyzeTrends() {
        if (benchmarkData.runs.length < 5) {
            console.log('❌ Need at least 5 runs for trend analysis. Run some benchmarks first.');
            return;
        }
        
        console.log('\n📈 Performance Trend Analysis');
        console.log('============================');
        
        const times = benchmarkData.runs.map(r => r.executionTime);
        const items = benchmarkData.runs.map(r => r.itemCount);
        
        // Time trend
        const timeTrend = calculateTrend(times);
        console.log('\n⏱️  Execution Time Trend:');
        console.log(`  Trend: ${timeTrend.direction} (${timeTrend.slope.toFixed(3)}ms per run)`);
        console.log(`  R²: ${timeTrend.rSquared.toFixed(3)}`);
        
        // Item count trend
        const itemTrend = calculateTrend(items);
        console.log('\n📊 Item Count Trend:');
        console.log(`  Trend: ${itemTrend.direction} (${itemTrend.slope.toFixed(3)} items per run)`);
        console.log(`  R²: ${itemTrend.rSquared.toFixed(3)}`);
        
        // Performance stability
        const timeVariance = calculateVariance(times);
        const itemVariance = calculateVariance(items);
        
        console.log('\n🎯 Stability Analysis:');
        console.log(`  Time Variance: ${timeVariance.toFixed(3)}`);
        console.log(`  Item Variance: ${itemVariance.toFixed(3)}`);
        
        if (timeVariance < 1) {
            console.log('  ✅ Very stable execution times');
        } else if (timeVariance < 5) {
            console.log('  ⚠️  Moderately stable execution times');
        } else {
            console.log('  ❌ Unstable execution times');
        }
    }
    
    /**
     * Calculate trend line
     */
    function calculateTrend(data) {
        const n = data.length;
        const x = Array.from({length: n}, (_, i) => i);
        
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = data.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * data[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        // Calculate R²
        const meanY = sumY / n;
        const ssRes = data.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0);
        const ssTot = data.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
        const rSquared = 1 - (ssRes / ssTot);
        
        return {
            slope: slope,
            intercept: intercept,
            rSquared: rSquared,
            direction: slope > 0.1 ? 'Increasing' : slope < -0.1 ? 'Decreasing' : 'Stable'
        };
    }
    
    /**
     * Calculate variance
     */
    function calculateVariance(data) {
        const mean = data.reduce((a, b) => a + b, 0) / data.length;
        return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    }
    
    /**
     * Reset all benchmark data
     */
    function resetBenchmarkData() {
        benchmarkData = {
            totalRuns: 0,
            totalTime: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            totalItems: 0,
            averageItems: 0,
            timeDistribution: {
                fast: 0,
                medium: 0,
                slow: 0
            },
            runs: [],
            memoryUsage: [],
            performanceMetrics: {
                consistency: 0,
                variance: 0,
                standardDeviation: 0
            }
        };
        console.log('✅ Benchmark data reset');
    }
    
    /**
     * Get current benchmark statistics
     */
    function getBenchmarkStats() {
        return {
            ...benchmarkData,
            currentMemory: config.enableMemoryTracking && performance.memory ? {
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }

    // Expose functions globally
    window.runOriginalBenchmark = runOriginalBenchmark;
    window.quickTest = quickTest;
    window.detailedAnalysis = detailedAnalysis;
    window.analyzeTrends = analyzeTrends;
    window.resetBenchmarkData = resetBenchmarkData;
    window.getBenchmarkStats = getBenchmarkStats;
    window.monitoredOriginalGetTextNodesToTranslate = monitoredOriginalGetTextNodesToTranslate;
    
    console.log('📋 Available Original Algorithm Functions:');
    console.log('  quickTest(runs) - Quick performance test (default: 5 runs)');
    console.log('  runOriginalBenchmark(runs) - Comprehensive benchmark');
    console.log('  detailedAnalysis(runs) - Detailed analysis (default: 50 runs)');
    console.log('  analyzeTrends() - Analyze performance trends');
    console.log('  resetBenchmarkData() - Reset all benchmark data');
    console.log('  getBenchmarkStats() - Get current statistics');
    console.log('\n💡 Run: quickTest() to start original algorithm benchmarking');
    console.log('\n🎯 This benchmark focuses on:');
    console.log('  - Performance consistency and variance');
    console.log('  - Memory usage patterns');
    console.log('  - Execution time distribution');
    console.log('  - Trend analysis and stability');

})();
