console.log("🚀 GF Content script loaded on:", window.location.href);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📨 Received message:", msg);
    
    if (msg.type === "updateGF") {
        const angerLevel = msg.anger;
        console.log("😡 Creating overlay with anger:", angerLevel);

        // Remove existing overlay
        const old = document.getElementById('gfOverlay');
        if (old) {
            console.log("🗑️ Removing old overlay");
            old.remove();
        }

        // Determine emoji based on anger
        let emoji;
        if (angerLevel >= 80) emoji = "💥";
        else if (angerLevel >= 60) emoji = "😡";
        else if (angerLevel >= 40) emoji = "😠";
        else if (angerLevel >= 20) emoji = "😐";
        else emoji = "😊";

        // Create overlay container
        const overlay = document.createElement("div");
        overlay.id = 'gfOverlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(255, 0, 100, 0.9) !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            color: white !important;
            font-family: Arial, sans-serif !important;
            pointer-events: none !important;
        `;

        // Add shake animation
        if (!document.getElementById('gfShakeStyle')) {
            const style = document.createElement("style");
            style.id = 'gfShakeStyle';
            style.textContent = `
                @keyframes gfShake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    10% { transform: translate(-5px, -5px) rotate(-2deg); }
                    20% { transform: translate(5px, 0px) rotate(2deg); }
                    30% { transform: translate(0px, 5px) rotate(0deg); }
                    40% { transform: translate(-5px, 0px) rotate(2deg); }
                    50% { transform: translate(5px, 5px) rotate(-2deg); }
                    60% { transform: translate(0px, -5px) rotate(0deg); }
                    70% { transform: translate(5px, 0px) rotate(-2deg); }
                    80% { transform: translate(-5px, 5px) rotate(2deg); }
                    90% { transform: translate(5px, -5px) rotate(0deg); }
                }
                #gfOverlay {
                    animation: gfShake 0.5s infinite !important;
                }
            `;
            document.head.appendChild(style);
            console.log("✅ Animation style added");
        }

        // Face emoji
        const face = document.createElement("div");
        face.style.cssText = `
            font-size: 120px !important;
            margin-bottom: 20px !important;
        `;
        face.textContent = emoji;
        overlay.appendChild(face);

        // Message text
        const msgText = document.createElement("div");
        msgText.style.cssText = `
            font-size: 48px !important;
            font-weight: bold !important;
            text-shadow: 3px 3px 6px rgba(0,0,0,0.8) !important;
        `;
        msgText.textContent = `CRAZY GF ALERT! (${angerLevel})`;
        overlay.appendChild(msgText);

        // Insert at the very end of body (or create body if it doesn't exist)
        if (document.body) {
            document.body.appendChild(overlay);
            console.log("✅ Overlay appended to body");
        } else {
            // If body doesn't exist yet, wait for it
            const observer = new MutationObserver(() => {
                if (document.body) {
                    document.body.appendChild(overlay);
                    console.log("✅ Overlay appended to body (after waiting)");
                    observer.disconnect();
                }
            });
            observer.observe(document.documentElement, { childList: true });
            console.log("⏳ Waiting for body to exist...");
        }

        // Remove after 4 seconds
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.remove();
                console.log("🗑️ Overlay removed after timeout");
            }
        }, 4000);

        sendResponse({ success: true });
    }
    
    return true;
});