document.getElementById('toggleButton').addEventListener('click', () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const tab = tabs[0];
    chrome.tabs.sendMessage(tab.id, {action: "toggleFilter"}, (response) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else if (response && response.status) {
        const button = document.getElementById('toggleButton');
        button.textContent = response.status === 'enabled' ? 'Disable' : 'Enable';
      }
    });
  });
});