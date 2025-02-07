browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureFull") {
        console.log("Capturing screenshot...");
        browser.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
            browser.storage.local.set({screenshotUri: imageUri})
            .then(() => {
                return browser.tabs.create({url: "editor.html"});
            })
            .catch(error => console.error("Storage failed:", error));

        });
    }

    if (request.action === "startSelection") {
        console.log("starting selection...");
        browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabId = tabs[0].id;

            browser.tabs.executeScript(
                tabId,
                { file: "content.js" }
            )
            .then(
                () => {
                    browser.tabs.sendMessage(tabId, { action: "startSelection" });
                }
            )
            .catch(error => console.error("Injection failed:", error));
        });
    }

    if (request.action === "captureSelectedArea") {
        browser.tabs.captureVisibleTab(null, { format: "png" }, (imageUri) => {
            browser.tabs.sendMessage(sender.tab.id, {
                action: "cropScreenshot",
                imageUri: imageUri,
                coords: request.coords
            });
        });
    }

    if (request.action === "croppedScreenshot") {
        browser.storage.local.set({screenshotUri: request.imageUri})
        .then(() => {
            return browser.tabs.create({url: "editor.html"});
        })
        .catch(error => console.error("Storage failed:", error));
    }

    if (request.action === "saveScreenshot") {
        uploadScreenshot(request.screenshotUri);
    }
});


function uploadScreenshot(imageUri) {
    // Convert base64 to a Blob
    function base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64.split(',')[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Create a File object from the Blob
    const blob = base64ToBlob(imageUri, "image/png");
    const file = new File([blob], "screenshot.png", { type: "image/png" });

    // Prepare FormData
    const formData = new FormData();
    formData.append("image", file);
    console.log("Uploading screenshot...");

    fetch("http://127.0.0.1:8000/api/upload/", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => { 
        // browser.notifications.create("screenshot-notification", {
        //    type: "basic",
        //    title: "Screenshot uploaded",
        //    iconUrl: "icon.png",
        //    message: "Image Url: " + data["image_url"]
        // });

        browser.notifications.create("tiny-url-notification", {
            type: "basic",
            title: "Screenshot uploaded",
            iconUrl: "icon.png",
            message: "Tiny URL: " + data["tiny_url"]
        });

        return browser.storage.local.set({
            "lastScreenshotUrl": data["tiny_url"]
        });
    })
    .catch(error => console.error("Upload failed:", error));
}
