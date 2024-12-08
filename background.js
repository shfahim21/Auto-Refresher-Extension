let refreshData = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startRefresh") {
    const tabId = request.tabId;
    const minutes = request.minutes;

    refreshData[tabId] = {
      interval: minutes * 60,
      remaining: minutes * 60,
      timerId: setInterval(() => {
        refreshData[tabId].remaining--;
        chrome.runtime.sendMessage({
          action: "updateCountdown",
          remaining: refreshData[tabId].remaining,
          tabId: tabId,
        });

        if (refreshData[tabId].remaining <= 0) {
          chrome.tabs.reload(tabId);
          refreshData[tabId].remaining = refreshData[tabId].interval;
        }
      }, 1000),
    };

    sendResponse({ success: true });
  }

  if (request.action === "stopRefresh") {
    const tabId = request.tabId;
    if (refreshData[tabId]) {
      clearInterval(refreshData[tabId].timerId);
      delete refreshData[tabId];
    }
    sendResponse({ success: true });
  }

  if (request.action === "getStatus") {
    const tabId = request.tabId;
    sendResponse({
      isRunning: !!refreshData[tabId],
      remaining: refreshData[tabId]?.remaining || 0,
    });
  }

  return true;
});
