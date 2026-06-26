/**
 * MyLittleLibrary - Core Application Logic (English Version)
 * State management, LocalStorage, CRUD operations, Search, Sort, Filters, and Theme toggles.
 * Supports multi-view SPA routing and customizable item languages.
 */

// ==========================================================================
// STATE & CONFIGURATION
// ==========================================================================
let state = {
  items: [],
  categories: ["Books", "Dramas", "Mangas", "Animes"], // Default categories
  languages: ["Japanese", "English", "Korean", "Chinese"], // Default languages
  theme: 'light-theme',
  currentView: 'dashboard', // 'dashboard' | 'settings' | categoryName (e.g. 'Books')
  filters: {
    search: '',
    status: 'all', // 'all' | 'planning' | 'reading' | 'completed'
    language: 'all', // 'all' | any language name
    sortBy: 'newest' // 'newest' | 'oldest' | 'rating-desc' | 'rating-asc' | 'title'
  },
  user: null,
  db: null,
  isSyncing: false
};

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const DOM = {
  // Theme & Menu Toggles
  themeToggleBtn: document.getElementById('theme-toggle'),
  menuToggleBtn: document.getElementById('menu-toggle-btn'),
  sidebarMenu: document.getElementById('sidebar-menu'),
  sidebarOverlay: document.getElementById('sidebar-overlay'),
  sidebarCloseBtn: document.getElementById('sidebar-close-btn'),
  
  // Sidebar Nav Link Container
  sidebarNav: document.getElementById('sidebar-nav'),

  // Views Toggles
  viewDashboard: document.getElementById('view-dashboard'),
  viewLibrary: document.getElementById('view-library'),
  viewSettings: document.getElementById('view-settings'),

  // Dashboard View Elements
  statsSection: document.getElementById('stats-section'),
  recentGrid: document.getElementById('recent-grid'),

  // Category View Elements
  libraryTitle: document.getElementById('library-title'),
  librarySubtitle: document.getElementById('library-subtitle'),
  categoryStatsSection: document.getElementById('category-stats-section'),
  addBtnText: document.getElementById('add-btn-text'),
  searchInput: document.getElementById('search-input'),
  statusFilter: document.getElementById('status-filter'),
  languageFilter: document.getElementById('language-filter'),
  sortPillsContainer: document.getElementById('sort-pills'),
  addItemBtn: document.getElementById('add-item-btn'),
  emptyAddBtn: document.getElementById('empty-add-btn'),
  itemsGrid: document.getElementById('items-grid'),
  emptyState: document.getElementById('empty-state'),
  analyticsGrid: document.getElementById('analytics-grid'),

  // Settings View Elements
  addCategoryForm: document.getElementById('add-category-form'),
  newCategoryInput: document.getElementById('new-category-input'),
  categoriesList: document.getElementById('categories-list'),
  settingsExportBtn: document.getElementById('settings-export-btn'),
  settingsImportBtn: document.getElementById('settings-import-btn'),
  importFileInput: document.getElementById('import-file-input'),

  // Modal & Form
  itemModal: document.getElementById('item-modal'),
  modalTitle: document.getElementById('modal-title'),
  modalCloseBtn: document.getElementById('modal-close-btn'),
  itemForm: document.getElementById('item-form'),
  formId: document.getElementById('item-id'),
  formTitle: document.getElementById('form-title'),
  formType: document.getElementById('form-type'),
  formCreator: document.getElementById('form-creator'),
  creatorLabel: document.getElementById('creator-label'),
  formStatus: document.getElementById('form-status'),
  formLanguage: document.getElementById('form-language'),
  customLanguageGroup: document.getElementById('custom-language-group'),
  formCustomLanguage: document.getElementById('form-custom-language'),
  formCover: document.getElementById('form-cover'),
  formStartDate: document.getElementById('form-start-date'),
  formEndDate: document.getElementById('form-end-date'),
  formNotes: document.getElementById('form-notes'),
  formMyList: document.getElementById('form-mylist'),
  formDeleteBtn: document.getElementById('form-delete-btn'),
  formCancelBtn: document.getElementById('form-cancel-btn'),
  formConditionalFields: document.getElementById('status-conditional-fields'),

  // Toast Container
  toastContainer: document.getElementById('toast-container')
};

// ==========================================================================
// INITIALIZATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  setupEventListeners();
  applyTheme();
  navigate(state.currentView);
});

// ==========================================================================
// THEME MANAGEMENT
// ==========================================================================
function applyTheme() {
  // Permanently set to light-theme (Pinkwhite)
  state.theme = 'light-theme';
  document.body.className = 'light-theme';
  
  if (DOM.themeToggleBtn) {
    const icon = DOM.themeToggleBtn.querySelector('i');
    if (icon) {
      icon.className = 'fa-solid fa-moon';
    }
  }
}

function toggleTheme() {
  // Theme is locked to Pinkwhite (light-theme)
  state.theme = 'light-theme';
  localStorage.setItem('yl_theme', 'light-theme');
  applyTheme();
}

// ==========================================================================
// SIDEBAR CONTROL
// ==========================================================================
function toggleSidebar(open = true) {
  if (open) {
    DOM.sidebarMenu.classList.add('active');
    DOM.sidebarOverlay.classList.add('active');
    renderSidebarNav();
  } else {
    DOM.sidebarMenu.classList.remove('active');
    DOM.sidebarOverlay.classList.remove('active');
  }
}

// ==========================================================================
// DATA PERSISTENCE & MIGRATION
// ==========================================================================
function loadData() {
  // Enforce Light Theme (Pinkwhite)
  state.theme = 'light-theme';
  localStorage.setItem('yl_theme', 'light-theme');

  // Load Categories
  const savedCategories = localStorage.getItem('yl_categories');
  if (savedCategories) {
    try {
      state.categories = JSON.parse(savedCategories);
    } catch (e) {
      console.error('Failed to parse categories, resetting to defaults.', e);
    }
  }
  if (!Array.isArray(state.categories) || state.categories.length === 0) {
    state.categories = ["Books", "Dramas", "Mangas", "Animes"];
  }

  // Load Languages
  const savedLanguages = localStorage.getItem('yl_languages');
  if (savedLanguages) {
    try {
      state.languages = JSON.parse(savedLanguages);
    } catch (e) {
      console.error('Failed to parse languages, resetting to defaults.', e);
    }
  }
  if (!Array.isArray(state.languages) || state.languages.length === 0) {
    state.languages = ["Japanese", "English", "Korean", "Chinese"];
  }

  // Load Items
  const savedItems = localStorage.getItem('yl_items');
  if (savedItems) {
    try {
      let items = JSON.parse(savedItems);
      // Migration: Convert legacy book/drama types to capitalized categories
      state.items = items.map(item => {
        if (item.type === 'book') item.type = 'Books';
        if (item.type === 'drama') item.type = 'Dramas';
        
        // Language fallback migration
        if (!item.language) {
          if (item.title === 'Norwegian Wood') item.language = 'Japanese';
          else if (item.title === 'Stranger Things') item.language = 'English';
          else if (item.title === 'The Three-Body Problem') item.language = 'Chinese';
          else item.language = 'English';
        }
        // Migrate mock-3 status to completed
        if (item.id === 'mock-3' && item.status === 'planning') {
          item.status = 'completed';
          item.rating = 5;
          item.startDate = '2026-06-10';
          item.endDate = '2026-06-20';
          item.notes = 'An absolutely mind-bending sci-fi masterpiece. The scope of the story is huge, combining hard physics with deep sociological questions. Highly recommended.';
        }
        return item;
      });

      // Ensure loaded categories are present
      state.items.forEach(item => {
        if (item.type && !state.categories.includes(item.type)) {
          state.categories.push(item.type);
        }
        if (item.language && !state.languages.includes(item.language)) {
          state.languages.push(item.language);
        }
      });
      saveItems();
      saveCategories();
      saveLanguages();
    } catch (e) {
      console.error('Failed to parse items from local storage', e);
      state.items = [];
      showToast('Failed to load library database.', 'error');
    }
  } else {
    // Insert mock data if empty
    state.items = getMockItems();
    saveItems();
  }

  // Initialize Firebase (if config exists)
  initFirebaseFromSavedConfig();
}

function saveItems() {
  localStorage.setItem('yl_items', JSON.stringify(state.items));
  triggerCloudSave();
}

function saveCategories() {
  localStorage.setItem('yl_categories', JSON.stringify(state.categories));
  triggerCloudSave();
}

function saveLanguages() {
  localStorage.setItem('yl_languages', JSON.stringify(state.languages));
  triggerCloudSave();
}

// ==========================================================================
// FIREBASE CLOUD SYNC & AUTHENTICATION
// ==========================================================================
async function initFirebaseFromSavedConfig() {
  const savedConfigStr = localStorage.getItem('yl_firebase_config');
  const configInput = document.getElementById('firebase-config-input');
  
  if (savedConfigStr && configInput && !configInput.value.trim()) {
    try {
      configInput.value = JSON.stringify(JSON.parse(savedConfigStr), null, 2);
    } catch (e) {
      configInput.value = savedConfigStr;
    }
  }

  if (!savedConfigStr) {
    updateFirebaseUIStatus('local');
    renderSidebarProfile();
    return;
  }
  
  try {
    const config = JSON.parse(savedConfigStr);
    updateFirebaseUIStatus('connecting');
    
    if (firebase.apps.length > 0) {
      await firebase.app().delete();
    }
    firebase.initializeApp(config);
    
    firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        state.user = user;
        state.db = firebase.firestore();
        updateFirebaseUIStatus('connected', user.email);
        renderSidebarProfile();
        
        state.isSyncing = true;
        await syncFromCloud();
        state.isSyncing = false;
      } else {
        state.user = null;
        state.db = null;
        updateFirebaseUIStatus('connected_logged_out');
        renderSidebarProfile();
      }
    });
  } catch (e) {
    console.error('Firebase initialization failed:', e);
    updateFirebaseUIStatus('error', e.message);
    renderSidebarProfile();
  }
}

function updateFirebaseUIStatus(status, detail = '') {
  const banner = document.getElementById('firebase-status-banner');
  const text = document.getElementById('firebase-status-text');
  const disconnectBtn = document.getElementById('firebase-disconnect-btn');
  
  if (!banner || !text) return;
  
  banner.className = 'firebase-status-banner ' + (status === 'connecting' ? 'local' : (status.startsWith('connected') ? 'connected' : (status === 'error' ? 'error' : 'local')));
  
  if (status === 'local') {
    text.textContent = 'Local Storage Mode';
    if (disconnectBtn) disconnectBtn.style.display = 'none';
  } else if (status === 'connecting') {
    text.textContent = 'Connecting to Firebase...';
  } else if (status === 'connected') {
    text.textContent = `Connected (Logged in: ${detail})`;
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  } else if (status === 'connected_logged_out') {
    text.textContent = 'Connected (Logged out)';
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  } else if (status === 'error') {
    text.textContent = `Connection Error: ${detail}`;
    if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
  }
}

async function handleFirebaseSave() {
  const configInput = document.getElementById('firebase-config-input');
  if (!configInput) return;
  
  const rawInput = configInput.value.trim();
  if (!rawInput) {
    showToast('Please paste a valid Firebase configuration object.', 'error');
    return;
  }
  
  try {
    const config = parseFirebaseConfig(rawInput);
    
    // Save to LocalStorage
    localStorage.setItem('yl_firebase_config', JSON.stringify(config));
    showToast('Firebase configuration saved! Connecting...', 'info');
    
    // Initialize
    await initFirebaseFromSavedConfig();
  } catch (e) {
    showToast(e.message, 'error');
  }
}

async function handleFirebaseDisconnect() {
  if (confirm('Are you sure you want to disconnect from Firebase? The app will return to local storage mode.')) {
    try {
      if (firebase.apps.length > 0) {
        if (firebase.auth()) {
          await firebase.auth().signOut();
        }
        await firebase.app().delete();
      }
    } catch (e) {
      console.error('Error during teardown:', e);
    }
    
    localStorage.removeItem('yl_firebase_config');
    localStorage.removeItem('yl_last_uid');
    state.user = null;
    state.db = null;
    
    const configInput = document.getElementById('firebase-config-input');
    if (configInput) configInput.value = '';
    
    updateFirebaseUIStatus('local');
    renderSidebarProfile();
    showToast('Disconnected from Firebase. Working locally.', 'info');
    
    loadLocalDataOnly();
    
    renderSidebarNav();
    if (state.currentView === 'dashboard') {
      navigate('dashboard');
    } else if (state.currentView === 'settings') {
      renderSettingsPage();
    } else {
      navigate('dashboard');
    }
  }
}

function loadLocalDataOnly() {
  // Load Categories
  const savedCategories = localStorage.getItem('yl_categories');
  if (savedCategories) {
    try {
      state.categories = JSON.parse(savedCategories);
    } catch (e) {}
  }
  
  // Load Languages
  const savedLanguages = localStorage.getItem('yl_languages');
  if (savedLanguages) {
    try {
      state.languages = JSON.parse(savedLanguages);
    } catch (e) {}
  }
  
  // Load Items
  const savedItems = localStorage.getItem('yl_items');
  if (savedItems) {
    try {
      state.items = JSON.parse(savedItems);
    } catch (e) {
      state.items = [];
    }
  }
}

function parseFirebaseConfig(rawInput) {
  let str = rawInput.trim();
  
  // Find the position of 'apiKey' (either quoted or unquoted)
  let apiKeyIdx = str.indexOf('apiKey');
  if (apiKeyIdx === -1) {
    apiKeyIdx = str.indexOf('"apiKey"');
    if (apiKeyIdx === -1) {
      apiKeyIdx = str.indexOf("'apiKey'");
    }
  }
  
  if (apiKeyIdx === -1) {
    throw new Error('Could not find "apiKey" inside the configuration block. Please ensure you copied the complete firebaseConfig object.');
  }
  
  // Find the opening brace '{' of the config object right before 'apiKey'
  const startIdx = str.lastIndexOf('{', apiKeyIdx);
  if (startIdx === -1) {
    throw new Error('Could not find the opening brace "{" before "apiKey". Please verify your input.');
  }
  
  // Find the matching closing brace '}' starting from startIdx
  let braceCount = 0;
  let endIdx = -1;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') {
      braceCount++;
    } else if (str[i] === '}') {
      braceCount--;
      if (braceCount === 0) {
        endIdx = i;
        break;
      }
    }
  }
  
  if (endIdx === -1) {
    throw new Error('Could not find the matching closing brace "}" for the configuration object.');
  }
  
  let body = str.substring(startIdx, endIdx + 1);
  
  // Remove comments (single line and multi line)
  body = body.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
  
  // Convert JS object format to valid JSON
  // 1. Ensure keys are double-quoted
  body = body.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
  
  // 2. Replace single quotes around values with double quotes
  body = body.replace(/:\s*'([^'\\]*(?:\\.[^'\\]*)*)'/g, ': "$1"');
  
  // 3. Remove trailing commas before } or ]
  body = body.replace(/,\s*([}\]])/g, '$1');
  
  try {
    const parsed = JSON.parse(body);
    if (!parsed.apiKey || !parsed.authDomain || !parsed.projectId) {
      throw new Error('Missing required fields: apiKey, authDomain, or projectId.');
    }
    return parsed;
  } catch (e) {
    console.error('JS-to-JSON cleaning failed. Input was:', rawInput, 'Error:', e);
    throw new Error('Invalid JSON format. Please copy the complete firebaseConfig object: ' + e.message);
  }
}

async function handleSignIn() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    await firebase.auth().signInWithPopup(provider);
    showToast('Signed in successfully!', 'success');
  } catch (e) {
    console.error('Sign-in error:', e);
    showToast('Failed to sign in: ' + e.message, 'error');
  }
}

async function handleSignOut() {
  try {
    await firebase.auth().signOut();
    showToast('Signed out successfully!', 'success');
  } catch (e) {
    console.error('Sign-out error:', e);
    showToast('Failed to sign out: ' + e.message, 'error');
  }
}

function renderSidebarProfile() {
  const container = document.getElementById('sidebar-profile');
  if (!container) return;
  
  if (state.user) {
    container.innerHTML = `
      <div class="profile-logged-in">
        <img src="${state.user.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'}" alt="Avatar" class="profile-avatar">
        <div class="profile-info">
          <div class="profile-name">${escapeHtml(state.user.displayName || 'User')}</div>
          <div class="profile-email">${escapeHtml(state.user.email || '')}</div>
        </div>
        <button id="google-signout-btn" class="profile-signout-btn" title="Sign Out">
          <i class="fa-solid fa-right-from-bracket"></i>
        </button>
      </div>
    `;
    const btn = document.getElementById('google-signout-btn');
    if (btn) btn.addEventListener('click', handleSignOut);
  } else {
    const isFirebaseConfigured = !!localStorage.getItem('yl_firebase_config');
    if (isFirebaseConfigured) {
      container.innerHTML = `
        <div class="profile-logged-out">
          <button id="google-signin-btn" class="btn-google">
            <i class="fa-brands fa-google"></i>
            <span>Sign in with Google</span>
          </button>
        </div>
      `;
      const btn = document.getElementById('google-signin-btn');
      if (btn) btn.addEventListener('click', handleSignIn);
    } else {
      container.innerHTML = `
        <div class="profile-logged-out">
          <button id="sidebar-setup-cloud-btn" class="btn-google">
            <i class="fa-solid fa-cloud"></i>
            <span>Setup Cloud Sync</span>
          </button>
        </div>
      `;
      const btn = document.getElementById('sidebar-setup-cloud-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          navigate('settings');
          const card = document.getElementById('firebase-settings-card');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth' });
            card.classList.add('highlight-flash');
            setTimeout(() => card.classList.remove('highlight-flash'), 1500);
          }
        });
      }
    }
  }
}

async function triggerCloudSave() {
  if (state.isSyncing || !state.user || !state.db) return;
  
  try {
    const docRef = state.db.collection('users').doc(state.user.uid).collection('data').doc('library');
    await docRef.set({
      items: state.items,
      categories: state.categories,
      languages: state.languages,
      updatedAt: new Date().toISOString()
    });
    console.log('Successfully synced library to Firestore.');
  } catch (e) {
    console.error('Failed to save data to cloud:', e);
    showToast('Failed to sync to cloud. Working offline.', 'error');
  }
}

function mergeLibraryData(localItems, cloudItems) {
  const mergedMap = new Map();
  
  localItems.forEach(item => {
    mergedMap.set(item.id, item);
  });
  
  cloudItems.forEach(cloudItem => {
    if (mergedMap.has(cloudItem.id)) {
      const localItem = mergedMap.get(cloudItem.id);
      const localTime = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
      const cloudTime = new Date(cloudItem.updatedAt || cloudItem.createdAt || 0).getTime();
      
      if (cloudTime >= localTime) {
        mergedMap.set(cloudItem.id, cloudItem);
      }
    } else {
      mergedMap.set(cloudItem.id, cloudItem);
    }
  });
  
  return Array.from(mergedMap.values());
}

function mergeLists(localList, cloudList) {
  return Array.from(new Set([...localList, ...cloudList]));
}

async function syncFromCloud() {
  if (!state.user || !state.db) return;
  
  try {
    const docRef = state.db.collection('users').doc(state.user.uid).collection('data').doc('library');
    const doc = await docRef.get();
    
    const lastUid = localStorage.getItem('yl_last_uid');
    const isNewUser = lastUid && lastUid !== state.user.uid;
    
    localStorage.setItem('yl_last_uid', state.user.uid);
    
    if (doc.exists) {
      const cloudData = doc.data();
      const cloudItems = cloudData.items || [];
      const cloudCategories = cloudData.categories || [];
      const cloudLanguages = cloudData.languages || [];
      
      if (isNewUser) {
        state.items = cloudItems;
        state.categories = cloudCategories;
        state.languages = cloudLanguages;
        showToast('Loaded library for ' + state.user.displayName, 'success');
      } else {
        state.items = mergeLibraryData(state.items, cloudItems);
        state.categories = mergeLists(state.categories, cloudCategories);
        state.languages = mergeLists(state.languages, cloudLanguages);
        showToast('Library synced with cloud!', 'success');
      }
    } else {
      if (isNewUser) {
        state.items = [];
        state.categories = ["Books", "Dramas", "Mangas", "Animes"];
        state.languages = ["Japanese", "English", "Korean", "Chinese"];
        showToast('Created new library for ' + state.user.displayName, 'success');
      } else {
        showToast('Uploading local library to cloud...', 'info');
      }
    }
    
    localStorage.setItem('yl_items', JSON.stringify(state.items));
    localStorage.setItem('yl_categories', JSON.stringify(state.categories));
    localStorage.setItem('yl_languages', JSON.stringify(state.languages));
    
    await triggerCloudSave();
    
    // Refresh active view
    renderSidebarNav();
    if (state.currentView === 'dashboard') {
      renderDashboard();
    } else if (state.currentView === 'settings') {
      renderSettingsPage();
    } else {
      renderLibraryPage(state.currentView);
    }
  } catch (e) {
    console.error('Error syncing cloud:', e);
    showToast('Failed to sync cloud: ' + e.message, 'error');
  }
}

// ==========================================================================
// SPA ROUTER / VIEW ENGINE
// ==========================================================================
function navigate(view) {
  state.currentView = view;
  toggleSidebar(false); // Close sidebar after clicking

  // Hide all view containers
  DOM.viewDashboard.classList.add('hidden');
  DOM.viewLibrary.classList.add('hidden');
  DOM.viewSettings.classList.add('hidden');

  // Reset filters when switching pages
  state.filters.search = '';
  state.filters.status = 'all';
  state.filters.language = 'all';
  state.filters.sortBy = 'newest';
  
  if (DOM.searchInput) DOM.searchInput.value = '';
  if (DOM.statusFilter) DOM.statusFilter.value = 'all';
  if (DOM.sortPillsContainer) {
    const pills = DOM.sortPillsContainer.querySelectorAll('.sort-pill');
    pills.forEach(p => {
      const isNewest = p.getAttribute('data-sort') === 'newest';
      p.classList.toggle('active', isNewest);
    });
  }

  // Show active view container and trigger renderer
  if (view === 'dashboard') {
    DOM.viewDashboard.classList.remove('hidden');
    renderDashboard();
  } else if (view === 'settings') {
    DOM.viewSettings.classList.remove('hidden');
    renderSettingsPage();
  } else {
    // Library View (Category specific)
    DOM.viewLibrary.classList.remove('hidden');
    renderLibraryPage(view);
  }

  // Refresh sidebar nav state
  renderSidebarNav();
}

// ==========================================================================
// EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Sidebar Toggles
  if (DOM.themeToggleBtn) {
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  }
  DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
  DOM.sidebarCloseBtn.addEventListener('click', () => toggleSidebar(false));
  DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

  // Logo Brand navigates to Dashboard
  const logoBrand = document.getElementById('logo-brand');
  if (logoBrand) {
    logoBrand.addEventListener('click', () => navigate('dashboard'));
  }

  // Category Add Form Submit (inside settings page)
  DOM.addCategoryForm.addEventListener('submit', handleAddCategory);

  // Search & Filter Inputs (inside library page)
  DOM.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim();
    renderList();
  });

  if (DOM.statusFilter) {
    DOM.statusFilter.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      renderList();
    });
  }

  DOM.languageFilter.addEventListener('change', (e) => {
    state.filters.language = e.target.value;
    renderList();
  });

  DOM.formStatus.addEventListener('change', (e) => {
    toggleModalFields(e.target.value);
  });

  if (DOM.sortPillsContainer) {
    DOM.sortPillsContainer.addEventListener('click', (e) => {
      const pill = e.target.closest('.sort-pill');
      if (pill) {
        state.filters.sortBy = pill.getAttribute('data-sort');
        const pills = DOM.sortPillsContainer.querySelectorAll('.sort-pill');
        pills.forEach(p => p.classList.toggle('active', p === pill));
        renderList();
      }
    });
  }

  // Modal Open Trigger
  DOM.addItemBtn.addEventListener('click', () => openModal());
  DOM.emptyAddBtn.addEventListener('click', () => openModal());

  // Modal Close Triggers
  DOM.modalCloseBtn.addEventListener('click', closeModal);
  DOM.formCancelBtn.addEventListener('click', closeModal);
  DOM.itemModal.addEventListener('click', (e) => {
    if (e.target === DOM.itemModal) closeModal();
  });

  // Category change within modal form
  DOM.formType.addEventListener('change', updateCreatorLabel);

  // Language selection change within modal form (triggers custom input display)
  DOM.formLanguage.addEventListener('change', handleFormLanguageChange);

  // Form Submission
  DOM.itemForm.addEventListener('submit', handleFormSubmit);

  // Delete Action in Form
  DOM.formDeleteBtn.addEventListener('click', handleDeleteItem);

  // Dynamic Autocomplete Online Search (Dual-compatible with cached HTML)
  let searchDebounceTimer = null;

  const registerInputAutocomplete = (inputEl) => {
    if (!inputEl) return;
    inputEl.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
      
      const onlineSearchResults = document.getElementById('online-search-results');
      if (!onlineSearchResults) return;
      
      if (query.length < 2) {
        onlineSearchResults.classList.add('hidden');
        return;
      }

      // Dynamically re-parent the suggestions list to match the active input container
      const parent = inputEl.parentNode;
      parent.style.position = 'relative';
      parent.appendChild(onlineSearchResults);
      
      searchDebounceTimer = setTimeout(() => {
        handleOnlineSearch(query);
      }, 300);
    });
  };

  registerInputAutocomplete(DOM.formTitle);
  registerInputAutocomplete(document.getElementById('online-search-input'));

  // Also bind the old search button just in case they click it in cached HTML
  const onlineSearchBtn = document.getElementById('online-search-btn');
  if (onlineSearchBtn) {
    onlineSearchBtn.addEventListener('click', () => {
      const input = document.getElementById('online-search-input');
      if (input) {
        const query = input.value.trim();
        if (query) {
          const onlineSearchResults = document.getElementById('online-search-results');
          if (onlineSearchResults) {
            const parent = input.parentNode;
            parent.style.position = 'relative';
            parent.appendChild(onlineSearchResults);
          }
          handleOnlineSearch(query);
        }
      }
    });
  }

  // Click outside search results to close dropdown
  document.addEventListener('click', (e) => {
    const onlineSearchResults = document.getElementById('online-search-results');
    if (onlineSearchResults && !onlineSearchResults.classList.contains('hidden')) {
      if (!e.target.closest('.form-group') && !e.target.closest('.online-search-bar') && !e.target.closest('.online-search-group')) {
        onlineSearchResults.classList.add('hidden');
      }
    }
  });

  // Export & Import Database Bindings (in Settings View)
  DOM.settingsExportBtn.addEventListener('click', exportLibrary);
  DOM.settingsImportBtn.addEventListener('click', () => DOM.importFileInput.click());
  DOM.importFileInput.addEventListener('change', handleImportFile);

  // Firebase Controls (in Settings View)
  const firebaseSaveBtn = document.getElementById('firebase-save-btn');
  const firebaseDisconnectBtn = document.getElementById('firebase-disconnect-btn');
  const guideToggleBtn = document.getElementById('guide-toggle-btn');
  
  if (firebaseSaveBtn) {
    firebaseSaveBtn.addEventListener('click', handleFirebaseSave);
  }
  if (firebaseDisconnectBtn) {
    firebaseDisconnectBtn.addEventListener('click', handleFirebaseDisconnect);
  }
  if (guideToggleBtn) {
    guideToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const guide = document.getElementById('firebase-guide');
      if (guide) {
        guide.classList.toggle('hidden');
        guideToggleBtn.textContent = guide.classList.contains('hidden') ? 'View Setup Guide' : 'Hide Setup Guide';
      }
    });
  }
}

// ==========================================================================
// RENDER COMPONENT: SIDEBAR NAVIGATION
// ==========================================================================
function renderSidebarNav() {
  DOM.sidebarNav.innerHTML = '';

  // 1. Dashboard Nav Link
  const dashLink = document.createElement('button');
  dashLink.className = `sidebar-nav-item ${state.currentView === 'dashboard' ? 'active' : ''}`;
  dashLink.innerHTML = `<i class="fa-solid fa-chart-simple"></i> <span>Dashboard</span>`;
  dashLink.addEventListener('click', () => navigate('dashboard'));
  DOM.sidebarNav.appendChild(dashLink);

  // 2. Divider label
  if (state.categories.length > 0) {
    const divider = document.createElement('div');
    divider.className = 'section-desc';
    divider.style.margin = '1rem 0 0.5rem 1rem';
    divider.style.fontWeight = '700';
    divider.style.textTransform = 'uppercase';
    divider.style.letterSpacing = '0.05em';
    divider.textContent = 'Collections';
    DOM.sidebarNav.appendChild(divider);

    // MyList Virtual Collection Link (at the top of Collections)
    const myListLink = document.createElement('button');
    myListLink.className = `sidebar-nav-item ${state.currentView === 'mylist' ? 'active' : ''}`;
    myListLink.innerHTML = `
      <i class="fa-solid fa-bookmark" style="color: #ea4335;"></i>
      <span>MyList</span>
    `;
    myListLink.addEventListener('click', () => navigate('mylist'));
    DOM.sidebarNav.appendChild(myListLink);
  }

  // 3. Category dynamic links
  state.categories.forEach(category => {
    const catLink = document.createElement('button');
    catLink.className = `sidebar-nav-item ${state.currentView === category ? 'active' : ''}`;
    
    // Select icon
    let iconClass = 'fa-solid fa-tag';
    const lower = category.toLowerCase();
    if (lower.includes('book')) iconClass = 'fa-solid fa-book-open';
    if (lower.includes('drama') || lower.includes('show') || lower.includes('movie')) iconClass = 'fa-solid fa-video';
    if (lower.includes('manga') || lower.includes('comic')) iconClass = 'fa-solid fa-book';
    if (lower.includes('anime')) iconClass = 'fa-solid fa-tv';

    const colors = getCategoryGradient(category);

    catLink.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${escapeHtml(category)}</span>
      <span class="category-dot" style="background-color: ${colors[0]}; margin-left: auto;"></span>
    `;
    catLink.addEventListener('click', () => navigate(category));
    DOM.sidebarNav.appendChild(catLink);
  });

  // 4. Settings link
  const setLink = document.createElement('button');
  setLink.className = `sidebar-nav-item ${state.currentView === 'settings' ? 'active' : ''}`;
  setLink.style.marginTop = 'auto'; // push settings to bottom
  setLink.innerHTML = `<i class="fa-solid fa-gear"></i> <span>Settings</span>`;
  setLink.addEventListener('click', () => navigate('settings'));
  DOM.sidebarNav.appendChild(setLink);
}

// ==========================================================================
// RENDER COMPONENT: DASHBOARD VIEW
// ==========================================================================
function renderDashboard() {
  DOM.statsSection.innerHTML = '';
  if (DOM.analyticsGrid) DOM.analyticsGrid.innerHTML = '';

  const total = state.items.length;
  const completedCount = state.items.filter(i => i.status === 'completed').length;
  const readingCount = state.items.filter(i => i.status === 'reading').length;
  const planningCount = state.items.filter(i => i.status === 'planning').length;
  
  // 1. Total Logged Card
  const totalCard = document.createElement('div');
  totalCard.className = 'stat-card';
  totalCard.innerHTML = `
    <div class="stat-icon icon-blue">
      <i class="fa-solid fa-cubes"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${total}</span>
      <span class="stat-label">Total Logged</span>
    </div>
  `;
  totalCard.addEventListener('click', () => openModal());
  DOM.statsSection.appendChild(totalCard);

  // 2. Completed Card
  const completedCard = document.createElement('div');
  completedCard.className = 'stat-card';
  completedCard.innerHTML = `
    <div class="stat-icon icon-violet" style="color: var(--color-green); background-color: rgba(16, 185, 129, 0.12);">
      <i class="fa-solid fa-circle-check"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${completedCount}</span>
      <span class="stat-label">Completed</span>
    </div>
  `;
  completedCard.addEventListener('click', () => openModal(null, 'completed'));
  DOM.statsSection.appendChild(completedCard);

  // 3. In Progress Card
  const progressCard = document.createElement('div');
  progressCard.className = 'stat-card';
  progressCard.innerHTML = `
    <div class="stat-icon icon-blue">
      <i class="fa-solid fa-spinner"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${readingCount}</span>
      <span class="stat-label">In Progress</span>
    </div>
  `;
  progressCard.addEventListener('click', () => openModal(null, 'reading'));
  DOM.statsSection.appendChild(progressCard);

  // 4. My List Card
  const planningCard = document.createElement('div');
  planningCard.className = 'stat-card';
  planningCard.innerHTML = `
    <div class="stat-icon icon-amber">
      <i class="fa-solid fa-bookmark"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${planningCount}</span>
      <span class="stat-label">My List</span>
    </div>
  `;
  planningCard.addEventListener('click', () => openModal(null, 'planning'));
  DOM.statsSection.appendChild(planningCard);

  // 4.5 Donut Chart Category Distribution
  const donutChart = document.getElementById('dashboard-donut-chart');
  const donutTotal = document.getElementById('donut-total-count');
  const pieLegend = document.getElementById('dashboard-pie-legend');

  if (donutChart && donutTotal && pieLegend) {
    pieLegend.innerHTML = '';
    donutTotal.textContent = total;

    if (total === 0) {
      donutChart.style.background = `conic-gradient(var(--border-color) 0% 100%)`;
      state.categories.forEach((category, idx) => {
        const catColor = getCategoryGradient(category)[0];
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
          <span class="legend-dot" style="background-color: ${catColor};"></span>
          <div class="legend-info">
            <span class="legend-name">${escapeHtml(category)}</span>
            <span class="legend-value">0 (0%)</span>
          </div>
        `;
        legendItem.addEventListener('click', () => navigate(category));
        pieLegend.appendChild(legendItem);
      });
    } else {
      let conicParts = [];
      let accumulatedPercent = 0;

      state.categories.forEach((category, idx) => {
        const catItems = state.items.filter(i => i.type === category);
        const catCount = catItems.length;
        const pct = (catCount / total) * 100;
        const catColor = getCategoryGradient(category)[0];

        if (pct > 0) {
          conicParts.push(`${catColor} ${accumulatedPercent}% ${(accumulatedPercent + pct)}%`);
          accumulatedPercent += pct;
        }

        // Render legend item
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
          <span class="legend-dot" style="background-color: ${catColor};"></span>
          <div class="legend-info">
            <span class="legend-name">${escapeHtml(category)}</span>
            <span class="legend-value">${catCount} (${pct.toFixed(0)}%)</span>
          </div>
        `;
        legendItem.addEventListener('click', () => navigate(category));
        pieLegend.appendChild(legendItem);
      });

      donutChart.style.background = `conic-gradient(${conicParts.join(', ')})`;
    }
  }

  // 5. Topic Analytics Cards
  if (DOM.analyticsGrid) {
    // Card A: Topic Distribution & Progress Breakdown
    const distCard = document.createElement('div');
    distCard.className = 'analytics-card';
    distCard.innerHTML = `
      <h4><i class="fa-solid fa-chart-pie"></i> Distribution by Status</h4>
      <div class="distribution-content" id="distribution-content"></div>
    `;
    DOM.analyticsGrid.appendChild(distCard);
    const distContent = distCard.querySelector('#distribution-content');

    // Card B: Topic Ratings & Highlights
    const ratingsCard = document.createElement('div');
    ratingsCard.className = 'analytics-card';
    ratingsCard.innerHTML = `
      <h4><i class="fa-solid fa-ranking-stars"></i> Average Ratings & Awards</h4>
      <div class="ratings-content" id="ratings-content"></div>
    `;
    DOM.analyticsGrid.appendChild(ratingsCard);
    const ratingsContent = ratingsCard.querySelector('#ratings-content');

    // Compute stats for each category
    state.categories.forEach(category => {
      const catItems = state.items.filter(i => i.type === category);
      const catCount = catItems.length;

      // Card A: stacked progress segment computation
      const catCompleted = catItems.filter(i => i.status === 'completed').length;
      const catReading = catItems.filter(i => i.status === 'reading').length;
      const catPlanning = catItems.filter(i => i.status === 'planning').length;

      const compPct = catCount > 0 ? (catCompleted / catCount) * 100 : 0;
      const readPct = catCount > 0 ? (catReading / catCount) * 100 : 0;
      const planPct = catCount > 0 ? (catPlanning / catCount) * 100 : 0;

      const rowA = document.createElement('div');
      rowA.className = 'category-analysis-row';
      rowA.style.cursor = 'pointer';
      rowA.innerHTML = `
        <div class="category-info">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-count">${catCount} ${catCount === 1 ? 'item' : 'items'}</span>
        </div>
        <div class="progress-bar-stacked">
          <div class="progress-segment completed" style="width: ${compPct}%;" title="Completed: ${catCompleted}"></div>
          <div class="progress-segment reading" style="width: ${readPct}%;" title="In Progress: ${catReading}"></div>
          <div class="progress-segment planning" style="width: ${planPct}%;" title="My List: ${catPlanning}"></div>
        </div>
        <div class="category-legend">
          <span><span class="dot completed"></span> Completed: ${catCompleted}</span>
          <span><span class="dot reading"></span> In Progress: ${catReading}</span>
          <span><span class="dot planning"></span> My List: ${catPlanning}</span>
        </div>
      `;
      rowA.addEventListener('click', () => navigate(category));
      distContent.appendChild(rowA);

      // Card B: average rating and highlights computation
      const ratedItems = catItems.filter(i => i.rating > 0);
      const avgRating = ratedItems.length > 0 
        ? (ratedItems.reduce((sum, item) => sum + item.rating, 0) / ratedItems.length).toFixed(1) 
        : '0.0';

      // Find top-rated item
      let topItemTitle = 'None';
      if (ratedItems.length > 0) {
        const sortedRated = [...ratedItems].sort((a, b) => b.rating - a.rating || new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        topItemTitle = sortedRated[0].title;
      }

      const ratingPct = (parseFloat(avgRating) / 5) * 100;

      const rowB = document.createElement('div');
      rowB.className = 'category-rating-row';
      rowB.style.cursor = 'pointer';
      rowB.innerHTML = `
        <div class="category-rating-header">
          <span class="category-name">${escapeHtml(category)}</span>
          <span class="category-avg-rating"><i class="fa-solid fa-star"></i> ${avgRating}</span>
        </div>
        <div class="category-rating-bar">
          <div class="rating-bar-fill" style="width: ${ratingPct}%;"></div>
        </div>
        <div class="category-top-item">
          <i class="fa-solid fa-award"></i> Top Rated: <span>${escapeHtml(topItemTitle)}</span>
        </div>
      `;
      rowB.addEventListener('click', () => navigate(category));
      ratingsContent.appendChild(rowB);
    });
  }

  // Render "Recent Logs" list (newest 4 items)
  DOM.recentGrid.innerHTML = '';
  const recentItems = [...state.items].slice(0, 4);

  if (recentItems.length === 0) {
    DOM.recentGrid.innerHTML = `
      <div class="empty-state" style="display: flex; grid-column: 1/-1; padding: 2rem;">
        <p>No logged items yet. Click any collection page in the menu to start cataloging!</p>
      </div>
    `;
  } else {
    recentItems.forEach(item => {
      DOM.recentGrid.appendChild(createCard(item));
    });
  }
}

// ==========================================================================
// RENDER COMPONENT: CATEGORY LIBRARY PAGE
// ==========================================================================
function renderLibraryPage(categoryName) {
  const isMyList = categoryName === 'mylist';
  
  if (isMyList) {
    DOM.libraryTitle.textContent = `My List`;
    DOM.librarySubtitle.textContent = `Manage and track your bookmarked items.`;
    DOM.addItemBtn.style.display = 'inline-flex';
    DOM.addBtnText.textContent = `Add Item`;
  } else {
    DOM.libraryTitle.textContent = `${categoryName} Collection`;
    DOM.librarySubtitle.textContent = `Manage and track your ${categoryName.toLowerCase()} logs.`;
    DOM.addItemBtn.style.display = 'inline-flex';
    DOM.addBtnText.textContent = `Add ${categoryName.replace(/s$/, '')}`;
  }

  // Render Category stats cards
  DOM.categoryStatsSection.innerHTML = '';
  const categoryItems = isMyList
    ? state.items.filter(i => i.myList === true)
    : state.items.filter(i => i.type === categoryName);
  
  // Total in category card
  const catTotalCard = document.createElement('div');
  catTotalCard.className = 'stat-card';
  catTotalCard.setAttribute('data-status-filter', 'all');
  const grad = getCategoryGradient(categoryName);
  catTotalCard.innerHTML = `
    <div class="stat-icon" style="background-color: ${grad[0]}1A; color: ${grad[0]};">
      <i class="fa-solid fa-list-ul"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${categoryItems.length}</span>
      <span class="stat-label">Total Logged</span>
    </div>
  `;
  catTotalCard.addEventListener('click', () => {
    state.filters.status = 'all';
    if (DOM.statusFilter) DOM.statusFilter.value = 'all';
    renderList();
  });
  DOM.categoryStatsSection.appendChild(catTotalCard);

  // Completed in category card
  const completedCount = categoryItems.filter(i => i.status === 'completed').length;
  const completedCard = document.createElement('div');
  completedCard.className = 'stat-card';
  completedCard.setAttribute('data-status-filter', 'completed');
  completedCard.innerHTML = `
    <div class="stat-icon" style="background-color: ${grad[0]}1A; color: ${grad[0]};">
      <i class="fa-solid fa-circle-check"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${completedCount}</span>
      <span class="stat-label">Completed</span>
    </div>
  `;
  completedCard.addEventListener('click', () => {
    state.filters.status = 'completed';
    if (DOM.statusFilter) DOM.statusFilter.value = 'completed';
    renderList();
  });
  DOM.categoryStatsSection.appendChild(completedCard);

  // In Progress in category card
  const progressCount = categoryItems.filter(i => i.status === 'reading').length;
  const progressCard = document.createElement('div');
  progressCard.className = 'stat-card';
  progressCard.setAttribute('data-status-filter', 'reading');
  progressCard.innerHTML = `
    <div class="stat-icon" style="background-color: ${grad[0]}1A; color: ${grad[0]};">
      <i class="fa-solid fa-spinner"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${progressCount}</span>
      <span class="stat-label">In Progress</span>
    </div>
  `;
  progressCard.addEventListener('click', () => {
    state.filters.status = 'reading';
    if (DOM.statusFilter) DOM.statusFilter.value = 'reading';
    renderList();
  });
  DOM.categoryStatsSection.appendChild(progressCard);

  // My List (Planning) in category card
  const catPlanningCount = categoryItems.filter(i => i.status === 'planning').length;

  const catPlanningCard = document.createElement('div');
  catPlanningCard.className = 'stat-card';
  catPlanningCard.setAttribute('data-status-filter', 'planning');
  catPlanningCard.innerHTML = `
    <div class="stat-icon" style="background-color: ${grad[0]}1A; color: ${grad[0]};">
      <i class="fa-solid fa-bookmark"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${catPlanningCount}</span>
      <span class="stat-label">My List</span>
    </div>
  `;
  catPlanningCard.addEventListener('click', () => {
    state.filters.status = 'planning';
    if (DOM.statusFilter) DOM.statusFilter.value = 'planning';
    renderList();
  });
  DOM.categoryStatsSection.appendChild(catPlanningCard);

  // Dynamically populate Language Filter dropdown
  populateLanguageFilter();

  // Render list of items
  renderList();
}

// ==========================================================================
// RENDER COMPONENT: SETTINGS & BACKUP PAGE
// ==========================================================================
function renderSettingsPage() {
  DOM.categoriesList.innerHTML = '';
  
  if (state.categories.length === 0) {
    DOM.categoriesList.innerHTML = `
      <li class="section-desc" style="text-align: center; padding: 1rem;">
        No active categories. Create one above.
      </li>
    `;
    return;
  }

  state.categories.forEach(category => {
    const li = document.createElement('li');
    li.className = 'category-item';

    const colors = getCategoryGradient(category);
    
    li.innerHTML = `
      <div class="category-name-wrapper">
        <span class="category-dot" style="background-color: ${colors[0]};"></span>
        <span>${escapeHtml(category)}</span>
      </div>
      <button class="category-delete-btn" title="Delete Category">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    `;

    li.querySelector('.category-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteCategory(category);
    });

    DOM.categoriesList.appendChild(li);
  });
}

// ==========================================================================
// CATEGORIES LOGIC IN SETTINGS
// ==========================================================================
function handleAddCategory(e) {
  e.preventDefault();
  const name = DOM.newCategoryInput.value.trim();
  if (!name) return;

  const duplicate = state.categories.some(cat => cat.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    showToast('Category already exists!', 'error');
    return;
  }

  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  state.categories.push(formattedName);
  saveCategories();
  
  DOM.newCategoryInput.value = '';
  renderSettingsPage();
  showToast(`Added category: ${formattedName}`, 'success');
}

function handleDeleteCategory(categoryName) {
  const count = state.items.filter(item => item.type === categoryName).length;
  let confirmMsg = `Are you sure you want to delete "${categoryName}"?`;
  
  if (count > 0) {
    confirmMsg = `There are ${count} items cataloged under "${categoryName}". Deleting it will keep the items, but unassign their category. Proceed?`;
  }

  if (confirm(confirmMsg)) {
    state.categories = state.categories.filter(cat => cat !== categoryName);
    saveCategories();

    // Clean deleted category reference in items
    state.items = state.items.map(item => {
      if (item.type === categoryName) {
        item.type = ''; // Unassign category
      }
      return item;
    });
    saveItems();

    // If we deleted the category page we are currently looking at, navigate home
    if (state.currentView === categoryName) {
      navigate('dashboard');
    } else {
      renderSettingsPage();
    }
    showToast(`Deleted category: ${categoryName}`, 'info');
  }
}

// ==========================================================================
// LANGUAGE FILTER POPULATER
// ==========================================================================
function populateLanguageFilter() {
  DOM.languageFilter.innerHTML = '';
  
  // All languages option
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'All Languages';
  DOM.languageFilter.appendChild(optAll);

  // Dynamic language options
  state.languages.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    DOM.languageFilter.appendChild(opt);
  });

  // Retain selected filter value
  DOM.languageFilter.value = state.filters.language;
}

// ==========================================================================
// RENDER ITEMS LIST (GRID VIEW FILTERED FOR LIBRARY PAGE)
// ==========================================================================
function renderList() {
  if (state.currentView === 'dashboard' || state.currentView === 'settings') return;

  // Sync active stats card highlight
  updateActiveStatsCard();

  const activeCategory = state.currentView;

  // Filter items matching active category + search query + status + language filters
  let filteredItems = state.items.filter(item => {
    // 1. Match current view category or bookmark status
    const typeMatch = (activeCategory === 'mylist')
      ? (item.myList === true)
      : (item.type === activeCategory);

    // 2. Search query
    const searchMatch = !state.filters.search || 
      item.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      item.creator.toLowerCase().includes(state.filters.search.toLowerCase());
      
    // 3. Status Filter
    const statusMatch = state.filters.status === 'all' || item.status === state.filters.status;

    // 4. Language Filter
    const langMatch = state.filters.language === 'all' || item.language === state.filters.language;
    
    return typeMatch && searchMatch && statusMatch && langMatch;
  });

  // Apply Sorting
  filteredItems.sort((a, b) => {
    switch (state.filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        
      case 'rating-desc':
        if (a.rating === b.rating) {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return b.rating - a.rating;
        
      case 'rating-asc':
        if (a.rating === 0 && b.rating > 0) return 1;
        if (b.rating === 0 && a.rating > 0) return -1;
        if (a.rating === b.rating) {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        return a.rating - b.rating;
        
      case 'title':
        return a.title.localeCompare(b.title, 'en');
        
      case 'newest':
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // Render Grid
  DOM.itemsGrid.innerHTML = '';
  
  if (filteredItems.length === 0) {
    DOM.emptyState.style.display = 'flex';
    DOM.itemsGrid.style.display = 'none';
    
    const isMyList = activeCategory === 'mylist';
    const categoryItems = isMyList
      ? state.items.filter(item => item.myList === true)
      : state.items.filter(item => item.type === activeCategory);
      
    if (categoryItems.length === 0) {
      // Entirely empty category
      if (isMyList) {
        DOM.emptyState.innerHTML = `
          <div class="empty-icon">
            <i class="fa-regular fa-bookmark" style="color: var(--color-rose);"></i>
          </div>
          <h3>Your MyList is empty</h3>
          <p>Click the bookmark icon on any item card in your collections to add them here!</p>
        `;
      } else {
        DOM.emptyState.innerHTML = `
          <div class="empty-icon">
            <i class="fa-regular fa-folder-open"></i>
          </div>
          <h3>Your collection is empty</h3>
          <p>Add your first item to start curating this list!</p>
          <button id="empty-add-btn" class="btn btn-primary">
            <i class="fa-solid fa-plus"></i> <span>Add First Item</span>
          </button>
        `;
        document.getElementById('empty-add-btn').addEventListener('click', () => openModal());
      }
    } else {
      // Filtered out empty state
      const singularCategory = activeCategory.replace(/s$/, ''); // e.g. "Book"
      DOM.emptyState.innerHTML = `
        <div class="empty-icon">
          <i class="fa-solid fa-filter"></i>
        </div>
        <h3>No matching results</h3>
        <p>No items match your active search query or filters.</p>
        <div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center; flex-wrap: wrap;">
          <button id="reset-filters-btn" class="btn btn-secondary">
            <i class="fa-solid fa-rotate-left"></i> Reset Filters
          </button>
          <button id="empty-add-btn" class="btn btn-primary">
            <i class="fa-solid fa-plus"></i> Add ${singularCategory}
          </button>
        </div>
      `;
      document.getElementById('reset-filters-btn').addEventListener('click', () => {
        state.filters.search = '';
        state.filters.status = 'all';
        state.filters.language = 'all';
        if (DOM.searchInput) DOM.searchInput.value = '';
        if (DOM.statusFilter) DOM.statusFilter.value = 'all';
        if (DOM.languageFilter) DOM.languageFilter.value = 'all';
        renderList();
      });
      document.getElementById('empty-add-btn').addEventListener('click', () => openModal());
    }
  } else {
    DOM.emptyState.style.display = 'none';
    DOM.itemsGrid.style.display = 'grid';
    
    filteredItems.forEach(item => {
      DOM.itemsGrid.appendChild(createCard(item));
    });
  }
}

function updateActiveStatsCard() {
  if (!DOM.categoryStatsSection) return;
  const cards = DOM.categoryStatsSection.querySelectorAll('.stat-card');
  const grad = getCategoryGradient(state.currentView);
  
  cards.forEach(card => {
    const status = card.getAttribute('data-status-filter');
    if (status) {
      if (status === state.filters.status) {
        card.classList.add('active');
        card.style.borderColor = grad[0];
        card.style.boxShadow = `0 0 15px ${grad[0]}40`; // 25% opacity color glow
        card.style.backgroundColor = `${grad[0]}0A`; // 4% opacity color tint background
      } else {
        card.classList.remove('active');
        card.style.borderColor = '';
        card.style.boxShadow = '';
        card.style.backgroundColor = '';
      }
    }
  });
}

function createCard(item) {
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('aria-label', `${item.type || 'Media'}: ${item.title}`);
  card.addEventListener('click', () => openModal(item));

  const typeBadgeText = item.type || 'Unassigned';
  const hasTypeClass = item.type ? 'badge-type-custom' : 'badge-type-unassigned';
  
  const lowerType = (item.type || '').toLowerCase();
  const isVideo = lowerType.includes('drama') || lowerType.includes('anime') || lowerType.includes('movie') || lowerType.includes('show');

  let statusBadgeHtml = '';
  if (item.status === 'planning') {
    const planningText = isVideo ? 'Plan to Watch' : 'Plan to Read';
    statusBadgeHtml = `<span class="badge badge-status planning">${planningText}</span>`;
  } else if (item.status === 'reading') {
    statusBadgeHtml = `<span class="badge badge-status reading">In Progress</span>`;
  }
  
  // Cover Art
  let coverHtml = '';
  if (item.coverUrl) {
    coverHtml = `<img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)} cover" loading="lazy">`;
  } else {
    const gradColors = getCategoryGradient(item.type || 'default');
    
    let iconClass = 'fa-solid fa-bookmark';
    if (lowerType.includes('book')) iconClass = 'fa-solid fa-book-open';
    if (lowerType.includes('drama') || lowerType.includes('show') || lowerType.includes('movie')) iconClass = 'fa-solid fa-video';
    if (lowerType.includes('manga') || lowerType.includes('comic')) iconClass = 'fa-solid fa-book';
    if (lowerType.includes('anime')) iconClass = 'fa-solid fa-clapperboard';

    coverHtml = `
      <div class="card-cover-placeholder" style="background-color: ${gradColors[0]};">
        <i class="${iconClass}"></i>
        <span>${escapeHtml(item.title)}</span>
      </div>
    `;
  }

  // Star Ratings
  let starsHtml = '';
  if (item.rating > 0) {
    for (let i = 1; i <= 5; i++) {
      if (i <= item.rating) {
        starsHtml += '<i class="fa-solid fa-star filled"></i>';
      } else {
        starsHtml += '<i class="fa-regular fa-star"></i>';
      }
    }
  } else {
    starsHtml = '<span class="unrated-label">Unrated</span>';
  }

  // Date selectors
  const startDateStr = item.startDate ? formatDate(item.startDate) : '--';
  const endDateStr = item.endDate ? formatDate(item.endDate) : '--';
  const datesHtml = item.status === 'planning' 
    ? `<div class="card-dates"><span>Added: ${formatDate(item.createdAt || new Date().toISOString())}</span></div>`
    : `<div class="card-dates"><span>Start: ${startDateStr}</span><span>End: ${endDateStr}</span></div>`;

  // Review section
  const notesSnippet = item.notes 
    ? `<div class="card-notes">${escapeHtml(item.notes)}</div>` 
    : '';

  const grad = getCategoryGradient(item.type || 'default');
  const typeBadgeStyle = `background-color: ${grad[0]}14; border: 1px solid ${grad[0]}40; color: ${grad[0]};`;

  card.innerHTML = `
    <div class="card-cover">
      ${coverHtml}
      <button class="card-bookmark-btn ${item.myList ? 'bookmarked' : ''}" aria-label="Bookmark item" title="${item.myList ? 'Remove from MyList' : 'Add to MyList'}">
        <i class="${item.myList ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>
      </button>
      <div class="card-badge-container">
        <span class="badge ${hasTypeClass}" style="${typeBadgeStyle}">${escapeHtml(typeBadgeText)}</span>
        <span class="badge badge-language">${escapeHtml(item.language || 'English')}</span>
        ${statusBadgeHtml}
      </div>
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(item.title)}</h3>
      <p class="card-creator">${escapeHtml(item.creator)}</p>
      <div class="card-rating">${starsHtml}</div>
      ${notesSnippet}
      ${datesHtml}
    </div>
  `;

  const bookmarkBtn = card.querySelector('.card-bookmark-btn');
  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.myList = !item.myList;
      saveItems();
      
      const isBookmarked = item.myList;
      bookmarkBtn.classList.toggle('bookmarked', isBookmarked);
      bookmarkBtn.setAttribute('title', isBookmarked ? 'Remove from MyList' : 'Add to MyList');
      const icon = bookmarkBtn.querySelector('i');
      if (icon) {
        icon.className = isBookmarked ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
      }
      
      showToast(isBookmarked ? 'Added to MyList' : 'Removed from MyList', 'success');
      
      if (state.currentView === 'mylist') {
        renderList();
      } else if (state.currentView === 'dashboard') {
        renderDashboard();
      }
    });
  }

  return card;
}

// ==========================================================================
// IMPORT & EXPORT LOGIC
// ==========================================================================
function exportLibrary() {
  if (state.items.length === 0) {
    showToast('No data to export', 'info');
    return;
  }
  
  const exportData = {
    version: 3,
    categories: state.categories,
    languages: state.languages,
    items: state.items
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `yourlibrary_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('Library exported successfully', 'success');
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const importedJson = JSON.parse(evt.target.result);
      
      let importedItems = [];
      let importedCategories = [];
      let importedLanguages = [];

      // Detect schema format version
      if (Array.isArray(importedJson)) {
        importedItems = importedJson;
        importedCategories = ["Books", "Dramas", "Mangas", "Animes"];
        importedLanguages = ["Japanese", "English", "Korean", "Chinese"];
      } else if (importedJson && typeof importedJson === 'object' && importedJson.items) {
        importedItems = importedJson.items;
        importedCategories = importedJson.categories || [];
        importedLanguages = importedJson.languages || ["Japanese", "English", "Korean", "Chinese"];
      } else {
        throw new Error('Invalid JSON format');
      }

      const validatedItems = importedItems.filter(item => {
        return item && typeof item === 'object' && item.title && item.creator;
      });

      if (validatedItems.length === 0) {
        throw new Error('No valid items found in JSON file');
      }

      if (confirm(`Do you want to import ${validatedItems.length} records? They will be merged with your current library.`)) {
        // Merge categories & languages lists
        state.categories = Array.from(new Set([...state.categories, ...importedCategories]));
        saveCategories();

        state.languages = Array.from(new Set([...state.languages, ...importedLanguages]));
        saveLanguages();

        // Avoid ID collisions
        const existingIds = new Set(state.items.map(item => item.id));
        const cleanItems = validatedItems.map(item => {
          if (existingIds.has(item.id) || !item.id) {
            item.id = (Date.now() + Math.random()).toString();
          }
          
          let type = item.type;
          if (type === 'book') type = 'Books';
          if (type === 'drama') type = 'Dramas';

          return {
            id: item.id,
            title: item.title,
            type: type || '',
            creator: item.creator,
            language: item.language || 'English',
            status: ['planning', 'reading', 'completed'].includes(item.status) ? item.status : 'planning',
            rating: typeof item.rating === 'number' && item.rating >= 0 && item.rating <= 5 ? item.rating : 0,
            coverUrl: item.coverUrl || '',
            startDate: item.startDate || '',
            endDate: item.endDate || '',
            notes: item.notes || '',
            createdAt: item.createdAt || new Date().toISOString()
          };
        });

        state.items = [...cleanItems, ...state.items];
        saveItems();
        
        // Refresh routing view
        navigate(state.currentView);
        showToast(`Imported ${cleanItems.length} records successfully!`, 'success');
      }
    } catch (error) {
      console.error('Import Error:', error);
      showToast('Import failed. Please choose a valid JSON backup file.', 'error');
    }
    DOM.importFileInput.value = '';
  };
  
  reader.readAsText(file);
}

// ==========================================================================
// UTILITY HELPERS
// ==========================================================================
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  } catch (e) {
    return '';
  }
}

// Category hashing color manager
function getCategoryGradient(categoryName) {
  if (categoryName === 'mylist') {
    return ['#ea4335', '#ea4335'];
  }

  const colors = [
    ['#fbbc05', '#fbbc05'], // Google Yellow (Books)
    ['#4285f4', '#4285f4'], // Google Blue (Dramas)
    ['#34a853', '#34a853'], // Google Green (Mangas)
    ['#ea4335', '#ea4335'], // Google Red (Animes)
    ['#a142f4', '#a142f4'], // Google Purple
    ['#fa7b17', '#fa7b17'], // Google Orange
    ['#12b5cb', '#12b5cb'], // Google Cyan
    ['#9aa0a6', '#9aa0a6']  // Google Grey
  ];
  
  let index = -1;
  if (typeof state !== 'undefined' && state.categories) {
    index = state.categories.indexOf(categoryName);
  }
  
  if (index === -1) {
    let hash = 0;
    for (let i = 0; i < categoryName.length; i++) {
      hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    }
    index = Math.abs(hash) % colors.length;
  } else {
    index = index % colors.length;
  }
  
  return colors[index];
}

// Notification Toast Generator
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'fa-solid fa-circle-check';
  if (type === 'error') icon = 'fa-solid fa-circle-exclamation';
  if (type === 'info') icon = 'fa-solid fa-circle-info';
  
  toast.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;
  
  DOM.toastContainer.appendChild(toast);
  
  // Slide up in next tick
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// ==========================================================================
// FORM LANGUAGES LOGIC
// ==========================================================================
function populateLanguageSelect(selectedVal = null) {
  DOM.formLanguage.innerHTML = '';

  if (state.languages.length === 0) {
    state.languages = ["Japanese", "English", "Korean", "Chinese"];
    saveLanguages();
  }

  state.languages.forEach(lang => {
    const opt = document.createElement('option');
    opt.value = lang;
    opt.textContent = lang;
    DOM.formLanguage.appendChild(opt);
  });

  // Option to add custom languages
  const optCustom = document.createElement('option');
  optCustom.value = '_custom_';
  optCustom.textContent = '[ Add Custom Language... ]';
  DOM.formLanguage.appendChild(optCustom);

  // Set selected value
  if (selectedVal) {
    DOM.formLanguage.value = selectedVal;
  }
}

function handleFormLanguageChange() {
  const val = DOM.formLanguage.value;
  if (val === '_custom_') {
    DOM.customLanguageGroup.style.display = 'flex';
    DOM.formCustomLanguage.required = true;
    DOM.formCustomLanguage.focus();
  } else {
    DOM.customLanguageGroup.style.display = 'none';
    DOM.formCustomLanguage.required = false;
    DOM.formCustomLanguage.value = '';
  }
}

// ==========================================================================
// MODAL POPULATION
// ==========================================================================
function populateCategorySelect() {
  DOM.formType.innerHTML = '';
  
  if (state.categories.length === 0) {
    state.categories = ["Books", "Dramas", "Mangas", "Animes"];
    saveCategories();
    renderSidebarNav();
  }

  state.categories.forEach(category => {
    const opt = document.createElement('option');
    opt.value = category;
    opt.textContent = category;
    DOM.formType.appendChild(opt);
  });
}

function populateSuggestions() {
  const suggestedTitles = document.getElementById('suggested-titles');
  const suggestedCreators = document.getElementById('suggested-creators');
  
  if (!suggestedTitles || !suggestedCreators) return;
  
  suggestedTitles.innerHTML = '';
  suggestedCreators.innerHTML = '';
  
  const titles = new Set();
  const creators = new Set();
  
  state.items.forEach(item => {
    if (item.title) titles.add(item.title.trim());
    if (item.creator) creators.add(item.creator.trim());
  });
  
  Array.from(titles).sort().forEach(title => {
    const option = document.createElement('option');
    option.value = title;
    suggestedTitles.appendChild(option);
  });
  
  Array.from(creators).sort().forEach(creator => {
    const option = document.createElement('option');
    option.value = creator;
    suggestedCreators.appendChild(option);
  });
}

async function handleOnlineSearch(query) {
  const onlineSearchResults = document.getElementById('online-search-results');
  if (!onlineSearchResults) return;
  
  onlineSearchResults.innerHTML = '';
  onlineSearchResults.classList.remove('hidden');
  
  const loadingItem = document.createElement('div');
  loadingItem.style.padding = '0.75rem 1rem';
  loadingItem.style.color = 'var(--text-secondary)';
  loadingItem.style.fontSize = '0.9rem';
  loadingItem.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 0.5rem;"></i> Searching online...';
  onlineSearchResults.appendChild(loadingItem);
  
  try {
    const results = [];
    
    const [booksRes, tvRes] = await Promise.allSettled([
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`).then(res => res.json()),
      fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`).then(res => res.json())
    ]);
    
    if (booksRes.status === 'fulfilled' && booksRes.value.items) {
      booksRes.value.items.forEach(item => {
        const info = item.volumeInfo;
        if (!info) return;
        
        const title = info.title || '';
        const creator = info.authors ? info.authors.join(', ') : 'Unknown Author';
        let coverUrl = '';
        if (info.imageLinks) {
          coverUrl = info.imageLinks.thumbnail || info.imageLinks.smallThumbnail || '';
          if (coverUrl.startsWith('http://')) {
            coverUrl = coverUrl.replace('http://', 'https://');
          }
        }
        
        results.push({
          title,
          creator,
          coverUrl,
          type: 'book',
          source: 'Google Books'
        });
      });
    }
    
    if (tvRes.status === 'fulfilled' && tvRes.value) {
      tvRes.value.slice(0, 5).forEach(item => {
        const show = item.show;
        if (!show) return;
        
        const title = show.name || '';
        const creator = show.network ? show.network.name : (show.webChannel ? show.webChannel.name : 'Unknown Network');
        let coverUrl = '';
        if (show.image) {
          coverUrl = show.image.medium || show.image.original || '';
          if (coverUrl.startsWith('http://')) {
            coverUrl = coverUrl.replace('http://', 'https://');
          }
        }
        
        results.push({
          title,
          creator,
          coverUrl,
          type: 'show',
          source: 'TVmaze'
        });
      });
    }
    
    onlineSearchResults.innerHTML = '';
    
    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.style.padding = '0.75rem 1rem';
      noResults.style.color = 'var(--text-secondary)';
      noResults.style.fontSize = '0.9rem';
      noResults.textContent = 'No suggestions found online.';
      onlineSearchResults.appendChild(noResults);
    } else {
      results.forEach(res => {
        const itemEl = document.createElement('div');
        itemEl.className = 'search-result-item';
        
        const imgHtml = res.coverUrl 
          ? `<img src="${escapeHtml(res.coverUrl)}" class="search-result-thumb" alt="cover">`
          : `<div class="search-result-thumb" style="display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--text-tertiary);"><i class="fa-solid fa-image"></i></div>`;
          
        itemEl.innerHTML = `
          ${imgHtml}
          <div class="search-result-info">
            <span class="search-result-title" title="${escapeHtml(res.title)}">${escapeHtml(res.title)}</span>
            <span class="search-result-meta" title="${escapeHtml(res.creator)}">${escapeHtml(res.creator)}</span>
          </div>
          <span class="search-result-badge">${escapeHtml(res.type)}</span>
        `;
        
        itemEl.addEventListener('click', () => {
          DOM.formTitle.value = res.title;
          DOM.formCreator.value = res.creator;
          DOM.formCover.value = res.coverUrl;
          
          onlineSearchResults.classList.add('hidden');
          showToast(`Auto-filled: "${res.title}"!`, 'success');
        });
        
        onlineSearchResults.appendChild(itemEl);
      });
    }
  } catch (error) {
    console.error('Online search failed:', error);
    onlineSearchResults.classList.add('hidden');
  }
}

function openModal(item = null, defaultStatus = null, defaultCategory = null) {
  DOM.itemForm.reset();
  
  // Hide online search results dropdown
  const onlineSearchResults = document.getElementById('online-search-results');
  if (onlineSearchResults) onlineSearchResults.classList.add('hidden');
  
  populateCategorySelect();
  populateSuggestions();
  
  // Pre-fill Language lists
  const defaultLang = item ? item.language : 'Japanese';
  populateLanguageSelect(defaultLang);
  
  // Hide custom language block by default
  DOM.customLanguageGroup.style.display = 'none';
  DOM.formCustomLanguage.required = false;

  if (item) {
    // Edit mode
    DOM.modalTitle.textContent = 'Edit Record';
    DOM.formId.value = item.id;
    DOM.formTitle.value = item.title;
    DOM.formType.value = item.type || '';
    DOM.formCreator.value = item.creator;
    DOM.formStatus.value = item.status;
    DOM.formCover.value = item.coverUrl || '';
    DOM.formStartDate.value = item.startDate || '';
    DOM.formEndDate.value = item.endDate || '';
    DOM.formNotes.value = item.notes || '';
    
    if (item.rating) {
      const radio = document.getElementById(`star${item.rating}`);
      if (radio) radio.checked = true;
    }
    DOM.formDeleteBtn.style.display = 'inline-flex';
  } else {
    // Add mode
    DOM.modalTitle.textContent = 'Add to Library';
    DOM.formId.value = '';
    DOM.formDeleteBtn.style.display = 'none';

    // Contextual Pre-fill category
    if (state.currentView !== 'dashboard' && state.currentView !== 'settings' && state.currentView !== 'mylist') {
      DOM.formType.value = state.currentView;
    } else if (defaultCategory) {
      DOM.formType.value = defaultCategory;
    }

    if (defaultStatus) {
      DOM.formStatus.value = defaultStatus;
    }
  }
  
  if (DOM.formMyList) {
    DOM.formMyList.checked = item ? (item.myList || false) : (state.currentView === 'mylist');
  }
  
  updateCreatorLabel();
  toggleModalFields(DOM.formStatus.value);
  DOM.itemModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  DOM.itemModal.classList.remove('active');
  document.body.style.overflow = '';
}

function toggleModalFields(status) {
  if (!DOM.formConditionalFields) return;
  if (status === 'planning') {
    DOM.formConditionalFields.style.display = 'none';
  } else {
    DOM.formConditionalFields.style.display = 'block';
  }
}

function updateCreatorLabel() {
  if (!DOM.creatorLabel || !DOM.formType) return;
  const category = DOM.formType.value;
  const lowerCategory = (category || '').toLowerCase();
  
  if (lowerCategory.includes('book') || lowerCategory.includes('manga') || lowerCategory.includes('novel')) {
    DOM.creatorLabel.textContent = 'Author';
  } else if (lowerCategory.includes('drama') || lowerCategory.includes('show') || lowerCategory.includes('movie')) {
    DOM.creatorLabel.textContent = 'Director';
  } else if (lowerCategory.includes('anime')) {
    DOM.creatorLabel.textContent = 'Studio / Director';
  } else {
    DOM.creatorLabel.textContent = 'Creator';
  }
}

function handleFormSubmit(e) {
  e.preventDefault();
  
  const id = DOM.formId.value;
  const title = DOM.formTitle.value.trim();
  const type = DOM.formType.value;
  const creator = DOM.formCreator.value.trim();
  const status = DOM.formStatus.value;
  const coverUrl = DOM.formCover.value.trim();
  const startDate = DOM.formStartDate.value;
  const endDate = DOM.formEndDate.value;
  const notes = DOM.formNotes.value.trim();
  const myList = DOM.formMyList ? DOM.formMyList.checked : false;
  
  let language = DOM.formLanguage.value;

  // Handle Custom Language Selection
  if (language === '_custom_') {
    const customName = DOM.formCustomLanguage.value.trim();
    if (!customName) {
      showToast('Please type a custom language name.', 'error');
      return;
    }
    // Capitalize language name
    const formattedLang = customName.charAt(0).toUpperCase() + customName.slice(1).toLowerCase();
    
    // Check if it already exists
    const duplicate = state.languages.some(lang => lang.toLowerCase() === formattedLang.toLowerCase());
    if (!duplicate) {
      state.languages.push(formattedLang);
      saveLanguages();
    }
    language = formattedLang;
  }

  // Get rating value
  let rating = 0;
  const checkedRating = document.querySelector('input[name="rating"]:checked');
  if (checkedRating) {
    rating = parseInt(checkedRating.value, 10);
  }

  // Basic Validation
  if (!title) {
    showToast('Title is required.', 'error');
    return;
  }
  
  if (!type) {
    showToast('Please select or add a category first.', 'error');
    return;
  }

  // Clear fields if status is planning (Add to My List)
  const isPlanning = status === 'planning';
  const savedLanguage = isPlanning ? '' : language;
  const savedRating = isPlanning ? 0 : rating;
  const savedCoverUrl = isPlanning ? '' : coverUrl;
  const savedStartDate = isPlanning ? '' : startDate;
  const savedEndDate = isPlanning ? '' : endDate;
  const savedNotes = isPlanning ? '' : notes;
  
  if (id) {
    // Edit existing item
    const index = state.items.findIndex(item => item.id === id);
    if (index !== -1) {
      state.items[index] = {
        ...state.items[index],
        title,
        type,
        creator,
        status,
        language: savedLanguage,
        rating: savedRating,
        coverUrl: savedCoverUrl,
        startDate: savedStartDate,
        endDate: savedEndDate,
        notes: savedNotes,
        myList,
        updatedAt: new Date().toISOString()
      };
      showToast('Record updated successfully!', 'success');
    }
  } else {
    // Add new item
    const newItem = {
      id: Date.now().toString(),
      title,
      type,
      creator,
      status,
      language: savedLanguage,
      rating: savedRating,
      coverUrl: savedCoverUrl,
      startDate: savedStartDate,
      endDate: savedEndDate,
      notes: savedNotes,
      myList,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.items.unshift(newItem); // Add to the front
    showToast('Record added successfully!', 'success');
  }
  
  saveItems();
  closeModal();
  
  // Refresh layout without resetting filters (unless on dashboard/settings)
  if (state.currentView === 'dashboard') {
    navigate('dashboard');
  } else if (state.currentView === 'settings') {
    navigate('settings');
  } else {
    if (!id) { // Only for adding new items
      state.filters.status = status;
      if (DOM.statusFilter) DOM.statusFilter.value = status;

      // Clear search and language filters to ensure the added item is immediately visible
      state.filters.search = '';
      if (DOM.searchInput) DOM.searchInput.value = '';

      state.filters.language = 'all';
      if (DOM.languageFilter) DOM.languageFilter.value = 'all';
    }
    renderLibraryPage(state.currentView);
  }
}

function handleDeleteItem() {
  const id = DOM.formId.value;
  if (!id) return;
  
  if (confirm('Are you sure you want to delete this record?')) {
    state.items = state.items.filter(item => item.id !== id);
    saveItems();
    closeModal();
    
    // Refresh layout preserving current filters
    if (state.currentView === 'dashboard') {
      navigate('dashboard');
    } else if (state.currentView === 'settings') {
      navigate('settings');
    } else {
      renderLibraryPage(state.currentView);
    }
    showToast('Record deleted.', 'info');
  }
}

// ==========================================================================
// MOCK DATA GENERATOR (English version)
// ==========================================================================
function getMockItems() {
  return [
    {
      id: 'mock-1',
      title: 'Norwegian Wood',
      type: 'Books',
      creator: 'Haruki Murakami',
      language: 'Japanese',
      status: 'completed',
      rating: 5,
      coverUrl: '',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      notes: 'A quiet, beautiful, and melancholic story. The contrast between Naoko and Midori is striking, making it a book you want to re-read multiple times. Extremely atmospheric writing style.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: 'mock-2',
      title: 'Stranger Things',
      type: 'Dramas',
      creator: 'The Duffer Brothers',
      language: 'English',
      status: 'reading',
      rating: 4,
      coverUrl: '',
      startDate: '2026-06-15',
      endDate: '',
      notes: 'Currently watching Season 1. The 80s atmosphere is amazing, and the friendship between the boys and Eleven is thrilling.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: 'mock-3',
      title: 'The Three-Body Problem',
      type: 'Books',
      creator: 'Cixin Liu',
      language: 'Chinese',
      status: 'completed',
      rating: 5,
      coverUrl: '',
      startDate: '2026-06-10',
      endDate: '2026-06-20',
      notes: 'An absolutely mind-bending sci-fi masterpiece. The scope of the story is huge, combining hard physics with deep sociological questions. Highly recommended.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
    }
  ];
}
