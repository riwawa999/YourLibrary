/**
 * YourLibrary - Core Application Logic (English Version)
 * State management, LocalStorage, CRUD operations, Search, Sort, Filters, and Theme toggles.
 * Now supports dynamic categories managed via a top-left hamburger sidebar menu.
 */

// ==========================================================================
// STATE & CONFIGURATION
// ==========================================================================
let state = {
  items: [],
  categories: ["Books", "Dramas", "Mangas", "Animes"], // Default categories
  theme: 'light-theme',
  filters: {
    search: '',
    type: 'all', // 'all' | any custom category name
    status: 'all', // 'all' | 'planning' | 'reading' | 'completed'
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
  
  // Category Form & List
  addCategoryForm: document.getElementById('add-category-form'),
  newCategoryInput: document.getElementById('new-category-input'),
  categoriesList: document.getElementById('categories-list'),
  
  // Actions
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFileInput: document.getElementById('import-file-input'),

  // Stats & Tabs Containers
  statsSection: document.getElementById('stats-section'),
  filterTabs: document.getElementById('filter-tabs'),

  // Controls
  searchInput: document.getElementById('search-input'),
  statusFilter: document.getElementById('status-filter'),
  sortSelector: document.getElementById('sort-selector'),
  addItemBtn: document.getElementById('add-item-btn'),
  emptyAddBtn: document.getElementById('empty-add-btn'),

  // Grid & States
  itemsGrid: document.getElementById('items-grid'),
  emptyState: document.getElementById('empty-state'),

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
  renderApp();
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
    renderSidebarCategories();
  } else {
    DOM.sidebarMenu.classList.remove('active');
    DOM.sidebarOverlay.classList.remove('active');
  }
}

// ==========================================================================
// DATA PERSISTENCE, MIGRATION & STATE SYNC
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

  // Load Items
  const savedItems = localStorage.getItem('yl_items');
  if (savedItems) {
    try {
      let items = JSON.parse(savedItems);
      // Data Migration: Translate old static 'book' / 'drama' string types to dynamic categories
      state.items = items.map(item => {
        if (item.type === 'book') item.type = 'Books';
        if (item.type === 'drama') item.type = 'Dramas';
        return item;
      });
      
      // Ensure mapped categories exist in the list
      state.items.forEach(item => {
        if (item.type && !state.categories.includes(item.type)) {
          state.categories.push(item.type);
        }
      });
      saveCategories();
    } catch (e) {
      console.error('Failed to parse items from local storage', e);
      state.items = [];
      showToast('Failed to load library data. Resetting database.', 'error');
    }
  } else {
    // Insert mock data if empty for a warm welcome
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

// ==========================================================================
// EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Theme & Sidebar Toggles
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);
  DOM.menuToggleBtn.addEventListener('click', () => toggleSidebar(true));
  DOM.sidebarCloseBtn.addEventListener('click', () => toggleSidebar(false));
  DOM.sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

  // Category Add Form Submit
  DOM.addCategoryForm.addEventListener('submit', handleAddCategory);

  // Search & Filter Inputs
  DOM.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim();
    renderList();
  });

  DOM.statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
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

  // Category change within form (updates Creator Label & placeholder hints)
  DOM.formType.addEventListener('change', updateCreatorLabel);

  // Form Submission
  DOM.itemForm.addEventListener('submit', handleFormSubmit);

  // Delete Action in Form
  DOM.formDeleteBtn.addEventListener('click', handleDeleteItem);

  // Export Data
  DOM.exportBtn.addEventListener('click', exportLibrary);

  // Import Data Trigger
  DOM.importBtn.addEventListener('click', () => DOM.importFileInput.click());
  DOM.importFileInput.addEventListener('change', handleImportFile);
}

// ==========================================================================
// CATEGORY CRUD LOGIC
// ==========================================================================
function handleAddCategory(e) {
  e.preventDefault();
  const name = DOM.newCategoryInput.value.trim();
  if (!name) return;

  // Case-insensitive check
  const duplicate = state.categories.some(cat => cat.toLowerCase() === name.toLowerCase());
  if (duplicate) {
    showToast('Category already exists!', 'error');
    return;
  }

  // Capitalize name cleanly
  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
  state.categories.push(formattedName);
  saveCategories();
  
  DOM.newCategoryInput.value = '';
  renderSidebarCategories();
  renderApp();
  showToast(`Added category: ${formattedName}`, 'success');
}

function handleDeleteCategory(categoryName) {
  const count = state.items.filter(item => item.type === categoryName).length;
  let confirmMsg = `Are you sure you want to delete "${categoryName}"?`;
  
  if (count > 0) {
    confirmMsg = `There are ${count} items cataloged under "${categoryName}". Deleting it will keep the items, but unassign their category. Proceed?`;
  }

  if (confirm(confirmMsg)) {
    // Remove from categories list
    state.categories = state.categories.filter(cat => cat !== categoryName);
    saveCategories();

    // Clean deleted category reference in items
    state.items = state.items.map(item => {
      if (item.type === categoryName) {
        item.type = ''; // Clear category assignment
      }
      return item;
    });
    saveItems();

    // Reset filter tab if it was selected
    if (state.filters.type === categoryName) {
      state.filters.type = 'all';
    }

    renderSidebarCategories();
    renderApp();
    showToast(`Deleted category: ${categoryName}`, 'info');
  }
}

// ==========================================================================
// MODAL & FORM LOGIC
// ==========================================================================
function openModal(item = null) {
  DOM.itemForm.reset();
  
  // Populate Category options dropdown dynamically
  populateCategorySelect();

  if (item) {
    // Edit Mode
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
    
    // Set Star Rating
    if (item.rating) {
      const radio = document.getElementById(`star${item.rating}`);
      if (radio) radio.checked = true;
    }
    
    DOM.formDeleteBtn.style.display = 'inline-flex';
  } else {
    // Add Mode
    DOM.modalTitle.textContent = 'Add to Library';
    DOM.formId.value = '';
    DOM.formDeleteBtn.style.display = 'none';
  }
  
  updateCreatorLabel();
  DOM.itemModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Lock background scrolling
}

function closeModal() {
  DOM.itemModal.classList.remove('active');
  document.body.style.overflow = ''; // Unlock scrolling
}

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

function updateCreatorLabel() {
  const type = DOM.formType.value.toLowerCase();
  
  if (type.includes('book') || type.includes('manga') || type.includes('novel')) {
    DOM.creatorLabel.innerHTML = 'Author <span class="required">*</span>';
    DOM.formCreator.placeholder = 'e.g., Haruki Murakami, Keigo Higashino';
  } else if (type.includes('drama') || type.includes('anime') || type.includes('movie') || type.includes('show')) {
    DOM.creatorLabel.innerHTML = 'Director / Studio <span class="required">*</span>';
    DOM.formCreator.placeholder = 'e.g., Studio Ghibli, David Fincher';
  } else {
    DOM.creatorLabel.innerHTML = 'Creator / Artist <span class="required">*</span>';
    DOM.formCreator.placeholder = 'e.g., Name of the creator';
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
  renderApp();
}

function handleDeleteItem() {
  const id = DOM.formId.value;
  if (!id) return;
  
  if (confirm('Are you sure you want to delete this record?')) {
    state.items = state.items.filter(item => item.id !== id);
    saveItems();
    closeModal();
    renderApp();
    showToast('Record deleted.', 'info');
  }
}

// ==========================================================================
// RENDER METHODS (UI UPDATES)
// ==========================================================================
function renderApp() {
  renderSidebarCategories();
  renderStats();
  renderFilterTabs();
  renderList();
}

function renderSidebarCategories() {
  DOM.categoriesList.innerHTML = '';
  
  if (state.categories.length === 0) {
    const li = document.createElement('li');
    li.className = 'section-desc';
    li.style.textAlign = 'center';
    li.textContent = 'No categories found. Create one above.';
    DOM.categoriesList.appendChild(li);
    return;
  }

  state.categories.forEach(category => {
    const li = document.createElement('li');
    li.className = 'category-item';

    // Generate color indicator based on category hash
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

    // Hook delete button click handler
    li.querySelector('.category-delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteCategory(category);
    });

    DOM.categoriesList.appendChild(li);
  });
}

function renderStats() {
  DOM.statsSection.innerHTML = '';

  const total = state.items.length;
  
  // Create static Total Card
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

  // Generate dynamic category stats (first 2 categories by default to fit the 4-column layout nicely)
  // Or sort by count and pick top 2 categories
  const categoryCounts = state.categories.map(cat => {
    return {
      name: cat,
      count: state.items.filter(i => i.type === cat).length
    };
  });

  // Sort by count descending, display top 2
  categoryCounts.sort((a, b) => b.count - a.count);
  const topCategories = categoryCounts.slice(0, 2);

  topCategories.forEach((catObj, index) => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const grad = getCategoryGradient(catObj.name);
    
    // Choose icon based on common keywords
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

  // Create static Avg Rating Card
  const ratedItems = state.items.filter(i => i.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, curr) => acc + curr.rating, 0) / ratedItems.length).toFixed(1)
    : '0.0';

  const ratingCard = document.createElement('div');
  ratingCard.className = 'stat-card';
  ratingCard.innerHTML = `
    <div class="stat-icon icon-amber">
      <i class="fa-solid fa-star"></i>
    </div>
    <div class="stat-details">
      <span class="stat-value">${avgRating}</span>
      <span class="stat-label">Average Rating</span>
    </div>
  `;
  DOM.statsSection.appendChild(ratingCard);
}

function renderFilterTabs() {
  DOM.filterTabs.innerHTML = '';

  // 1. Render 'All' Tab
  const allBtn = document.createElement('button');
  allBtn.className = `tab-btn ${state.filters.type === 'all' ? 'active' : ''}`;
  allBtn.dataset.type = 'all';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => handleTabClick(allBtn, 'all'));
  DOM.filterTabs.appendChild(allBtn);

  // 2. Render dynamic tabs for each category
  state.categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = `tab-btn ${state.filters.type === category ? 'active' : ''}`;
    btn.dataset.type = category;
    
    // Choose icon
    let iconHtml = '<i class="fa-solid fa-tag"></i> ';
    const lower = category.toLowerCase();
    if (lower.includes('book')) iconHtml = '<i class="fa-solid fa-book-open"></i> ';
    if (lower.includes('drama') || lower.includes('show') || lower.includes('movie')) iconHtml = '<i class="fa-solid fa-video"></i> ';
    if (lower.includes('manga') || lower.includes('comic')) iconHtml = '<i class="fa-solid fa-book"></i> ';
    if (lower.includes('anime')) iconHtml = '<i class="fa-solid fa-clapperboard"></i> ';

    btn.innerHTML = `${iconHtml}${escapeHtml(category)}`;
    btn.addEventListener('click', () => handleTabClick(btn, category));
    DOM.filterTabs.appendChild(btn);
  });
}

function handleTabClick(btn, type) {
  const tabs = DOM.filterTabs.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  state.filters.type = type;
  renderList();
}

function renderList() {
  // Apply Search, Category, Status Filters
  let filteredItems = state.items.filter(item => {
    // 1. Search Query
    const searchMatch = !state.filters.search || 
      item.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      item.creator.toLowerCase().includes(state.filters.search.toLowerCase());
      
    // 2. Category Type Filter (handle items with deleted/unassigned category as well)
    const typeMatch = state.filters.type === 'all' || item.type === state.filters.type;
    
    // 3. Status Filter
    const statusMatch = state.filters.status === 'all' || item.status === state.filters.status;
    
    return searchMatch && typeMatch && statusMatch;
  });

  // Apply Sorting
  filteredItems.sort((a, b) => {
    switch (state.filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        
      case 'rating-desc':
        if (a.rating === b.rating) {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); // tie breaker
        }
        return b.rating - a.rating;
        
      case 'rating-asc':
        // Keep unrated items (0) at the bottom
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

  // Determine Badge labels & Status class
  const typeBadgeText = item.type || 'Unassigned';
  const hasTypeClass = item.type ? 'badge-type-custom' : 'badge-type-unassigned';
  
  let statusBadgeText = '';
  const lowerType = (item.type || '').toLowerCase();
  const isVideo = lowerType.includes('drama') || lowerType.includes('anime') || lowerType.includes('movie') || lowerType.includes('show');

  switch (item.status) {
    case 'planning':
      statusBadgeText = isVideo ? 'Plan to Watch' : 'Plan to Read';
      break;
    case 'reading':
      statusBadgeText = isVideo ? 'Watching' : 'Reading';
      break;
    case 'completed':
      statusBadgeText = 'Completed';
      break;
  }
  
  // Cover Render
  let coverHtml = '';
  if (item.coverUrl) {
    coverHtml = `<img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)} cover" loading="lazy">`;
  } else {
    // Generate beautiful colored gradient cover based on name hashing
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

  // Stars HTML
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

  // Dates strings
  const startDateStr = item.startDate ? formatDate(item.startDate) : '--';
  const endDateStr = item.endDate ? formatDate(item.endDate) : '--';
  const datesHtml = item.status === 'planning' 
    ? `<div class="card-dates"><span>Added: ${formatDate(item.createdAt || new Date().toISOString())}</span></div>`
    : `<div class="card-dates"><span>Start: ${startDateStr}</span><span>End: ${endDateStr}</span></div>`;

  // Notes snippet
  const notesSnippet = item.notes 
    ? `<div class="card-notes">${escapeHtml(item.notes)}</div>` 
    : '';

  // Generate dynamic type badge style
  const grad = getCategoryGradient(item.type || 'default');
  const typeBadgeStyle = `background: linear-gradient(135deg, ${grad[0]}cc, ${grad[1]}cc); border: 1px solid ${grad[0]};`;

  card.innerHTML = `
    <div class="card-cover">
      ${coverHtml}
      <div class="card-badge-container">
        <span class="badge ${hasTypeClass}" style="${typeBadgeStyle}">${escapeHtml(typeBadgeText)}</span>
        <span class="badge badge-status ${item.status}">${statusBadgeText}</span>
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
  
  // Export schema includes categories list
  const exportData = {
    version: 2,
    categories: state.categories,
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

      // Check format version
      if (Array.isArray(importedJson)) {
        // Legacy import (direct array of items)
        importedItems = importedJson;
        importedCategories = ["Books", "Dramas", "Mangas", "Animes"]; // use defaults
      } else if (importedJson && typeof importedJson === 'object' && importedJson.items) {
        // Version 2 import (object containing items and categories)
        importedItems = importedJson.items;
        importedCategories = importedJson.categories || [];
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
        // Merge categories
        const mergedCategories = Array.from(new Set([...state.categories, ...importedCategories]));
        state.categories = mergedCategories;
        saveCategories();

        // Prevent duplicate IDs (regenerate if exists)
        const existingIds = new Set(state.items.map(item => item.id));
        const cleanItems = validatedItems.map(item => {
          if (existingIds.has(item.id) || !item.id) {
            item.id = (Date.now() + Math.random()).toString();
          }
          
          // Map legacy types
          let type = item.type;
          if (type === 'book') type = 'Books';
          if (type === 'drama') type = 'Dramas';

          // Normalise schema fields just in case
          return {
            id: item.id,
            title: item.title,
            type: type || '',
            creator: item.creator,
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
        renderApp();
        showToast(`Imported ${cleanItems.length} records successfully!`, 'success');
      }
    } catch (error) {
      console.error('Import Error:', error);
      showToast('Import failed. Please choose a valid JSON backup file.', 'error');
    }
    DOM.importFileInput.value = ''; // Reset input
  };
  
  reader.readAsText(file);
}

// ==========================================================================
// UTILITY FUNCTIONS
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

// String hashing to generate a unique, beautiful gradient color pair
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
// MOCK DATA GENERATOR (English version)
// ==========================================================================
function getMockItems() {
  return [
    {
      id: 'mock-1',
      title: 'Norwegian Wood',
      type: 'Books',
      creator: 'Haruki Murakami',
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
      status: 'planning',
      rating: 0,
      coverUrl: '',
      startDate: '',
      endDate: '',
      notes: 'Heard it is a masterpiece of sci-fi. Want to take my time and read it when I get a chance.',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
    }
  ];
}
