(() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const addTextBtn = document.getElementById('addTextBtn');
    const drawBtn = document.getElementById('drawBtn');
    const thicknessInput = document.getElementById('thicknessInput');
    const colorPicker = document.getElementById('colorPicker');
    const clearBtn = document.getElementById('clearBtn');
    const addShapesBtn = document.getElementById('addShapesBtn');
    const shapeOptions = document.getElementById('shapeOptions');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let loadedImage = null;
    chrome.storage.local.get('screenshotUri').then(result => {
        const screenshotUri = result.screenshotUri;
        if (screenshotUri) {
            const image = new Image();
            image.onload = () => {
                loadedImage = image;
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = screenshotUri;
        }
    });
    
    let selectedColor = colorPicker.value;
    colorPicker.addEventListener('input', () => {
        selectedColor = colorPicker.value;
    });
    
    let textBoxes = [];
    addTextBtn.addEventListener('click', () => {
        const textBox = document.createElement('input');
        textBox.style.position = 'absolute';
        textBox.style.left = canvas.width / 2 + 'px';
        textBox.style.top = canvas.height / 2 + 'px';
        textBox.style.border = '1px solid black';
        textBox.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        textBox.style.padding = '5px';
        textBox.style.color = selectedColor;
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

    function DrawFreehand(ctx, lineWidth, color) {
        this.ctx = ctx;
        this.color = color;
        this.lineWidth = lineWidth;
        this.path = [];
    
        this.addPoint = function (x, y) {
            this.path.push({ x, y });
            this.draw();
        };
    
        this.draw = function () {
            if (this.path.length < 2) return;
    
            this.ctx.beginPath();
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.moveTo(this.path[0].x, this.path[0].y);
            for (let i = 1; i < this.path.length; i++) {
                this.ctx.lineTo(this.path[i].x, this.path[i].y);
            }
            this.ctx.stroke();
        };
    }

    ctx.lineWidth = 2;
    let freehandDrawing = [];
    let currentDrawing = null;
    let isDrawing = false;

    drawBtn.addEventListener("click", () => {
    isDrawing = !isDrawing;
    drawBtn.textContent = isDrawing ? "Stop Drawing" : "Draw";
    });

    canvas.addEventListener("mousedown", (e) => {
        if (!isDrawing) return;

        const rect = canvas.getBoundingClientRect();
        const offsetX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const offsetY = (e.clientY - rect.top) * (canvas.height / rect.height);

        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = thicknessInput.value;

        currentDrawing = new DrawFreehand(ctx, ctx.lineWidth, ctx.strokeStyle);
        currentDrawing.addPoint(offsetX, offsetY);
        freehandDrawing.push(currentDrawing);

        canvas.addEventListener("mousemove", onMouseMove);
    });

    canvas.addEventListener("mouseup", () => {
        canvas.removeEventListener("mousemove", onMouseMove);
    });

    function onMouseMove(e) {
        if (!isDrawing || !currentDrawing) return;
    
        const rect = canvas.getBoundingClientRect();
        const offsetX = (e.clientX - rect.left) * (canvas.width / rect.width);
        const offsetY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
        currentDrawing.addPoint(offsetX, offsetY);
    }

    thicknessInput.addEventListener('input', () => {
        ctx.lineWidth = thicknessInput.value;
    });

    addShapesBtn.addEventListener('click', () => {
        addShapesBtn.style.display = 'none';
        shapeOptions.style.display = shapeOptions.style.display === 'none' ? 'block' : 'none';
    });

    shapeOptions.addEventListener('click', (e) => {
        shapeOptions.style.display = 'none';
        addShapesBtn.style.display = 'block';
        addShape(e.target.getAttribute('data-shape'));
    });

    function addShape(shape) {
        switch (shape) {
            case 'circle':
                drawCircle();
                break;
            case 'rectangle':
                drawRectangle();
                break;
            case 'line':
                drawLine();
                break;
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

    let shapesData = [];
    let totalShapes = [];
    let shapeIdCounter = 0;
    function drawCircle() {
        const circle = document.createElement('div');
        circle.style.position = 'absolute';
        circle.style.left = canvas.width / 2 + 'px';
        circle.style.top = canvas.height / 2 + 'px';
        circle.style.width = '100px';
        circle.style.height = '100px';
        circle.style.border = `2px solid ${selectedColor}`;
        circle.style.borderRadius = '50%';
        let rgbaColor = hexToRgba(selectedColor, 0.3);
        circle.style.backgroundColor = rgbaColor;
        document.body.appendChild(circle);

        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '10px';
        resizeHandle.style.height = '10px';
        resizeHandle.style.border = '2px solid black';
        resizeHandle.style.borderRadius = '50%';
        resizeHandle.style.backgroundColor = 'white';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.left = 'calc(100% - 5px)';
        resizeHandle.style.top = '-5px';
        circle.appendChild(resizeHandle);

        shapeIdCounter++;
        const circleId = shapeIdCounter;

        circle.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) return;
            const offsetX = e.clientX - circle.getBoundingClientRect().left;
            const offsetY = e.clientY - circle.getBoundingClientRect().top;
            const onMouseMove = (e) => {
                circle.style.left = e.clientX - offsetX + 'px';
                circle.style.top = e.clientY - offsetY + 'px';

                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                const shape = shapesData.find(shape => shape.id === circleId);
                if (shape) {
                    shape.xStart = newX;
                    shape.yStart = newY;
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = parseInt(circle.style.width);
            const startHeight = parseInt(circle.style.height);
    
            const onMouseMove = (e) => {
                let newWidth = startWidth + (e.clientX - startX);
                let newHeight = startHeight + (e.clientY - startY);

                newWidth = Math.max(20, newWidth);
                newHeight = newWidth;
    
                circle.style.width = newWidth + 'px';
                circle.style.height = newHeight + 'px';

                const shape = shapesData.find(shape => shape.id === circleId);
                if (shape) {
                    shape.radius = newWidth / 2;
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });

        let circleBounds = circle.getBoundingClientRect();
        shapesData.push({
            id: circleId,
            type: 'circle',
            color: selectedColor,
            xStart: parseInt(circleBounds.left),
            yStart: parseInt(circleBounds.top),
            radius: circleBounds.width / 2
        });
        totalShapes.push(circle);
    }

    function drawRectangle() {
        const rectangle = document.createElement('div');
        rectangle.style.position = 'absolute';
        rectangle.style.left = canvas.width / 2 + 'px';
        rectangle.style.top = canvas.height / 2 + 'px';
        rectangle.style.width = '120px';
        rectangle.style.height = '80px';
        rectangle.style.border = `2px solid ${selectedColor}`;
        let rgbaColor = hexToRgba(selectedColor, 0.3);
        rectangle.style.backgroundColor = rgbaColor;
        document.body.appendChild(rectangle);

        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.width = '10px';
        resizeHandle.style.height = '10px';
        resizeHandle.style.border = '2px solid black';
        resizeHandle.style.backgroundColor = 'white';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.right = '-5px';
        resizeHandle.style.bottom = '-5px';
        rectangle.appendChild(resizeHandle);

        shapeIdCounter++;
        const rectId = shapeIdCounter;

        let rectBounds = rectangle.getBoundingClientRect();
        shapesData.push({
            id: rectId,
            type: 'rectangle',
            color: selectedColor,
            xStart: rectBounds.left,
            yStart: rectBounds.top,
            xEnd: rectBounds.right,
            yEnd: rectBounds.bottom
        });
    
        rectangle.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) return;
            const offsetX = e.clientX - rectangle.getBoundingClientRect().left;
            const offsetY = e.clientY - rectangle.getBoundingClientRect().top;
            const onMouseMove = (e) => {
                rectangle.style.left = e.clientX - offsetX + 'px';
                rectangle.style.top = e.clientY - offsetY + 'px';

                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;
                const shape = shapesData.find(shape => shape.id === rectId);
                if (shape) {
                    shape.xStart = newX;
                    shape.yStart = newY;
                    shape.xEnd = newX + parseInt(rectangle.style.width);
                    shape.yEnd = newY + parseInt(rectangle.style.height);
                }
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = parseInt(rectangle.style.width);
            const startHeight = parseInt(rectangle.style.height);
    
            const onMouseMove = (e) => {
                let newWidth = startWidth + (e.clientX - startX);
                let newHeight = startHeight + (e.clientY - startY);
    
                newWidth = Math.max(30, newWidth);
                newHeight = Math.max(20, newHeight);
    
                rectangle.style.width = newWidth + 'px';
                rectangle.style.height = newHeight + 'px';

                const shape = shapesData.find(shape => shape.id === rectId);
                if (shape) {
                    shape.xEnd = shape.xStart + newWidth;
                    shape.yEnd = shape.yStart + newHeight;
                }
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
        
        totalShapes.push(rectangle);
    }
    
    function drawLine() {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.left = canvas.width / 2 + 'px';
        line.style.top = canvas.height / 2 + 'px';
        line.style.width = '100px';
        line.style.height =  `${thicknessInput.value}px`;
        line.style.backgroundColor = selectedColor;
        line.style.transformOrigin = 'left center';
        document.body.appendChild(line);
    
        // // Create arrowhead
        // const arrowhead = document.createElement('div');
        // arrowhead.style.position = 'absolute';
        // arrowhead.style.right = '-10px';
        // arrowhead.style.top = '-8px';
        // arrowhead.style.width = '0';
        // arrowhead.style.height = '0';
        // arrowhead.style.borderLeft = '10px solid transparent';
        // arrowhead.style.borderRight = '10px solid transparent';
        // arrowhead.style.borderTop = `15px solid ${selectedColor}`;
        // arrow.appendChild(arrowhead);
    
        const resizeHandle = document.createElement('div');
        resizeHandle.style.position = 'absolute';
        resizeHandle.style.right = '-15px';
        resizeHandle.style.top = '-5px';
        resizeHandle.style.width = '10px';
        resizeHandle.style.height = '10px';
        resizeHandle.style.border = '2px solid black';
        resizeHandle.style.backgroundColor = 'white';
        resizeHandle.style.cursor = 'ew-resize';
        line.appendChild(resizeHandle);

        shapeIdCounter++;
        const lineId = shapeIdCounter;
    
        line.addEventListener('mousedown', (e) => {
            if (e.target === resizeHandle) return;
            const offsetX = e.clientX - line.getBoundingClientRect().left;
            const offsetY = e.clientY - line.getBoundingClientRect().top;
            const onMouseMove = (e) => {
                line.style.left = e.clientX - offsetX + 'px';
                line.style.top = e.clientY - offsetY + 'px';

                const newX = e.clientX - offsetX;
                const newY = e.clientY - offsetY;

                const shape = shapesData.find(shape => shape.id === lineId);
                if (shape) {
                    shape.xStart = newX;
                    shape.yStart = newY;
                    shape.xEnd = newX + parseInt(line.style.width);
                    shape.yEnd = newY + parseInt(line.style.height);
                }
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    
        resizeHandle.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            const startX = e.clientX;
            const startWidth = parseInt(line.style.width);
    
            const onMouseMove = (e) => {
                let newWidth = startWidth + (e.clientX - startX);
                newWidth = Math.max(20, newWidth);
                line.style.width = newWidth + 'px';

                const shape = shapesData.find(shape => shape.id === lineId);
                if (shape) {
                    shape.xEnd = shape.xStart + newWidth;
                }
            };
    
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
            }, { once: true });
        });
    
        let lineBounds = line.getBoundingClientRect();
        shapesData.push({
            id: lineId,
            type: 'line',
            color: selectedColor,
            xStart: parseInt(lineBounds.left),
            yStart: parseInt(lineBounds.top),
            xEnd: parseInt(lineBounds.left) + parseInt(lineBounds.width),
            yEnd: parseInt(lineBounds.top) + parseInt(lineBounds.height)
        });
        totalShapes.push(line);

    }
    

    cancelBtn.addEventListener('click', () => {
        window.close();
    });

    saveBtn.addEventListener('click', () => {
        textBoxes.forEach((textBox) => {
            ctx.font = '20px Arial';
            ctx.fillStyle = selectedColor;
            ctx.fillText(textBox.value, parseInt(textBox.style.left), parseInt(textBox.style.top) + 20);
            textBox.remove();
        });
        textBoxes = [];

        shapesData.forEach((shape) => {
            switch(shape.type) {
                case 'circle':
                    ctx.beginPath();
                    ctx.strokeStyle = shape.color;
                    ctx.arc(shape.xStart, shape.yStart, shape.radius, Math.PI * 2, false);
                    ctx.fillStyle = hexToRgba(shape.color, 0.3);
                    ctx.fill();
                    ctx.stroke();
                    break;
                case 'rectangle':
                    ctx.beginPath();
                    ctx.strokeStyle = shape.color;
                    ctx.fillStyle = hexToRgba(shape.color, 0.3);
                    ctx.fillRect(shape.xStart, shape.yStart, shape.xEnd, shape.yEnd);
                    ctx.stroke();
                    break;
                case 'line':
                    ctx.beginPath();
                    ctx.strokeStyle = shape.color;
                    ctx.moveTo(shape.xStart, shape.yStart);
                    ctx.lineTo(shape.xEnd, shape.yEnd);
                    ctx.stroke();
                    break;
            }
        });

        totalShapes.forEach((shape) => {
            shape.remove();
        });
        totalShapes = [];

        const editedScreenshotUri = canvas.toDataURL();
        chrome.runtime.sendMessage({
            action: 'saveScreenshot',
            screenshotUri: editedScreenshotUri
        });
        setInterval(() => {
            window.close();
        }, 300);
    });

    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (loadedImage) {
            ctx.drawImage(loadedImage, 0, 0);
        }

        textBoxes.forEach((textBox) => {
            textBox.remove();
        });
        textBoxes = [];

        totalShapes.forEach((shape) => {
            shape.remove();
        })
        shapesData = [];

        freehandDrawing = [];
    });
})();
