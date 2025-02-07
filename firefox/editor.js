(() => {
    let width = window.innerWidth;
    let height = window.innerHeight;

    let stage = new Konva.Stage({
        container: 'editor-container',
        width: width,
        height: height
    });

    let backgroundLayer = new Konva.Layer();
    stage.add(backgroundLayer);

    let transformer = new Konva.Transformer();
    backgroundLayer.add(transformer);

    stage.on('click', (e) => {
        if (e.target === stage) {
            transformer.nodes([]);
        } else {
            transformer.nodes([e.target]);
        }
        backgroundLayer.batchDraw();
    });

    let loadedImage = null;
    browser.storage.local.get('screenshotUri').then(result => {
        const screenshotUri = result.screenshotUri;
        if (screenshotUri) {
            const imageObj = new Image();
            imageObj.onload = () => {
                loadedImage = imageObj;
                stage.width(imageObj.width);
                stage.height(imageObj.height);

                const konvaScreenshot = new Konva.Image({
                   x: 0,
                   y: 0,
                   image: imageObj,
                   width: imageObj.width,
                   height: imageObj.height,
                });

                backgroundLayer.add(konvaScreenshot);
                backgroundLayer.draw();
                
            };
            imageObj.src = screenshotUri;
        }
    });

    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const drawBtn = document.getElementById('drawBtn');
    const thicknessInput = document.getElementById('thicknessInput');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearBtn');
    const addShapesBtn = document.getElementById('addShapesBtn');
    const shapeOptions = document.getElementById('shapeOptions');
    
    let selectedColor = colorPicker.value;
    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
    });
    
    let selectedThickness = thicknessInput.value;
    thicknessInput.addEventListener('input', () => {
        selectedThickness = thicknessInput.value;
    });

    saveBtn.addEventListener('click', () => {
        saveScreenshot();
    });

    cancelBtn.addEventListener('click', () => {
        cancelScreenshot();
    });

    clearBtn.addEventListener('click', () => {
        clearCanvas();
    });

    addTextBtn.addEventListener('click', () => {
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.style.position = 'absolute';
        textInput.style.left = `${stage.width() / 2}px`;
        textInput.style.top = `${stage.height() / 2}px`;
        textInput.style.zIndex = 1000;
        textInput.style.fontSize = '20px';
        textInput.style.border = `1px solid ${selectedColor}`;
        textInput.style.padding = '5px';
        textInput.style.backgroundColor = hexToRgba(selectedColor, 0.3);
        document.body.appendChild(textInput);
    
        textInput.focus();
    
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                let textValue = textInput.value.trim();
                if (textValue) {
                    let text = new Konva.Text({
                        x: parseFloat(textInput.style.left),
                        y: parseFloat(textInput.style.top),
                        text: textValue,
                        fontSize: 20,
                        fill: selectedColor,
                        draggable: true
                    });

                    text.on('click', () => {
                        transformer.nodes([text]);
                        transformer.moveToTop();
                    });
                    backgroundLayer.add(text);
                    backgroundLayer.draw();
                }

                document.body.removeChild(textInput);
            }
        });
    });
    

    let isDrawing = false;
    drawBtn.addEventListener('click', () => {
        isDrawing = !isDrawing;
        drawBtn.textContent = drawBtn.textContent === 'Draw' ? 'Stop Drawing' : 'Draw';
    });
    
    let currrentlyDrawing = null;
    stage.on('mousedown', (e) => {
        if (!isDrawing) return;

        const pos = stage.getPointerPosition();
        currrentlyDrawing = new Konva.Line({
            stroke: selectedColor,
            strokeWidth: parseInt(thicknessInput.value),
            globalCompositeOperation: 'source-over',
            points: [pos.x, pos.y],
        });
        backgroundLayer.add(currrentlyDrawing);
    });

    stage.on('mousemove', () => {
        if (!isDrawing || !currrentlyDrawing) return;

        const pos = stage.getPointerPosition();
        const newPoints = currrentlyDrawing.points().concat([pos.x, pos.y]);
        currrentlyDrawing.points(newPoints);
        backgroundLayer.batchDraw();
    });

    stage.on('mouseup touchend', () => {
        currrentlyDrawing = null;
    });

    addShapesBtn.addEventListener('click', () => {
        addShapesBtn.style.display = 'none';
        shapeOptions.style.display = 'block';
    });

    shapeOptions.addEventListener('click', (e) => {
        shapeOptions.style.display = 'none';
        addShapesBtn.style.display = 'block';
        addShape(e.target.getAttribute('data-shape'));
    });
    
    function saveScreenshot() {
        transformer.nodes([]);
        backgroundLayer.batchDraw();

        const editedScreenshotUri = stage.toDataURL();
        browser.runtime.sendMessage({
            action: 'saveScreenshot',
            screenshotUri: editedScreenshotUri
        });
        setTimeout(() => {
            window.close();
        }, 300);
    }

    function cancelScreenshot() {
        browser.storage.local.remove('screenshotUri');
        window.close();
    }

    function clearCanvas() {
        backgroundLayer.removeChildren();
        transformer.nodes([]);        

        if (loadedImage) {
            const konvaScreenshot = new Konva.Image({
                x: 0,
                y: 0,
                image: loadedImage,
                width: loadedImage.width,
                height: loadedImage.height,
             });

            backgroundLayer.add(konvaScreenshot);
            backgroundLayer.add(transformer);

        }
        backgroundLayer.batchDraw();
    }

    function addShape(shape) {
        let newShape;
        switch (shape) {
            case 'circle':
                newShape = new Konva.Circle({
                    x: stage.width() / 2,
                    y: stage.height() / 2,
                    radius: 50,
                    //fill: hexToRgba(selectedColor, 0.3),
                    stroke: selectedColor,
                    strokeWidth: parseInt(selectedThickness),
                    draggable: true
                });
                break;
            case 'rectangle':
                newShape = new Konva.Rect({
                    x: stage.width() / 2 - 50,
                    y: stage.height() / 2 - 50,
                    width: 100,
                    height: 100,
                    //fill: hexToRgba(selectedColor, 0.3),
                    stroke: selectedColor,
                    strokeWidth: parseInt(selectedThickness),
                    draggable: true
                });
                break;
            case 'line':
                newShape = new Konva.Line({
                    points: [stage.width() / 2, stage.height() / 2, stage.width() / 2 + 50, stage.height() / 2 + 50],
                    stroke: selectedColor,
                    strokeWidth: parseInt(selectedThickness),
                    draggable: true
                });
                break;
        }

        if (newShape) {
            newShape.on('click', () => {
                transformer.nodes([newShape]);
                transformer.moveToTop();
            });
            backgroundLayer.add(newShape);
            backgroundLayer.batchDraw();
        }
    }

    function hexToRgba(hex, alpha = 1) {
        hex = hex.replace(/^#/, '');
    
        let r, g, b;
        if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else if (hex.length === 8) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
            alpha = parseInt(hex.substring(6, 8), 16) / 255;
        } else {
            throw new Error("Invalid HEX color format");
        }
    
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
})();
