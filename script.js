let scale;
let config;
let configPollInterval;

function updateScale(value) {
    scale = parseInt(value);
    console.log('updateScale called with:', value, 'scale is now:', scale);
    updateImage();
}

function updateImage() {
    console.log('updateImage called, scale:', scale);
    
    // If config exists, use config-based logic
    if (config && config.images) {
        // Hide all images
        for (let i = 1; i <= config.images.length; i++) {
            const imgElement = document.getElementById('gfImg' + i);
            if (imgElement) {
                imgElement.style.display = 'none';
            }
        }
        
        // Find and show the appropriate image based on scale
        // Use < for upper bound to avoid overlaps: [0,20), [20,40), [40,60), [60,80), [80,100]
        let imageIndex = -1;
        for (let i = 0; i < config.images.length; i++) {
            const imgConfig = config.images[i];
            const inRange = scale >= imgConfig.range[0] && 
                           (i === config.images.length - 1 ? scale <= imgConfig.range[1] : scale < imgConfig.range[1]);
            
            if (inRange) {
                imageIndex = i + 1;
                break;
            }
        }
        
        // Fallback: if scale > 100, show last image
        if (imageIndex === -1 && scale > 100) {
            imageIndex = config.images.length;
        }
        
        console.log('Showing image index:', imageIndex);
        
        if (imageIndex > 0) {
            const imgElement = document.getElementById('gfImg' + imageIndex);
            if (imgElement) {
                imgElement.style.display = 'block';
                console.log('Displayed:', imgElement.id);
            } else {
                console.error('Image element not found:', 'gfImg' + imageIndex);
            }
        }
    } else {
        console.log('No config, using fallback');
        // Fallback: simple logic for gfLVL1-5 images
        for (let i = 1; i <= 5; i++) {
            const imgElement = document.getElementById('gfImg' + i);
            if (imgElement) {
                imgElement.style.display = 'none';
            }
        }
        // Show the appropriate image based on scale (0-100 maps to 1-5)
        let index = Math.floor(scale / 25) + 1;
        if (index > 5) index = 5;
        if (index < 1) index = 1;
        const imgElement = document.getElementById('gfImg' + index);
        if (imgElement) {
            imgElement.style.display = 'block';
        }
    }
}

async function loadConfig() {
    try {
        const response = await fetch('config.json?t=' + Date.now());
        config = await response.json();
        console.log('Config loaded:', config);
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
    console.log('DOM loaded');
    
    // Load initial config
    await loadConfig();

    // Create images
    const gfSprite = document.getElementById('gfSprite');
    if (gfSprite && config) {
        console.log('Creating images for config:', config);
        for (let i = 0; i < config.images.length; i++) {
            const img = document.createElement('img');
            img.id = 'gfImg' + (i + 1);
            img.src = 'image' + (i + 1) + '.gif';
            img.style.display = 'none';
            img.style.width = '200px'; // Add some default styling
            img.onerror = function() {
                console.error('Failed to load image:', this.src);
                // Show placeholder
                this.alt = 'Image ' + (i + 1) + ' (not found)';
                this.style.display = 'block';
                this.style.background = '#ddd';
                this.style.height = '200px';
            };
            gfSprite.appendChild(img);
            console.log('Created image:', img.id, img.src);
        }
    } else {
        console.error('gfSprite or config not found', {gfSprite, config});
    }

    // Initial update
    updateImage();
    
    // Set initial anger level display
    updateFaceGesture(75);
});

// Send message to AI and update UI
async function sendValue() {
    const userInput = document.getElementById('userInput');
    const gfText = document.getElementById('gfText');
    const message = userInput.value.trim();
    
    if (!message) {
        alert('Please enter a message!');
        return;
    }
    
    userInput.disabled = true;
    const sendButton = document.getElementById('sendButton');
    const originalButtonText = sendButton.textContent;
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    
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
            gfText.innerHTML = `<p>${data.response}</p>`;
            updateScale(data.anger_level);
            updateFaceGesture(data.anger_level);
            userInput.value = '';
        } else {
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
    const angerLvl = document.getElementById('angerLvl');
    if (angerLvl) {
        angerLvl.textContent = angerLevel;
    }

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
    } else {
        faceGesture.textContent = 'Calm/Happy 😊';
    }
}

// Allow Enter key to send message
document.addEventListener('DOMContentLoaded', function() {
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sendValue();
        });
    }
    
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                sendValue();
            }
        });
    }
});