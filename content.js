let isFilterEnabled = false;
const WRAPPER_CLASS = 'stereo-reader-wrapper';
let colorA = 'red';
let colorB = 'blue';
let bgColor = '';
let algorithm = 'char';
let textScale = 100; // New setting for text scaling

// --- MutationObserver Setup ---
let observer = null;
const observerConfig = { childList: true, subtree: true, characterData: true };

function removeWrappers() {
  // Find all wrapped elements
  const wrappers = document.querySelectorAll(`.${WRAPPER_CLASS}`);

  wrappers.forEach(wrapper => {
    const originalText = wrapper.getAttribute('data-original-text');
    if (originalText !== null) {
      const textNode = document.createTextNode(originalText);
      wrapper.parentNode.replaceChild(textNode, wrapper);
    }
  });
}

function handleMutations(mutationsList, observer) {
  // Check if any mutation occurred that might affect text content
  let shouldReapply = false;
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList' || mutation.type === 'characterData') {
      shouldReapply = true;
      break;
    }
  }

  if (shouldReapply) {
    // Temporarily disconnect to prevent infinite loops during re-application
    observer.disconnect();
    
    // 1. Remove existing filter
    removeWrappers(); 
    
    // 2. Re-apply filter
    traverseAndWrap(document.body);
    
    // 3. Reconnect observer
    observer.observe(document.body, observerConfig);
  }
}

function initObserver() {
  if (!observer) {
    observer = new MutationObserver(handleMutations);
  }
}

// --- Algorithm Implementations ---

// Character-based algorithm
function wrapCharText(text) {
  let wrappedHtml = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const color = i % 2 === 0 ? colorA : colorB;
    wrappedHtml += `<span style="color: ${color}; font-size: ${textScale}%;">${char}</span>`;
  }
  return wrappedHtml;
}

// Word-based algorithm
function wrapWordText(text) {
  // Split by whitespace, keeping the delimiters
  const parts = text.split(/(\s+)/);
  let wrappedHtml = '';
  let wordIndex = 0;

  for (const part of parts) {
    if (part.trim().length === 0) {
      // It's a space/delimiter, just append it
      wrappedHtml += part;
    } else {
      // It's a word, alternate color based on word index
      const color = wordIndex % 2 === 0 ? colorA : colorB;
      wrappedHtml += `<span style="color: ${color}; font-size: ${textScale}%;">${part}</span>`;
      wordIndex++;
    }
  }
  return wrappedHtml;
}

// Dispatcher function
function wrapText(text) {
  if (algorithm === 'word') {
    return wrapWordText(text);
  }
  // Default to character-based
  return wrapCharText(text);
}

// --- Core Traversal and Filter Functions ---

// Recursive function to find and replace text nodes
function traverseAndWrap(node) {
  // Skip script, style, and already-wrapped elements
  if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE' || node.nodeName === 'NOSCRIPT' || node.classList?.contains(WRAPPER_CLASS)) {
    return;
  }

  if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
    const parent = node.parentNode;
    if (parent) {
      const wrapper = document.createElement('span');
      wrapper.className = WRAPPER_CLASS;
      // Store original text for reversal
      wrapper.setAttribute('data-original-text', node.textContent);
      wrapper.innerHTML = wrapText(node.textContent);
      parent.replaceChild(wrapper, node);
    }
  } else {
    // Recurse through children
    // Use a copy of childNodes because replaceChild modifies the list
    const children = Array.from(node.childNodes);
    for (let i = 0; i < children.length; i++) {
      traverseAndWrap(children[i]);
    }
  }
}

function applyFilter() {
  if (isFilterEnabled) return;

  // Apply background color
  if (bgColor && bgColor !== '#FFFFFF') {
    document.body.style.backgroundColor = bgColor;
  }

  // Start traversal from the body
  traverseAndWrap(document.body);

  // Start observing for dynamic content changes
  initObserver();
  observer.observe(document.body, observerConfig);

  console.log('FusionText: Filter Enabled');
  isFilterEnabled = true;
}

function removeFilter() {
  if (!isFilterEnabled) return;

  // Stop observing
  if (observer) {
      observer.disconnect();
  }

  // Remove background color
  document.body.style.backgroundColor = '';

  removeWrappers();

  console.log('FusionText: Filter Disabled');
  isFilterEnabled = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFilter") {
    // Update settings
    if (request.settings) {
      colorA = request.settings.colorA;
      colorB = request.settings.colorB;
      bgColor = request.settings.bgColor;
      algorithm = request.settings.algorithm;
      textScale = request.settings.textScale; // New setting
    }

    // If filter is enabled, we need to remove it first before applying the new settings
    if (isFilterEnabled) {
      removeFilter();
    }

    // If the user toggled it on, apply the filter with new settings
    if (request.settings.isEnabled) {
      applyFilter();
    }
    
    // Send back the new status
    sendResponse({status: isFilterEnabled ? 'enabled' : 'disabled'});
  }
});