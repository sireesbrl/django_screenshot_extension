(() => {
    let selectionBox, overlay, startX, startY, endX, endY;
    let isSelecting = false;

    function createOverlay() {
        if (document.getElementById("screenshot-overlay")) return;

        overlay = document.createElement("div");
        overlay.id = "screenshot-overlay";
        overlay.tabIndex = "0";

        Object.assign(overlay.style, {
            position: "fixed",
            top: "0", left: "0",
            width: "100vw", height: "100vh",
            background: "rgba(0, 0, 0, 0.3)",
            zIndex: "9998",
            cursor: "crosshair"
        });

        document.body.appendChild(overlay);
        overlay.focus();
        overlay.addEventListener("mousedown", onMouseDown);
    }

    function createSelectionBox() {
        selectionBox = document.createElement("div");
        Object.assign(selectionBox.style, {
            position: "fixed",
            border: "2px dashed red",
            background: "rgba(255, 0, 0, 0.2)",
            zIndex: "9999",
            pointerEvents: "none"
        });

        document.body.appendChild(selectionBox);
    }

    function onMouseDown(event) {
        if (isSelecting) return;

        isSelecting = true;
        startX = event.clientX;
        startY = event.clientY;

        createSelectionBox();
        selectionBox.style.left = startX + "px";
        selectionBox.style.top = startY + "px";
        selectionBox.style.width = "0px";
        selectionBox.style.height = "0px";

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("keydown", onKeyDown);
    }

    function onMouseMove(event) {
        endX = event.clientX;
        endY = event.clientY;

        let width = Math.abs(endX - startX);
        let height = Math.abs(endY - startY);
        let left = Math.min(startX, endX);
        let top = Math.min(startY, endY);

        selectionBox.style.left = left + "px";
        selectionBox.style.top = top + "px";
        selectionBox.style.width = width + "px";
        selectionBox.style.height = height + "px";
    }

    function onMouseUp(event) {
        if (!isSelecting) return;

        endX = event.clientX;
        endY = event.clientY;

        document.removeEventListener("mousemove", onMouseMove);
    }

    function onKeyDown(event) {
        console.log(`Key pressed: ${event.key}`);
        if (event.key === "Enter") {
            confirmSelection();
        } else if (event.key === "Escape") {
            cancelSelection();
        }
    }

    function confirmSelection() {
        console.log("Confirming selection...");
        if (!isSelecting) return;

        cleanup();
        
        setTimeout(() => {
            chrome.runtime.sendMessage({
                action: "captureSelectedArea",
                coords: {
                    x: Math.min(startX, endX),
                    y: Math.min(startY, endY),
                    width: Math.abs(endX - startX),
                    height: Math.abs(endY - startY)
                }
            });
        }, 100);
        
    }

    function cancelSelection() {
        console.log("Canceling selection...");
        cleanup();
    }

    function cleanup() {
        if (selectionBox) selectionBox.remove();
        if (overlay) {
            overlay.removeEventListener("mousedown", onMouseDown);
            overlay.remove();
        };

        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("keydown", onKeyDown);

        isSelecting = false;
    }

    
    function cropScreenshot(imageUri, coords) {
        console.log("Cropping screenshot...");
        let img = new Image();
        img.src = imageUri;
        
        img.onload = function () {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext("2d");
            
            canvas.width = coords.width;
            canvas.height = coords.height;
    
            ctx.drawImage(
                img, 
                coords.x, coords.y, coords.width, coords.height, // Source (full image)
                0, 0, coords.width, coords.height // Destination (cropped)
            );
            
            let croppedImageUri = canvas.toDataURL("image/png");

            chrome.runtime.sendMessage({
                action: "croppedScreenshot",
                imageUri: croppedImageUri
            });
        };
    }
    
    if (!window.hasSelectionAreaMessageListener) {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === "startSelection") {
                console.log("Adding selection overlay...");
                createOverlay();
            } 
            if (request.action === "cropScreenshot") {
                console.log("Cropping screenshot...");
                cropScreenshot(request.imageUri, request.coords);
            }
        });
        window.hasSelectionAreaMessageListener = true;
    }
})();
