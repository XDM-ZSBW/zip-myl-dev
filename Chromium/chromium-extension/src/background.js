// This file contains the background script for the extension. It manages events and handles tasks that need to run in the background, such as listening for browser actions or messages from content scripts.

chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'someAction') {
        // Handle the action
        sendResponse({status: 'success'});
    }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "UPDATE_BADGE") {
    if (msg.offLimit) {
      chrome.action.setBadgeText({ text: "!", tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: "#FFA500", tabId: sender.tab.id });
    } else {
      chrome.action.setBadgeText({ text: "", tabId: sender.tab.id });
    }
  }
});

// Additional background script logic can be added here.