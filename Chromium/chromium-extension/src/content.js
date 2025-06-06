// Helper: Get current page's unique key
function getPageKey() {
  return location.origin + location.pathname;
}

async function isSensitiveOrBlacklisted() {
  const SENSITIVE_WHITELIST = [
    'bankofamerica.com', 'chase.com', 'wellsfargo.com', 'citibank.com', 'paypal.com'
  ];
  const SENSITIVE_BLACKLIST = [
    'example-badsite.com'
  ];
  const hostname = location.hostname;
  let { userBlacklist } = await chrome.storage.local.get("userBlacklist");
  userBlacklist = userBlacklist || [];
  return SENSITIVE_WHITELIST.some(domain => hostname.includes(domain)) ||
         SENSITIVE_BLACKLIST.some(domain => hostname.includes(domain)) ||
         userBlacklist.includes(hostname);
}

// On page load, check if we have saved data for this page
(async () => {
  if (await isSensitiveOrBlacklisted()) return;
  const key = getPageKey();
  const data = (await chrome.storage.local.get("formdata"))?.formdata || {};
  const hasData = !!data[key];
  chrome.runtime.sendMessage({ type: "UPDATE_BADGE", hasData });
})();

// Listen for autofill request from popup
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.type === "AUTOFILL") {
    const key = getPageKey();
    const data = (await chrome.storage.local.get("formdata"))?.formdata || {};
    if (!data[key]) return;
    for (const [field, value] of Object.entries(data[key])) {
      let el = document.querySelector(`[name="${field}"], [id="${field}"]`);
      if (el) el.value = value;
    }
    sendResponse({ success: true });
  }
});