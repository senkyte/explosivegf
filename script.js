let scale;
let config;
let configPollInterval;

function updateImage() {
    if (!config) return; // Wait for config to load
    // Hide all images
    for (let i = 1; i <= config.images.length; i++) {
        const imgElement = document.getElementById('gfImg' + i);
        if (imgElement) {
            imgElement.style.display = 'none';
        }
    }
    // Find and show the appropriate image based on scale
    for (let i = 0; i < config.images.length; i++) {
        const imgConfig = config.images[i];
        if (scale >= imgConfig.range[0] && scale <= imgConfig.range[1]) {
            const imgElement = document.getElementById('gfImg' + (i + 1));
            if (imgElement) {
                imgElement.style.display = 'block';
            }
            break;
        }
    }
}

async function loadConfig() {
    try {
        const response = await fetch('config.json?t=' + Date.now()); // Add timestamp to prevent caching
        config = await response.json();
        scale = config.anger;
        
        // Update face gesture with anger level
        const faceGesture = document.getElementById('faceGesture');
        if (faceGesture) {
            faceGesture.textContent = 'Anger: ' + scale;
        }
        
        // Update image
        updateImage();
    } catch (error) {
        console.error('Failed to load config.json:', error);
    }
}

// Load config and initialize
document.addEventListener('DOMContentLoaded', async function () {
    // Load initial config
    await loadConfig();

    // Create images
    const gfSprite = document.getElementById('gfSprite');
    if (gfSprite && config) {
        for (let i = 0; i < config.images.length; i++) {
            const img = document.createElement('img');
            img.id = 'gfImg' + (i + 1); // IDs: gfImg1, gfImg2, etc.
            img.src = config.images[i].src;
            img.style.display = 'none';
            gfSprite.appendChild(img);
        }
    }

    // Initial update
    updateImage();
    
    // Poll config.json every 2 seconds to check for updates
    configPollInterval = setInterval(loadConfig, 2000);
});

// Send user message function
async function sendValue() {
    const userInput = document.getElementById('userInput');
    const gfText = document.getElementById('gfText');
    
    if (!userInput) return;
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Show user message
    if (gfText) {
        gfText.innerHTML = '<p><strong>You:</strong> ' + message + '</p><p>Waiting for response...</p>';
    }
    
    // Clear input
    userInput.value = '';
    
<<<<<<< HEAD
    // Try to send via WebSocket if available
    const websocket = window.ws || (typeof ws !== 'undefined' ? ws : null);
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify({ type: 'message', content: message }));
        console.log('Sent via WebSocket:', message);
=======
<<<<<<< ours
=======
    // Show loading state
>>>>>>> theirs
    gfText.innerHTML = '<p>Thinking...</p>';
    
    try {
        const response = await fetch('http://localhost:8888/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received from API:', data);
        
        if (data.success) {
<<<<<<< ours
            gfText.innerHTML = `<p>${data.response}</p>`;
            updateScale(data.anger_level);
=======
            // Update AI response text
            gfText.innerHTML = `<p>${data.response}</p>`;
            
            // Update image based on anger level (0-100 maps to 0-100 scale)
            // Higher anger = lower scale (more angry = angrier image)
            // 100 anger = 0 scale (most angry = gfLVL1), 0 anger = 100 scale (calm = gfLVL5)
            const invertedScale = 100 - data.anger_level;
            updateScale(invertedScale);
            
            // Update face gesture based on anger level
>>>>>>> theirs
            updateFaceGesture(data.anger_level);
            userInput.value = '';
        } else {
<<<<<<< ours
=======
            // Handle error response
>>>>>>> theirs
            gfText.innerHTML = `<p style="color: red;">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (error) {
        console.error('Error:', error);
        gfText.innerHTML = `<p style="color: red;">Failed to connect to server. Make sure the Flask server is running on http://localhost:8888</p>`;
    } finally {
        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = originalButtonText;
        userInput.focus();
    }
}

// Update face gesture based on anger level (higher = more angry)
function updateFaceGesture(angerLevel) {
<<<<<<< ours
    const angerLvl = document.getElementById('angerLvl');
    if (angerLvl) {
        angerLvl.textContent = angerLevel;
    }

=======
>>>>>>> theirs
    const faceGesture = document.getElementById('faceGesture');
    
    if (angerLevel >= 100) {
        faceGesture.textContent = 'KABOOM 💥';
    } else if (angerLevel >= 80) {
        faceGesture.textContent = 'Explosive/Cold War 💢';
    } else if (angerLevel >= 60) {
        faceGesture.textContent = 'Very Angry 😡';
    } else if (angerLevel >= 40) {
        faceGesture.textContent = 'Obviously Angry 😠';
    } else if (angerLevel >= 20) {
        faceGesture.textContent = 'Slightly Upset 😐';
>>>>>>> parent of ca2f3d3 (Merge branch 'main' of https://github.com/senkyte/explosivegf)
    } else {
        // Fallback: Try HTTP POST to /chat endpoint
        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (gfText) {
                    gfText.innerHTML = '<p><strong>You:</strong> ' + message + '</p><p><strong>Girlfriend:</strong> ' + data.response + '</p>';
                }
                // Force reload config to update anger level
                await loadConfig();
            } else {
                throw new Error('HTTP request failed');
            }
        } catch (error) {
            // If both WebSocket and HTTP fail, show error
            console.error('Failed to send message:', error);
            if (gfText) {
                gfText.innerHTML = '<p><strong>You:</strong> ' + message + '</p><p style="color: red;">Error: Could not connect to server. Make sure the backend is running.</p>';
            }
        }
    }
}

// Make sendValue available globally
window.sendValue = sendValue;