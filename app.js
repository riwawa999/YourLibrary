/**
 * YourLibrary - Core Application Logic
 * State management, LocalStorage, CRUD operations, Search, Sort, Filters, and Theme toggles.
 */

// ==========================================================================
// STATE & CONFIGURATION
// ==========================================================================
let state = {
  items: [],
  theme: 'dark-theme',
  filters: {
    search: '',
    type: 'all', // 'all' | 'book' | 'drama'
    status: 'all', // 'all' | 'planning' | 'reading' | 'completed'
    sortBy: 'newest' // 'newest' | 'oldest' | 'rating-desc' | 'rating-asc' | 'title'
  }
};

// ==========================================================================
// DOM ELEMENTS
// ==========================================================================
const DOM = {
  // Theme & Actions
  themeToggleBtn: document.getElementById('theme-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFileInput: document.getElementById('import-file-input'),

  // Stats
  statTotal: document.getElementById('stat-total'),
  statBooks: document.getElementById('stat-books'),
  statDramas: document.getElementById('stat-dramas'),
  statRating: document.getElementById('stat-rating'),

  // Controls
  searchInput: document.getElementById('search-input'),
  tabBtns: document.querySelectorAll('.tab-btn'),
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
  showToast('テーマを切り替えました', 'info');
}

// ==========================================================================
// DATA PERSISTENCE & STATE SYNC
// ==========================================================================
function loadData() {
  // Load Theme
  const savedTheme = localStorage.getItem('yl_theme');
  if (savedTheme) {
    state.theme = savedTheme;
  }

  // Load Items
  const savedItems = localStorage.getItem('yl_items');
  if (savedItems) {
    try {
      state.items = JSON.parse(savedItems);
    } catch (e) {
      console.error('Failed to parse items from local storage', e);
      state.items = [];
      showToast('データの読み込みに失敗しました。リセットします。', 'error');
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

// ==========================================================================
// EVENT LISTENERS SETUP
// ==========================================================================
function setupEventListeners() {
  // Theme Toggle
  DOM.themeToggleBtn.addEventListener('click', toggleTheme);

  // Search & Filter Inputs
  DOM.searchInput.addEventListener('input', (e) => {
    state.filters.search = e.target.value.trim();
    renderApp();
  });

  DOM.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      DOM.tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.filters.type = btn.dataset.type;
      renderApp();
    });
  });

  DOM.statusFilter.addEventListener('change', (e) => {
    state.filters.status = e.target.value;
    renderApp();
  });

  DOM.sortSelector.addEventListener('change', (e) => {
    state.filters.sortBy = e.target.value;
    renderApp();
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

  // Category change within form (updates Creator Label)
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
// MODAL & FORM LOGIC
// ==========================================================================
function openModal(item = null) {
  DOM.itemForm.reset();
  
  if (item) {
    // Edit Mode
    DOM.modalTitle.textContent = '記録を編集する';
    DOM.formId.value = item.id;
    DOM.formTitle.value = item.title;
    DOM.formType.value = item.type;
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
    DOM.modalTitle.textContent = '新しく記録する';
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

function updateCreatorLabel() {
  const type = DOM.formType.value;
  if (type === 'book') {
    DOM.creatorLabel.innerHTML = '著者名 <span class="required">*</span>';
    DOM.formCreator.placeholder = '例: 村上春樹、東野圭吾';
  } else {
    DOM.creatorLabel.innerHTML = '監督 / 制作 <span class="required">*</span>';
    DOM.formCreator.placeholder = '例: デヴィッド・フィンチャー、ダファー兄弟';
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
    showToast('タイトルと著作者は入力必須です。', 'error');
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
      showToast('記録を更新しました！', 'success');
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
    showToast('新しく記録を追加しました！', 'success');
  }
  
  saveItems();
  closeModal();
  renderApp();
}

function handleDeleteItem() {
  const id = DOM.formId.value;
  if (!id) return;
  
  if (confirm('この記録を削除してもよろしいですか？')) {
    state.items = state.items.filter(item => item.id !== id);
    saveItems();
    closeModal();
    renderApp();
    showToast('記録を削除しました。', 'info');
  }
}

// ==========================================================================
// RENDER METHODS (UI UPDATES)
// ==========================================================================
function renderApp() {
  renderStats();
  renderList();
}

function renderStats() {
  const total = state.items.length;
  const books = state.items.filter(i => i.type === 'book').length;
  const dramas = state.items.filter(i => i.type === 'drama').length;
  
  // Calculate average rating for rated items
  const ratedItems = state.items.filter(i => i.rating > 0);
  const avgRating = ratedItems.length > 0
    ? (ratedItems.reduce((acc, curr) => acc + curr.rating, 0) / ratedItems.length).toFixed(1)
    : '0.0';

  DOM.statTotal.textContent = total;
  DOM.statBooks.textContent = books;
  DOM.statDramas.textContent = dramas;
  DOM.statRating.textContent = avgRating;
}

function renderList() {
  // Apply Search, Category, Status Filters
  let filteredItems = state.items.filter(item => {
    // 1. Search Query
    const searchMatch = !state.filters.search || 
      item.title.toLowerCase().includes(state.filters.search.toLowerCase()) ||
      item.creator.toLowerCase().includes(state.filters.search.toLowerCase());
      
    // 2. Category Type Filter
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
        return a.title.localeCompare(b.title, 'ja');
        
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
  card.setAttribute('aria-label', `${item.type === 'book' ? '本' : 'ドラマ'}: ${item.title}`);
  card.addEventListener('click', () => openModal(item));

  // Determine Badge labels & Status class
  const typeBadgeText = item.type === 'book' ? 'Book' : 'Drama';
  const typeBadgeClass = `badge-type-${item.type}`;
  
  let statusBadgeText = '';
  switch (item.status) {
    case 'planning':
      statusBadgeText = item.type === 'book' ? '読みたい' : '観たい';
      break;
    case 'reading':
      statusBadgeText = item.type === 'book' ? '読書中' : '視聴中';
      break;
    case 'completed':
      statusBadgeText = '完了';
      break;
  }
  
  // Cover Render
  let coverHtml = '';
  if (item.coverUrl) {
    coverHtml = `<img src="${escapeHtml(item.coverUrl)}" alt="${escapeHtml(item.title)}のカバー" loading="lazy">`;
  } else {
    const placeholderClass = item.type === 'book' ? 'placeholder-book' : 'placeholder-drama';
    const icon = item.type === 'book' ? 'fa-solid fa-book-open' : 'fa-solid fa-video';
    coverHtml = `
      <div class="card-cover-placeholder ${placeholderClass}">
        <i class="${icon}"></i>
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
    starsHtml = '<span class="unrated-label">未評価</span>';
  }

  // Dates strings
  const startDateStr = item.startDate ? formatDate(item.startDate) : '--';
  const endDateStr = item.endDate ? formatDate(item.endDate) : '--';
  const datesHtml = item.status === 'planning' 
    ? `<div class="card-dates"><span>追加: ${formatDate(item.createdAt || new Date().toISOString())}</span></div>`
    : `<div class="card-dates"><span>開始: ${startDateStr}</span><span>完了: ${endDateStr}</span></div>`;

  // Notes snippet
  const notesSnippet = item.notes 
    ? `<div class="card-notes">${escapeHtml(item.notes)}</div>` 
    : '';

  card.innerHTML = `
    <div class="card-cover">
      ${coverHtml}
      <div class="card-badge-container">
        <span class="badge ${typeBadgeClass}">${typeBadgeText}</span>
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
    showToast('エクスポートするデータがありません', 'info');
    return;
  }
  
  const dataStr = JSON.stringify(state.items, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `yourlibrary_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast('ライブラリをエクスポートしました', 'success');
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const importedData = JSON.parse(evt.target.result);
      
      // Validation check
      if (!Array.isArray(importedData)) {
        throw new Error('Imported data must be an array');
      }

      const validatedItems = importedData.filter(item => {
        // Ensure minimum required fields exist
        return item && typeof item === 'object' && item.title && item.creator && item.type;
      });

      if (validatedItems.length === 0) {
        throw new Error('No valid items found in JSON file');
      }

      if (confirm(`${validatedItems.length}件のアイテムをインポートしますか？既存のアイテムと結合されます。`)) {
        // Prevent duplicate IDs (regenerate if exists)
        const existingIds = new Set(state.items.map(item => item.id));
        const cleanItems = validatedItems.map(item => {
          if (existingIds.has(item.id) || !item.id) {
            item.id = (Date.now() + Math.random()).toString();
          }
          // Normalise schema fields just in case
          return {
            id: item.id,
            title: item.title,
            type: item.type === 'book' || item.type === 'drama' ? item.type : 'book',
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
        showToast(`${cleanItems.length}件のインポートに成功しました！`, 'success');
      }
    } catch (error) {
      console.error('Import Error:', error);
      showToast('インポートに失敗しました。正しいJSONファイルを選択してください。', 'error');
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
// MOCK DATA GENERATOR
// ==========================================================================
function getMockItems() {
  return [
    {
      id: 'mock-1',
      title: 'ノルウェイの森',
      type: 'book',
      creator: '村上春樹',
      status: 'completed',
      rating: 5,
      coverUrl: '',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
      notes: '静かで美しく、寂しげな物語。直子と緑の対比が印象的で、何度も読み返したくなる作品です。背景描写がとても丁寧。',
      createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
    },
    {
      id: 'mock-2',
      title: 'ストレンジャー・シングス 未知の世界',
      type: 'drama',
      creator: 'ザ・ダファー・ブラザーズ',
      status: 'reading',
      rating: 4,
      coverUrl: '',
      startDate: '2026-06-15',
      endDate: '',
      notes: 'シーズン1を視聴中。80年代の雰囲気が最高で、超能力少女イレブンと少年たちの友情にわくわくする。',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
    },
    {
      id: 'mock-3',
      title: '三体',
      type: 'book',
      creator: '劉慈欣',
      status: 'planning',
      rating: 0,
      coverUrl: '',
      startDate: '',
      endDate: '',
      notes: 'SFの世界的傑作と聞いたので、時間がある時にじっくり読みたい。',
      createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
    }
  ];
}
