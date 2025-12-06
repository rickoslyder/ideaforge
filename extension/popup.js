// IdeaForge Quick Capture - Popup Script

const DEFAULT_ENDPOINT = "https://ideaforge.vercel.app";

// DOM Elements
const setupNotice = document.getElementById("setup-notice");
const captureForm = document.getElementById("capture-form");
const titleInput = document.getElementById("title");
const ideaInput = document.getElementById("idea");
const sourceInfo = document.getElementById("source-info");
const createProjectCheckbox = document.getElementById("create-project");
const captureButton = document.getElementById("capture");
const cancelButton = document.getElementById("cancel");
const openOptionsButton = document.getElementById("open-options");
const statusDiv = document.getElementById("status");

let currentTab = null;
let selectedText = "";

// Initialize popup
async function init() {
  // Get current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  // Update source info
  if (tab?.url) {
    sourceInfo.textContent = tab.title || tab.url;
    sourceInfo.title = tab.url;
  }

  // Try to get selected text from the page
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection()?.toString() || "",
    });
    if (results?.[0]?.result) {
      selectedText = results[0].result.trim();
      if (selectedText) {
        ideaInput.value = selectedText;
      }
    }
  } catch (e) {
    // Ignore errors (e.g., chrome:// pages)
    console.log("Could not get selection:", e);
  }

  // Check if configured
  const settings = await chrome.storage.sync.get(["apiToken", "endpoint"]);
  if (!settings.apiToken) {
    setupNotice.classList.remove("hidden");
    captureForm.classList.add("hidden");
  } else {
    setupNotice.classList.add("hidden");
    captureForm.classList.remove("hidden");
    titleInput.focus();
  }
}

// Show status message
function showStatus(message, type = "loading") {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove("hidden");
}

function hideStatus() {
  statusDiv.classList.add("hidden");
}

// Send capture to API
async function sendCapture() {
  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const settings = await chrome.storage.sync.get(["apiToken", "endpoint", "defaultCreateProject"]);
  const endpoint = settings.endpoint || DEFAULT_ENDPOINT;
  const apiUrl = `${endpoint}/api/capture`;

  captureButton.disabled = true;
  showStatus("Capturing...", "loading");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiToken}`,
      },
      body: JSON.stringify({
        title,
        idea: ideaInput.value.trim() || undefined,
        source_url: currentTab?.url || undefined,
        source_title: currentTab?.title || undefined,
        selected_text: selectedText || undefined,
        create_project: createProjectCheckbox.checked,
        metadata: {
          source_type: "extension",
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.project?.url) {
      showStatus("Captured! Opening project...", "success");
      setTimeout(() => {
        chrome.tabs.create({ url: data.project.url });
        window.close();
      }, 500);
    } else {
      showStatus("Captured to inbox!", "success");
      setTimeout(() => window.close(), 1500);
    }
  } catch (error) {
    showStatus(`Error: ${error.message}`, "error");
    captureButton.disabled = false;
  }
}

// Event listeners
captureButton.addEventListener("click", sendCapture);

cancelButton.addEventListener("click", () => window.close());

openOptionsButton.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

titleInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendCapture();
  }
});

ideaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.ctrlKey) {
    e.preventDefault();
    sendCapture();
  }
});

// Initialize
init();
