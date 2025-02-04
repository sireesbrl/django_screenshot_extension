document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("captureFull").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "captureFull" });
    });

    document.getElementById("captureArea").addEventListener("click", () => {
        chrome.runtime.sendMessage({ action: "startSelection" });
    });

    chrome.storage.local.get("lastScreenshotUrl")
        .then(({ lastScreenshotUrl }) => {
            const lastScreenshotBtn = document.getElementById("lastScreenshotUrl");
            const screenshotContainer = lastScreenshotBtn.parentElement;

            if (lastScreenshotUrl) {
                lastScreenshotBtn.href = lastScreenshotUrl;
                lastScreenshotBtn.textContent = "📸 View Last Screenshot";
                lastScreenshotBtn.target = "_blank";
                screenshotContainer.style.display = "block";
            } else {
                screenshotContainer.style.display = "none";
            }
        })
        .catch(error => console.error("Error accessing storage:", error));
});