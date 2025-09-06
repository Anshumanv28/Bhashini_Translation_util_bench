/**
 * Bhashini Utility Initialization Script
 * Sets up required variables and configuration for the Bhashini utility
 */

// Set required variables that the Bhashini utility expects
window.TRANSLATION_PLUGIN_API_BASE_URL = "https://translation-plugin.bhashini.co.in";
window.mixedCode = false;
window.languageDetection = false;
window.pageSourceLanguage = "en";
window.languageIconColor = "#1D0A69";

// Mock the currentScript attributes that the utility expects
// This needs to be a global variable, not window.currentScript
var currentScript = {
    getAttribute: function(attr) {
        const attributes = {
            "default-translated-language": "en",
            "translation-language-list": "en,hi,ta,te,kn,ml,gu,mr,pa,or,as,brx,doi,gom,ks,mai,mni,ne,sa,sat,sd,ur",
            "initial_preferred_language": "en",
            "language_order": "en,hi,ta,te,kn,ml,gu,mr,pa,or,as,brx,doi,gom,ks,mai,mni,ne,sa,sat,sd,ur",
            "mixed-code": "false",
            "language-detection": "false",
            "page-source-language": "en",
            "language-icon-color": "#1D0A69"
        };
        console.log(`🔍 currentScript.getAttribute("${attr}") called, returning:`, attributes[attr] || null);
        return attributes[attr] || null;
    }
};

// Also set it on window for compatibility
window.currentScript = currentScript;

console.log('✅ Bhashini utility initialization complete');
console.log('🔍 currentScript mock created:', currentScript);
console.log('🔍 Testing getAttribute calls:');
console.log('  - default-translated-language:', currentScript.getAttribute('default-translated-language'));
console.log('  - mixed-code:', currentScript.getAttribute('mixed-code'));
console.log('  - page-source-language:', currentScript.getAttribute('page-source-language'));
