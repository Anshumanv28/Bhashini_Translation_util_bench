import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [logCounter, setLogCounter] = useState(4); // Start from 4 since we have 3 initial logs
  const [logs, setLogs] = useState([
    { id: 1, message: 'System initialized. Ready for testing.', type: 'info', timestamp: new Date().toLocaleTimeString() },
    { id: 2, message: 'Enhanced Bhashini Utility loaded successfully.', type: 'info', timestamp: new Date().toLocaleTimeString() },
    { id: 3, message: 'All helper modules loaded and ready.', type: 'info', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [metrics, setMetrics] = useState({
    domTime: '0ms',
    translationTime: '0ms',
    cacheHitRate: '0%',
    memoryUsage: '0MB',
    apiCalls: '0',
    itemsProcessed: '0',
    benchmarkResults: null
  });
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [isTranslating, setIsTranslating] = useState(false);
  const consoleRef = useRef(null);

  const updateMetrics = useCallback((newMetrics) => {
    if (!newMetrics) return;
    
    if (newMetrics.domTraversal) {
      setMetrics(prev => ({
        ...prev,
        domTime: (newMetrics.domTraversal.traversalTime || 0).toFixed(2) + 'ms',
        itemsProcessed: newMetrics.domTraversal.itemsFound || 0
      }));
    }
    
    if (newMetrics.translation) {
      setMetrics(prev => ({
        ...prev,
        translationTime: (newMetrics.translation.totalTime || 0).toFixed(2) + 'ms',
        apiCalls: newMetrics.translation.apiCalls || 0
      }));
    }
    
    if (newMetrics.caching) {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: (newMetrics.caching.cacheHitRate || 0) + '%'
      }));
    }
    
    if (newMetrics.memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: (newMetrics.memory.usage || 0).toFixed(2) + 'MB'
      }));
    }
  }, []);

  // Auto-scroll console to bottom
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  // Periodic metrics update
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (window.enhancedGetMetrics && typeof window.enhancedGetMetrics === 'function') {
          const currentMetrics = window.enhancedGetMetrics();
          if (currentMetrics && typeof currentMetrics === 'object') {
            updateMetrics(currentMetrics);
          }
        }
      } catch (error) {
        // Silently handle errors during periodic updates
        console.debug('Periodic metrics update error:', error.message);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [updateMetrics]);

  const log = useCallback((message, type = 'info') => {
    const newLog = {
      id: logCounter,
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    };
    setLogs(prev => [...prev, newLog]);
    setLogCounter(prev => prev + 1); // Increment counter for next log
    console.log('[' + type.toUpperCase() + '] ' + message);
  }, [logCounter]);

  const clearConsole = () => {
    setLogs([]);
    setLogCounter(1); // Reset counter to 1
    log('Console cleared', 'info');
  };

  const testDFSTraversal = useCallback(() => {
    log('Testing DFS traversal with caching...', 'info');
    
    try {
      if (window.enhancedGetMetrics && typeof window.enhancedGetMetrics === 'function') {
        const startTime = performance.now();
        const result = window.enhancedGetMetrics();
        const endTime = performance.now();
        
        if (result && typeof result === 'object') {
          log('DFS traversal completed in ' + (endTime - startTime).toFixed(2) + 'ms', 'success');
          log('Items found: ' + (result.domTraversal?.itemsFound || 'N/A'), 'info');
          log('Cache hits: ' + (result.caching?.cacheHits || 'N/A'), 'info');
          log('Cache misses: ' + (result.caching?.cacheMisses || 'N/A'), 'info');
          
          updateMetrics(result);
        } else {
          log('Invalid metrics result received', 'error');
        }
      } else {
        log('Enhanced Bhashini Utility not loaded', 'error');
      }
    } catch (error) {
      log('DFS traversal error: ' + error.message, 'error');
    }
  }, [log, updateMetrics]);

  const enhancedTranslatePage = async () => {
    log('Starting enhanced page translation...', 'info');
    
    try {
      log('Target language: ' + targetLanguage, 'info');
      
      setIsTranslating(true);
      
      // Call the enhanced translation
      if (window.enhancedTranslatePage) {
        await window.enhancedTranslatePage(targetLanguage);
        log('Page translation completed successfully!', 'success');
        
        // Update metrics
        if (window.enhancedGetMetrics && typeof window.enhancedGetMetrics === 'function') {
          const currentMetrics = window.enhancedGetMetrics();
          if (currentMetrics && typeof currentMetrics === 'object') {
            updateMetrics(currentMetrics);
          }
        }
      } else {
        log('Enhanced Bhashini Utility not loaded', 'error');
      }
    } catch (error) {
      log('Translation error: ' + error.message, 'error');
    } finally {
      setIsTranslating(false);
    }
  };

  const testTTS = () => {
    log('Testing text-to-speech functionality...', 'info');
    
    try {
      if (window.speakText && typeof window.speakText === 'function') {
        window.speakText('Hello, this is a test of the text-to-speech functionality.');
        log('TTS test initiated successfully', 'success');
      } else {
        log('Text-to-speech helper not loaded', 'error');
      }
    } catch (error) {
      log('TTS test error: ' + error.message, 'error');
    }
  };

  const testEnhancedUtility = async () => {
    log('Testing Enhanced Bhashini Utility...', 'info');
    
    try {
      if (window.testEnhancedUtility && typeof window.testEnhancedUtility === 'function') {
        const result = await window.testEnhancedUtility(targetLanguage);
        log('Enhanced utility test completed successfully', 'success');
        log('Test results: ' + JSON.stringify(result, null, 2), 'info');
      } else {
        log('Enhanced utility test function not loaded', 'error');
      }
    } catch (error) {
      log('Enhanced utility test error: ' + error.message, 'error');
    }
  };

  const testBhashiniCompatibility = async () => {
    log('Testing Bhashini Compatibility Functions...', 'info');
    
    try {
      // Test original Bhashini functions
      if (window.getTextNodesToTranslate && typeof window.getTextNodesToTranslate === 'function') {
        const textNodes = window.getTextNodesToTranslate(document.body);
        log('Original getTextNodesToTranslate found ' + textNodes.length + ' nodes', 'success');
        
        // Test original translateTextChunks with a small sample
        if (window.translateTextChunks && typeof window.translateTextChunks === 'function') {
          const sampleTexts = ['Hello', 'World', 'Test'];
          const translations = await window.translateTextChunks(sampleTexts, targetLanguage);
          log('Original translateTextChunks test completed: ' + translations.length + ' items', 'success');
          log('Sample translations: ' + JSON.stringify(translations, null, 2), 'info');
        } else {
          log('Original translateTextChunks function not found', 'error');
        }
      } else {
        log('Original Bhashini functions not found', 'error');
      }
      
      // Test enhanced functions
      log('Testing Enhanced Functions...', 'info');
      if (window.enhancedGetTextNodesToTranslate && typeof window.enhancedGetTextNodesToTranslate === 'function') {
        const enhancedNodes = window.enhancedGetTextNodesToTranslate(document.body);
        log('Enhanced getTextNodesToTranslate found ' + enhancedNodes.length + ' nodes', 'success');
      } else {
        log('Enhanced getTextNodesToTranslate function not found', 'error');
      }
    } catch (error) {
      log('Bhashini compatibility test error: ' + error.message, 'error');
    }
  };

  const testEnhancedFunctions = async () => {
    log('Testing Enhanced Functions Only...', 'info');
    
    try {
      // Test enhanced text node discovery
      if (window.enhancedGetTextNodesToTranslate && typeof window.enhancedGetTextNodesToTranslate === 'function') {
        const enhancedNodes = window.enhancedGetTextNodesToTranslate(document.body);
        log('Enhanced getTextNodesToTranslate found ' + enhancedNodes.length + ' nodes', 'success');
        
        // Test enhanced translation with a small sample
        if (window.enhancedTranslateTextChunks && typeof window.enhancedTranslateTextChunks === 'function') {
          const sampleTexts = ['Hello', 'World', 'Test'];
          const translations = await window.enhancedTranslateTextChunks(sampleTexts, targetLanguage);
          log('Enhanced translateTextChunks test completed: ' + translations.length + ' items', 'success');
          log('Sample translations: ' + JSON.stringify(translations, null, 2), 'info');
        } else {
          log('Enhanced translateTextChunks function not found', 'error');
        }
      } else {
        log('Enhanced functions not found', 'error');
      }
    } catch (error) {
      log('Enhanced functions test error: ' + error.message, 'error');
    }
  };

  const runPerformanceBenchmark = async () => {
    log('🚀 Starting Performance Benchmark...', 'info');
    log('This will compare Enhanced vs Original Bhashini utility performance', 'info');
    
    try {
      const results = {
        original: { times: [], average: 0, total: 0 },
        enhanced: { times: [], average: 0, total: 0 },
        improvement: 0
      };
      
      const testRuns = 5; // Number of test runs for each utility
      
      // Test 1: DOM Traversal Performance
      log('📊 Benchmark 1: DOM Traversal Performance', 'info');
      
      // Test Original Bhashini DOM traversal
      if (window.getTextNodesToTranslate && typeof window.getTextNodesToTranslate === 'function') {
        log('Testing Original Bhashini DOM traversal...', 'info');
        for (let i = 0; i < testRuns; i++) {
          const startTime = performance.now();
          const nodes = window.getTextNodesToTranslate(document.body);
          const endTime = performance.now();
          const duration = endTime - startTime;
          results.original.times.push(duration);
          results.original.total += duration;
          log(`Original Run ${i + 1}: ${duration.toFixed(2)}ms (${nodes.length} nodes)`, 'info');
        }
        results.original.average = results.original.total / testRuns;
        log(`Original Average: ${results.original.average.toFixed(2)}ms`, 'success');
      }
      
      // Test Enhanced DOM traversal
      if (window.enhancedGetTextNodesToTranslate && typeof window.enhancedGetTextNodesToTranslate === 'function') {
        log('Testing Enhanced DOM traversal...', 'info');
        for (let i = 0; i < testRuns; i++) {
          const startTime = performance.now();
          const nodes = window.enhancedGetTextNodesToTranslate(document.body);
          const endTime = performance.now();
          const duration = endTime - startTime;
          results.enhanced.times.push(duration);
          results.enhanced.total += duration;
          log(`Enhanced Run ${i + 1}: ${duration.toFixed(2)}ms (${nodes.length} nodes)`, 'info');
        }
        results.enhanced.average = results.enhanced.total / testRuns;
        log(`Enhanced Average: ${results.enhanced.average.toFixed(2)}ms`, 'success');
      }
      
      // Test 2: Translation Performance (Small Batch)
      log('📊 Benchmark 2: Translation Performance (Small Batch)', 'info');
      
      const sampleTexts = ['Hello', 'World', 'Test', 'Performance', 'Benchmark'];
      
      // Test Original Bhashini translation
      if (window.translateTextChunks && typeof window.translateTextChunks === 'function') {
        log('Testing Original Bhashini translation...', 'info');
        for (let i = 0; i < testRuns; i++) {
          const startTime = performance.now();
          const translations = await window.translateTextChunks(sampleTexts, targetLanguage);
          const endTime = performance.now();
          const duration = endTime - startTime;
          log(`Original Translation Run ${i + 1}: ${duration.toFixed(2)}ms`, 'info');
        }
      }
      
      // Test Enhanced translation
      if (window.enhancedTranslateTextChunks && typeof window.enhancedTranslateTextChunks === 'function') {
        log('Testing Enhanced translation...', 'info');
        for (let i = 0; i < testRuns; i++) {
          const startTime = performance.now();
          const translations = await window.enhancedTranslateTextChunks(sampleTexts, targetLanguage);
          const endTime = performance.now();
          const duration = endTime - startTime;
          log(`Enhanced Translation Run ${i + 1}: ${duration.toFixed(2)}ms`, 'info');
        }
      }
      
      // Test 3: Cache Performance
      log('📊 Benchmark 3: Cache Performance', 'info');
      
      // Test Enhanced cache system
      if (window.enhancedGetCacheStats && typeof window.enhancedGetCacheStats === 'function') {
        const cacheStats = window.enhancedGetCacheStats();
        log('Enhanced Cache Stats: ' + JSON.stringify(cacheStats, null, 2), 'info');
      }
      
      // Test 4: Memory Usage
      log('📊 Benchmark 4: Memory Usage', 'info');
      
      if (performance.memory) {
        const memoryInfo = {
          used: (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
          total: (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
          limit: (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB'
        };
        log('Memory Usage: ' + JSON.stringify(memoryInfo, null, 2), 'info');
      }
      
      // Calculate and display results
      if (results.original.average > 0 && results.enhanced.average > 0) {
        const improvement = ((results.original.average - results.enhanced.average) / results.original.average) * 100;
        results.improvement = improvement;
        
        log('🏆 BENCHMARK RESULTS SUMMARY', 'success');
        log('============================', 'info');
        log(`Original Bhashini Average: ${results.original.average.toFixed(2)}ms`, 'info');
        log(`Enhanced Utility Average: ${results.enhanced.average.toFixed(2)}ms`, 'info');
        log(`Performance Improvement: ${improvement > 0 ? '+' : ''}${improvement.toFixed(2)}%`, improvement > 0 ? 'success' : 'error');
        
        if (improvement > 0) {
          log(`🎉 Enhanced utility is ${improvement.toFixed(2)}% FASTER!`, 'success');
        } else {
          log(`⚠️ Enhanced utility is ${Math.abs(improvement).toFixed(2)}% slower`, 'error');
        }
        
        // Store results for display
        setMetrics(prev => ({
          ...prev,
          benchmarkResults: results
        }));
        
      } else {
        log('⚠️ Could not complete benchmark - missing utility functions', 'error');
      }
      
      log('✅ Performance benchmark completed!', 'success');
      
    } catch (error) {
      log('Benchmark error: ' + error.message, 'error');
    }
  };

  const testEnhancedOverlay = useCallback(() => {
    log('🎯 Testing Enhanced Bhashini Overlay Component...', 'info');

    try {
      if (window.enhancedBhashiniOverlay) {
        log('Enhanced overlay component found!', 'success');
        log('Overlay should be visible in the bottom-right corner', 'info');
        log('Click on it to test language selection and translation', 'info');

        // Test overlay functionality
        if (typeof window.enhancedBhashiniOverlay.selectLanguage === 'function') {
          log('Testing overlay language selection...', 'info');
          window.enhancedBhashiniOverlay.selectLanguage('hi');
          log('Language set to Hindi via overlay', 'success');
        }

        if (typeof window.enhancedBhashiniOverlay.updateStatus === 'function') {
          log('Testing overlay status updates...', 'info');
          window.enhancedBhashiniOverlay.updateStatus('Overlay test successful!', 'success');
          log('Status updated via overlay', 'success');
        }

      } else {
        log('Enhanced overlay component not found', 'error');
        log('Make sure enhanced-overlay-component.js is loaded', 'error');
      }
    } catch (error) {
      log('Enhanced overlay test error: ' + error.message, 'error');
    }
  }, [log]);

  const testMutationObserver = useCallback(() => {
    log('🔍 Testing Enhanced Mutation Observer...', 'info');

    try {
      if (window.enhancedTestMutationObserver && typeof window.enhancedTestMutationObserver === 'function') {
        const stats = window.enhancedTestMutationObserver();
        log('Mutation Observer Stats: ' + JSON.stringify(stats, null, 2), 'info');
        log('✅ Mutation Observer test completed!', 'success');
      } else {
        log('Enhanced mutation observer functions not found', 'error');
        log('Make sure enhanced_bhashini_utility.js is loaded', 'error');
      }
    } catch (error) {
      log('Mutation Observer test error: ' + error.message, 'error');
    }
  }, [log]);

  const testNavigationManager = useCallback(() => {
    log('🧭 Testing Enhanced Navigation Manager...', 'info');

    try {
      if (window.enhancedTestNavigationManager && typeof window.enhancedTestNavigationManager === 'function') {
        const stats = window.enhancedTestNavigationManager();
        log('Navigation Manager Stats: ' + JSON.stringify(stats, null, 2), 'info');
        
        // Test page history
        if (window.enhancedGetPageHistory && typeof window.enhancedGetPageHistory === 'function') {
          const pageHistory = window.enhancedGetPageHistory();
          log('Page History: ' + JSON.stringify(pageHistory, null, 2), 'info');
        }
        
        log('✅ Navigation Manager test completed!', 'success');
      } else {
        log('Enhanced navigation manager functions not found', 'error');
        log('Make sure enhanced_bhashini_utility.js is loaded', 'error');
      }
    } catch (error) {
      log('Navigation Manager test error: ' + error.message, 'error');
    }
  }, [log]);

  const openFeedback = () => {
    log('Opening feedback modal...', 'info');
    
    try {
      if (window.openFeedbackModal && typeof window.openFeedbackModal === 'function') {
        window.openFeedbackModal();
        log('Feedback modal opened successfully', 'success');
      } else {
        log('Advanced feedback helper not loaded', 'error');
      }
    } catch (error) {
      log('Feedback error: ' + error.message, 'error');
    }
  };

  const resetPage = () => {
    window.location.reload();
  };

  const renderHomePage = () => (
    <div className="main-content">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">🚀 Build the Future of Software Development</h1>
          <p className="hero-subtitle">
            Join millions of developers and companies to build, ship, and maintain software on the most trusted open source platform.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">📝 Sign up for free</button>
            <button className="btn btn-secondary">📚 Start a project</button>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">100M+</span>
            <span className="stat-label">Repositories</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">90M+</span>
            <span className="stat-label">Developers</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">4M+</span>
            <span className="stat-label">Organizations</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2>✨ Powerful Features for Developers</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Advanced security features including SAML SSO, 2FA, and audit logs to keep your code safe.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>GitHub Actions</h3>
            <p>Automate your workflow from idea to production with GitHub Actions and Packages.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Project Management</h3>
            <p>Track issues, manage projects, and collaborate with teams using GitHub's project management tools.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>GitHub Pages</h3>
            <p>Host your static sites directly from your GitHub repository with GitHub Pages.</p>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <h2>🤝 Join Our Global Community</h2>
        <div className="community-content">
          <div className="community-text">
            <h3>Connect with developers worldwide</h3>
            <p>Share your code, contribute to open source projects, and learn from the best developers in the world. Our community spans across continents and includes developers of all skill levels.</p>
            <ul className="community-benefits">
              <li>📚 Access to millions of open source projects</li>
              <li>💬 Active community forums and discussions</li>
              <li>🎓 Learning resources and tutorials</li>
              <li>🌟 Recognition for your contributions</li>
            </ul>
          </div>
          <div className="community-stats">
            <div className="stat-card">
              <span className="stat-number">200+</span>
              <span className="stat-label">Countries</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">100+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="integration-section">
        <h2>🔌 Seamless Integrations</h2>
        <div className="integrations-grid">
          <div className="integration-item">
            <span className="integration-icon">⚡</span>
            <span className="integration-name">VS Code</span>
          </div>
          <div className="integration-item">
            <span className="integration-icon">🐳</span>
            <span className="integration-name">Docker</span>
          </div>
          <div className="integration-item">
            <span className="integration-icon">☁️</span>
            <span className="integration-name">AWS</span>
          </div>
          <div className="integration-item">
            <span className="integration-icon">🔧</span>
            <span className="integration-name">Jenkins</span>
          </div>
          <div className="integration-item">
            <span className="integration-icon">📱</span>
            <span className="integration-name">Mobile Apps</span>
          </div>
          <div className="integration-item">
            <span className="integration-icon">🎯</span>
            <span className="integration-name">Slack</span>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAboutPage = () => (
    <div className="main-content">
      {/* About Hero */}
      <section className="about-hero">
        <h1>📖 About Our Platform</h1>
        <p className="about-subtitle">
          Empowering developers to build amazing software through collaboration, innovation, and open source principles.
        </p>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>🎯 Our Mission</h2>
        <div className="mission-content">
          <p>
            We believe in the power of open source and collaborative development. Our platform serves as the foundation for millions of developers, 
            enabling them to create, share, and maintain software that makes a difference in the world.
          </p>
          <div className="mission-values">
            <div className="value-item">
              <span className="value-icon">🤝</span>
              <h3>Collaboration</h3>
              <p>Fostering teamwork and knowledge sharing across the global developer community.</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🔓</span>
              <h3>Open Source</h3>
              <p>Promoting transparency, accessibility, and community-driven development.</p>
            </div>
            <div className="value-item">
              <span className="value-icon">💡</span>
              <h3>Innovation</h3>
              <p>Encouraging creative solutions and pushing the boundaries of what's possible.</p>
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="history-section">
        <h2>📅 Our Journey</h2>
        <div className="timeline">
          <div className="timeline-item">
            <div className="timeline-year">2008</div>
            <div className="timeline-content">
              <h3>Platform Launch</h3>
              <p>Started as a simple Git hosting service for developers.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2012</div>
            <div className="timeline-content">
              <h3>Enterprise Features</h3>
              <p>Introduced advanced security and collaboration tools for teams.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2018</div>
            <div className="timeline-content">
              <h3>AI Integration</h3>
              <p>Launched GitHub Copilot and other AI-powered development tools.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-year">2024</div>
            <div className="timeline-content">
              <h3>Future Vision</h3>
              <p>Continuing to innovate and support the next generation of developers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <h2>👥 Our Team</h2>
        <div className="team-grid">
          <div className="team-member">
            <div className="member-avatar">👨‍💻</div>
            <h3>Development Team</h3>
            <p>Engineers and developers working on the core platform and features.</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">🎨</div>
            <h3>Design Team</h3>
            <p>UX/UI designers creating intuitive and beautiful user experiences.</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">📚</div>
            <h3>Community Team</h3>
            <p>Supporting and growing our global developer community.</p>
          </div>
          <div className="team-member">
            <div className="member-avatar">🚀</div>
            <h3>Product Team</h3>
            <p>Product managers and strategists shaping the future of development.</p>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <div className="App">
      <header className="header">
        <nav className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">🐙</span>
            <span className="brand-name">GitHub Clone</span>
          </div>
          <div className="nav-links">
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentPage('home')}
            >
              🏠 Home
            </button>
            <button 
              className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
              onClick={() => setCurrentPage('about')}
            >
              📖 About
            </button>
          </div>
        </nav>
      </header>

      <main className="main">
        {currentPage === 'home' ? renderHomePage() : renderAboutPage()}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🚀 Platform</h4>
            <ul>
              <li>Features</li>
              <li>Enterprise</li>
              <li>Security</li>
              <li>Team</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>💻 Developer</h4>
            <ul>
              <li>Documentation</li>
              <li>API</li>
              <li>Libraries</li>
              <li>Tools</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>🤝 Community</h4>
            <ul>
              <li>Support</li>
              <li>Forum</li>
              <li>Events</li>
              <li>Blog</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>📞 Contact</h4>
            <ul>
              <li>Sales</li>
              <li>Support</li>
              <li>Partners</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 GitHub Clone. Built for testing enhanced Bhashini utility.</p>
        </div>
      </footer>

             {/* Testing Panel - Commented out to focus on utility testing
       <div className="testing-panel">
         <div className="panel-header">
           <h3>🧪 Enhanced Bhashini Testing Panel</h3>
           <button className="panel-toggle">📊</button>
         </div>
         
         <div className="panel-content">
           <div className="control-group">
             <label htmlFor="targetLanguage">Target Language:</label>
             <select 
               id="targetLanguage"
               value={targetLanguage} 
               onChange={(e) => setTargetLanguage(e.target.value)}
               className="language-select"
             >
               <option value="hi">Hindi (हिंदी)</option>
               <option value="bn">Bengali (বাংলা)</option>
               <option value="ta">Tamil (தமிழ்)</option>
               <option value="te">Telugu (తెలుగు)</option>
               <option value="mr">Marathi (मराठी)</option>
               <option value="gu">Gujarati (ગુજરાતી)</option>
               <option value="kn">Kannada (ಕನ್ನಡ)</option>
               <option value="ml">Malayalam (മലയാളം)</option>
               <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
               <option value="or">Odia (ଓଡ଼ିଆ)</option>
             </select>
             
             <button 
               className="btn success" 
               onClick={enhancedTranslatePage}
               disabled={isTranslating}
             >
               {isTranslating ? (
                 <>
                   <span className="loading-spinner"></span>
                   Translating...
                 </>
               ) : (
                 '🌐 Translate Page'
               )}
             </button>
             
             <button className="btn secondary" onClick={testDFSTraversal}>
               🔍 Test DFS Traversal
             </button>
             
             <button className="btn info" onClick={testEnhancedUtility}>
               🧪 Test Enhanced Utility
             </button>
             
             <button className="btn warning" onClick={testBhashiniCompatibility}>
               🔧 Test Bhashini Compatibility
             </button>
             
             <button className="btn info" onClick={testEnhancedFunctions}>
               🚀 Test Enhanced Functions
             </button>
             
             <button className="btn warning" onClick={runPerformanceBenchmark}>
               ⚡ Performance Benchmark
             </button>
           </div>

           <div className="control-group">
             <button className="btn success" onClick={testTTS}>
               🔊 Test TTS
             </button>
             
             <button className="btn warning" onClick={openFeedback}>
               💬 Open Feedback
             </button>
             
             <button className="btn" onClick={clearConsole}>
               🗑️ Clear Console
             </button>
             
             <button className="btn" onClick={resetPage}>
               🔄 Reset Page
             </button>
           </div>

            <div className="metrics">
              <h4>📊 Real-time Performance Metrics</h4>
              <div className="metric-grid">
                <div className="metric-card">
                  <div className="metric-value">{metrics.domTime}</div>
                  <div className="metric-label">DOM Traversal Time</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.translationTime}</div>
                  <div className="metric-label">Translation Time</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.cacheHitRate}</div>
                  <div className="metric-label">Cache Hit Rate</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.memoryUsage}</div>
                  <div className="metric-label">Memory Usage</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.apiCalls}</div>
                  <div className="metric-label">API Calls Made</div>
                </div>
                <div className="metric-card">
                  <div className="metric-value">{metrics.itemsProcessed}</div>
                  <div className="metric-label">Items Processed</div>
                </div>
              </div>
            </div>

            {metrics.benchmarkResults && (
              <div className="benchmark-results">
                <h4>🏆 Benchmark Results</h4>
                <div className="benchmark-grid">
                  <div className="benchmark-card original">
                    <div className="benchmark-title">Original Bhashini</div>
                    <div className="benchmark-value">{metrics.benchmarkResults.original.average.toFixed(2)}ms</div>
                    <div className="benchmark-label">Average DOM Traversal</div>
                  </div>
                  <div className="benchmark-card enhanced">
                    <div className="benchmark-title">Enhanced Utility</div>
                    <div className="benchmark-value">{metrics.benchmarkResults.enhanced.average.toFixed(2)}ms</div>
                    <div className="benchmark-label">Average DOM Traversal</div>
                  </div>
                  <div className="benchmark-card improvement">
                    <div className="benchmark-title">Performance</div>
                    <div className="benchmark-value">
                      {metrics.benchmarkResults.improvement > 0 ? '+' : ''}
                      {metrics.benchmarkResults.improvement.toFixed(2)}%
                    </div>
                    <div className="benchmark-label">
                      {metrics.benchmarkResults.improvement > 0 ? 'FASTER' : 'SLOWER'}
                    </div>
                  </div>
                </div>
              </div>
            )}

           <div className="console-output">
             <h4>📝 Console Output</h4>
             <div ref={consoleRef} className="console-content">
               {logs.map(log => (
                 <div key={log.id} className={'log-entry ' + log.type}>
                   <span className={'status-indicator status-' + (log.type === 'error' ? 'inactive' : log.type === 'warn' ? 'processing' : 'active')}></span>
                   [{log.timestamp}] {log.message}
                 </div>
               ))}
             </div>
           </div>
         </div>
       </div>
       */}
    </div>
  );
}

export default App;

