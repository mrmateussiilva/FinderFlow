// Background service worker for Chrome extension
console.log('WhatsApp CRM Extension - Background worker loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('WhatsApp CRM Extension installed');
});
