(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const saveBtn = document.getElementById('saveBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const drawBtn = document.getElementById('drawBtn');
    
    // Make canvas fullscreen
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Get screenshot URI from local storage
    chrome.storage.local.get('screenshotUri').then(result => {
        const screenshotUri = result.screenshotUri;
        if (screenshotUri) {
            const image = new Image();
            image.onload = () => {
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
            };
            image.src = screenshotUri;
        }
    });

    let isDrawing = false;
    let startX, startY;
    let isAddingText = false;  // Flag to track if the "Add Text" button was clicked

    // Start/Stop drawing
    drawBtn.addEventListener('click', () => {
        isDrawing = !isDrawing;
        if (isDrawing) {
            drawBtn.textContent = 'Stop Drawing';
        } else {
            drawBtn.textContent = 'Draw';
        }
    });

    // Set default drawing properties
    ctx.lineWidth = 2; // Set line width for better drawing precision

    // Drawing logic
    canvas.addEventListener('mousedown', (e) => {
        if (isDrawing) {
            // Set stroke color to red every time before drawing
            ctx.strokeStyle = 'red'; // Ensure stroke color is red
            startX = e.offsetX;
            startY = e.offsetY;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            canvas.addEventListener('mousemove', onMouseMove);
        }
    });

    canvas.addEventListener('mouseup', () => {
        if (isDrawing) {
            canvas.removeEventListener('mousemove', onMouseMove);
        }
    });

    function onMouseMove(e) {
        if (isDrawing) {
            const currentX = e.offsetX;
            const currentY = e.offsetY;
            ctx.lineTo(currentX, currentY); // Draw a line to the current mouse position
            ctx.stroke(); // Apply the stroke (draw it)
        }
    }

    // Add text to canvas only after clicking the "Add Text" button
    addTextBtn.addEventListener('click', () => {
        isAddingText = !isAddingText; // Toggle the flag
        if (isAddingText) {
            addTextBtn.textContent = 'Stop Adding Text'; // Change button text to "Stop Adding Text"
        } else {
            addTextBtn.textContent = 'Add Text'; // Reset button text
        }
    });

    // Listen for click events on canvas only if the user is adding text
    canvas.addEventListener('click', (e) => {
        if (isAddingText) {
            const text = prompt("Enter text to add to the screenshot:");
            if (text) {
                const x = e.offsetX; // Get X position of click
                const y = e.offsetY; // Get Y position of click
                ctx.font = '30px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText(text, x, y); // Add the text where the user clicked
            }
        }
    });

    // Save and upload the edited screenshot
    saveBtn.addEventListener('click', () => {
        const editedScreenshotUri = canvas.toDataURL();
        chrome.runtime.sendMessage({
            action: 'saveScreenshot',
            screenshotUri: editedScreenshotUri
        });
        window.close(); // Close the tab after saving
    });
})();
