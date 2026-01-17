// -------------------
// Global variables
// -------------------
let scale = 75; // Initial anger level (0 = angry, 100 = calm)

// -------------------
// Load saved messages on startup
// -------------------
async function loadMessages() {
    const result = await chrome.storage.local.get(['chatMessages', 'angerLevel']);
    const chatBox = document.getElementById('chatBox');
    
    if (result.chatMessages && result.chatMessages.length > 0) {
        chatBox.innerHTML = ''; // Clear default message
        result.chatMessages.forEach(msg => {
            const msgElement = document.createElement("div");
            msgElement.setAttribute("class", `card ${msg.type}`);
            msgElement.innerText = msg.text;
            chatBox.appendChild(msgElement);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    
    // Restore anger level (but don't update image yet)
    if (result.angerLevel !== undefined) {
        scale = 100 - result.angerLevel;
        updateFaceGesture(result.angerLevel);
    }
}

// -------------------
// Save messages to storage
// -------------------
async function saveMessages() {
    const chatBox = document.getElementById('chatBox');
    const messages = [];
    
    chatBox.querySelectorAll('.card').forEach(card => {
        messages.push({
            type: card.classList.contains('userBubble') ? 'userBubble' : 'aiBubble',
            text: card.innerText
        });
    });
    
    await chrome.storage.local.set({ 
        chatMessages: messages,
        angerLevel: 100 - scale
    });
}

// -------------------
// Update scale and image
// -------------------
function updateScale(value) {
    scale = parseInt(value);
    updateImage();
}

function updateImage() {
    // Hide all images
    for (let i = 1; i <= 5; i++) {
        const img = document.getElementById('gfImg' + i);
        if (img) img.style.display = 'none';
    }

    // Determine which image to show based on scale
    let imageIndex;
    if (scale < 20) imageIndex = 1;
    else if (scale < 40) imageIndex = 2;
    else if (scale < 60) imageIndex = 3;
    else if (scale < 80) imageIndex = 4;
    else imageIndex = 5;

    const img = document.getElementById('gfImg' + imageIndex);
    if (img) img.style.display = 'block';
}

// -------------------
// Update face gesture
// -------------------
function updateFaceGesture(angerLevel) {
    const faceGesture = document.getElementById('faceGesture');
    const angerLvlDiv = document.getElementById('angerLvl');
    if (!faceGesture) return;

    if (angerLevel >= 80) faceGesture.textContent = 'Explosive 💥';
    else if (angerLevel >= 60) faceGesture.textContent = 'Very Angry 😡';
    else if (angerLevel >= 40) faceGesture.textContent = 'Angry 😠';
    else if (angerLevel >= 20) faceGesture.textContent = 'Upset 😐';
    else faceGesture.textContent = 'Calm 😊';
    
    const rageBar = document.getElementById('rageBar');
    rageBar.style.width = angerLevel + "%";
    
    if (angerLvlDiv) {
        angerLvlDiv.textContent = `Anger Level: ${angerLevel}`;
    }
    
    // Update badge
    chrome.runtime.sendMessage({
        type: "updateAnger",
        anger: angerLevel
    });
}

// -------------------
// Send user message to backend
// -------------------
async function sendValue() {
    const userInput = document.getElementById('userInput');
    const gfText = document.getElementById('gfText');
    const gfSprite = document.getElementById('gfSprite');
    const message = userInput.value.trim();
    
    if (!message) {
        alert('Please enter a message!');
        return;
    }

    userInput.disabled = true;
    const sendButton = document.getElementById('sendButton');
    const originalButtonText = sendButton.textContent;
    
    let newElement = document.createElement("div");
    newElement.setAttribute("class", "card userBubble");
    newElement.innerText = message;
    
    const chatBox = document.getElementById("chatBox");
    chatBox.appendChild(newElement);
    
    sendButton.disabled = true;
    sendButton.textContent = '...';

    // Show loading sprite
    if (gfSprite) {
        for (let i = 1; i <= 5; i++) {
            const img = document.getElementById('gfImg' + i);
            if (img) img.style.display = 'none';
        }

        let loadingImg = document.getElementById('gfLoading');
        if (!loadingImg) {
            loadingImg = document.createElement('img');
            loadingImg.id = 'gfLoading';
            loadingImg.src = 'gfLoading.gif';
            loadingImg.style.width = '300px';
            loadingImg.style.height = 'auto';
            gfSprite.appendChild(loadingImg);
        }
        loadingImg.style.display = 'block';
    }
   
    let newAiElement = document.createElement("div");
    newAiElement.setAttribute("class", "card aiBubble");
    newAiElement.innerText = "";
    chatBox.appendChild(newAiElement);
    chatBox.scrollTop = chatBox.scrollHeight;
    
    let dots = 0;
    const loadingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        newAiElement.innerText = ".".repeat(dots); 
    }, 500);

    try {
        const response = await fetch('http://18.143.187.4:8888/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        clearInterval(loadingInterval);

        if (data.success) {
            newAiElement.innerText = data.response;
            const invertedScale = 100 - data.anger_level;
            updateScale(invertedScale);
            updateFaceGesture(data.anger_level);
            userInput.value = '';
            
            // Save messages after each interaction
            await saveMessages();
        } else {
            gfText.innerHTML = `<p style="color: red;">Error: ${data.error || 'Unknown error'}</p>`;
        }
    } catch (err) {
        console.error(err);
        clearInterval(loadingInterval);
        newAiElement.innerText = "Failed to connect to server!";
    } finally {
        // Hide loading and show normal sprite
        if (gfSprite) {
            const loadingImg = document.getElementById('gfLoading');
            if (loadingImg) loadingImg.style.display = 'none';
            updateImage();
        }

        userInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = originalButtonText;
        userInput.focus();
    }
}

// -------------------
// Initialize DOM elements
// -------------------
document.addEventListener('DOMContentLoaded', async function() {
    const gfSprite = document.getElementById('gfSprite');
    if (gfSprite) {
        for (let i = 1; i <= 5; i++) {
            const img = document.createElement('img');
            img.id = 'gfImg' + i;
            img.src = `image${i}.gif`;
            img.style.display = 'none';
            img.style.width = '300px';
            img.style.height = 'auto';

            img.onerror = function() {
                const placeholder = document.createElement('div');
                placeholder.id = this.id;
                placeholder.style.width = '300px';
                placeholder.style.height = '300px';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.style.background = ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#b794f6'][i-1];
                placeholder.style.color = 'white';
                placeholder.style.fontSize = '48px';
                placeholder.style.fontWeight = 'bold';
                placeholder.textContent = ['💥', '😡', '😠', '😐', '😊'][i-1];
                this.parentNode.replaceChild(placeholder, this);
            };

            gfSprite.appendChild(img);
        }
    }

    // Load saved messages AFTER DOM is ready
    await loadMessages();
    
    // Show the sprite based on current scale
    updateImage();

    // Send button
    const sendButton = document.getElementById('sendButton');
    if (sendButton) {
        sendButton.addEventListener('click', function(e) {
            e.preventDefault();
            sendValue();
        });
    }

    // Enter key triggers send
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendValue();
            }
        });
    }
});