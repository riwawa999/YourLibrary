/**
 * YourLibrary - Core Application Logic (English Version)
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
  }
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
  sortSelector: document.getElementById('sort-selector'),
  addItemBtn: document.getElementById('add-item-btn'),
  emptyAddBtn: document.getElementById('empty-add-btn'),
  itemsGrid: document.getElementById('items-grid'),
  emptyState: document.getElementById('empty-state'),

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
  formDeleteBtn: document.getElementById('form-delete-btn'),
  formCancelBtn: document.getElementById('form-cancel-btn'),

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
  document.body.className = state.theme;
  const icon = DOM.themeToggleBtn.querySelector('i');
  if (state.theme === 'light-theme') {
    icon.className = 'fa-solid fa-moon';
  } else {
    icon.className = 'fa-solid fa-sun';
  }
}

function toggleTheme() {
  state.theme = state.theme === 'dark-theme' ? 'light-theme' : 'dark-theme';
  localStorage.setItem('yl_theme', state.theme);
  applyTheme();
  showToast('Theme switched successfully', 'info');
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
  // Load Theme
  const savedTheme = localStorage.getItem('yl_theme');
  if (savedTheme) {
    state.theme = savedTheme;
  }

  // Load Categories
  const savedCategories = localStorage.getItem('yl_categories');
  if (savedCategories) {
    try {
      state.categories = JSON.parse(savedCategories);
    } catch (e) {
      console.error('Failed to parse categories, resetting to defaults.', e);
    }
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
}

function saveItems() {
  localStorage.setItem('yl_items', JSON.stringify(state.items));
}

function saveCategories() {
  localStorage.setItem('yl_categories', JSON.stringify(state.categories));
}

function saveLanguages() {
  localStorage.setItem('yl_languages', JSON.stringify(state.languages));
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
  if (DOM.sortSelector) DOM.sortSelector.value = 'newest';

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
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
  DOM.sidebarCloseBtn.addEventListener('click', () => toggleSidebar(false));
  DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

  // Category Add Form Submit (inside settings page)
  DOM.addCategoryForm.addEventListener('submit', handleAddCategory);

  // Search & Filter Inputs (inside library page)
  DOM.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim();
    renderList();
  });

  DOM.statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderList();
  });

  DOM.languageFilter.addEventListener('change', (e) => {
    state.filters.language = e.target.value;
    renderList();
  });

  DOM.sortSelector.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    renderList();
  });

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

  // Export & Import Database Bindings (in Settings View)
  DOM.settingsExportBtn.addEventListener('click', exportLibrary);
  DOM.settingsImportBtn.addEventListener('click', () => DOM.importFileInput.click());
  DOM.importFileInput.addEventListener('change', handleImportFile);
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
      <span class="category-dot" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]}); margin-left: auto;"></span>
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

  const total = state.items.length;
  
  // Total Items Card
  const totalCard = document.createElement('div');
  totalCard.className = 'stat-card';
  totalCard.innerHTML = `
    <div class="stat-icon icon-blue">
      <i class="fa-solid fa-cubes"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${total}</span>
      <span class="stat-label">Total Items</span>
    </div>
  `;
  DOM.statsSection.appendChild(totalCard);

  // Stats for the top 2 categories (by item count)
  const categoryCounts = state.categories.map(cat => {
    return {
      name: cat,
      count: state.items.filter(i => i.type === cat).length
    };
  });
  categoryCounts.sort((a, b) => b.count - a.count);
  const topCategories = categoryCounts.slice(0, 2);

  topCategories.forEach(catObj => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const grad = getCategoryGradient(catObj.name);
    
    let iconClass = 'fa-solid fa-bookmark';
    const lowerName = catObj.name.toLowerCase();
    if (lowerName.includes('book')) iconClass = 'fa-solid fa-book';
    if (lowerName.includes('drama') || lowerName.includes('show') || lowerName.includes('movie')) iconClass = 'fa-solid fa-tv';
    if (lowerName.includes('manga') || lowerName.includes('comic')) iconClass = 'fa-solid fa-scroll';
    if (lowerName.includes('anime')) iconClass = 'fa-solid fa-video';

    card.innerHTML = `
      <div class="stat-icon" style="background-color: rgba(236, 72, 153, 0.08); color: ${grad[0]};">
        <i class="${iconClass}"></i>
      </div>
      <div class="stat-details">
        <span class="stat-value">${catObj.count}</span>
        <span class="stat-label">${escapeHtml(catObj.name)}</span>
      </div>
    `;
    DOM.statsSection.appendChild(card);
  });

  // My List (Planning) Card
  const planningCount = state.items.filter(i => i.status === 'planning').length;

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
  DOM.statsSection.appendChild(planningCard);

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
  DOM.libraryTitle.textContent = `${categoryName} Collection`;
  DOM.librarySubtitle.textContent = `Manage and track your ${categoryName.toLowerCase()} logs.`;
  DOM.addBtnText.textContent = `Add ${categoryName.replace(/s$/, '')}`; // Singular e.g. "Add Book"

  // Render Category stats cards
  DOM.categoryStatsSection.innerHTML = '';
  const categoryItems = state.items.filter(i => i.type === categoryName);
  
  // Total in category card
  const catTotalCard = document.createElement('div');
  catTotalCard.className = 'stat-card';
  const grad = getCategoryGradient(categoryName);
  catTotalCard.innerHTML = `
    <div class="stat-icon" style="background-color: rgba(236, 72, 153, 0.08); color: ${grad[0]};">
      <i class="fa-solid fa-list-ul"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${categoryItems.length}</span>
      <span class="stat-label">Total Logged</span>
    </div>
  `;
  DOM.categoryStatsSection.appendChild(catTotalCard);

  // Completed in category card
  const completedCount = categoryItems.filter(i => i.status === 'completed').length;
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
  DOM.categoryStatsSection.appendChild(completedCard);

  // In Progress in category card
  const progressCount = categoryItems.filter(i => i.status === 'reading').length;
  const progressCard = document.createElement('div');
  progressCard.className = 'stat-card';
  progressCard.innerHTML = `
    <div class="stat-icon icon-blue">
      <i class="fa-solid fa-spinner"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${progressCount}</span>
      <span class="stat-label">In Progress</span>
    </div>
  `;
  DOM.categoryStatsSection.appendChild(progressCard);

  // My List (Planning) in category card
  const catPlanningCount = categoryItems.filter(i => i.status === 'planning').length;

  const catPlanningCard = document.createElement('div');
  catPlanningCard.className = 'stat-card';
  catPlanningCard.innerHTML = `
    <div class="stat-icon icon-amber">
      <i class="fa-solid fa-bookmark"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${catPlanningCount}</span>
      <span class="stat-label">My List</span>
    </div>
  `;
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
        <span class="category-dot" style="background: linear-gradient(135deg, ${colors[0]}, ${colors[1]});"></span>
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

  const activeCategory = state.currentView;

  // Filter items matching active category + search query + status + language filters
  let filteredItems = state.items.filter(item => {
    // 1. Match current view category
    const typeMatch = item.type === activeCategory;

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
  } else {
    DOM.emptyState.style.display = 'none';
    DOM.itemsGrid.style.display = 'grid';
    
    filteredItems.forEach(item => {
      DOM.itemsGrid.appendChild(createCard(item));
    });
  }
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
      <div class="card-cover-placeholder" style="background: linear-gradient(135deg, ${gradColors[0]}, ${gradColors[1]});">
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
  const typeBadgeStyle = `background: linear-gradient(135deg, ${grad[0]}cc, ${grad[1]}cc); border: 1px solid ${grad[0]};`;

  card.innerHTML = `
    <div class="card-cover">
      ${coverHtml}
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
  const colors = [
    ['#8b5cf6', '#a855f7'], // Violet -> Purple
    ['#ec4899', '#f472b6'], // Pink -> Light Pink
    ['#3b82f6', '#60a5fa'], // Blue -> Light Blue
    ['#10b981', '#34d399'], // Emerald -> Mint
    ['#f59e0b', '#fbbf24'], // Amber -> Yellow
    ['#14b8a6', '#2dd4bf'], // Teal -> Turquoise
    ['#6366f1', '#818cf8']  // Indigo -> Light Indigo
  ];
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
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
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = '(Create a category first)';
    DOM.formType.appendChild(opt);
    return;
  }

  state.categories.forEach(category => {
    const opt = document.createElement('option');
    opt.value = category;
    opt.textContent = category;
    DOM.formType.appendChild(opt);
  });
}

function openModal(item = null) {
  DOM.itemForm.reset();
  
  populateCategorySelect();
  
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
    if (state.currentView !== 'dashboard' && state.currentView !== 'settings') {
      DOM.formType.value = state.currentView;
    }
  }
  
  updateCreatorLabel();
  DOM.itemModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  DOM.itemModal.classList.remove('active');
  document.body.style.overflow = '';
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
  if (!title || !creator) {
    showToast('Title and Creator fields are required.', 'error');
    return;
  }
  
  if (!type) {
    showToast('Please select or add a category first.', 'error');
    return;
  }
  
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
        language,
        rating,
        coverUrl,
        startDate,
        endDate,
        notes
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
      language,
      rating,
      coverUrl,
      startDate,
      endDate,
      notes,
      createdAt: new Date().toISOString()
    };
    state.items.unshift(newItem); // Add to the front
    showToast('Record added successfully!', 'success');
  }
  
  saveItems();
  closeModal();
  
  // Refresh layout
  navigate(state.currentView);
}

function handleDeleteItem() {
  const id = DOM.formId.value;
  if (!id) return;
  
  if (confirm('Are you sure you want to delete this record?')) {
    state.items = state.items.filter(item => item.id !== id);
    saveItems();
    closeModal();
    navigate(state.currentView);
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
