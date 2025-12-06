// IdeaForge Quick Capture - Options Script

const DEFAULT_ENDPOINT = "https://ideaforge.rbnk.uk";

// DOM Elements
const apiTokenInput = document.getElementById("api-token");
const endpointInput = document.getElementById("endpoint");
const defaultCreateProjectCheckbox = document.getElementById("default-create-project");
const saveButton = document.getElementById("save");
const testButton = document.getElementById("test");
const statusDiv = document.getElementById("status");
const tokenLink = document.getElementById("token-link");

// Load saved settings
async function loadSettings() {
  const settings = await chrome.storage.sync.get([
    "apiToken",
    "endpoint",
    "defaultCreateProject",
  ]);

  if (settings.apiToken) {
    apiTokenInput.value = settings.apiToken;
  }
  if (settings.endpoint) {
    endpointInput.value = settings.endpoint;
  }
  if (settings.defaultCreateProject) {
    defaultCreateProjectCheckbox.checked = true;
  }

  updateTokenLink();
}

// Update the settings link to point to the configured endpoint
function updateTokenLink() {
  const endpoint = endpointInput.value.trim() || DEFAULT_ENDPOINT;
  tokenLink.href = `${endpoint}/settings/tokens`;
}

// Show status message
function showStatus(message, type = "success") {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.classList.remove("hidden");

  if (type === "success") {
    setTimeout(() => {
      statusDiv.classList.add("hidden");
    }, 3000);
  }
}

// Save settings
async function saveSettings() {
  const apiToken = apiTokenInput.value.trim();
  const endpoint = endpointInput.value.trim();
  const defaultCreateProject = defaultCreateProjectCheckbox.checked;

  if (!apiToken) {
    showStatus("API token is required", "error");
    apiTokenInput.focus();
    return;
  }

  if (!apiToken.startsWith("idfc_")) {
    showStatus("Invalid token format. Token should start with 'idfc_'", "error");
    apiTokenInput.focus();
    return;
  }

  await chrome.storage.sync.set({
    apiToken,
    endpoint: endpoint || "",
    defaultCreateProject,
  });

  showStatus("Settings saved!");
}

// Test the connection
async function testConnection() {
  const apiToken = apiTokenInput.value.trim();
  const endpoint = endpointInput.value.trim() || DEFAULT_ENDPOINT;

  if (!apiToken) {
    showStatus("Enter an API token first", "error");
    apiTokenInput.focus();
    return;
  }

  testButton.disabled = true;
  testButton.textContent = "Testing...";

  try {
    // Try to capture a test message (it will be added to inbox)
    const response = await fetch(`${endpoint}/api/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        title: "Extension Test",
        idea: "This is a test capture from the IdeaForge browser extension. You can delete this from your inbox.",
        create_project: false,
        metadata: {
          source_type: "extension",
          test: true,
        },
      }),
    });

    if (response.ok) {
      showStatus("Connection successful! Test capture added to inbox.", "success");
    } else {
      const data = await response.json().catch(() => ({}));
      showStatus(`Connection failed: ${data.error || response.statusText}`, "error");
    }
  } catch (error) {
    showStatus(`Connection failed: ${error.message}`, "error");
  } finally {
    testButton.disabled = false;
    testButton.textContent = "Test Connection";
  }
}

// Event listeners
saveButton.addEventListener("click", saveSettings);
testButton.addEventListener("click", testConnection);
endpointInput.addEventListener("input", updateTokenLink);

// Save on Enter in inputs
apiTokenInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveSettings();
});
endpointInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") saveSettings();
});

// Initialize
loadSettings();
