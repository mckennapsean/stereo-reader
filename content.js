let isFilterEnabled = false;
const WRAPPER_CLASS = 'stereo-reader-wrapper';
let colorA = 'red';
let colorB = 'blue';
let bgColor = '';
let algorithm = 'char'; // New variable for algorithm

// --- Algorithm Implementations (Task 3.2) ---

// Character-based algorithm (Existing PoC logic)
function wrapCharText(text) {
  let wrappedHtml = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const color = i % 2 === 0 ? colorA : colorB;
    wrappedHtml += `<span style="color: ${color};">${char}</span>`;
  }
  return wrappedHtml;
}

// Word-based algorithm (New logic)
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
      wrappedHtml += `<span style="color: ${color};">${part}</span>`;
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

// Recursive function to find and replace text nodes (Task 1.3)
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

  // Apply background color (Task 2.3)
  if (bgColor && bgColor !== '#FFFFFF') {
    document.body.style.backgroundColor = bgColor;
  }

  // Start traversal from the body
  traverseAndWrap(document.body);

  console.log('Stereo Reader: Filter Enabled');
  isFilterEnabled = true;
}

function removeFilter() {
  if (!isFilterEnabled) return;

  // Remove background color (Task 2.3)
  document.body.style.backgroundColor = '';

  // Find all wrapped elements
  const wrappers = document.querySelectorAll(`.${WRAPPER_CLASS}`);

  wrappers.forEach(wrapper => {
    const originalText = wrapper.getAttribute('data-original-text');
    if (originalText !== null) {
      const textNode = document.createTextNode(originalText);
      wrapper.parentNode.replaceChild(textNode, wrapper);
    }
  });

  console.log('Stereo Reader: Filter Disabled');
  isFilterEnabled = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleFilter") {
    // Update settings
    if (request.settings) {
      colorA = request.settings.colorA;
      colorB = request.settings.colorB;
      bgColor = request.settings.bgColor;
      algorithm = request.settings.algorithm; // Update algorithm
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