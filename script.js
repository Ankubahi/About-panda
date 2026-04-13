/* ════════════════════════════════════════════════════════
   TaskFlow — script.js
   Full Application Logic
════════════════════════════════════════════════════════ */

/* ── 1. CONSTANTS ──────────────────────────────────────── */
const APP_KEY       = 'taskflow_v2';
const TASKS_KEY     = `${APP_KEY}_tasks`;
const CATS_KEY      = `${APP_KEY}_categories`;
const SETTINGS_KEY  = `${APP_KEY}_settings`;
const ACTIVITY_KEY  = `${APP_KEY}_activity`;

const PRIORITY_ORDER = { high: 3, medium: 2, low: 1 };
const TASKS_PER_PAGE_DEFAULT = 20;

const ICONS = {
  dashboard : 'fa-solid fa-gauge-high',
  tasks     : 'fa-solid fa-list-check',
  today     : 'fa-solid fa-sun',
  upcoming  : 'fa-solid fa-calendar-days',
  calendar  : 'fa-solid fa-calendar',
  stats     : 'fa-solid fa-chart-bar',
  settings  : 'fa-solid fa-gear',
};

const BREADCRUMBS = {
  dashboard : 'Dashboard',
  tasks     : 'All Tasks',
  today     : 'Today',
  upcoming  : 'Upcoming',
  calendar  : 'Calendar',
  stats     : 'Statistics',
  settings  : 'Settings',
};

/* ── 2. STATE ──────────────────────────────────────────── */
let state = {
  tasks      : [],
  categories : [],
  settings   : {},
  activity   : [],
  currentView    : 'dashboard',
  currentFilter  : 'all',
  currentSort    : 'created-desc',
  currentPage    : 1,
  tasksPerPage   : TASKS_PER_PAGE_DEFAULT,
  categoryFilter : 'all',
  searchQuery    : '',
  isSelectMode   : false,
  selectedTasks  : new Set(),
  calendarDate   : new Date(),
  calSelectedDay : null,
  pendingConfirm : null,
  pendingDetailId: null,
  calAddOnDate   : null,
};

/* ── 3. DEFAULT DATA ──────────────────────────────────── */
const DEFAULT_SETTINGS = {
  name           : 'User',
  avatarColor    : '#7c3aed',
  theme          : 'dark',
  accentColor    : '#7c3aed',
  fontSize       : 'medium',
  defaultPriority: 'medium',
  defaultCategory: 'general',
  showCompleted  : true,
  autoArchive    : false,
  tasksPerPage   : 20,
};

const DEFAULT_CATEGORIES = [
  { id: 'general',  name: 'General',  color: '#7c3aed' },
  { id: 'work',     name: 'Work',     color: '#2563eb' },
  { id: 'personal', name: 'Personal', color: '#16a34a' },
  { id: 'health',   name: 'Health',   color: '#dc2626' },
  { id: 'learning', name: 'Learning', color: '#d97706' },
];

/* ── 4. INIT ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

function init() {
  loadData();
  applySettings();
  cacheDOMElements();
  bindAllEvents();
  renderAll();
  setGreeting();
  setDateDisplay();
  updateBadges();
}

/* ── 5. DATA PERSISTENCE ──────────────────────────────── */
function loadData() {
  try {
    state.tasks = JSON.parse(localStorage.getItem(TASKS_KEY)) || [];
    state.categories = JSON.parse(localStorage.getItem(CATS_KEY)) || [...DEFAULT_CATEGORIES];
    state.settings = {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {})
    };
    state.activity = JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
    state.tasksPerPage = state.settings.tasksPerPage || TASKS_PER_PAGE_DEFAULT;
  } catch (e) {
    console.error('Failed to load data:', e);
    state.tasks      = [];
    state.categories = [...DEFAULT_CATEGORIES];
    state.settings   = { ...DEFAULT_SETTINGS };
    state.activity   = [];
  }
}

function saveData() {
  try {
    localStorage.setItem(TASKS_KEY,    JSON.stringify(state.tasks));
    localStorage.setItem(CATS_KEY,     JSON.stringify(state.categories));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(state.activity.slice(0, 50)));
    updateStorageIndicator();
  } catch (e) {
    console.error('Failed to save data:', e);
    showToast('error', 'Save Failed', 'Could not save data to storage.');
  }
}

function updateStorageIndicator() {
  const total = Object.keys(localStorage).reduce((acc, k) => {
    return acc + (localStorage.getItem(k) || '').length;
  }, 0);
  const kb = (total * 2 / 1024).toFixed(1);
  const pct = Math.min((total * 2 / (5 * 1024 * 1024)) * 100, 100);
  const el = document.getElementById('storage-size');
  const fill = document.getElementById('storage-fill');
  if (el)   el.textContent = `${kb} KB`;
  if (fill) fill.style.width = `${pct}%`;
  const aboutSz = document.getElementById('about-storage');
  if (aboutSz) aboutSz.textContent = `${kb} KB`;
}

/* ── 6. SETTINGS ─────────────────────────────────────── */
function applySettings() {
  const { theme, accentColor, fontSize, name } = state.settings;
  document.documentElement.setAttribute('data-theme', theme || 'dark');
  document.documentElement.setAttribute('data-font-size', fontSize || 'medium');
  if (accentColor) setAccentColor(accentColor);
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.className = theme === 'light'
    ? 'fa-solid fa-sun'
    : 'fa-solid fa-moon';
  const profileName = document.getElementById('profile-name-display');
  if (profileName) profileName.textContent = name || 'User';
  const avatar = document.getElementById('user-avatar');
  if (avatar) avatar.style.background = accentColor || '#7c3aed';
}

function setAccentColor(color) {
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-hover', color);
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  document.documentElement.style.setProperty(
    '--accent-light', `rgba(${r},${g},${b},0.15)`
  );
}

/* ── 7. DOM CACHE ─────────────────────────────────────── */
let dom = {};
function cacheDOMElements() {
  dom = {
    // Views
    views: document.querySelectorAll('.view'),
    navBtns: document.querySelectorAll('.nav-btn'),

    // Topbar
    hamburger      : document.getElementById('hamburger-btn'),
    sidebar        : document.getElementById('sidebar'),
    sidebarClose   : document.getElementById('sidebar-close-btn'),
    overlay        : document.getElementById('overlay'),
    breadcrumbIcon : document.getElementById('breadcrumb-icon'),
    breadcrumbText : document.getElementById('breadcrumb-text'),
    themeToggle    : document.getElementById('theme-toggle-btn'),
    themeIcon      : document.getElementById('theme-icon'),
    globalSearch   : document.getElementById('global-search'),
    searchClear    : document.getElementById('search-clear-btn'),
    searchResults  : document.getElementById('search-results'),
    searchResultList: document.getElementById('search-result-list'),
    searchCount    : document.getElementById('search-result-count'),
    searchNoResult : document.getElementById('search-no-results'),
    addTaskTopBtn  : document.getElementById('add-task-top-btn'),
    exportQuickBtn : document.getElementById('export-quick-btn'),

    // Dashboard
    statTotal         : document.getElementById('stat-total'),
    statCompleted     : document.getElementById('stat-completed'),
    statActive        : document.getElementById('stat-active'),
    statOverdue       : document.getElementById('stat-overdue'),
    statTotalSub      : document.getElementById('stat-total-sub'),
    statCompletedSub  : document.getElementById('stat-completed-sub'),
    progressBar       : document.getElementById('progress-bar-fill'),
    progressPercent   : document.getElementById('progress-percent'),
    dashGreeting      : document.getElementById('dashboard-greeting'),
    currentDateDisplay: document.getElementById('current-date-display'),
    recentTaskList    : document.getElementById('recent-task-list'),
    recentTaskEmpty   : document.getElementById('recent-task-empty'),
    todayDashList     : document.getElementById('today-dash-list'),
    todayDashEmpty    : document.getElementById('today-dash-empty'),
    categoryOverview  : document.getElementById('category-overview-bars'),
    activityList      : document.getElementById('activity-list'),
    activityEmpty     : document.getElementById('activity-empty'),
    clearActivityBtn  : document.getElementById('clear-activity-btn'),
    donutHigh         : document.getElementById('donut-high'),
    donutMedium       : document.getElementById('donut-medium'),
    donutLow          : document.getElementById('donut-low'),
    donutCenterNum    : document.getElementById('donut-center-num'),
    legendHighVal     : document.getElementById('legend-high-val'),
    legendMediumVal   : document.getElementById('legend-medium-val'),
    legendLowVal      : document.getElementById('legend-low-val'),

    // Tasks view
    taskList          : document.getElementById('task-list'),
    tasksEmptyState   : document.getElementById('tasks-empty-state'),
    tasksCountSub     : document.getElementById('tasks-count-subtitle'),
    addTaskViewBtn    : document.getElementById('add-task-view-btn'),
    sortOpenBtn       : document.getElementById('sort-open-btn'),
    selectModeBtn     : document.getElementById('select-mode-btn'),
    filterChips       : document.querySelectorAll('.chip'),
    categoryFilterSel : document.getElementById('category-filter-select'),
    listViewBtn       : document.getElementById('list-view-btn'),
    gridViewBtn       : document.getElementById('grid-view-btn'),
    bulkBar           : document.getElementById('bulk-bar'),
    bulkCountLabel    : document.getElementById('bulk-count-label'),
    bulkCompleteBtn   : document.getElementById('bulk-complete-btn'),
    bulkUncompleteBtn : document.getElementById('bulk-uncomplete-btn'),
    bulkDeleteBtn     : document.getElementById('bulk-delete-btn'),
    bulkCancelBtn     : document.getElementById('bulk-cancel-btn'),
    paginationBar     : document.getElementById('pagination-bar'),
    prevPage          : document.getElementById('prev-page'),
    nextPage          : document.getElementById('next-page'),
    pageNumbers       : document.getElementById('page-numbers'),
    emptyAddBtn       : document.getElementById('empty-state-add-btn'),

    // Today view
    todayDateSub      : document.getElementById('today-date-sub'),
    overdueTaskList   : document.getElementById('overdue-task-list'),
    todayTaskList     : document.getElementById('today-task-list'),
    weekTaskList      : document.getElementById('week-task-list'),
    overdueCount      : document.getElementById('overdue-count'),
    todayCount        : document.getElementById('today-count'),
    weekCount         : document.getElementById('week-count'),
    overdueEmptyMsg   : document.getElementById('overdue-empty-msg'),
    todayEmptyMsg     : document.getElementById('today-empty-msg'),
    weekEmptyMsg      : document.getElementById('week-empty-msg'),
    addTodayTaskBtn   : document.getElementById('add-today-task-btn'),

    // Upcoming view
    upcomingGroups    : document.getElementById('upcoming-groups-container'),
    upcomingEmpty     : document.getElementById('upcoming-empty'),

    // Calendar view
    calGrid           : document.getElementById('cal-grid'),
    calMonthTitle     : document.getElementById('cal-month-title'),
    calPrev           : document.getElementById('cal-prev-btn'),
    calNext           : document.getElementById('cal-next-btn'),
    calGotoToday      : document.getElementById('cal-goto-today'),
    calDayPanel       : document.getElementById('cal-day-panel'),
    calDayTitle       : document.getElementById('cal-selected-day-title'),
    calDayList        : document.getElementById('cal-day-task-list'),
    calDayEmpty       : document.getElementById('cal-day-empty'),
    calAddOnDayBtn    : document.getElementById('cal-add-on-day-btn'),

    // Stats view
    kpiCompletionRate : document.getElementById('kpi-completion-rate'),
    kpiTotalCompleted : document.getElementById('kpi-total-completed'),
    kpiHighDone       : document.getElementById('kpi-high-done'),
    kpiOverdue        : document.getElementById('kpi-overdue'),
    chartCreated      : document.getElementById('chart-created'),
    chartCompleted    : document.getElementById('chart-completed'),
    priorityDistBar   : document.getElementById('priority-dist-bar'),
    catProgressList   : document.getElementById('cat-progress-list'),

    // Settings view
    sName             : document.getElementById('s-name'),
    sAvatarColor      : document.getElementById('s-avatar-color'),
    saveProfileBtn    : document.getElementById('save-profile-btn'),
    sExportJson       : document.getElementById('s-export-json'),
    sExportCsv        : document.getElementById('s-export-csv'),
    sImportBtn        : document.getElementById('s-import-btn'),
    sImportFile       : document.getElementById('s-import-file'),
    sClearCompleted   : document.getElementById('s-clear-completed-btn'),
    sClearAll         : document.getElementById('s-clear-all-btn'),
    sFontSize         : document.getElementById('s-font-size'),
    sDefaultPriority  : document.getElementById('s-default-priority'),
    sDefaultCategory  : document.getElementById('s-default-category'),
    sShowCompleted    : document.getElementById('s-show-completed'),
    sAutoArchive      : document.getElementById('s-auto-archive'),
    sPerPage          : document.getElementById('s-per-page'),
    savePrefsBtn      : document.getElementById('save-prefs-btn'),
    sNewCatName       : document.getElementById('s-new-cat-name'),
    sNewCatColor      : document.getElementById('s-new-cat-color'),
    sAddCatBtn        : document.getElementById('s-add-cat-btn'),
    sCategoryList     : document.getElementById('s-category-list'),
    themeChoices      : document.querySelectorAll('.theme-choice'),
    accentDots        : document.querySelectorAll('.accent-dot'),
    quickAddCatBtn    : document.getElementById('quick-add-cat-btn'),
    dashManageCatBtn  : document.getElementById('dash-manage-cat-btn'),
    aboutTotalTasks   : document.getElementById('about-total-tasks'),
    aboutCategories   : document.getElementById('about-categories'),

    // Task Modal
    taskModalBg       : document.getElementById('task-modal-bg'),
    taskModalTitle    : document.getElementById('task-modal-title'),
    taskModalClose    : document.getElementById('task-modal-close'),
    taskFormCancel    : document.getElementById('task-form-cancel'),
    taskFormSave      : document.getElementById('task-form-save'),
    fTitle            : document.getElementById('f-title'),
    fTitleCount       : document.getElementById('f-title-count'),
    fTitleError       : document.getElementById('f-title-error'),
    fDesc             : document.getElementById('f-desc'),
    fDescCount        : document.getElementById('f-desc-count'),
    fPriority         : document.getElementById('f-priority'),
    fCategory         : document.getElementById('f-category'),
    fDate             : document.getElementById('f-date'),
    fTime             : document.getElementById('f-time'),
    fTags             : document.getElementById('f-tags'),
    fTagsPreview      : document.getElementById('f-tags-preview'),
    fSubtaskInput     : document.getElementById('f-subtask-input'),
    fAddSubtaskBtn    : document.getElementById('f-add-subtask-btn'),
    fSubtaskList      : document.getElementById('f-subtask-list'),
    fNotes            : document.getElementById('f-notes'),
    fTaskId           : document.getElementById('f-task-id'),

    // Confirm Modal
    confirmModalBg    : document.getElementById('confirm-modal-bg'),
    confirmModalMsg   : document.getElementById('confirm-modal-message'),
    confirmModalClose : document.getElementById('confirm-modal-close'),
    confirmModalCancel: document.getElementById('confirm-modal-cancel'),
    confirmModalOk    : document.getElementById('confirm-modal-ok'),
    confirmModalTitle : document.getElementById('confirm-modal-title'),

    // Sort Modal
    sortModalBg       : document.getElementById('sort-modal-bg'),
    sortModalClose    : document.getElementById('sort-modal-close'),
    sortModalCancel   : document.getElementById('sort-modal-cancel'),
    sortModalApply    : document.getElementById('sort-modal-apply'),

    // Detail Modal
    detailModalBg     : document.getElementById('detail-modal-bg'),
    detailModalTitle  : document.getElementById('detail-modal-title'),
    detailModalClose  : document.getElementById('detail-modal-close'),
    detailModalBody   : document.getElementById('detail-modal-body'),
    detailEditBtn     : document.getElementById('detail-edit-btn'),

    // Category nav
    categoryNavList   : document.getElementById('category-nav-list'),
  };
}

/* ── 8. EVENT BINDING ─────────────────────────────────── */
function bindAllEvents() {
  // Sidebar
  dom.hamburger?.addEventListener('click', toggleSidebar);
  dom.sidebarClose?.addEventListener('click', closeSidebar);
  dom.overlay?.addEventListener('click', closeSidebar);

  // Navigation
  dom.navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view) switchView(view);
    });
  });

  // Theme toggle
  dom.themeToggle?.addEventListener('click', toggleTheme);

  // Theme choices (settings)
  dom.themeChoices.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.themeChoices.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.theme = btn.dataset.theme;
      applySettings();
      saveData();
    });
  });

  // Accent colors
  dom.accentDots.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.accentDots.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.settings.accentColor = btn.dataset.color;
      setAccentColor(btn.dataset.color);
      saveData();
    });
  });

  // Search
  dom.globalSearch?.addEventListener('input', onSearchInput);
  dom.globalSearch?.addEventListener('focus', onSearchFocus);
  dom.globalSearch?.addEventListener('keydown', onSearchKeydown);
  dom.searchClear?.addEventListener('click', clearSearch);

  // Close search on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('#search-box') && !e.target.closest('#search-results')) {
      hideSearchResults();
    }
  });

  // Add Task buttons
  dom.addTaskTopBtn?.addEventListener('click', () => openTaskModal());
  dom.addTaskViewBtn?.addEventListener('click', () => openTaskModal());
  dom.emptyAddBtn?.addEventListener('click', () => openTaskModal());
  dom.addTodayTaskBtn?.addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    openTaskModal(null, today);
  });

  // Task Modal
  dom.taskModalClose?.addEventListener('click', closeTaskModal);
  dom.taskFormCancel?.addEventListener('click', closeTaskModal);
  dom.taskFormSave?.addEventListener('click', saveTask);
  dom.taskModalBg?.addEventListener('click', e => {
    if (e.target === dom.taskModalBg) closeTaskModal();
  });

  // Char counters
  dom.fTitle?.addEventListener('input', () => {
    updateCharCount(dom.fTitle, dom.fTitleCount, 150);
    updateTagsPreview();
  });
  dom.fDesc?.addEventListener('input', () => updateCharCount(dom.fDesc, dom.fDescCount, 500));
  dom.fTags?.addEventListener('input', updateTagsPreview);

  // Subtasks in modal
  dom.fAddSubtaskBtn?.addEventListener('click', addModalSubtask);
  dom.fSubtaskInput?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addModalSubtask(); }
  });

  // Confirm Modal
  dom.confirmModalClose?.addEventListener('click', closeConfirmModal);
  dom.confirmModalCancel?.addEventListener('click', closeConfirmModal);
  dom.confirmModalOk?.addEventListener('click', () => {
    if (state.pendingConfirm) {
      state.pendingConfirm();
      state.pendingConfirm = null;
    }
    closeConfirmModal();
  });
  dom.confirmModalBg?.addEventListener('click', e => {
    if (e.target === dom.confirmModalBg) closeConfirmModal();
  });

  // Sort Modal
  dom.sortOpenBtn?.addEventListener('click', openSortModal);
  dom.sortModalClose?.addEventListener('click', closeSortModal);
  dom.sortModalCancel?.addEventListener('click', closeSortModal);
  dom.sortModalApply?.addEventListener('click', applySortModal);
  dom.sortModalBg?.addEventListener('click', e => {
    if (e.target === dom.sortModalBg) closeSortModal();
  });

  // Detail Modal
  dom.detailModalClose?.addEventListener('click', closeDetailModal);
  dom.detailModalBg?.addEventListener('click', e => {
    if (e.target === dom.detailModalBg) closeDetailModal();
  });
  dom.detailEditBtn?.addEventListener('click', () => {
    closeDetailModal();
    if (state.pendingDetailId) openTaskModal(state.pendingDetailId);
  });

  // Filter chips
  dom.filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      dom.filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentFilter = chip.dataset.filter;
      state.currentPage = 1;
      renderTaskList();
    });
  });

  // Category filter select
  dom.categoryFilterSel?.addEventListener('change', () => {
    state.categoryFilter = dom.categoryFilterSel.value;
    state.currentPage = 1;
    renderTaskList();
  });

  // View toggle (list / grid)
  dom.listViewBtn?.addEventListener('click', () => {
    dom.listViewBtn.classList.add('active');
    dom.gridViewBtn.classList.remove('active');
    dom.taskList?.classList.remove('grid-view');
  });
  dom.gridViewBtn?.addEventListener('click', () => {
    dom.gridViewBtn.classList.add('active');
    dom.listViewBtn.classList.remove('active');
    dom.taskList?.classList.add('grid-view');
  });

  // Select mode
  dom.selectModeBtn?.addEventListener('click', toggleSelectMode);
  dom.bulkCompleteBtn?.addEventListener('click', bulkComplete);
  dom.bulkUncompleteBtn?.addEventListener('click', bulkUncomplete);
  dom.bulkDeleteBtn?.addEventListener('click', bulkDelete);
  dom.bulkCancelBtn?.addEventListener('click', cancelSelectMode);

  // Pagination
  dom.prevPage?.addEventListener('click', () => {
    if (state.currentPage > 1) {
      state.currentPage--;
      renderTaskList();
    }
  });
  dom.nextPage?.addEventListener('click', () => {
    const filtered = getFilteredTasks();
    const total = Math.ceil(filtered.length / state.tasksPerPage);
    if (state.currentPage < total) {
      state.currentPage++;
      renderTaskList();
    }
  });

  // Calendar
  dom.calPrev?.addEventListener('click', () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
    renderCalendar();
  });
  dom.calNext?.addEventListener('click', () => {
    state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
    renderCalendar();
  });
  dom.calGotoToday?.addEventListener('click', () => {
    state.calendarDate = new Date();
    renderCalendar();
  });
  dom.calAddOnDayBtn?.addEventListener('click', () => {
    const dateStr = state.calSelectedDay
      ? state.calSelectedDay.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    openTaskModal(null, dateStr);
  });

  // Dashboard links
  document.querySelectorAll('[data-view]').forEach(el => {
    if (!el.classList.contains('nav-btn')) {
      el.addEventListener('click', () => switchView(el.dataset.view));
    }
  });

  // Activity
  dom.clearActivityBtn?.addEventListener('click', clearActivity);

  // Settings: Profile
  dom.saveProfileBtn?.addEventListener('click', saveProfile);

  // Settings: Preferences
  dom.savePrefsBtn?.addEventListener('click', savePreferences);

  // Settings: Category management
  dom.sAddCatBtn?.addEventListener('click', addCategory);
  dom.sNewCatName?.addEventListener('keydown', e => {
    if (e.key === 'Enter') addCategory();
  });
  dom.quickAddCatBtn?.addEventListener('click', () => {
    switchView('settings');
    setTimeout(() => dom.sNewCatName?.focus(), 300);
  });
  dom.dashManageCatBtn?.addEventListener('click', () => switchView('settings'));

  // Settings: Export / Import / Clear
  dom.sExportJson?.addEventListener('click', exportJSON);
  dom.sExportCsv?.addEventListener('click', exportCSV);
  dom.exportQuickBtn?.addEventListener('click', exportJSON);
  dom.sImportBtn?.addEventListener('click', () => dom.sImportFile?.click());
  dom.sImportFile?.addEventListener('change', importJSON);
  dom.sClearCompleted?.addEventListener('click', () => {
    showConfirmModal(
      'Clear Completed Tasks',
      'Remove all completed tasks? This cannot be undone.',
      clearCompletedTasks
    );
  });
  dom.sClearAll?.addEventListener('click', () => {
    showConfirmModal(
      'Clear ALL Data',
      'Delete all tasks, categories, and settings? This is irreversible!',
      clearAllData
    );
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeConfirmModal();
      closeSortModal();
      closeDetailModal();
      if (state.searchQuery) clearSearch();
    }
  });
}

/* ── 9. VIEW SWITCHING ──────────────────────────────────── */
function switchView(viewName) {
  state.currentView = viewName;

  // Update views
  dom.views.forEach(v => v.classList.remove('active'));
  const target = document.getElementById(`view-${viewName}`);
  if (target) target.classList.add('active');

  // Update nav
  dom.navBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  // Update breadcrumb
  if (dom.breadcrumbText) dom.breadcrumbText.textContent = BREADCRUMBS[viewName] || viewName;
  if (dom.breadcrumbIcon) dom.breadcrumbIcon.className = ICONS[viewName] || 'fa-solid fa-circle';

  // Render view-specific content
  switch (viewName) {
    case 'dashboard': renderDashboard(); break;
    case 'tasks':     renderTaskList();  break;
    case 'today':     renderTodayView(); break;
    case 'upcoming':  renderUpcoming();  break;
    case 'calendar':  renderCalendar();  break;
    case 'stats':     renderStats();     break;
    case 'settings':  renderSettings();  break;
  }

  closeSidebar();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── 10. RENDER ALL ─────────────────────────────────────── */
function renderAll() {
  renderDashboard();
  renderTaskList();
  updateBadges();
  updateCategoryNavList();
  updateCategorySelects();
  updateStorageIndicator();
}

/* ── 11. DASHBOARD ─────────────────────────────────────── */
function renderDashboard() {
  const tasks     = state.tasks;
  const total     = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const active    = tasks.filter(t => !t.completed).length;
  const overdue   = getOverdueTasks().length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Stat cards
  setText('stat-total',     total);
  setText('stat-completed', completed);
  setText('stat-active',    active);
  setText('stat-overdue',   overdue);
  if (dom.statTotalSub)    dom.statTotalSub.textContent    = `${state.categories.length} categories`;
  if (dom.statCompletedSub)dom.statCompletedSub.textContent= `${pct}% complete`;

  // Progress
  if (dom.progressBar)    dom.progressBar.style.width       = `${pct}%`;
  if (dom.progressPercent)dom.progressPercent.textContent   = `${pct}%`;

  // Recent Tasks (last 5)
  const recent = [...tasks].sort((a,b) => b.createdAt - a.createdAt).slice(0, 5);
  renderMiniTaskList(dom.recentTaskList, dom.recentTaskEmpty, recent);

  // Today's tasks
  const todayTasks = getTodayTasks();
  renderMiniTaskList(dom.todayDashList, dom.todayDashEmpty, todayTasks.slice(0, 5));

  // Donut chart
  renderDonutChart();

  // Category bars
  renderCategoryOverview();

  // Activity
  renderActivity();

  // About stats
  if (dom.aboutTotalTasks) dom.aboutTotalTasks.textContent = total;
  if (dom.aboutCategories) dom.aboutCategories.textContent = state.categories.length;
}

function renderMiniTaskList(listEl, emptyEl, tasks) {
  if (!listEl) return;
  listEl.innerHTML = '';
  if (tasks.length === 0) {
    emptyEl?.classList.remove('hidden');
    return;
  }
  emptyEl?.classList.add('hidden');
  tasks.forEach(task => {
    const li = document.createElement('li');
    const cat = getCategoryById(task.categoryId);
    li.className = `mini-task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
    li.innerHTML = `
      <div class="mini-task-icon" style="background:${cat?.color || 'var(--accent)'}22;color:${cat?.color || 'var(--accent)'}">
        <i class="fa-solid ${task.completed ? 'fa-check' : 'fa-circle-dot'}"></i>
      </div>
      <span class="mini-task-text">${escapeHTML(task.title)}</span>
      <span class="mini-task-date">${task.dueDate ? formatDateShort(task.dueDate) : ''}</span>
    `;
    li.addEventListener('click', () => openDetailModal(task.id));
    listEl.appendChild(li);
  });
}

function renderDonutChart() {
  const tasks  = state.tasks;
  const total  = tasks.length;
  const high   = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low    = tasks.filter(t => t.priority === 'low').length;

  if (dom.donutCenterNum) dom.donutCenterNum.textContent = total;
  if (dom.legendHighVal)   dom.legendHighVal.textContent   = high;
  if (dom.legendMediumVal) dom.legendMediumVal.textContent = medium;
  if (dom.legendLowVal)    dom.legendLowVal.textContent    = low;

  const circumference = 2 * Math.PI * 48; // r=48

  if (total === 0) {
    [dom.donutHigh, dom.donutMedium, dom.donutLow].forEach(el => {
      if (el) el.style.strokeDasharray = `0 ${circumference}`;
    });
    return;
  }

  const highDash   = (high   / total) * circumference;
  const mediumDash = (medium / total) * circumference;
  const lowDash    = (low    / total) * circumference;

  const highOffset   = 0;
  const mediumOffset = -(highDash);
  const lowOffset    = -(highDash + mediumDash);

  if (dom.donutHigh) {
    dom.donutHigh.style.strokeDasharray  = `${highDash} ${circumference - highDash}`;
    dom.donutHigh.style.strokeDashoffset = `${highOffset}`;
  }
  if (dom.donutMedium) {
    dom.donutMedium.style.strokeDasharray  = `${mediumDash} ${circumference - mediumDash}`;
    dom.donutMedium.style.strokeDashoffset = `${mediumOffset}`;
  }
  if (dom.donutLow) {
    dom.donutLow.style.strokeDasharray  = `${lowDash} ${circumference - lowDash}`;
    dom.donutLow.style.strokeDashoffset = `${lowOffset}`;
  }
}

function renderCategoryOverview() {
  if (!dom.categoryOverview) return;
  dom.categoryOverview.innerHTML = '';
  state.categories.forEach(cat => {
    const catTasks = state.tasks.filter(t => t.categoryId === cat.id);
    if (catTasks.length === 0) return;
    const done = catTasks.filter(t => t.completed).length;
    const pct  = Math.round((done / catTasks.length) * 100);
    const div  = document.createElement('div');
    div.className = 'cat-overview-row';
    div.innerHTML = `
      <div class="cat-overview-header">
        <span class="cat-overview-name">
          <span class="cat-dot" style="background:${cat.color}"></span>
          ${escapeHTML(cat.name)}
        </span>
        <span class="cat-overview-count">${done}/${catTasks.length}</span>
      </div>
      <div class="cat-overview-bar">
        <div class="cat-overview-fill" style="width:${pct}%;background:${cat.color}"></div>
      </div>
    `;
    dom.categoryOverview.appendChild(div);
  });
  if (dom.categoryOverview.innerHTML === '') {
    dom.categoryOverview.innerHTML = `
      <div class="empty-mini">
        <i class="fa-solid fa-tags"></i>
        <span>No category data yet</span>
      </div>
    `;
  }
}

/* ── 12. TASK LIST VIEW ──────────────────────────────────── */
function renderTaskList() {
  if (!dom.taskList) return;

  const filtered = getFilteredTasks();
  const totalFiltered = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / state.tasksPerPage));

  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const start = (state.currentPage - 1) * state.tasksPerPage;
  const paginated = filtered.slice(start, start + state.tasksPerPage);

  if (dom.tasksCountSub) {
    dom.tasksCountSub.textContent = `${totalFiltered} task${totalFiltered !== 1 ? 's' : ''} found`;
  }

  dom.taskList.innerHTML = '';

  if (paginated.length === 0) {
    dom.tasksEmptyState?.classList.remove('hidden');
  } else {
    dom.tasksEmptyState?.classList.add('hidden');
    paginated.forEach((task, i) => {
      const li = createTaskCard(task);
      li.style.animationDelay = `${i * 0.04}s`;
      dom.taskList.appendChild(li);
    });
  }

  renderPagination(totalFiltered, totalPages);
  updateBulkBar();
}

function getFilteredTasks() {
  let tasks = [...state.tasks];

  // Search query
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }

  // Completed filter
  if (!state.settings.showCompleted && state.currentFilter !== 'completed') {
    tasks = tasks.filter(t => !t.completed);
  }

  // Status/priority filter
  switch (state.currentFilter) {
    case 'active':    tasks = tasks.filter(t => !t.completed); break;
    case 'completed': tasks = tasks.filter(t => t.completed);  break;
    case 'high':      tasks = tasks.filter(t => t.priority === 'high');   break;
    case 'medium':    tasks = tasks.filter(t => t.priority === 'medium'); break;
    case 'low':       tasks = tasks.filter(t => t.priority === 'low');    break;
    case 'overdue':   tasks = tasks.filter(t => isOverdue(t));            break;
  }

  // Category filter
  if (state.categoryFilter && state.categoryFilter !== 'all') {
    tasks = tasks.filter(t => t.categoryId === state.categoryFilter);
  }

  // Sort
  tasks = sortTasks(tasks, state.currentSort);

  return tasks;
}

function sortTasks(tasks, sortBy) {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'created-desc': return b.createdAt - a.createdAt;
      case 'created-asc':  return a.createdAt - b.createdAt;
      case 'due-asc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.d

## Ошибка max_tokens пересоздайте чат
