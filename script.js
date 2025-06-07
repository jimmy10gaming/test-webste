const tabsEl = document.getElementById('tabs');
const iframesEl = document.getElementById('iframes');
const addTabBtn = document.getElementById('addTabBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const GOOGLE_URL = "https://www.google.com/search?igu=1";

let tabs = [];
let currentTab = null;
let tabIdCounter = 1;

// Each tab: {id, url, history:[], historyIndex:int}
function createTab(url = GOOGLE_URL) {
  const tabId = tabIdCounter++;
  tabs.push({
    id: tabId,
    url: url,
    history: [url],
    historyIndex: 0
  });
  renderTabs();
  switchToTab(tabId);
}

function closeTab(tabId) {
  const idx = tabs.findIndex(tab => tab.id === tabId);
  if (idx !== -1) {
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
  iframesEl.innerHTML = '';
  tabs.forEach(tab => {
    const wrapper = document.createElement('div');
    wrapper.className = 'iframe-container' + (tab.id === currentTab ? ' active' : '');
    const iframe = document.createElement('iframe');
    iframe.src = tab.url;
    iframe.setAttribute('data-tabid', tab.id);
    wrapper.appendChild(iframe);
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
      renderIframes();
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
    renderIframes();
    updateAddressBar();
    updateNavButtons();
  }
});
forwardBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab && tab.historyIndex < tab.history.length - 1) {
    tab.historyIndex++;
    tab.url = tab.history[tab.historyIndex];
    renderIframes();
    updateAddressBar();
    updateNavButtons();
  }
});
reloadBtn.addEventListener('click', function() {
  // Reload the current iframe
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    renderIframes();
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
