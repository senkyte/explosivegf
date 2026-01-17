console.log("🚀 GF Content script loaded on:", window.location.href);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("📨 Received message:", msg);
    
    if (msg.type === "updateGF") {
        const angerLevel = msg.anger;
        console.log("😡 Creating overlay with anger:", angerLevel);

        // Remove existing overlay
        const old = document.getElementById('gfOverlay');
        if (old) old.remove();

        // Create overlay
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
            animation: shake 0.5s infinite !important;
        `;

        // Add animation
        if (!document.getElementById('gfStyle')) {
            const style = document.createElement("style");
            style.id = 'gfStyle';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    10% { transform: translate(-2px, -2px) rotate(-1deg); }
                    20% { transform: translate(2px, 0px) rotate(1deg); }
                    30% { transform: translate(0px, 2px) rotate(0deg); }
                    40% { transform: translate(-2px, 0px) rotate(1deg); }
                    50% { transform: translate(2px, 2px) rotate(-1deg); }
                    60% { transform: translate(0px, -2px) rotate(0deg); }
                    70% { transform: translate(2px, 0px) rotate(-1deg); }
                    80% { transform: translate(-2px, 2px) rotate(1deg); }
                    90% { transform: translate(2px, -2px) rotate(0deg); }
                }
            `;
            document.head.appendChild(style);
        }

        // Face emoji
        const face = document.createElement("div");
        face.style.fontSize = "120px";
        if (angerLevel >= 80) face.textContent = "💥";
        else if (angerLevel >= 60) face.textContent = "😡";
        else if (angerLevel >= 40) face.textContent = "😠";
        else if (angerLevel >= 20) face.textContent = "😐";
        else face.textContent = "😊";
        overlay.appendChild(face);

        // Message
        const msg = document.createElement("div");
        msg.textContent = `CRAZY GF ALERT! (${angerLevel})`;
        msg.style.fontSize = "48px";
        msg.style.fontWeight = "bold";
        msg.style.marginTop = "20px";
        overlay.appendChild(msg);

        document.body.appendChild(overlay);
        console.log("✅ Overlay added to page!");

        // Remove after 4 seconds
        setTimeout(() => {
            overlay.remove();
            console.log("🗑️ Overlay removed");
        }, 4000);

        sendResponse({ success: true });
    }
    
    return true;
});