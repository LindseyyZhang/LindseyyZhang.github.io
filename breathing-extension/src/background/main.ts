/// <reference types="chrome" />

// Let the toolbar icon open the side panel directly (Chrome also exposes the
// panel via its own side-panel picker regardless of this setting).
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => {
    /* sidePanel API unavailable on this Chrome version, ignore */
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "catbreath:open-sidepanel" && message.windowId) {
    chrome.sidePanel?.open?.({ windowId: message.windowId }).catch(() => {
      /* ignore */
    });
  }
});
