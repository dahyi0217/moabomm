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
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  let toastTimer = null;
  function showToast(msg) {
    els.toastBanner.textContent = msg;
    els.toastBanner.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toastBanner.classList.remove('is-visible');
    }, 2600);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ------------------------------------------------------------------------
     Filtering & Search Logic
     ------------------------------------------------------------------------ */
  function getFilteredReferences() {
    const { query, topic, status, categories } = state.filters;

    const scored = [];
    for (const ref of state.references) {
      if (topic !== 'all' && ref.projectTopic !== topic) continue;
      if (status !== 'all' && ref.status !== status) continue;

      let catMatch = true;
      for (const cat of TAG_CATEGORIES) {
        const selectedTag = categories[cat];
        if (selectedTag && !(ref.tags[cat] || []).includes(selectedTag)) {
          catMatch = false;
          break;
        }
      }
      if (!catMatch) continue;

      const score = query.trim() ? scoreReferenceMatch(ref, query) : 1;
      if (score <= 0) continue;

      scored.push({ ref, score });
    }

    if (query.trim()) {
      scored.sort((a, b) => b.score - a.score);
    }

    return scored.map((item) => item.ref);
  }

  function hasActiveFilters() {
    const { query, topic, status, categories } = state.filters;
    if (query.trim() || topic !== 'all' || status !== 'all') return true;
    return Object.values(categories).some(Boolean);
  }

  function recordSearchSession(queryText, count) {
    const clean = queryText.trim();
    if (!clean) return;
    if (state.lastLoggedQuery === clean) return;
    state.lastLoggedQuery = clean;
    state.logs.searchCount += 1;
    addLogEvent('자연어·키워드 검색', `"${clean}"`, `${count}건 일치`);
  }

  function resetAllFilters() {
    state.filters.query = '';
    state.filters.topic = 'all';
    state.filters.status = 'all';
    TAG_CATEGORIES.forEach((cat) => {
      state.filters.categories[cat] = '';
    });
    state.lastLoggedQuery = '';

    els.searchInput.value = '';
    els.clearSearchBtn.classList.remove('is-visible');
    setTopicDropdownValue('all');
    els.statusPills.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.statusFilter === 'all');
    });
    TAG_CATEGORIES.forEach((cat) => setCatDropdownValue(cat, ''));
    syncQuickQueryChips();
    renderGallery();
  }

  /* ------------------------------------------------------------------------
     Custom Dropdown Manager
     ------------------------------------------------------------------------ */
  let openDropdownTrigger = null;

  function closeAllDropdowns() {
    document.querySelectorAll('.custom-dropdown__menu:not([hidden])').forEach((menu) => {
      menu.hidden = true;
    });
    document.querySelectorAll('.custom-dropdown__trigger[aria-expanded="true"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
    });
    openDropdownTrigger = null;
  }

  function toggleDropdown(trigger, menu) {
    const isOpen = !menu.hidden;
    closeAllDropdowns();
    if (!isOpen) {
      menu.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      openDropdownTrigger = trigger;
    }
  }

  function setTopicDropdownValue(value) {
    state.filters.topic = value;
    const label = value === 'all' ? '프로젝트 주제: 전체' : value;
    els.topicDropdownLabel.textContent = label;
    const isFiltered = value !== 'all';
    els.topicDropdownTrigger.classList.toggle('has-value', isFiltered);
  }

  function setCatDropdownValue(cat, value) {
    state.filters.categories[cat] = value;
    const container = document.getElementById(`catDropdown_${cat}`);
    if (!container) return;
    const trigger = container.querySelector('.custom-dropdown__trigger');
    const labelEl = container.querySelector('.cat-dropdown-label');
    if (labelEl) labelEl.textContent = value ? `${cat}: ${value}` : `${cat}: 전체`;
    if (trigger) trigger.classList.toggle('has-value', Boolean(value));
    container.querySelectorAll('.custom-dropdown__item').forEach((item) => {
      item.classList.toggle('is-selected', item.dataset.catValue === value || (value === '' && item.dataset.catValue === ''));
    });
  }

  /* ------------------------------------------------------------------------
     Populate Dynamic Filter Dropdowns (Custom)
     ------------------------------------------------------------------------ */
  function populateFilterOptions() {
    const currentTopic = state.filters.topic;
    const refTopics = Array.from(new Set(state.references.map((r) => r.projectTopic).filter(Boolean)));
    const customTopics = (state.customTopics || []).filter((t) => !refTopics.includes(t));
    const topics = [...refTopics, ...customTopics];

    const menu = els.topicDropdownMenu;
    menu.querySelectorAll('[data-topic-value]:not([data-topic-value="all"])').forEach((el) => el.remove());

    const allItem = menu.querySelector('[data-topic-value="all"]');
    topics.forEach((topic) => {
      const item = document.createElement('div');
      item.className = 'custom-dropdown__item';
      item.role = 'option';
      item.dataset.topicValue = topic;
      item.textContent = topic;
      if (topic === currentTopic) item.classList.add('is-selected');
      allItem.after(item);
    });

    allItem.classList.toggle('is-selected', currentTopic === 'all');
    setTopicDropdownValue(currentTopic);

    TAG_CATEGORIES.forEach((cat) => {
      const container = document.getElementById(`catDropdown_${cat}`);
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
      allOpt.textContent = `${cat}: 전체`;
      catMenu.appendChild(allOpt);

      tags.forEach((tag) => {
        const item = document.createElement('div');
        item.className = 'custom-dropdown__item' + (tag === prevVal ? ' is-selected' : '');
        item.role = 'option';
        item.dataset.catValue = tag;
        item.dataset.cat = cat;
        item.textContent = tag;
        catMenu.appendChild(item);
      });
    });
  }

  function syncQuickQueryChips() {
    const q = state.filters.query.trim();
    els.quickQueryChips.forEach((chip) => {
      chip.classList.toggle('is-active', chip.dataset.quickQuery === q);
    });
  }

  /* ------------------------------------------------------------------------
     Render Masonry Gallery
     ------------------------------------------------------------------------ */
  function renderGallery() {
    const filtered = getFilteredReferences();
    const total = state.references.length;

    els.galleryCount.innerHTML = hasActiveFilters()
      ? `검색 결과 <strong>${filtered.length}</strong>건 <span style="color:var(--color-ink-subtle);">(전체 ${total}건)</span>`
      : `총 <strong>${total}</strong>개의 레퍼런스`;

    els.resetFiltersBtn.hidden = !hasActiveFilters();

    if (filtered.length === 0) {
      els.masonryGrid.innerHTML = '';
      els.emptyState.hidden = false;
      renderFooterStats();
      return;
    }

    els.emptyState.hidden = true;
    const fragment = document.createDocumentFragment();

    filtered.forEach((ref) => {
      const card = document.createElement('article');
      card.className = 'ref-card';
      const isSelected = state.compareIds.includes(ref.id);
      if (isSelected) card.classList.add('is-selected');
      card.dataset.id = ref.id;
      card.tabIndex = 0;
      card.setAttribute('aria-label', `${ref.title} — 상세 보기`);

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
            <p class="ref-card__desc">${escapeHtml(ref.description)}</p>
            <div class="ref-card__tags">
              ${allTags.map((tag) => `<span class="hover-tag-chip">${escapeHtml(tag)}</span>`).join('')}
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        const compareBtn = e.target.closest('[data-compare-toggle]');
        if (compareBtn) {
          e.stopPropagation();
          toggleCompare(ref.id);
          return;
        }
        openLightbox(ref.id);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(ref.id);
        }
      });

      fragment.appendChild(card);
    });

    els.masonryGrid.innerHTML = '';
    els.masonryGrid.appendChild(fragment);
    renderCompareDock();
    renderFooterStats();
  }

  /* ------------------------------------------------------------------------
     Compare Selection & Compare Modal
     ------------------------------------------------------------------------ */
  function toggleCompare(id) {
    const idx = state.compareIds.indexOf(id);
    if (idx >= 0) {
      state.compareIds.splice(idx, 1);
    } else {
      if (state.compareIds.length >= 4) {
        showToast('후보 비교는 최대 4개까지 선택할 수 있습니다.');
        return;
      }
      state.compareIds.push(id);
    }
    renderGallery();
    if (state.activeLightboxId === id) {
      updateLightboxCompareButton();
    }
  }

  function renderCompareDock() {
    const selectedRefs = state.compareIds
      .map((id) => state.references.find((r) => r.id === id))
      .filter(Boolean);

    if (selectedRefs.length === 0) {
      els.compareDock.classList.remove('is-visible');
      return;
    }

    els.compareDock.classList.add('is-visible');
    els.compareDockThumbs.innerHTML = selectedRefs
      .map((r) => `<img class="compare-dock__thumb" src="${escapeHtml(r.image)}" alt="${escapeHtml(r.title)}" />`)
      .join('');

    const hint =
      selectedRefs.length < 2
        ? '<span>1개 더 선택하면 나란히 비교할 수 있습니다</span>'
        : '<span>나란히 비교 준비 완료</span>';
    els.compareDockInfo.innerHTML = `<strong>${selectedRefs.length}</strong> / 4 선택됨 ${hint}`;
    els.openCompareModalBtn.disabled = selectedRefs.length < 2;
  }

  function openCompareModal() {
    const selectedRefs = state.compareIds
      .map((id) => state.references.find((r) => r.id === id))
      .filter(Boolean);

    if (selectedRefs.length < 2) {
      showToast('2개 이상의 레퍼런스를 선택해 주세요.');
      return;
    }

    const tagFreq = new Map();
    selectedRefs.forEach((ref) => {
      const uniqueInRef = new Set(TAG_CATEGORIES.flatMap((c) => ref.tags[c] || []));
      uniqueInRef.forEach((tag) => {
        tagFreq.set(tag, (tagFreq.get(tag) || 0) + 1);
      });
    });
    const sharedTags = Array.from(tagFreq.entries())
      .filter(([, count]) => count >= 2)
      .map(([tag]) => tag);

    els.compareSharedBar.innerHTML = sharedTags.length
      ? `<strong>공통 교집합 태그:</strong> ${sharedTags
          .map((t) => `<span class="compare-tag is-shared">${escapeHtml(t)}</span>`)
          .join('')}`
      : '<strong>공통 교집합 태그:</strong> <span style="color:var(--color-ink-muted);">선택된 후보 간 직접 일치하는 태그가 없어 서로 다른 스타일 대조 중입니다.</span>';

    els.compareGrid.style.gridTemplateColumns = `repeat(${selectedRefs.length}, minmax(0, 1fr))`;
    els.compareGrid.innerHTML = selectedRefs
      .map((ref) => {
        const isVerified = ref.status === 'verified';
        return `
          <div class="compare-col ${ref.picked ? 'is-picked' : ''}">
            <div class="compare-col__media">
              <img src="${escapeHtml(ref.image)}" alt="${escapeHtml(ref.title)}" />
            </div>
            <div class="compare-col__body">
              <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                <span class="compare-col__topic">${escapeHtml(ref.projectTopic)}</span>
                <span class="ref-card__status-dot ${isVerified ? 'ref-card__status-dot--verified' : 'ref-card__status-dot--draft'}" style="font-size:0.68rem;">
                  ${isVerified ? '검토 완료' : 'AI 초안'}
                </span>
              </div>
              <h3 class="compare-col__title">${escapeHtml(ref.title)}</h3>
              <p class="compare-col__desc">${escapeHtml(ref.description)}</p>
              ${TAG_CATEGORIES.map((cat) => {
                const tags = ref.tags[cat] || [];
                return `
                  <div class="compare-cat-row">
                    <div class="compare-cat-row__label">${cat}</div>
                    <div>
                      ${
                        tags.length
                          ? tags
                              .map((t) => {
                                const isShared = sharedTags.includes(t);
                                return `<span class="compare-tag ${isShared ? 'is-shared' : ''}">${escapeHtml(t)}</span>`;
                              })
                              .join('')
                          : '<span style="font-size:0.72rem; color:var(--color-ink-subtle);">없음</span>'
                      }
                    </div>
                  </div>
                `;
              }).join('')}
              <div class="compare-col__actions">
                <button type="button" class="${ref.picked ? 'btn-primary' : 'btn-outline'}" style="height:32px; font-size:0.76rem;" data-compare-pick="${escapeHtml(ref.id)}">
                  ${ref.picked ? '★ 최종 선별됨' : '☆ 최종 선별'}
                </button>
                <div style="display:flex; gap:4px;">
                  <button type="button" class="btn-ghost" style="font-size:0.75rem;" data-compare-inspect="${escapeHtml(ref.id)}">상세</button>
                  <button type="button" class="btn-ghost" style="font-size:0.75rem;" data-compare-remove="${escapeHtml(ref.id)}">제외</button>
                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join('');

    openModal(els.compareModal);
    addLogEvent('후보 비교 보드', `${selectedRefs.length}건 나란히 비교`, sharedTags.length ? `공통 태그 ${sharedTags.length}개` : '대조 비교');
  }

  /* ------------------------------------------------------------------------
     Detail Lightbox & Human-in-the-loop Review Editor
     ------------------------------------------------------------------------ */
  function openLightbox(id) {
    const ref = state.references.find((r) => r.id === id);
    if (!ref) return;

    state.activeLightboxId = id;
    els.lightboxImg.src = ref.image;
    els.lightboxImg.alt = ref.title;
    els.lightboxFilename.textContent = ref.filename || ref.id;
    els.lightboxSource.textContent = ref.source || '모아봄 아카이브';
    els.lightboxTitle.textContent = ref.title;
    els.lightboxTopic.textContent = ref.projectTopic;

    els.lightboxDescView.textContent = ref.description;
    els.lightboxDescView.hidden = false;
    els.lightboxDescEditWrap.hidden = true;

    updateLightboxStatusButton(ref);
    updateLightboxCompareButton();
    updateLightboxPickButton(ref);
    renderLightboxTagEditor(ref);

    openModal(els.lightboxModal);
  }

  function updateLightboxStatusButton(ref) {
    const isVerified = ref.status === 'verified';
    els.lightboxStatusBtn.className = `status-toggle-btn ${
      isVerified ? 'status-toggle-btn--verified' : 'status-toggle-btn--draft'
    }`;
    els.lightboxStatusText.textContent = isVerified ? '검토 완료' : 'AI 초안 (검수 필요)';
  }

  function updateLightboxCompareButton() {
    const inCompare = state.compareIds.includes(state.activeLightboxId);
    els.lightboxCompareBtn.textContent = inCompare ? '✓ 비교 담김' : '+ 비교 담기';
    els.lightboxCompareBtn.style.backgroundColor = inCompare ? 'var(--color-mahogany)' : 'transparent';
    els.lightboxCompareBtn.style.color = inCompare ? '#FFFFFF' : 'var(--color-deep-brown)';
  }

  function updateLightboxPickButton(ref) {
    els.lightboxPickBtn.textContent = ref.picked ? '★ 최종 선별됨' : '☆ 최종 선별';
    els.lightboxPickBtn.style.backgroundColor = ref.picked ? 'var(--color-mahogany)' : 'transparent';
    els.lightboxPickBtn.style.color = ref.picked ? '#FFFFFF' : 'var(--color-deep-brown)';
  }

  function renderLightboxTagEditor(ref) {
    els.lightboxTagEditor.innerHTML = TAG_CATEGORIES.map((cat) => {
      const tags = ref.tags[cat] || [];
      return `
        <div class="tag-category-block">
          <div class="tag-category-header">
            <span class="tag-category-name">${cat}</span>
            <span style="font-size:0.7rem; color:var(--color-ink-subtle);">${tags.length}개</span>
          </div>
          <div class="tag-chips-wrap">
            ${tags
              .map(
                (tag) => `
                  <span class="editable-tag">
                    <span>${escapeHtml(tag)}</span>
                    <button
                      type="button"
                      class="editable-tag__remove"
                      data-remove-tag="${escapeHtml(tag)}"
                      data-tag-cat="${cat}"
                      aria-label="${escapeHtml(tag)} 태그 삭제"
                    >×</button>
                  </span>
                `
              )
              .join('')}
            <span class="tag-add-inline">
              <input
                type="text"
                class="tag-add-input"
                data-add-input-cat="${cat}"
                placeholder="+ ${cat} 태그"
                aria-label="${cat} 태그 추가 입력"
              />
              <button
                type="button"
                class="tag-add-btn"
                data-add-btn-cat="${cat}"
                aria-label="${cat} 태그 추가"
              >+</button>
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  function navigateLightbox(delta) {
    const filtered = getFilteredReferences();
    if (!filtered.length) return;
    const idx = filtered.findIndex((r) => r.id === state.activeLightboxId);
    const nextIdx = idx === -1 ? 0 : (idx + delta + filtered.length) % filtered.length;
    openLightbox(filtered[nextIdx].id);
  }

  function addTagToActiveRef(cat, rawVal) {
    const ref = state.references.find((r) => r.id === state.activeLightboxId);
    if (!ref) return;
    let clean = rawVal.trim().replace(/\s+/g, '');
    if (!clean) return;
    if (!clean.startsWith('#')) clean = `#${clean}`;

    ref.tags[cat] = ref.tags[cat] || [];
    if (ref.tags[cat].includes(clean)) {
      showToast(`이미 등록된 태그입니다: ${clean}`);
      return;
    }
    ref.tags[cat].push(clean);
    saveReferences();
    populateFilterOptions();
    renderLightboxTagEditor(ref);
    renderGallery();
    addLogEvent('태그 교정 (추가)', `${ref.title} · ${cat} ${clean}`, '저장 완료');
    showToast(`${cat} 태그 ${clean} 추가됨`);
  }

  /* ------------------------------------------------------------------------
     Add Reference Modal (Input -> Prompt -> Output)
     ------------------------------------------------------------------------ */
  function openAddModal() {
    state.pendingFiles = [];
    state.analyzedDrafts = [];
    els.uploadPreviewStrip.innerHTML = '';
    els.uploadPreviewStrip.hidden = true;
    els.pipelineSteps.hidden = true;
    els.generatedOutputList.innerHTML = '';
    els.generatedOutputList.hidden = true;
    els.runAnalyzeBtn.hidden = false;
    els.runAnalyzeBtn.disabled = true;
    els.commitAnalyzedBtn.hidden = true;
    els.fileInput.value = '';

    const topics = Array.from(new Set([...state.references.map((r) => r.projectTopic), ...(state.customTopics || [])])).slice(0, 6);
    els.topicSuggestions.innerHTML = topics
      .map(
        (t) =>
          `<button type="button" class="query-chip" data-suggest-topic="${escapeHtml(t)}">${escapeHtml(t)}</button>`
      )
      .join('');

    openModal(els.addModal);
  }

  async function handleIncomingFiles(fileList) {
    const files = Array.from(fileList).filter((f) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(f.type) ||
      /\.(jpe?g|png|webp)$/i.test(f.name)
    );
    if (!files.length) {
      showToast('JPG, PNG, WEBP 이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    for (const file of files) {
      try {
        const compressed = await readImageAsCompressedDataUrl(file);
        state.pendingFiles.push({
          file,
          dataUrl: compressed.dataUrl,
          width: compressed.width,
          height: compressed.height,
          canvas: compressed.canvas,
        });
      } catch (err) {
        showToast(`${file.name}: ${err.message}`);
      }
    }

    renderPendingThumbnails();
  }

  function renderPendingThumbnails() {
    if (!state.pendingFiles.length) {
      els.uploadPreviewStrip.hidden = true;
      els.uploadPreviewStrip.innerHTML = '';
      els.runAnalyzeBtn.disabled = true;
      return;
    }

    els.uploadPreviewStrip.hidden = false;
    els.runAnalyzeBtn.disabled = false;

    const countBadge = `<div style="grid-column:1/-1; display:flex; align-items:center; justify-content:space-between; padding:4px 2px 6px;">
      <span style="font-size:0.82rem; font-weight:600; color:var(--color-deep-brown);">
        ${state.pendingFiles.length}개의 이미지가 선택됨
      </span>
      <button type="button" id="addMoreImagesBtn" style="font-size:0.76rem; color:var(--color-mahogany); font-weight:600; background:none; border:none; text-decoration:underline; text-underline-offset:3px; cursor:pointer;">
        + 이미지 더 추가하기
      </button>
    </div>`;

    els.uploadPreviewStrip.innerHTML = countBadge + state.pendingFiles
      .map(
        (item, idx) => `
          <div class="upload-thumb-card">
            <img src="${item.dataUrl}" alt="${escapeHtml(item.file.name)}" />
            <button type="button" class="upload-thumb-remove" data-remove-pending="${idx}" aria-label="업로드 취소">×</button>
          </div>
        `
      )
      .join('');

    const addMoreBtn = document.getElementById('addMoreImagesBtn');
    if (addMoreBtn) {
      addMoreBtn.addEventListener('click', () => els.fileInput.click());
    }
  }

  function setPipelineStep(activeStep) {
    els.pipelineSteps.hidden = false;
    els.pipelineSteps.querySelectorAll('.pipeline-step').forEach((el) => {
      const stepNum = Number(el.dataset.step);
      el.classList.remove('is-active', 'is-done');
      if (stepNum < activeStep) el.classList.add('is-done');
      else if (stepNum === activeStep) el.classList.add('is-active');
    });
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function runAnalysisPipeline() {
    if (!state.pendingFiles.length) return;
    const projectTopic = els.projectTopicInput.value.trim() || '신규 디자인 레퍼런스 리서치';
    const apiKey = (localStorage.getItem(STORAGE_KEYS.API_KEY) || '').trim();

    els.runAnalyzeBtn.disabled = true;
    els.generatedOutputList.hidden = true;
    state.analyzedDrafts = [];

    setPipelineStep(1);
    await sleep(220);

    setPipelineStep(2);
    const results = [];

    for (const item of state.pendingFiles) {
      let analysis = null;
      if (apiKey) {
        try {
          analysis = await analyzeImageWithGemini(apiKey, item.dataUrl, projectTopic);
        } catch (err) {
          showToast(`Gemini API 전환 안내: ${err.message} → 로컬 스마트 분석으로 진행합니다.`);
        }
      }
      if (!analysis) {
        await sleep(260);
        analysis = analyzeImageLocally(item.file, item, projectTopic);
      }
      results.push({
        id: `ref_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        image: item.dataUrl,
        filename: item.file.name,
        title: analysis.title,
        projectTopic,
        description: analysis.description,
        tags: analysis.tags,
        status: 'draft',
        source: analysis.source,
        picked: false,
        createdAt: new Date().toISOString(),
      });
    }

    setPipelineStep(3);
    await sleep(220);

    setPipelineStep(4);
    state.analyzedDrafts = results;
    renderAnalyzedDrafts();
  }

  function renderAnalyzedDrafts() {
    els.generatedOutputList.hidden = false;
    els.runAnalyzeBtn.hidden = true;
    els.commitAnalyzedBtn.hidden = false;

    els.generatedOutputList.innerHTML = state.analyzedDrafts
      .map(
        (draft, idx) => `
          <div class="generated-item-card" data-draft-idx="${idx}">
            <img src="${draft.image}" alt="${escapeHtml(draft.title)}" />
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
                <input
                  type="text"
                  class="form-input"
                  style="height:32px; font-weight:600; font-size:0.85rem;"
                  data-draft-title="${idx}"
                  value="${escapeHtml(draft.title)}"
                />
                <span style="font-size:0.7rem; color:var(--color-deep-brown); white-space:nowrap;">${escapeHtml(draft.source)}</span>
              </div>
              <input
                type="text"
                class="form-input"
                style="height:34px; font-size:0.81rem;"
                data-draft-desc="${idx}"
                value="${escapeHtml(draft.description)}"
              />
              <div style="display:flex; flex-wrap:wrap; gap:6px; font-size:0.74rem;">
                ${TAG_CATEGORIES.map((cat) => {
                  const tags = (draft.tags[cat] || []).join(' ');
                  return `<span style="padding:3px 9px; border-radius:999px; background:var(--color-cream); border:1px solid var(--color-border);">
                    <strong>${cat}:</strong> ${escapeHtml(tags)}
                  </span>`;
                }).join('')}
              </div>
            </div>
          </div>
        `
      )
      .join('');
  }

  function commitAnalyzedDrafts() {
    if (!state.analyzedDrafts.length) return;

    state.analyzedDrafts.forEach((draft, idx) => {
      const titleInput = els.generatedOutputList.querySelector(`[data-draft-title="${idx}"]`);
      const descInput = els.generatedOutputList.querySelector(`[data-draft-desc="${idx}"]`);
      if (titleInput && titleInput.value.trim()) draft.title = titleInput.value.trim();
      if (descInput && descInput.value.trim()) draft.description = descInput.value.trim();
    });

    state.references = [...state.analyzedDrafts, ...state.references];
    saveReferences();
    populateFilterOptions();
    renderGallery();

    addLogEvent(
      'AI 레퍼런스 등록',
      `주제 "${state.analyzedDrafts[0].projectTopic}"`,
      `${state.analyzedDrafts.length}건 추가`
    );

    closeModal(els.addModal);
    showToast(`${state.analyzedDrafts.length}건의 레퍼런스가 보드에 저장되었습니다.`);
  }

  /* ------------------------------------------------------------------------
     Footer Stats & Logs Modal
     ------------------------------------------------------------------------ */
  function renderFooterStats() {
    const total = state.references.length;
    const verifiedCount = state.references.filter((r) => r.status === 'verified').length;
    const rate = total ? Math.round((verifiedCount / total) * 100) : 0;

    els.statTotalRefs.textContent = `${total}건`;
    els.statVerifiedRate.textContent = `${rate}% (${verifiedCount}/${total})`;
    els.statSearchCount.textContent = `${state.logs.searchCount}회`;
  }

  function openLogsModal() {
    const total = state.references.length;
    const verifiedCount = state.references.filter((r) => r.status === 'verified').length;
    els.logSummaryBadge.textContent = `누적 검색 ${state.logs.searchCount}회 · 검수 완료 ${verifiedCount}/${total}건`;

    els.logsTableBody.innerHTML = state.logs.events.length
      ? state.logs.events
          .map(
            (ev) => `
              <tr>
                <td style="white-space:nowrap; color:var(--color-ink-muted);">${escapeHtml(ev.time)}</td>
                <td><strong>${escapeHtml(ev.type)}</strong></td>
                <td>${escapeHtml(ev.detail)}</td>
                <td style="white-space:nowrap; color:var(--color-deep-brown); font-weight:600;">${escapeHtml(ev.result)}</td>
              </tr>
            `
          )
          .join('')
      : '<tr><td colspan="4" style="text-align:center; padding:20px; color:var(--color-ink-muted);">기록된 세션 로그가 없습니다.</td></tr>';

    openModal(els.logsModal);
  }

  /* ------------------------------------------------------------------------
     Modal Utilities
     ------------------------------------------------------------------------ */
  function openModal(modalEl) {
    modalEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalEl) {
    modalEl.classList.remove('is-open');
    if (modalEl === els.lightboxModal) {
      state.activeLightboxId = null;
    }
    const anyOpen = document.querySelector('.modal-backdrop.is-open');
    if (!anyOpen) {
      document.body.style.overflow = '';
    }
  }

  /* ------------------------------------------------------------------------
     Event Wiring
     ------------------------------------------------------------------------ */
  function bindEvents() {
    // Brand reset
    els.brandHomeBtn.addEventListener('click', resetAllFilters);
    els.resetFiltersBtn.addEventListener('click', resetAllFilters);
    els.emptyResetBtn.addEventListener('click', resetAllFilters);

    // Search Input (real-time + debounced session logging)
    els.searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      state.filters.query = val;
      els.clearSearchBtn.classList.toggle('is-visible', Boolean(val));
      syncQuickQueryChips();
      renderGallery();

      clearTimeout(state.searchDebounceTimer);
      if (val.trim()) {
        state.searchDebounceTimer = setTimeout(() => {
          recordSearchSession(val, getFilteredReferences().length);
        }, 1100);
      }
    });

    els.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        clearTimeout(state.searchDebounceTimer);
        recordSearchSession(els.searchInput.value, getFilteredReferences().length);
      }
    });

    els.submitSearchBtn.addEventListener('click', () => {
      clearTimeout(state.searchDebounceTimer);
      recordSearchSession(els.searchInput.value, getFilteredReferences().length);
    });

    els.clearSearchBtn.addEventListener('click', () => {
      state.filters.query = '';
      state.lastLoggedQuery = '';
      els.searchInput.value = '';
      els.clearSearchBtn.classList.remove('is-visible');
      syncQuickQueryChips();
      renderGallery();
      els.searchInput.focus();
    });

    // Quick query chips
    els.quickQueryChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.quickQuery;
        if (state.filters.query.trim() === q) {
          state.filters.query = '';
          els.searchInput.value = '';
          els.clearSearchBtn.classList.remove('is-visible');
        } else {
          state.filters.query = q;
          els.searchInput.value = q;
          els.clearSearchBtn.classList.add('is-visible');
        }
        syncQuickQueryChips();
        renderGallery();
        if (state.filters.query) {
          recordSearchSession(state.filters.query, getFilteredReferences().length);
        }
      });
    });

    // ---- Custom dropdown: Topic ----
    els.topicDropdownTrigger.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });

    els.topicDropdownTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleDropdown(els.topicDropdownTrigger, els.topicDropdownMenu);
    });

    // Keep dropdown open when interacting with menu, input, or add button
    ['pointerdown', 'mousedown', 'click'].forEach((evtName) => {
      els.topicDropdownMenu.addEventListener(evtName, (e) => {
        e.stopPropagation();
      });
    });

    els.newTopicInput.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    els.newTopicInput.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    els.newTopicInput.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    els.addTopicBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    els.addTopicBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    // Topic menu item clicks (delegated)
    els.topicDropdownMenu.addEventListener('click', (e) => {
      if (e.target.closest('.custom-dropdown__add-row')) return;
      const item = e.target.closest('[data-topic-value]');
      if (!item) return;
      const value = item.dataset.topicValue;
      if (value === undefined) return;

      setTopicDropdownValue(value);
      els.topicDropdownMenu.querySelectorAll('[data-topic-value]').forEach((el) => {
        el.classList.toggle('is-selected', el.dataset.topicValue === value);
      });
      closeAllDropdowns();
      renderGallery();
      if (value !== 'all') {
        addLogEvent('프로젝트 주제 필터', value, `${getFilteredReferences().length}건`);
      }
    });

    // "새 주제 추가" button
    els.addTopicBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const val = els.newTopicInput.value.trim();
      if (!val) {
        els.newTopicInput.focus();
        return;
      }
      const existing = Array.from(
        new Set([...state.references.map((r) => r.projectTopic).filter(Boolean), ...(state.customTopics || [])])
      );
      if (!existing.includes(val)) {
        state.customTopics = state.customTopics || [];
        state.customTopics.push(val);
        saveCustomTopics();
        populateFilterOptions();
      }
      setTopicDropdownValue(val);
      els.topicDropdownMenu.querySelectorAll('[data-topic-value]').forEach((el) => {
        el.classList.toggle('is-selected', el.dataset.topicValue === val);
      });
      els.newTopicInput.value = '';
      closeAllDropdowns();
      renderGallery();
      addLogEvent('프로젝트 주제 추가', `"${val}"`, '추가 완료');
      showToast(`프로젝트 주제 "${val}"가 추가되었습니다.`);
    });

    els.newTopicInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        els.addTopicBtn.click();
      }
    });

    // ---- Custom dropdowns: Category filters ----
    els.catDropdowns.forEach((container) => {
      const trigger = container.querySelector('.custom-dropdown__trigger');
      const menu = container.querySelector('.custom-dropdown__menu');
      const cat = container.dataset.category;

      trigger.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown(trigger, menu);
      });

      menu.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = e.target.closest('[data-cat-value]');
        if (!item) return;
        const value = item.dataset.catValue;
        setCatDropdownValue(cat, value);
        closeAllDropdowns();
        renderGallery();
      });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (e.target.closest('.custom-dropdown')) return;
      closeAllDropdowns();
    });

    // Status pills
    els.statusPills.forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filters.status = btn.dataset.statusFilter;
        els.statusPills.forEach((b) => b.classList.toggle('is-active', b === btn));
        renderGallery();
      });
    });

    // Compare Dock
    els.clearCompareBtn.addEventListener('click', () => {
      state.compareIds = [];
      renderGallery();
    });
    els.openCompareModalBtn.addEventListener('click', openCompareModal);

    // Compare Modal internal actions (delegated)
    els.compareGrid.addEventListener('click', (e) => {
      const pickBtn = e.target.closest('[data-compare-pick]');
      if (pickBtn) {
        const id = pickBtn.dataset.comparePick;
        const ref = state.references.find((r) => r.id === id);
        if (ref) {
          ref.picked = !ref.picked;
          saveReferences();
          openCompareModal();
          addLogEvent('최종 후보 선별', ref.title, ref.picked ? '선별됨' : '선별 해제');
        }
        return;
      }

      const inspectBtn = e.target.closest('[data-compare-inspect]');
      if (inspectBtn) {
        const id = inspectBtn.dataset.compareInspect;
        closeModal(els.compareModal);
        openLightbox(id);
        return;
      }

      const removeBtn = e.target.closest('[data-compare-remove]');
      if (removeBtn) {
        const id = removeBtn.dataset.compareRemove;
        state.compareIds = state.compareIds.filter((cid) => cid !== id);
        renderGallery();
        if (state.compareIds.length < 2) {
          closeModal(els.compareModal);
          showToast('비교 대상이 2개 미만이어서 비교 보드를 닫았습니다.');
        } else {
          openCompareModal();
        }
      }
    });

    // Lightbox actions
    els.lightboxPrevBtn.addEventListener('click', () => navigateLightbox(-1));
    els.lightboxNextBtn.addEventListener('click', () => navigateLightbox(1));

    els.lightboxStatusBtn.addEventListener('click', () => {
      const ref = state.references.find((r) => r.id === state.activeLightboxId);
      if (!ref) return;
      ref.status = ref.status === 'verified' ? 'draft' : 'verified';
      saveReferences();
      updateLightboxStatusButton(ref);
      renderGallery();
      addLogEvent('검수 상태 전환', ref.title, ref.status === 'verified' ? '검토 완료' : 'AI 초안');
      showToast(ref.status === 'verified' ? '검토 완료로 표시되었습니다.' : 'AI 초안 상태로 되돌렸습니다.');
    });

    els.lightboxCompareBtn.addEventListener('click', () => {
      if (state.activeLightboxId) toggleCompare(state.activeLightboxId);
    });

    els.lightboxPickBtn.addEventListener('click', () => {
      const ref = state.references.find((r) => r.id === state.activeLightboxId);
      if (!ref) return;
      ref.picked = !ref.picked;
      saveReferences();
      updateLightboxPickButton(ref);
      addLogEvent('최종 후보 선별', ref.title, ref.picked ? '선별됨' : '선별 해제');
    });

    els.lightboxDeleteBtn.addEventListener('click', () => {
      const ref = state.references.find((r) => r.id === state.activeLightboxId);
      if (!ref) return;
      if (!confirm(`"${ref.title}" 레퍼런스를 보드에서 삭제할까요?`)) return;
      state.references = state.references.filter((r) => r.id !== ref.id);
      state.compareIds = state.compareIds.filter((cid) => cid !== ref.id);
      saveReferences();
      populateFilterOptions();
      closeModal(els.lightboxModal);
      renderGallery();
      addLogEvent('레퍼런스 삭제', ref.title, '삭제 완료');
      showToast('레퍼런스가 삭제되었습니다.');
    });

    // Inline description editing
    const startDescEdit = () => {
      const ref = state.references.find((r) => r.id === state.activeLightboxId);
      if (!ref) return;
      els.lightboxDescTextarea.value = ref.description;
      els.lightboxDescView.hidden = true;
      els.lightboxDescEditWrap.hidden = false;
      els.lightboxDescTextarea.focus();
    };

    const commitDescEdit = () => {
      const ref = state.references.find((r) => r.id === state.activeLightboxId);
      if (!ref) return;
      const next = els.lightboxDescTextarea.value.trim();
      if (next) {
        ref.description = next;
        saveReferences();
        renderGallery();
        addLogEvent('한 줄 설명 수정', ref.title, '저장 완료');
        showToast('한 줄 설명이 수정되었습니다.');
      }
      els.lightboxDescView.textContent = ref.description;
      els.lightboxDescView.hidden = false;
      els.lightboxDescEditWrap.hidden = true;
    };

    els.lightboxDescView.addEventListener('click', startDescEdit);
    els.lightboxDescView.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        startDescEdit();
      }
    });
    els.editDescTriggerBtn.addEventListener('click', startDescEdit);
    els.saveDescBtn.addEventListener('click', commitDescEdit);
    els.cancelDescBtn.addEventListener('click', () => {
      els.lightboxDescView.hidden = false;
      els.lightboxDescEditWrap.hidden = true;
    });
    els.lightboxDescTextarea.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        commitDescEdit();
      }
    });

    // Lightbox Tag Editor (remove / add)
    els.lightboxTagEditor.addEventListener('click', (e) => {
      const rmBtn = e.target.closest('[data-remove-tag]');
      if (rmBtn) {
        const tag = rmBtn.dataset.removeTag;
        const cat = rmBtn.dataset.tagCat;
        const ref = state.references.find((r) => r.id === state.activeLightboxId);
        if (!ref) return;
        ref.tags[cat] = (ref.tags[cat] || []).filter((t) => t !== tag);
        saveReferences();
        populateFilterOptions();
        renderLightboxTagEditor(ref);
        renderGallery();
        addLogEvent('태그 교정 (삭제)', `${ref.title} · ${cat} ${tag}`, '삭제 완료');
        return;
      }

      const addBtn = e.target.closest('[data-add-btn-cat]');
      if (addBtn) {
        const cat = addBtn.dataset.addBtnCat;
        const input = els.lightboxTagEditor.querySelector(`[data-add-input-cat="${cat}"]`);
        if (input) {
          addTagToActiveRef(cat, input.value);
        }
      }
    });

    els.lightboxTagEditor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('[data-add-input-cat]')) {
        e.preventDefault();
        addTagToActiveRef(e.target.dataset.addInputCat, e.target.value);
      }
    });

    // Add Modal wiring
    els.openAddModalBtn.addEventListener('click', openAddModal);

    els.uploadDropzone.addEventListener('click', () => els.fileInput.click());
    els.uploadDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        els.fileInput.click();
      }
    });

    els.fileInput.addEventListener('change', (e) => {
      handleIncomingFiles(e.target.files);
    });

    els.uploadDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      els.uploadDropzone.classList.add('is-dragover');
    });
    els.uploadDropzone.addEventListener('dragleave', () => {
      els.uploadDropzone.classList.remove('is-dragover');
    });
    els.uploadDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      els.uploadDropzone.classList.remove('is-dragover');
      handleIncomingFiles(e.dataTransfer.files);
    });

    els.uploadPreviewStrip.addEventListener('click', (e) => {
      const rmBtn = e.target.closest('[data-remove-pending]');
      if (!rmBtn) return;
      const idx = Number(rmBtn.dataset.removePending);
      state.pendingFiles.splice(idx, 1);
      renderPendingThumbnails();
    });

    els.topicSuggestions.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-suggest-topic]');
      if (btn) {
        els.projectTopicInput.value = btn.dataset.suggestTopic;
      }
    });

    els.saveApiKeyBtn.addEventListener('click', () => {
      const val = els.geminiApiKeyInput.value.trim();
      if (val) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, val);
        showToast('Gemini API 키가 LocalStorage에 저장되었습니다.');
      } else {
        localStorage.removeItem(STORAGE_KEYS.API_KEY);
        showToast('API 키가 제거되어 내장 스마트 자동 분석 모드로 전환되었습니다.');
      }
    });

    els.runAnalyzeBtn.addEventListener('click', runAnalysisPipeline);
    els.commitAnalyzedBtn.addEventListener('click', commitAnalyzedDrafts);

    // Logs Modal wiring
    els.openLogsModalBtn.addEventListener('click', openLogsModal);

    els.resetSampleDataBtn.addEventListener('click', () => {
      if (!confirm('사용자 추가·수정 내역을 초기화하고 초기 샘플 10종으로 복원할까요?')) return;
      state.references = structuredClone(INITIAL_REFERENCES);
      state.customTopics = [];
      state.compareIds = [];
      state.logs = {
        searchCount: 0,
        events: [
          {
            time: formatTime(new Date()),
            type: '데이터 초기화',
            detail: '초기 샘플 10종 상태로 복원됨',
            result: '10건',
          },
        ],
      };
      saveReferences();
      saveCustomTopics();
      saveLogs();
      populateFilterOptions();
      resetAllFilters();
      closeModal(els.logsModal);
      showToast('초기 샘플 10종으로 복원되었습니다.');
    });

    els.exportJsonBtn.addEventListener('click', () => {
      const payload = {
        exportedAt: new Date().toISOString(),
        totalReferences: state.references.length,
        customTopics: state.customTopics || [],
        references: state.references.map(({ image, ...rest }) => ({
          ...rest,
          image: image.startsWith('data:') ? '[uploaded-data-url]' : image,
        })),
        logs: state.logs,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moabom-archive-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('모아봄 아카이브 JSON 파일이 다운로드되었습니다.');
    });

    // Global modal close handlers
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = document.getElementById(btn.dataset.closeModal);
        if (modal) closeModal(modal);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(backdrop);
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllDropdowns();
        const openModals = Array.from(document.querySelectorAll('.modal-backdrop.is-open'));
        if (openModals.length) {
          closeModal(openModals[openModals.length - 1]);
        }
        return;
      }

      if (els.lightboxModal.classList.contains('is-open')) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------------ */
  loadState();
  populateFilterOptions();
  bindEvents();
  renderGallery();
})();
