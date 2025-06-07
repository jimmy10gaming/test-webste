const tabsEl = document.getElementById('tabs');
const iframesEl = document.getElementById('iframes');
const addTabBtn = document.getElementById('addTabBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const GOOGLE_URL = "https://www.google.com/";

let tabs = [];
let currentTab = null;
let tabIdCounter = 1;

// Each tab: {id, url, history:[], historyIndex:int, iframe:element}
function createTab(url = GOOGLE_URL) {
  const tabId = tabIdCounter++;
  // Create iframe for this tab (persist while tab is open)
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('data-tabid', tabId);
  iframe.className = 'browser-iframe';

  // Track history for this tab
  tabs.push({
    id: tabId,
    url: url,
    history: [url],
    historyIndex: 0,
    iframe: iframe
  });

  // Listen for iframe navigation (will only work for same-origin)
  iframe.addEventListener('load', function() {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    try {
      // Try to get the actual iframe location for same-origin
      let realUrl = iframe.contentWindow.location.href;
      if (realUrl && realUrl !== tab.url) {
        // Only push if it's a new URL
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        tab.history.push(realUrl);
        tab.historyIndex = tab.history.length - 1;
        tab.url = realUrl;
      }
      // Update address bar only if active
      if (tabId === currentTab) {
        addressBar.value = realUrl;
      }
    } catch (e) {
      // Cross-origin, fallback to last known URL
      if (tabId === currentTab) {
        addressBar.value = tab.url;
      }
    }
    if (tabId === currentTab) updateNavButtons();
  });

  renderTabs();
  switchToTab(tabId);
}

function closeTab(tabId) {
  const idx = tabs.findIndex(tab => tab.id === tabId);
  if (idx !== -1) {
    // Remove iframe from DOM if present
    const tab = tabs[idx];
    if (tab.iframe && tab.iframe.parentNode) {
      tab.iframe.parentNode.removeChild(tab.iframe);
    }
    tabs.splice(idx, 1);
    if (tabs.length === 0) {
      createTab();
    } else {
      if (currentTab === tabId) {
        const newIdx = Math.max(0, idx - 1);
        switchToTab(tabs[newIdx].id);
      }
      renderTabs();
    }
  }
}

function switchToTab(tabId) {
  currentTab = tabId;
  renderTabs();
  renderIframes();
  updateAddressBar();
  updateNavButtons();
}

function renderTabs() {
  tabsEl.innerHTML = '';
  tabs.forEach(tab => {
    const tabDiv = document.createElement('div');
    tabDiv.className = 'tab' + (tab.id === currentTab ? ' active' : '');
    tabDiv.textContent = "Google";
    tabDiv.onclick = () => switchToTab(tab.id);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };
    tabDiv.appendChild(closeBtn);

    tabsEl.appendChild(tabDiv);
  });
}

function renderIframes() {
  // Only attach iframes that aren't already in DOM and show/hide according to active tab
  iframesEl.innerHTML = '';
  tabs.forEach(tab => {
    const wrapper = document.createElement('div');
    wrapper.className = 'iframe-container' + (tab.id === currentTab ? ' active' : '');
    wrapper.appendChild(tab.iframe);
    iframesEl.appendChild(wrapper);
  });
}

function updateAddressBar() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    addressBar.value = tab.url;
  } else {
    addressBar.value = "";
  }
}

// Enable/disable back/forward buttons per tab
function updateNavButtons() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    backBtn.disabled = tab.historyIndex <= 0;
    forwardBtn.disabled = tab.historyIndex >= tab.history.length - 1;
  } else {
    backBtn.disabled = true;
    forwardBtn.disabled = true;
  }
}

function navigateToAddress(newUrl = null) {
  let url = newUrl !== null ? newUrl : addressBar.value.trim();
  if (!url) return;
  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    // Only push if not the same as current
    if (tab.url !== url) {
      // Truncate forward history
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(url);
      tab.historyIndex = tab.history.length - 1;
      tab.url = url;
      tab.iframe.src = url; // Actually navigate iframe
      updateAddressBar();
      updateNavButtons();
    }
  }
}

addressBar.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    navigateToAddress();
  }
});

goBtn.addEventListener('click', () => navigateToAddress());

// Navigation buttons
backBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab && tab.historyIndex > 0) {
    tab.historyIndex--;
    tab.url = tab.history[tab.historyIndex];
    tab.iframe.src = tab.url;
    updateAddressBar();
    updateNavButtons();
  }
});
forwardBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab && tab.historyIndex < tab.history.length - 1) {
    tab.historyIndex++;
    tab.url = tab.history[tab.historyIndex];
    tab.iframe.src = tab.url;
    updateAddressBar();
    updateNavButtons();
  }
});
reloadBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    tab.iframe.src = tab.url;
    updateAddressBar();
    updateNavButtons();
  }
});

// Mode toggle
toggleModeBtn.onclick = function() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  toggleModeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};

// Add new tab
addTabBtn.onclick = () => createTab();

// Init
createTab();
