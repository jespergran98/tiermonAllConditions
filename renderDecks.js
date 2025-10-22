/**
 * ============================================================================
 * DECK RENDERER
 * ============================================================================
 * 
 * Efficient rendering system for displaying tens of thousands of decks.
 * Uses virtual scrolling and lazy rendering for optimal performance.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const BATCH_SIZE = 50; // Number of decks to render per batch
const SCROLL_THRESHOLD = 500; // Pixels from bottom to trigger next batch load

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let allDecks = [];
let filteredDecks = [];
let displayedDecks = [];
let currentBatch = 0;
let isGridView = true;
let isLoading = false;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
  container: document.getElementById('deckContainer'),
  searchInput: document.getElementById('searchInput'),
  sortSelect: document.getElementById('sortSelect'),
  tierFilter: document.getElementById('tierFilter'),
  gridViewBtn: document.getElementById('gridView'),
  listViewBtn: document.getElementById('listView'),
  loadingIndicator: document.getElementById('loadingIndicator'),
  noResults: document.getElementById('noResults'),
  totalDecks: document.getElementById('totalDecks'),
  totalMatches: document.getElementById('totalMatches')
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  // Get decks from decks.js (exported as module.exports or global variable)
  allDecks = typeof module !== 'undefined' && module.exports 
    ? module.exports 
    : window.enrichedDecks || [];
  
  // Initial sort and filter
  filteredDecks = [...allDecks].sort((a, b) => a.rank - b.rank);
  
  // Update summary stats
  updateSummaryStats();
  
  // Initial render
  renderInitialBatch();
  
  // Setup event listeners
  setupEventListeners();
  
  // Hide loading indicator
  elements.loadingIndicator.style.display = 'none';
}

// ============================================================================
// SUMMARY STATISTICS
// ============================================================================

function updateSummaryStats() {
  const totalMatches = allDecks.reduce((sum, deck) => sum + deck.total_matches, 0);
  elements.totalDecks.textContent = `${allDecks.length} Decks`;
  elements.totalMatches.textContent = `${totalMatches.toLocaleString()} Total Matches`;
}

// ============================================================================
// RENDERING FUNCTIONS
// ============================================================================

function renderInitialBatch() {
  currentBatch = 0;
  displayedDecks = [];
  elements.container.innerHTML = '';
  renderNextBatch();
}

function renderNextBatch() {
  if (isLoading) return;
  
  const start = currentBatch * BATCH_SIZE;
  const end = Math.min(start + BATCH_SIZE, filteredDecks.length);
  
  if (start >= filteredDecks.length) return;
  
  isLoading = true;
  
  const batch = filteredDecks.slice(start, end);
  displayedDecks.push(...batch);
  
  // Use document fragment for better performance
  const fragment = document.createDocumentFragment();
  
  batch.forEach(deck => {
    const card = createDeckCard(deck);
    fragment.appendChild(card);
  });
  
  elements.container.appendChild(fragment);
  
  currentBatch++;
  isLoading = false;
  
  // Show/hide no results message
  if (displayedDecks.length === 0) {
    elements.noResults.style.display = 'block';
  } else {
    elements.noResults.style.display = 'none';
  }
}

function createDeckCard(deck) {
  const card = document.createElement('div');
  card.className = 'deck-card fade-in';
  
  card.innerHTML = `
    <div class="deck-header">
      <div class="deck-name">${escapeHtml(deck.deck_name)}</div>
      <div class="deck-rank">#${deck.rank}</div>
    </div>
    
    <div class="tier-badge tier-${escapeHtml(deck.tier)}">${escapeHtml(deck.tier_display)}</div>
    
    <div class="deck-stats">
      <div class="stat-item">
        <div class="stat-label">Rating</div>
        <div class="stat-value">${deck.rating_rounded}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value positive">${deck.win_rate.toFixed(1)}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Popularity</div>
        <div class="stat-value">${deck.share.toFixed(1)}%</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Meta Impact</div>
        <div class="stat-value">${deck.meta_impact.toFixed(0)}</div>
      </div>
    </div>
    
    <div class="deck-record">
      <div class="record-item">
        <strong>${deck.wins}</strong> <span>W</span>
      </div>
      <div class="record-item">
        <strong>${deck.losses}</strong> <span>L</span>
      </div>
      <div class="record-item">
        <strong>${deck.ties}</strong> <span>T</span>
      </div>
    </div>
    
    <div class="deck-meta">
      <div class="meta-tag">${deck.count} entries</div>
      <div class="meta-tag">${deck.total_matches.toLocaleString()} matches</div>
      <div class="meta-tag">${deck.avg_tournament_depth.toFixed(1)} avg depth</div>
    </div>
  `;
  
  return card;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// FILTERING AND SORTING
// ============================================================================

function applyFiltersAndSort() {
  const searchTerm = elements.searchInput.value.toLowerCase();
  const tierFilter = elements.tierFilter.value;
  const sortBy = elements.sortSelect.value;
  
  // Filter
  filteredDecks = allDecks.filter(deck => {
    const matchesSearch = deck.deck_name.toLowerCase().includes(searchTerm);
    const matchesTier = tierFilter === 'all' || deck.tier === tierFilter;
    return matchesSearch && matchesTier;
  });
  
  // Sort
  filteredDecks.sort((a, b) => {
    switch (sortBy) {
      case 'rank':
        return a.rank - b.rank;
      case 'rating':
        return b.rating - a.rating;
      case 'winRate':
        return b.win_rate - a.win_rate;
      case 'count':
        return b.count - a.count;
      case 'metaImpact':
        return b.meta_impact - a.meta_impact;
      case 'depth':
        return b.avg_tournament_depth - a.avg_tournament_depth;
      default:
        return a.rank - b.rank;
    }
  });
  
  // Re-render
  renderInitialBatch();
}

// ============================================================================
// VIEW SWITCHING
// ============================================================================

function switchToGridView() {
  isGridView = true;
  elements.container.className = 'deck-grid';
  elements.gridViewBtn.classList.add('active');
  elements.listViewBtn.classList.remove('active');
}

function switchToListView() {
  isGridView = false;
  elements.container.className = 'deck-list';
  elements.listViewBtn.classList.add('active');
  elements.gridViewBtn.classList.remove('active');
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Search
  let searchTimeout;
  elements.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(applyFiltersAndSort, 300);
  });
  
  // Sort
  elements.sortSelect.addEventListener('change', applyFiltersAndSort);
  
  // Tier filter
  elements.tierFilter.addEventListener('change', applyFiltersAndSort);
  
  // View toggle
  elements.gridViewBtn.addEventListener('click', () => {
    if (!isGridView) {
      switchToGridView();
      renderInitialBatch();
    }
  });
  
  elements.listViewBtn.addEventListener('click', () => {
    if (isGridView) {
      switchToListView();
      renderInitialBatch();
    }
  });
  
  // Infinite scroll
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - SCROLL_THRESHOLD;
      
      if (scrollPosition >= threshold && !isLoading) {
        renderNextBatch();
      }
    }, 100);
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Focus search on "/" key
    if (e.key === '/' && document.activeElement !== elements.searchInput) {
      e.preventDefault();
      elements.searchInput.focus();
    }
    
    // Clear search on Escape
    if (e.key === 'Escape' && document.activeElement === elements.searchInput) {
      elements.searchInput.value = '';
      applyFiltersAndSort();
      elements.searchInput.blur();
    }
  });
}

// ============================================================================
// START APPLICATION
// ============================================================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}