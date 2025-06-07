const tabsEl = document.getElementById('tabs');
const iframesEl = document.getElementById('iframes');
const addTabBtn = document.getElementById('addTabBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const GOOGLE_URL = "https://www.google.com/search?igu=1";

let tabs = [];
let currentTab = null;
let tabIdCounter = 1;

function createTab(url = GOOGLE_URL) {
  const tabId = tabIdCounter++;
  tabs.push({id: tabId, url: url});
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

function navigateToAddress() {
  let url = addressBar.value.trim();
  if (!url) return;
  // Add protocol if missing
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  // Update URL in tabs
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    tab.url = url;
    renderIframes();
    updateAddressBar();
  }
}

addressBar.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    navigateToAddress();
  }
});

goBtn.addEventListener('click', navigateToAddress);

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
