// Handle extension icon clicks
chrome.action.onClicked.addListener(async (tab) => {
  // Only work on LinkedIn and Indeed pages
  if (tab.url && (tab.url.includes('linkedin.com') || tab.url.includes('indeed.com'))) {
    try {
      // Send message to content script to toggle the panel
      await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    } catch (error) {
      console.log('Could not send message to content script:', error);
    }
  }
});