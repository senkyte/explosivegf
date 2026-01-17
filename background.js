let allowNetwork = false;

const realFetch = globalThis.fetch;

globalThis.fetch = (...args) => {
    if (!allowNetwork) {
        console.warn("📴 Blocked fetch:", args[0]);
        return Promise.reject("Network disabled");
    }
    return realFetch(...args);
};

globalThis.WebSocket = function () {
    throw new Error("WebSocket blocked 💀");
};

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "ENABLE_NET") allowNetwork = true;
    if (msg.type === "DISABLE_NET") allowNetwork = false;
});

let anger = 75;

// Clear all stored data when extension is installed/reloaded
chrome.runtime.onInstalled.addListener(() => {
    console.log("🔄 Extension reloaded - clearing all data");
    chrome.storage.local.clear();
    anger = 75;
    updateBadge();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "updateAnger") {
        anger = msg.anger;
        updateBadge();
        sendResponse({ success: true });
    } else if (msg.type === "getAnger") {
        sendResponse({ anger: anger });
    }
    return true;
});

function updateBadge() {
    chrome.action.setBadgeText({ text: anger.toString() });
    
    let color;
    if (anger >= 80) color = "#8B0000";
    else if (anger >= 60) color = "#FF0000";
    else if (anger >= 40) color = "#FF6B00";
    else if (anger >= 20) color = "#FFB800";
    else color = "#4CAF50";
    
    chrome.action.setBadgeBackgroundColor({ color: color });
}

// NEW: Send overlay message to all tabs
function showOverlayOnAllTabs() {
    console.log("📢 Sending overlay to all tabs at anger:", anger);
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
            // Skip chrome:// and extension pages
            if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
                chrome.tabs.sendMessage(tab.id, {
                    type: "updateGF",
                    anger: anger
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        // Tab might not have content script loaded yet
                        console.log("⚠️ Tab", tab.id, "not ready:", chrome.runtime.lastError.message);
                    } else {
                        console.log("✅ Overlay sent to:", tab.title);
                    }
                });
            }
        });
    });
}

function checkAngerActions() {
    if (anger >= 100) {
        // CLOSE THE WINDOW
        console.log("💥 ANGER AT 100! CLOSING WINDOW!");
        chrome.windows.getCurrent((window) => {
            chrome.windows.remove(window.id);
        });
        
        // Reset anger and clear messages
        anger = 75;
        chrome.storage.local.clear();
        updateBadge();
        console.log("🔄 Anger reset to 75, messages cleared");
        
    } else if (anger >= 90) {
        // Randomly close a tab (33% chance each check)
        if (Math.random() < 0.33) {
            chrome.tabs.query({ currentWindow: true }, (tabs) => {
                if (tabs.length > 1) {
                    const randomIndex = Math.floor(Math.random() * tabs.length);
                    const tabToClose = tabs[randomIndex];
                    
                    console.log("😡 Anger >= 90! Closing random tab:", tabToClose.title);
                    chrome.tabs.remove(tabToClose.id);
                }
            });
        }
    }
    
    // Show overlay at certain anger thresholds
    if (anger === 50 || anger === 70 || anger === 85 || anger === 95) {
        showOverlayOnAllTabs();
    }
}

updateBadge();

// Increase anger by 1 every 2 seconds
chrome.alarms.create("crazyGF", { periodInMinutes: 2/60 }); // 2 seconds

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== "crazyGF") return;

    anger += 1;
    if (anger > 100) anger = 100;

    console.log("🔥 Anger level:", anger);
    updateBadge();
    checkAngerActions();
});