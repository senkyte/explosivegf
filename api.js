let ws;
let faceGesture = document.getElementById("faceGesture");
let gfText = document.getElementById("gfText");

// Initialize WebSocket connection
try {
    ws = new WebSocket('ws://localhost:8765');

    ws.onopen = () => {
        console.log("Connected to websocket port 8765.");
    }

    ws.onmessage = (e) => {
        try {
            const receivedData = JSON.parse(e.data);
            
            // Update face gesture if expression is provided
            if (receivedData.expression && faceGesture) {
                faceGesture.innerText = receivedData.expression;
            }
            
            // Update anger level if provided
            if (receivedData.anger_level !== undefined && typeof scale !== 'undefined') {
                scale = receivedData.anger_level;
                if (faceGesture) {
                    faceGesture.textContent = 'Anger: ' + scale;
                }
                // Update image based on new anger level
                if (typeof updateImage === 'function') {
                    updateImage();
                }
            }
            
            // Update girlfriend response text
            if (receivedData.response && gfText) {
                const userMsg = gfText.querySelector('p:first-child')?.textContent || '';
                gfText.innerHTML = userMsg + '<p><strong>Girlfriend:</strong> ' + receivedData.response + '</p>';
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    }

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
    
    // Make ws available globally
    window.ws = ws;
} catch (error) {
    console.error('Failed to create WebSocket connection:', error);
}