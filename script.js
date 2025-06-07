const tabsEl = document.getElementById('tabs');
const iframesEl = document.getElementById('iframes');
const addTabBtn = document.getElementById('addTabBtn');
const toggleModeBtn = document.getElementById('toggleModeBtn');
const addressBar = document.getElementById('addressBar');
const goBtn = document.getElementById('goBtn');
const backBtn = document.getElementById('backBtn');
const forwardBtn = document.getElementById('forwardBtn');
const reloadBtn = document.getElementById('reloadBtn');
const bookmarkStar = document.getElementById('bookmarkStar');
const bookmarksBar = document.getElementById('bookmarksBar');

const GOOGLE_URL = "https://www.google.com/search?igu=1";

let tabs = [];
let currentTab = null;
let tabIdCounter = 1;
let bookmarks = JSON.parse(localStorage.getItem("browser_bookmarks") || "[]");

function saveBookmarks() {
  localStorage.setItem("browser_bookmarks", JSON.stringify(bookmarks));
}

function createTab(url = GOOGLE_URL) {
  const tabId = tabIdCounter++;
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('data-tabid', tabId);
  iframe.className = 'browser-iframe';

  tabs.push({
    id: tabId,
    url: url,
    history: [url],
    historyIndex: 0,
    iframe: iframe
  });

  iframe.addEventListener('load', function() {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;
    try {
      let realUrl = iframe.contentWindow.location.href;
      if (realUrl && realUrl !== tab.url) {
        tab.history = tab.history.slice(0, tab.historyIndex + 1);
        tab.history.push(realUrl);
        tab.historyIndex = tab.history.length - 1;
        tab.url = realUrl;
      }
      if (tabId === currentTab) {
        addressBar.value = realUrl;
        updateBookmarkStar();
      }
    } catch (e) {
      if (tabId === currentTab) {
        addressBar.value = tab.url;
        updateBookmarkStar();
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
  updateBookmarkStar();
}

function renderTabs() {
  tabsEl.innerHTML = '';
  tabs.forEach(tab => {
    const tabDiv = document.createElement('div');
    tabDiv.className = 'tab' + (tab.id === currentTab ? ' active' : '');
    tabDiv.textContent = "New Tab";
    tabDiv.onclick = () => switchToTab(tab.id);

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
    wrapper.appendChild(tab.iframe);
    iframesEl.appendChild(wrapper);
  });
}

function updateAddressBar() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    addressBar.value = tab.url;
    updateBookmarkStar();
  } else {
    addressBar.value = "";
    updateBookmarkStar();
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

function updateBookmarkStar() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab && isBookmarked(tab.url)) {
    bookmarkStar.textContent = "★";
    bookmarkStar.classList.add("active");
  } else {
    bookmarkStar.textContent = "☆";
    bookmarkStar.classList.remove("active");
  }
}

function isBookmarked(url) {
  return bookmarks.some(bm => bm.url === url);
}

function addOrRemoveBookmark() {
  const tab = tabs.find(t => t.id === currentTab);
  if (!tab) return;
  const url = tab.url;
  const idx = bookmarks.findIndex(bm => bm.url === url);
  if (idx === -1) {
    // Add
    bookmarks.push({
      url: url,
      title: (url.match(/^https?:\/\/([^\/]+)/i) || [])[1] || url
    });
  } else {
    // Remove
    bookmarks.splice(idx, 1);
  }
  saveBookmarks();
  renderBookmarksBar();
  updateBookmarkStar();
}

function renderBookmarksBar() {
  bookmarksBar.innerHTML = '';
  bookmarks.forEach((bm, i) => {
    const btn = document.createElement('button');
    btn.className = 'bookmark-btn';
    btn.title = bm.url;
    btn.textContent = bm.title || bm.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    btn.onclick = () => navigateToAddress(bm.url);
    // Remove bookmark button (X)
    const rm = document.createElement('span');
    rm.className = 'bookmark-remove';
    rm.textContent = '×';
    rm.onclick = (e) => {
      e.stopPropagation();
      bookmarks.splice(i, 1);
      saveBookmarks();
      renderBookmarksBar();
      updateBookmarkStar();
    };
    btn.appendChild(rm);
    bookmarksBar.appendChild(btn);
  });
}

function navigateToAddress(newUrl = null) {
  let url = newUrl !== null ? newUrl : addressBar.value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    if (tab.url !== url) {
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(url);
      tab.historyIndex = tab.history.length - 1;
      tab.url = url;
      tab.iframe.src = url;
      updateAddressBar();
      updateNavButtons();
      updateBookmarkStar();
    }
  }
}

addressBar.addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    navigateToAddress();
  }
});
goBtn.addEventListener('click', () => navigateToAddress());

backBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab && tab.historyIndex > 0) {
    tab.historyIndex--;
    tab.url = tab.history[tab.historyIndex];
    tab.iframe.src = tab.url;
    updateAddressBar();
    updateNavButtons();
    updateBookmarkStar();
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
    updateBookmarkStar();
  }
});
reloadBtn.addEventListener('click', function() {
  const tab = tabs.find(t => t.id === currentTab);
  if (tab) {
    tab.iframe.src = tab.url;
    updateAddressBar();
    updateNavButtons();
    updateBookmarkStar();
  }
});

toggleModeBtn.onclick = function() {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
  toggleModeBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
};

addTabBtn.onclick = () => createTab();

bookmarkStar.onclick = addOrRemoveBookmark;

// Initial setup
createTab();
renderBookmarksBar();
