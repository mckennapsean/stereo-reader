const DEFAULT_SETTINGS = {
  colorA: '#FF0000',
  colorB: '#0000FF',
  bgColor: '#FFFFFF',
  algorithm: 'char', // New default setting
  textScale: 100, // New default setting for text scaling (100% = normal)
  isEnabled: false,
  startTime: null,
  elapsedTime: 0
};

let currentSettings = { ...DEFAULT_SETTINGS };
let timerInterval = null;

const toggleButton = document.getElementById('toggleButton');
const colorAInput = document.getElementById('colorA');
const colorBInput = document.getElementById('colorB');
const bgColorInput = document.getElementById('bgColor');
const algorithmSelect = document.getElementById('algorithmSelect'); // New element reference
const textScaleRange = document.getElementById('textScaleRange');
const textScaleValue = document.getElementById('textScaleValue');
const resetScaleButton = document.getElementById('resetScaleButton');
const timerDisplay = document.getElementById('timerDisplay');

// --- Timer Functions (Task 2.4) ---

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateTimerDisplay() {
  const now = Date.now();
  let currentElapsed = currentSettings.elapsedTime;

  if (currentSettings.isEnabled && currentSettings.startTime) {
    currentElapsed += (now - currentSettings.startTime);
  }
  timerDisplay.textContent = formatTime(currentElapsed);
}

function startTimer() {
  if (timerInterval) return;
  currentSettings.startTime = Date.now();
  timerInterval = setInterval(updateTimerDisplay, 1000);
  chrome.storage.local.set({ startTime: currentSettings.startTime });
}

function stopTimer() {
  if (!timerInterval) return;
  clearInterval(timerInterval);
  timerInterval = null;

  const now = Date.now();
  if (currentSettings.startTime) {
    currentSettings.elapsedTime += (now - currentSettings.startTime);
    currentSettings.startTime = null;
  }
  chrome.storage.local.set({ startTime: null, elapsedTime: currentSettings.elapsedTime });
  updateTimerDisplay();
}

// --- Settings Functions (Task 2.2 & 3.3) ---

function saveSettings() {
  currentSettings.colorA = colorAInput.value;
  currentSettings.colorB = colorBInput.value;
  currentSettings.bgColor = bgColorInput.value;
  currentSettings.algorithm = algorithmSelect.value; // Save algorithm
  currentSettings.textScale = parseInt(textScaleRange.value); // Save text scale
  chrome.storage.local.set({
    colorA: currentSettings.colorA,
    colorB: currentSettings.colorB,
    bgColor: currentSettings.bgColor,
    algorithm: currentSettings.algorithm, // Save algorithm
    textScale: currentSettings.textScale, // Save text scale
    isEnabled: currentSettings.isEnabled,
    elapsedTime: currentSettings.elapsedTime
  });
  // If the filter is already enabled, we need to re-apply it with the new settings
  if (currentSettings.isEnabled) {
    sendSettingsToContentScript();
  }
}

function loadSettings() {
  chrome.storage.local.get(DEFAULT_SETTINGS, (items) => {
    currentSettings = { ...currentSettings, ...items };

    colorAInput.value = currentSettings.colorA;
    colorBInput.value = currentSettings.colorB;
    bgColorInput.value = currentSettings.bgColor;
    algorithmSelect.value = currentSettings.algorithm; // Load algorithm
    textScaleRange.value = currentSettings.textScale; // Load text scale
    textScaleValue.textContent = `${currentSettings.textScale}%`; // Update display

    // Update button text based on saved state
    toggleButton.textContent = currentSettings.isEnabled ? 'Disable' : 'Enable';

    // Resume timer if it was running
    if (currentSettings.isEnabled) {
      // If the extension was closed while enabled, startTime will be null, so we just start the interval
      // The content script will handle the actual filtering state on the page.
      if (currentSettings.startTime) {
        startTimer();
      } else {
        // If startTime is null but isEnabled is true, it means the timer was stopped
        // but the filter was still active on the page. We should just display the elapsed time.
        updateTimerDisplay();
      }
    } else {
      updateTimerDisplay();
    }
  });
}

function sendSettingsToContentScript() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {
      action: "toggleFilter",
      settings: currentSettings
    });
  });
}

// --- Event Listeners ---

toggleButton.addEventListener('click', () => {
  currentSettings.isEnabled = !currentSettings.isEnabled;
  toggleButton.textContent = currentSettings.isEnabled ? 'Disable' : 'Enable';

  if (currentSettings.isEnabled) {
    startTimer();
  } else {
    stopTimer();
  }

  saveSettings(); // Save the new isEnabled state and send message
});

colorAInput.addEventListener('change', saveSettings);
colorBInput.addEventListener('change', saveSettings);
bgColorInput.addEventListener('change', saveSettings);
algorithmSelect.addEventListener('change', saveSettings); // New event listener

textScaleRange.addEventListener('input', () => {
  textScaleValue.textContent = `${textScaleRange.value}%`;
  saveSettings();
});

resetScaleButton.addEventListener('click', () => {
  textScaleRange.value = 100;
  textScaleValue.textContent = '100%';
  saveSettings();
});

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);