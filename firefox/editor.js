(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const drawBtn = document.getElementById('drawBtn');
    const thicknessInput = document.getElementById('thicknessInput');
    const colorPicker = document.getElementById('colorPicker');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    browser.storage.local.get('screenshotUri').then(result => {
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
    let textBoxes = [];
    let selectedTextColor = colorPicker.value;

    colorPicker.addEventListener('input', () => {
        selectedTextColor = colorPicker.value;
    });

    drawBtn.addEventListener('click', () => {
        isDrawing = !isDrawing;
        drawBtn.textContent = isDrawing ? 'Stop Drawing' : 'Draw';
    });

    addTextBtn.addEventListener('click', () => {
        const textBox = document.createElement('input');
        textBox.style.position = 'absolute';
        textBox.style.left = '50px';
        textBox.style.top = '50px';
        textBox.style.border = '1px solid black';
        textBox.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        textBox.style.padding = '5px';
        textBox.style.color = selectedTextColor;
        document.body.appendChild(textBox);

        textBox.focus();

        textBox.addEventListener('mousedown', (e) => {
            const offsetX = e.clientX - textBox.getBoundingClientRect().left;
            const offsetY = e.clientY - textBox.getBoundingClientRect().top;
            const onMouseMove = (e) => {
                textBox.style.left = e.clientX - offsetX + 'px';
                textBox.style.top = e.clientY - offsetY + 'px';
            };

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        textBoxes.push(textBox);
    });

    ctx.lineWidth = 2;

    canvas.addEventListener('mousedown', (e) => {
        if (isDrawing) {
            const rect = canvas.getBoundingClientRect();
            const offsetX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const offsetY = (e.clientY - rect.top) * (canvas.height / rect.height);
            ctx.strokeStyle = colorPicker.value;
            ctx.lineWidth = thicknessInput.value;
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
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
            const rect = canvas.getBoundingClientRect();
            const offsetX = (e.clientX - rect.left) * (canvas.width / rect.width);
            const offsetY = (e.clientY - rect.top) * (canvas.height / rect.height);
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
    }

    thicknessInput.addEventListener('input', () => {
        ctx.lineWidth = thicknessInput.value;
    });

    cancelBtn.addEventListener('click', () => {
        window.close();
    });

    saveBtn.addEventListener('click', () => {
        textBoxes.forEach((textBox) => {
            ctx.font = '20px Arial';
            ctx.fillStyle = selectedTextColor;
            ctx.fillText(textBox.value, parseInt(textBox.style.left), parseInt(textBox.style.top) + 20);
            textBox.remove();
        });

        
        textBoxes = [];

        const editedScreenshotUri = canvas.toDataURL();
        browser.runtime.sendMessage({
            action: 'saveScreenshot',
            screenshotUri: editedScreenshotUri
        });
        window.close();
    });
})();
