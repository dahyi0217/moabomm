/* ==========================================================================
   Moabom (모아봄) — Interactive Web Application Controller
   ========================================================================== */

(() => {
  const STORAGE_KEYS = {
    REFS: 'moabom_refs_v1',
    LOGS: 'moabom_logs_v1',
    API_KEY: 'moabom_gemini_key',
    CUSTOM_TOPICS: 'moabom_custom_topics_v1',
  };

  const state = {
    references: [],
    customTopics: [],
    logs: {
      searchCount: 0,
      events: [],
    },
    filters: {
      query: '',
      topic: 'all',
      status: 'all',
      categories: {
        색감: '',
        구성: '',
        분위기: '',
        매체: '',
      },
    },
    compareIds: [],
    activeLightboxId: null,
    pendingFiles: [], // { file, dataUrl, width, height, canvas }
    analyzedDrafts: [],
    lastLoggedQuery: '',
    searchDebounceTimer: null,
  };

  /* ------------------------------------------------------------------------
     DOM References
     ------------------------------------------------------------------------ */
  const els = {
    brandHomeBtn: document.getElementById('brandHomeBtn'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    submitSearchBtn: document.getElementById('submitSearchBtn'),
    openAddModalBtn: document.getElementById('openAddModalBtn'),

    // Custom dropdown — topic
    topicDropdownTrigger: document.getElementById('topicDropdownTrigger'),
    topicDropdownMenu: document.getElementById('topicDropdownMenu'),
    topicDropdownLabel: document.getElementById('topicDropdownLabel'),
    newTopicInput: document.getElementById('newTopicInput'),
    addTopicBtn: document.getElementById('addTopicBtn'),

    // Custom dropdowns — categories
    catDropdowns: document.querySelectorAll('.cat-dropdown'),

    galleryCount: document.getElementById('galleryCount'),
    statusPills: document.querySelectorAll('[data-status-filter]'),
    resetFiltersBtn: document.getElementById('resetFiltersBtn'),
    quickQueryChips: document.querySelectorAll('[data-quick-query]'),

    masonryGrid: document.getElementById('masonryGrid'),
    emptyState: document.getElementById('emptyState'),
    emptyResetBtn: document.getElementById('emptyResetBtn'),

    compareDock: document.getElementById('compareDock'),
    compareDockThumbs: document.getElementById('compareDockThumbs'),
    compareDockInfo: document.getElementById('compareDockInfo'),
    clearCompareBtn: document.getElementById('clearCompareBtn'),
    openCompareModalBtn: document.getElementById('openCompareModalBtn'),

    statTotalRefs: document.getElementById('statTotalRefs'),
    statVerifiedRate: document.getElementById('statVerifiedRate'),
    statSearchCount: document.getElementById('statSearchCount'),
    openLogsModalBtn: document.getElementById('openLogsModalBtn'),

    // Lightbox
    lightboxModal: document.getElementById('lightboxModal'),
    lightboxImg: document.getElementById('lightboxImg'),
    lightboxFilename: document.getElementById('lightboxFilename'),
    lightboxSource: document.getElementById('lightboxSource'),
    lightboxPrevBtn: document.getElementById('lightboxPrevBtn'),
    lightboxNextBtn: document.getElementById('lightboxNextBtn'),
    lightboxStatusBtn: document.getElementById('lightboxStatusBtn'),
    lightboxStatusText: document.getElementById('lightboxStatusText'),
    lightboxCompareBtn: document.getElementById('lightboxCompareBtn'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxTopic: document.getElementById('lightboxTopic'),
    lightboxDescView: document.getElementById('lightboxDescView'),
    lightboxDescEditWrap: document.getElementById('lightboxDescEditWrap'),
    lightboxDescTextarea: document.getElementById('lightboxDescTextarea'),
    editDescTriggerBtn: document.getElementById('editDescTriggerBtn'),
    saveDescBtn: document.getElementById('saveDescBtn'),
    cancelDescBtn: document.getElementById('cancelDescBtn'),
    lightboxTagEditor: document.getElementById('lightboxTagEditor'),
    lightboxPickBtn: document.getElementById('lightboxPickBtn'),
    lightboxDeleteBtn: document.getElementById('lightboxDeleteBtn'),

    // Add Modal
    addModal: document.getElementById('addModal'),
    uploadDropzone: document.getElementById('uploadDropzone'),
    fileInput: document.getElementById('fileInput'),
    uploadPreviewStrip: document.getElementById('uploadPreviewStrip'),
    projectTopicInput: document.getElementById('projectTopicInput'),
    topicSuggestions: document.getElementById('topicSuggestions'),
    geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
    saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
    pipelineSteps: document.getElementById('pipelineSteps'),
    generatedOutputList: document.getElementById('generatedOutputList'),
    runAnalyzeBtn: document.getElementById('runAnalyzeBtn'),
    commitAnalyzedBtn: document.getElementById('commitAnalyzedBtn'),

    // Compare Modal
    compareModal: document.getElementById('compareModal'),
    compareSharedBar: document.getElementById('compareSharedBar'),
    compareGrid: document.getElementById('compareGrid'),

    // Logs Modal
    logsModal: document.getElementById('logsModal'),
    logsTableBody: document.getElementById('logsTableBody'),
    logSummaryBadge: document.getElementById('logSummaryBadge'),
    resetSampleDataBtn: document.getElementById('resetSampleDataBtn'),
    exportJsonBtn: document.getElementById('exportJsonBtn'),

    toastBanner: document.getElementById('toastBanner'),
  };

  /* ------------------------------------------------------------------------
     Storage & Telemetry Helpers
     ------------------------------------------------------------------------ */
  function loadState() {
    try {
      const savedRefs = localStorage.getItem(STORAGE_KEYS.REFS);
      if (savedRefs) {
        const parsed = JSON.parse(savedRefs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          state.references = parsed;
        } else {
          state.references = structuredClone(INITIAL_REFERENCES);
        }
      } else {
        state.references = structuredClone(INITIAL_REFERENCES);
        saveReferences();
      }
    } catch {
      state.references = structuredClone(INITIAL_REFERENCES);
    }

    try {
      const savedTopics = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOPICS);
      if (savedTopics) {
        const parsedTopics = JSON.parse(savedTopics);
        state.customTopics = Array.isArray(parsedTopics) ? parsedTopics.filter(Boolean) : [];
      } else {
        state.customTopics = [];
      }
    } catch {
      state.customTopics = [];
    }

    try {
      const savedLogs = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        state.logs = {
          searchCount: Number(parsed.searchCount) || 0,
          events: Array.isArray(parsed.events) ? parsed.events : [],
        };
      } else {
        state.logs = {
          searchCount: 0,
          events: [
            {
              time: formatTime(new Date()),
              type: '시스템 초기화',
              detail: '초기 디자인 레퍼런스 10종 로드 완료',
              result: '10건',
            },
          ],
        };
        saveLogs();
      }
    } catch {
      state.logs = { searchCount: 0, events: [] };
    }

    const savedKey = localStorage.getItem(STORAGE_KEYS.API_KEY) || '';
    if (els.geminiApiKeyInput) els.geminiApiKeyInput.value = savedKey;
  }

  function saveReferences() {
    try {
      localStorage.setItem(STORAGE_KEYS.REFS, JSON.stringify(state.references));
    } catch {
      showToast('브라우저 저장 용량 한도에 가까워 일부 이미지 저장에 실패했습니다.');
    }
  }

  function saveCustomTopics() {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(state.customTopics || []));
    } catch {
      // ignore storage quota errors
    }
  }

  function saveLogs() {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(state.logs));
    } catch {
      // ignore storage quota errors on logs
    }
  }

  function addLogEvent(type, detail, result) {
    state.logs.events.unshift({
      time: formatTime(new Date()),
      type,
      detail,
      result,
    });
    if (state.logs.events.length > 50) {
      state.logs.events = state.logs.events.slice(0, 50);
    }
    saveLogs();
    renderFooterStats();
  }

  function formatTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`; }  let toastTimer = null; function showToast(msg) { els.toastBanner.textContent = msg; els.toastBanner.classList.add('is-visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => { els.toastBanner.classList.remove('is-visible'); }, 2600); }  function escapeHtml(str) { return String(str) .replace(/&/g, '&amp;') .replace(/</g, '&lt;') .replace(/>/g, '&gt;') .replace(/"/g, '&quot;') .replace(/'/g, '&#39;'); }  /* ------------------------------------------------------------------------ Filtering & Search Logic ------------------------------------------------------------------------ */ function getFilteredReferences() { const { query, topic, status, categories } = state.filters;  const scored = []; for (const ref of state.references) { if (topic !== 'all' && ref.projectTopic !== topic) continue; if (status !== 'all' && ref.status !== status) continue;  let catMatch = true; for (const cat of TAG_CATEGORIES) { const selectedTag = categories[cat]; if (selectedTag && !(ref.tags[cat] \vert{}\vert{} []).includes(selectedTag)) { catMatch = false; break; } } if (!catMatch) continue;  const score = query.trim() ? scoreReferenceMatch(ref, query) : 1; if (score <= 0) continue;  scored.push({ ref, score }); }  if (query.trim()) { scored.sort((a, b) => b.score - a.score); }  return scored.map((item) => item.ref); }  function hasActiveFilters() { const { query, topic, status, categories } = state.filters; if (query.trim() \vert{}\vert{} topic !== 'all' \vert{}\vert{} status !== 'all') return true; return Object.values(categories).some(Boolean); }  function recordSearchSession(queryText, count) { const clean = queryText.trim(); if (!clean) return; if (state.lastLoggedQuery === clean) return; state.lastLoggedQuery = clean; state.logs.searchCount += 1; addLogEvent('자연어·키워드 검색', `"${clean}"`, `${count}건 일치`); }  function resetAllFilters() { state.filters.query = ''; state.filters.topic = 'all'; state.filters.status = 'all'; TAG_CATEGORIES.forEach((cat) => { state.filters.categories[cat] = ''; }); state.lastLoggedQuery = '';  els.searchInput.value = ''; els.clearSearchBtn.classList.remove('is-visible'); setTopicDropdownValue('all'); els.statusPills.forEach((btn) => { btn.classList.toggle('is-active', btn.dataset.statusFilter === 'all'); }); TAG_CATEGORIES.forEach((cat) => setCatDropdownValue(cat, '')); syncQuickQueryChips(); renderGallery(); }  /* ------------------------------------------------------------------------ Custom Dropdown Manager ------------------------------------------------------------------------ */ let openDropdownTrigger = null;  function closeAllDropdowns() { document.querySelectorAll('.custom-dropdown__menu:not([hidden])').forEach((menu) => { menu.hidden = true; }); document.querySelectorAll('.custom-dropdown__trigger[aria-expanded="true"]').forEach((btn) => { btn.setAttribute('aria-expanded', 'false'); }); openDropdownTrigger = null; }  function toggleDropdown(trigger, menu) { const isOpen = !menu.hidden; closeAllDropdowns(); if (!isOpen) { menu.hidden = false; trigger.setAttribute('aria-expanded', 'true'); openDropdownTrigger = trigger; } }  function setTopicDropdownValue(value) { state.filters.topic = value; const label = value === 'all' ? '프로젝트 주제: 전체' : value; els.topicDropdownLabel.textContent = label; const isFiltered = value !== 'all'; els.topicDropdownTrigger.classList.toggle('has-value', isFiltered); }  function setCatDropdownValue(cat, value) { state.filters.categories[cat] = value; const container = document.getElementById(`catDropdown_${cat}`);
    if (!container) return;
    const trigger = container.querySelector('.custom-dropdown__trigger');
    const labelEl = container.querySelector('.cat-dropdown-label');
    if (labelEl) labelEl.textContent = value ? `${cat}:${value}` : `${cat}: 전체`; if (trigger) trigger.classList.toggle('has-value', Boolean(value)); container.querySelectorAll('.custom-dropdown__item').forEach((item) => { item.classList.toggle('is-selected', item.dataset.catValue === value \vert{}\vert{} (value === '' && item.dataset.catValue === '')); }); }  /* ------------------------------------------------------------------------ Populate Dynamic Filter Dropdowns (Custom) ------------------------------------------------------------------------ */ function populateFilterOptions() { const currentTopic = state.filters.topic; const refTopics = Array.from(new Set(state.references.map((r) => r.projectTopic).filter(Boolean))); const customTopics = (state.customTopics \vert{}\vert{} []).filter((t) => !refTopics.includes(t)); const topics = [...refTopics, ...customTopics];  const menu = els.topicDropdownMenu; menu.querySelectorAll('[data-topic-value]:not([data-topic-value="all"])').forEach((el) => el.remove());  const allItem = menu.querySelector('[data-topic-value="all"]'); topics.forEach((topic) => { const item = document.createElement('div'); item.className = 'custom-dropdown__item'; item.role = 'option'; item.dataset.topicValue = topic; item.textContent = topic; if (topic === currentTopic) item.classList.add('is-selected'); allItem.after(item); });  allItem.classList.toggle('is-selected', currentTopic === 'all'); setTopicDropdownValue(currentTopic);  TAG_CATEGORIES.forEach((cat) => { const container = document.getElementById(`catDropdown_${cat}`);
      if (!container) return;
      const catMenu = container.querySelector('.custom-dropdown__menu');
      const prevVal = state.filters.categories[cat];

      const tagSet = new Set();
      state.references.forEach((ref) => {
        (ref.tags[cat] || []).forEach((t) => tagSet.add(t));
      });
      const tags = Array.from(tagSet).sort();

      catMenu.innerHTML = '';

      const allOpt = document.createElement('div');
      allOpt.className = 'custom-dropdown__item' + (prevVal === '' ? ' is-selected' : '');
      allOpt.role = 'option';
      allOpt.dataset.catValue = '';
      allOpt.dataset.cat = cat;
      allOpt.textContent = `${cat}: 전체`; catMenu.appendChild(allOpt);  tags.forEach((tag) => { const item = document.createElement('div'); item.className = 'custom-dropdown__item' + (tag === prevVal ? ' is-selected' : ''); item.role = 'option'; item.dataset.catValue = tag; item.dataset.cat = cat; item.textContent = tag; catMenu.appendChild(item); }); }); }  function syncQuickQueryChips() { const q = state.filters.query.trim(); els.quickQueryChips.forEach((chip) => { chip.classList.toggle('is-active', chip.dataset.quickQuery === q); }); }  /* ------------------------------------------------------------------------ Render Masonry Gallery ------------------------------------------------------------------------ */ function renderGallery() { const filtered = getFilteredReferences(); const total = state.references.length;  els.galleryCount.innerHTML = hasActiveFilters() ? `검색 결과 <strong>${filtered.length}</strong>건 <span style="color:var(--color-ink-subtle);">(전체 ${total}건)</span>`
      : `총 <strong>${total}</strong>개의 레퍼런스`;  els.resetFiltersBtn.hidden = !hasActiveFilters();  if (filtered.length === 0) { els.masonryGrid.innerHTML = ''; els.emptyState.hidden = false; renderFooterStats(); return; }  els.emptyState.hidden = true; const fragment = document.createDocumentFragment();  filtered.forEach((ref) => { const card = document.createElement('article'); card.className = 'ref-card'; const isSelected = state.compareIds.includes(ref.id); if (isSelected) card.classList.add('is-selected'); card.dataset.id = ref.id; card.tabIndex = 0; card.setAttribute('aria-label', `${ref.title} — 상세 보기`);

      const allTags = TAG_CATEGORIES.flatMap((cat) => ref.tags[cat] || []);
      const isVerified = ref.status === 'verified';

      card.innerHTML = `
        <img class="ref-card__img" src="${escapeHtml(ref.image)}" alt="${escapeHtml(ref.title)}" loading="lazy" />
        ${
          isSelected
            ? '<span class="ref-card__pinned-compare" aria-hidden="true">✓ 비교 선택</span>'
            : ''
        }
        <div class="ref-card__overlay">
          <div class="ref-card__top-bar">
            <span class="ref-card__status-dot ${isVerified ? 'ref-card__status-dot--verified' : 'ref-card__status-dot--draft'}">
              ${isVerified ? '● 검토 완료' : '○ AI 초안'}
            </span>
            <button
              type="button"
              class="compare-check-btn ${isSelected ? 'is-checked' : ''}"
              data-compare-toggle="${escapeHtml(ref.id)}"
              aria-pressed="${isSelected}"
            >
              ${isSelected ? '✓ 비교 담김' : '☐ 비교 담기'}
            </button>
          </div>
          <div class="ref-card__bottom">
            <span class="ref-card__topic">${escapeHtml(ref.projectTopic)}</span>
            <p class="ref