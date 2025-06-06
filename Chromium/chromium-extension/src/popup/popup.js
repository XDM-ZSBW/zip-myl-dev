// This file contains the JavaScript logic for the popup. It handles user interactions and communicates with the background script or content script as needed.

const QR_LINK = "https://master-website.example.com/link-extension"; // Replace with your real link

const SENSITIVE_WHITELIST = [
  'bankofamerica.com', 'chase.com', 'wellsfargo.com', 'citibank.com', 'paypal.com'
];
const SENSITIVE_BLACKLIST = [
  'example-badsite.com'
];

async function getCurrentTab() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function isSensitiveSite(url) {
  return SENSITIVE_WHITELIST.some(domain => url.includes(domain)) ||
         SENSITIVE_BLACKLIST.some(domain => url.includes(domain));
}

async function checkToken() {
  const { token } = await chrome.storage.local.get("token");
  if (!token) {
    document.getElementById("notoken").style.display = "block";
    document.getElementById("withtoken").style.display = "none";
  } else {
    document.getElementById("notoken").style.display = "none";
    document.getElementById("withtoken").style.display = "block";
    showSiteStatus();
  }
}

// Simulate token reception (for demo: click QR to set token)
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("qrcode")?.addEventListener("click", async () => {
    await chrome.storage.local.set({ token: "demo" });
    location.reload();
  });
  document.getElementById("sendlink").onclick = async () => {
    const email = document.getElementById("email").value;
    if (!email) return;
    document.getElementById("emailStatus").textContent = "Sending magic link... (simulated)";
    // Simulate sending magic link and generating token
    setTimeout(() => {
      document.getElementById("emailStatus").textContent = "Check your email for a magic link.";
      // Simulate QR code for 2FA
      document.getElementById("qrcode").style.display = "block";
      document.getElementById("qrdesc").style.display = "block";
      new QRCode(document.getElementById("qrcode"), `https://master-website.example.com/2fa?email=${encodeURIComponent(email)}`);
      // Simulate token set after 2FA
      setTimeout(async () => {
        await chrome.storage.local.set({ token: "secure-token-for-" + email });
        location.reload();
      }, 3000);
    }, 1500);
  };
  checkToken();
});

async function showSiteStatus() {
  const tab = await getCurrentTab();
  const url = tab.url;
  const isSensitive = isSensitiveSite(url);
  const siteStatus = document.getElementById("siteStatus");
  const turnoffBtn = document.getElementById("turnoff");
  if (isSensitive) {
    siteStatus.textContent = "This site is sensitive. Extension is OFF.";
    turnoffBtn.style.display = "none";
  } else {
    siteStatus.textContent = "Extension is monitoring forms on this site.";
    turnoffBtn.style.display = "block";
    turnoffBtn.onclick = async () => {
      let { userBlacklist } = await chrome.storage.local.get("userBlacklist");
      userBlacklist = userBlacklist || [];
      userBlacklist.push(new URL(url).hostname);
      await chrome.storage.local.set({ userBlacklist });
      siteStatus.textContent = "Extension turned off for this site.";
      turnoffBtn.style.display = "none";
      chrome.runtime.sendMessage({ type: "UPDATE_BADGE", hasData: true, offLimit: true });
    };
  }
  // Notify background to update badge if off-limits
  chrome.runtime.sendMessage({ type: "UPDATE_BADGE", hasData: isSensitive, offLimit: isSensitive });
}