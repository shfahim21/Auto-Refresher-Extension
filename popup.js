document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startRefresh");
  const stopButton = document.getElementById("stopRefresh");
  const minutesInput = document.getElementById("minutes");
  const statusDiv = document.getElementById("status");
  const countdownDiv = document.getElementById("countdown");

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  // Check current status when popup opens
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.runtime.sendMessage(
      {
        action: "getStatus",
        tabId: tabs[0].id,
      },
      (response) => {
        if (response.isRunning) {
          countdownDiv.textContent = `Time until refresh: ${formatTime(
            response.remaining
          )}`;
          statusDiv.textContent = "Auto refresh is running";
        }
      }
    );
  });

  // Listen for countdown updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "updateCountdown") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (request.tabId === tabs[0].id) {
          countdownDiv.textContent = `Time until refresh: ${formatTime(
            request.remaining
          )}`;
        }
      });
    }
  });

  startButton.addEventListener("click", function () {
    const minutes = parseInt(minutesInput.value);
    if (minutes < 1) {
      statusDiv.textContent =
        "Please enter a valid number of minutes (minimum 1)";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage(
        {
          action: "startRefresh",
          tabId: tabs[0].id,
          minutes: minutes,
        },
        (response) => {
          if (response.success) {
            statusDiv.textContent = `Page will refresh every ${minutes} minute(s)`;
          }
        }
      );
    });
  });

  stopButton.addEventListener("click", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.runtime.sendMessage(
        {
          action: "stopRefresh",
          tabId: tabs[0].id,
        },
        (response) => {
          if (response.success) {
            countdownDiv.textContent = "Time until refresh: 00:00";
            statusDiv.textContent = "Auto refresh stopped!";
          }
        }
      );
    });
  });
});
