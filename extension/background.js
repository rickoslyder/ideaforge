// IdeaForge Quick Capture - Background Service Worker

const DEFAULT_ENDPOINT = "https://ideaforge.vercel.app";

// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capture-selection",
    title: "Capture to IdeaForge",
    contexts: ["selection"],
  });

  chrome.contextMenus.create({
    id: "capture-page",
    title: "Capture this page to IdeaForge",
    contexts: ["page"],
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const settings = await chrome.storage.sync.get(["apiToken", "endpoint"]);

  if (!settings.apiToken) {
    // Open options page if not configured
    chrome.runtime.openOptionsPage();
    return;
  }

  const endpoint = settings.endpoint || DEFAULT_ENDPOINT;

  try {
    const captureData = {
      title: tab.title || "Captured Page",
      source_url: tab.url,
      source_title: tab.title,
      create_project: false,
      metadata: {
        source_type: "extension",
      },
    };

    if (info.menuItemId === "capture-selection" && info.selectionText) {
      captureData.selected_text = info.selectionText;
      captureData.idea = info.selectionText;
      captureData.title = `Selection from: ${tab.title}`;
    }

    const response = await fetch(`${endpoint}/api/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiToken}`,
      },
      body: JSON.stringify(captureData),
    });

    if (response.ok) {
      // Show notification (optional - requires notifications permission)
      // For now, just log success
      console.log("Captured successfully");
    } else {
      const data = await response.json().catch(() => ({}));
      console.error("Capture failed:", data.error || response.statusText);
    }
  } catch (error) {
    console.error("Capture error:", error);
  }
});
