document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("captureFull").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "captureFull" });
    });

    document.getElementById("captureArea").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "startSelection" });
    });
    chrome.storage.local.get("lastScreenshotUrl").then(result => {
        let lastScreenshotBtn = document.getElementById("lastScreenshotUrl");

        if (result.lastScreenshotUrl) {
            lastScreenshotBtn.href = result.lastScreenshotUrl;
            lastScreenshotBtn.style.textDecoration = "none";
            lastScreenshotBtn.style.color = "white";
            lastScreenshotBtn.textContent = "LastScreenshot";
            lastScreenshotBtn.target = "_blank";
            lastScreenshotBtn.parentElement.style.display = "block";
        } else {
            lastScreenshotBtn.parentElement.style.display = "none";
        }
    }).catch(error => console.error("Error accessing storage:", error));
});
