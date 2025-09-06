/**
 * Enhanced Bhashini Overlay Component
 * Provides a floating interface for the enhanced Bhashini utility
 * Similar to the original Bhashini utility but with enhanced features
 */

class EnhancedBhashiniOverlay {
  constructor() {
    this.isVisible = false;
    this.currentLanguage = 'en';
    this.isTranslating = false;
    this.overlayElement = null;
    this.dropdownElement = null;
    this.languageSelector = null;
    this.translateButton = null;
    this.statusIndicator = null;
    this.metricsDisplay = null;
    
    this.supportedLanguages = [
      { code: "en", label: "English", native: "English" },
      { code: "hi", label: "Hindi", native: "हिंदी" },
      { code: "bn", label: "Bengali", native: "বাংলা" },
      { code: "ta", label: "Tamil", native: "தமிழ்" },
      { code: "te", label: "Telugu", native: "తెలుగు" },
      { code: "mr", label: "Marathi", native: "मराठी" },
      { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
      { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
      { code: "ml", label: "Malayalam", native: "മലയാളം" },
      { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
      { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
      { code: "as", label: "Assamese", native: "অসমীয়া" },
      { code: "brx", label: "Bodo", native: "बड़ो" },
      { code: "doi", label: "Dogri", native: "डोगरी" },
      { code: "gom", label: "Goan Konkani", native: "गोवा कोंकणी" },
      { code: "ks", label: "Kashmiri", native: "کٲشُر" },
      { code: "mai", label: "Maithili", native: "मैथिली" },
      { code: "mni", label: "Manipuri", native: "মণিপুরী" },
      { code: "ne", label: "Nepali", native: "नेपाली" },
      { code: "sa", label: "Sanskrit", native: "संस्कृत" },
      { code: "sat", label: "Santali", native: "संताली" },
      { code: "sd", label: "Sindhi", native: "سنڌي" },
      { code: "ur", label: "Urdu", native: "اردو" }
    ];
    
    this.init();
  }

  init() {
    this.createOverlay();
    this.setupEventListeners();
    this.loadSavedLanguage();
    this.updatePosition();
    
    // Listen for window resize to adjust position
    window.addEventListener('resize', () => this.updatePosition());
    
    console.log('🚀 Enhanced Bhashini Overlay Component initialized');
  }

  createOverlay() {
    // Create main overlay container
    this.overlayElement = document.createElement('div');
    this.overlayElement.className = 'enhanced-bhashini-overlay';
    this.overlayElement.id = 'enhanced-bhashini-overlay';
    
    // Create the main button with language display
    const mainButton = document.createElement('button');
    mainButton.className = 'enhanced-bhashini-main-btn';
    mainButton.innerHTML = `
      <div class="enhanced-bhashini-btn-icon">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyQzIgMTcuNTIgNi40OCAyMiAxMiAyMkMxNy41MiAyMiAyMiAxNy41MiAyMiAxMkMyMiA2LjQ4IDE3LjUyIDIgMTIgMloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMiAxNEMxMy4xMDQ2IDE0IDE0IDEzLjEwNDYgMTQgMTJDMTRIDEwLjg5NTQgMTMuMTA0NiAxMCAxMiAxMEMxMC44OTU0IDEwIDEwIDEwLjg5NTQgMTAgMTJDMTAgMTMuMTA0NiAxMC44OTU0IDE0IDEyIDE0WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyIDZDNi40OCA2IDIgMTAuNDggMiAxNkMyIDIxLjUyIDYuNDggMjYgMTIgMjZDMjEgMjYgMjYgMjEgMjYgMTZDMjYgMTAuNDggMjEuNTIgNiAxMiA2WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+" alt="Enhanced Bhashini">
        <span class="enhanced-bhashini-btn-text">English</span>
      </div>
      <svg class="enhanced-bhashini-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 7.5L10 12.5L15 7.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    
    // Create dropdown content
    this.dropdownElement = document.createElement('div');
    this.dropdownElement.className = 'enhanced-bhashini-dropdown';
    this.dropdownElement.innerHTML = `
      <div class="enhanced-bhashini-header">
        <h3>🌐 Enhanced Translation</h3>
        <p>Select target language</p>
      </div>
      <div class="enhanced-bhashini-languages">
        ${this.supportedLanguages.map(lang => `
          <div class="enhanced-language-option" data-lang="${lang.code}">
            <span class="enhanced-language-native">${lang.native}</span>
            <span class="enhanced-language-english">${lang.label}</span>
          </div>
        `).join('')}
      </div>
      <div class="enhanced-bhashini-actions">
        <button class="enhanced-translate-btn" id="enhanced-translate-btn">
          <span class="enhanced-translate-icon">🚀</span>
          Translate Page
        </button>
        <button class="enhanced-benchmark-btn" id="enhanced-benchmark-btn">
          <span class="enhanced-benchmark-icon">⚡</span>
          Benchmark
        </button>
        <button class="enhanced-cache-btn" id="enhanced-cache-btn">
          <span class="enhanced-cache-icon">💾</span>
          Cache Stats
        </button>
      </div>
      <div class="enhanced-bhashini-status" id="enhanced-status">
        <div class="enhanced-status-indicator"></div>
        <span class="enhanced-status-text">Ready</span>
      </div>
      <div class="enhanced-bhashini-metrics" id="enhanced-metrics">
        <div class="enhanced-metric">
          <span class="enhanced-metric-label">DOM Time:</span>
          <span class="enhanced-metric-value" id="dom-time">0ms</span>
        </div>
        <div class="enhanced-metric">
          <span class="enhanced-metric-label">Cache Hit:</span>
          <span class="enhanced-metric-value" id="cache-hit">0%</span>
        </div>
      </div>
    `;
    
    // Append elements
    this.overlayElement.appendChild(mainButton);
    this.overlayElement.appendChild(this.dropdownElement);
    
    // Add to page
    document.body.appendChild(this.overlayElement);
    
    // Store references
    this.languageSelector = mainButton;
    this.translateButton = document.getElementById('enhanced-translate-btn');
    this.statusIndicator = document.getElementById('enhanced-status');
    this.metricsDisplay = document.getElementById('enhanced-metrics');
  }

  setupEventListeners() {
    // Toggle dropdown on main button click
    this.languageSelector.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });
    
    // Handle language selection
    this.dropdownElement.addEventListener('click', (e) => {
      const languageOption = e.target.closest('.enhanced-language-option');
      if (languageOption) {
        const langCode = languageOption.dataset.lang;
        this.selectLanguage(langCode);
      }
    });
    
    // Handle translate button
    if (this.translateButton) {
      this.translateButton.addEventListener('click', () => {
        this.translatePage();
      });
    }
    
    // Handle benchmark button
    const benchmarkBtn = document.getElementById('enhanced-benchmark-btn');
    if (benchmarkBtn) {
      benchmarkBtn.addEventListener('click', () => {
        this.runBenchmark();
      });
    }
    
    // Handle cache stats button
    const cacheBtn = document.getElementById('enhanced-cache-btn');
    if (cacheBtn) {
      cacheBtn.addEventListener('click', () => {
        this.showCacheStats();
      });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.overlayElement.contains(e.target)) {
        this.hideDropdown();
      }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.hideDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.isVisible) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  showDropdown() {
    this.dropdownElement.classList.add('show');
    this.isVisible = true;
    this.languageSelector.querySelector('.enhanced-bhashini-arrow').style.transform = 'rotate(180deg)';
  }

  hideDropdown() {
    this.dropdownElement.classList.remove('show');
    this.isVisible = false;
    this.languageSelector.querySelector('.enhanced-bhashini-arrow').style.transform = 'rotate(0deg)';
  }

  selectLanguage(langCode) {
    this.currentLanguage = langCode;
    const language = this.supportedLanguages.find(lang => lang.code === langCode);
    
    if (language) {
      this.languageSelector.querySelector('.enhanced-bhashini-btn-text').textContent = language.label;
      
      // Update selected state in dropdown
      this.dropdownElement.querySelectorAll('.enhanced-language-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.lang === langCode) {
          option.classList.add('selected');
        }
      });
      
      // Save to localStorage
      localStorage.setItem('enhancedBhashiniLanguage', langCode);
      
      this.updateStatus(`Language set to ${language.label}`, 'success');
      console.log(`🌐 Enhanced Bhashini: Language set to ${language.label}`);
    }
  }

  async translatePage() {
    if (this.isTranslating) {
      this.updateStatus('Translation already in progress', 'warning');
      return;
    }
    
    if (!window.enhancedTranslatePage) {
      this.updateStatus('Enhanced utility not loaded', 'error');
      return;
    }
    
    this.isTranslating = true;
    this.updateStatus('Translating page...', 'processing');
    this.translateButton.disabled = true;
    this.translateButton.innerHTML = '<span class="enhanced-loading-spinner"></span> Translating...';
    
    try {
      await window.enhancedTranslatePage(this.currentLanguage);
      this.updateStatus('Translation completed!', 'success');
      this.updateMetrics();
    } catch (error) {
      this.updateStatus(`Translation failed: ${error.message}`, 'error');
      console.error('Enhanced Bhashini translation error:', error);
    } finally {
      this.isTranslating = false;
      this.translateButton.disabled = false;
      this.translateButton.innerHTML = '<span class="enhanced-translate-icon">🚀</span> Translate Page';
    }
  }

  async runBenchmark() {
    if (!window.runPerformanceBenchmark) {
      this.updateStatus('Benchmark function not available', 'error');
      return;
    }
    
    this.updateStatus('Running benchmark...', 'processing');
    
    try {
      await window.runPerformanceBenchmark();
      this.updateStatus('Benchmark completed!', 'success');
      this.updateMetrics();
    } catch (error) {
      this.updateStatus(`Benchmark failed: ${error.message}`, 'error');
    }
  }

  showCacheStats() {
    if (!window.enhancedGetCacheStats) {
      this.updateStatus('Cache stats not available', 'error');
      return;
    }
    
    try {
      const cacheStats = window.enhancedGetCacheStats();
      this.updateStatus(`Cache: ${cacheStats.cacheHits || 0} hits, ${cacheStats.cacheMisses || 0} misses`, 'info');
    } catch (error) {
      this.updateStatus('Failed to get cache stats', 'error');
    }
  }

  updateStatus(message, type = 'info') {
    if (!this.statusIndicator) return;
    
    const statusText = this.statusIndicator.querySelector('.enhanced-status-text');
    const statusIndicator = this.statusIndicator.querySelector('.enhanced-status-indicator');
    
    if (statusText) statusText.textContent = message;
    
    // Update status indicator class
    statusIndicator.className = `enhanced-status-indicator enhanced-status-${type}`;
    
    // Auto-clear status after 5 seconds
    setTimeout(() => {
      if (statusText) statusText.textContent = 'Ready';
      statusIndicator.className = 'enhanced-status-indicator';
    }, 5000);
  }

  updateMetrics() {
    if (!window.enhancedGetMetrics || !this.metricsDisplay) return;
    
    try {
      const metrics = window.enhancedGetMetrics();
      
      if (metrics.domTraversal) {
        const domTimeElement = document.getElementById('dom-time');
        if (domTimeElement) {
          domTimeElement.textContent = `${(metrics.domTraversal.traversalTime || 0).toFixed(2)}ms`;
        }
      }
      
      if (metrics.caching) {
        const cacheHitElement = document.getElementById('cache-hit');
        if (cacheHitElement) {
          cacheHitElement.textContent = `${(metrics.caching.cacheHitRate || 0).toFixed(1)}%`;
        }
      }
    } catch (error) {
      console.debug('Failed to update metrics:', error.message);
    }
  }

  loadSavedLanguage() {
    const savedLang = localStorage.getItem('enhancedBhashiniLanguage');
    if (savedLang && this.supportedLanguages.find(lang => lang.code === savedLang)) {
      this.selectLanguage(savedLang);
    }
  }

  updatePosition() {
    if (!this.overlayElement) return;
    
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024;
    
    if (isMobile) {
      this.overlayElement.style.left = 'auto';
      this.overlayElement.style.right = '10px';
      this.overlayElement.style.bottom = '10px';
      this.overlayElement.style.top = 'auto';
    } else if (isTablet) {
      this.overlayElement.style.left = 'auto';
      this.overlayElement.style.right = '20px';
      this.overlayElement.style.bottom = '20px';
      this.overlayElement.style.top = 'auto';
    } else {
      this.overlayElement.style.left = 'auto';
      this.overlayElement.style.right = '30px';
      this.overlayElement.style.bottom = '30px';
      this.overlayElement.style.top = 'auto';
    }
  }

  destroy() {
    if (this.overlayElement && this.overlayElement.parentNode) {
      this.overlayElement.parentNode.removeChild(this.overlayElement);
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.enhancedBhashiniOverlay = new EnhancedBhashiniOverlay();
  });
} else {
  window.enhancedBhashiniOverlay = new EnhancedBhashiniOverlay();
}

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EnhancedBhashiniOverlay;
}
