/**
 * ============================================================================
 * DECK STATISTICS CALCULATOR
 * ============================================================================
 * 
 * This module calculates comprehensive statistics for competitive deck data,
 * including win rates, rankings, tiers, and meta impact using a hierarchical
 * Bayesian algorithm.
 * 
 * The calculation pipeline follows these steps:
 * 1. Calculate basic metrics (win rates, matches)
 * 2. Calculate share metrics (usage percentages)
 * 3. Calculate meta impact
 * 4. Calculate Bayesian ratings
 * 5. Assign tiers based on ratings
 * 6. Calculate rankings
 * 7. Calculate percentiles for all metrics
 * 8. Calculate rounded values for display
 */

// ============================================================================
// RAW DATA
// ============================================================================

const decks = [
  { deck_name: "Exeggutor ex Celebi ex", count: 5393, wins: 15010, losses: 12323, ties: 300 },
  { deck_name: "Darkrai ex Magnezone", count: 4061, wins: 11603, losses: 9397, ties: 215 },
  { deck_name: "Charizard ex Moltres ex", count: 3388, wins: 7530, losses: 7881, ties: 134 },
  { deck_name: "Darkrai ex Greninja", count: 1973, wins: 5399, losses: 4538, ties: 104 },
  { deck_name: "Gyarados ex Greninja", count: 1807, wins: 4161, losses: 4291, ties: 67 },
  { deck_name: "Palkia ex Vaporeon", count: 1730, wins: 4241, losses: 4059, ties: 67 },
  { deck_name: "Magnezone Skarmory", count: 1699, wins: 4602, losses: 3972, ties: 62 },
  { deck_name: "Weavile ex Darkrai ex", count: 1279, wins: 3138, losses: 2989, ties: 45 },
  { deck_name: "Magnezone Hitmonlee", count: 926, wins: 2499, losses: 2224, ties: 35 }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate percentile ranking for a value within an array
 * 
 * @param {number} value - The value to rank
 * @param {number[]} sortedArray - Array sorted in ascending order
 * @returns {number} Percentile from 0-100 (higher = better relative position)
 * 
 * @example
 * calculatePercentile(75, [50, 60, 70, 80, 90]) // Returns 50 (middle of pack)
 * calculatePercentile(95, [50, 60, 70, 80, 90]) // Returns 100 (best in group)
 */
function calculatePercentile(value, sortedArray) {
  const rank = sortedArray.filter(v => v < value).length;
  return (rank / (sortedArray.length - 1)) * 100;
}

/**
 * Round a number to the nearest specified interval
 * 
 * @param {number} num - Number to round
 * @param {number} interval - Rounding interval (5, 10, 50, 100, etc.)
 * @returns {number} Rounded number
 * 
 * @example
 * roundToNearest(123, 10) // Returns 120
 * roundToNearest(127, 10) // Returns 130
 */
function roundToNearest(num, interval) {
  return Math.round(num / interval) * interval;
}

/**
 * Determine appropriate rounding interval based on number magnitude
 * Uses smart scaling to keep rounded numbers readable
 * 
 * @param {number} num - Number to analyze
 * @returns {number} Appropriate interval (5, 10, 50, or 100)
 * 
 * @example
 * getSmartRoundingInterval(75)    // Returns 5
 * getSmartRoundingInterval(450)   // Returns 10
 * getSmartRoundingInterval(5000)  // Returns 50
 */
function getSmartRoundingInterval(num) {
  if (num < 100) return 5;
  if (num < 1000) return 10;
  if (num < 10000) return 50;
  return 100;
}

// ============================================================================
// STEP 1: CALCULATE BASIC METRICS
// ============================================================================

const enrichedDecks = decks.map(deck => {
  // TOTAL MATCHES
  // Sum of all game outcomes for this deck
  const total_matches = deck.wins + deck.losses + deck.ties;
  
  // WIN RATE
  // Standard win percentage: wins divided by total matches
  // Does not account for ties
  const win_rate = (deck.wins / total_matches) * 100;
  
  // ADJUSTED WIN RATE
  // Treats ties as half-wins for a more nuanced performance measure
  // Formula: (wins + 0.5 Ã— ties) / total_matches Ã— 100
  const adjusted_win_rate = ((deck.wins + 0.5 * deck.ties) / total_matches) * 100;
  
  // AVERAGE MATCHES PER ENTRY
  // Indicates tournament depth - higher values mean the deck progresses further
  // Formula: total_matches / count
  const avg_matches_per_entry = total_matches / deck.count;
  
  return {
    ...deck,
    total_matches,
    win_rate,
    adjusted_win_rate,
    avg_matches_per_entry
  };
});

// ============================================================================
// STEP 2: CALCULATE SHARE METRICS
// ============================================================================

// Calculate total count across all decks for percentage calculations
const totalCount = enrichedDecks.reduce((sum, deck) => sum + deck.count, 0);

// Find the most played deck's count for relative comparisons
const mostPlayedDeckCount = Math.max(...enrichedDecks.map(d => d.count));

enrichedDecks.forEach(deck => {
  // SHARE
  // Deck's percentage of total tournament entries
  // Formula: (count / totalCount) Ã— 100
  // Example: If deck has 500 entries out of 5000 total, share = 10%
  deck.share = (deck.count / totalCount) * 100;
  
  // SHARE COMPARED TO MOST PLAYED DECK
  // Relative popularity compared to the #1 most played deck
  // Formula: (deck.share / most_played_share) Ã— 100
  // Example: If deck has 5% share and top deck has 20%, result = 25%
  const mostPlayedShare = (mostPlayedDeckCount / totalCount) * 100;
  deck.share_compared_to_most_played_deck = (deck.share / mostPlayedShare) * 100;
});

// ============================================================================
// STEP 3: CALCULATE META IMPACT
// ============================================================================

enrichedDecks.forEach(deck => {
  // META IMPACT
  // Measures overall influence on the metagame
  // Formula: adjusted_win_rate Ã— share
  // High values indicate decks that are both popular AND successful
  // Low values indicate niche or underperforming decks
  deck.meta_impact = deck.adjusted_win_rate * deck.share;
});

// ============================================================================
// STEP 4: CALCULATE RATING (HIERARCHICAL BAYESIAN ALGORITHM)
// ============================================================================

/**
 * Get dynamic z-score based on sample size with refined interpolation
 * Provides smooth, continuous scaling from tiny samples (n=1) to massive datasets (n=1,000,000+)
 * 
 * Z-score philosophy:
 * - Tiny samples (n<30): Very conservative (z ≈ 2.576-3.0) to account for high uncertainty
 * - Small samples (n=30-500): Gradual reduction with refined steps
 * - Medium samples (n=500-5000): Transitional zone between conservative and moderate
 * - Large samples (n=5000-50000): Approaching asymptotic confidence
 * - Very large samples (n>50000): Asymptotic to 1.96 (95% confidence)
 * - Massive samples (n>500000): Converge to 1.645 (90% confidence) due to practical bounds
 * 
 * @param {number} n - Sample size (number of matches/games)
 * @returns {number} Z-score for confidence interval calculation (typically 1.645 to 3.0)
 */
const getDynamicZScore = (n) => {
  // Clamp n to reasonable bounds
  n = Math.max(1, Math.min(n, 1000000));
  
  // Define key breakpoints with refined z-scores
  // These are calibrated for progressive confidence building
  const breakpoints = [
    { n: 1,       z: 3.0 },      // Single game - maximum conservatism
    { n: 5,       z: 2.967 },    // Very tiny sample
    { n: 10,      z: 2.878 },    // Tiny sample
    { n: 20,      z: 2.746 },    // Very small sample
    { n: 30,      z: 2.576 },    // 99% confidence threshold
    { n: 50,      z: 2.442 },    // Early interpolation
    { n: 100,     z: 2.241 },    // Small sample - building confidence
    { n: 200,     z: 2.054 },    // Transitional zone
    { n: 300,     z: 1.960 },    // Cross 95% confidence (1.96)
    { n: 500,     z: 1.881 },    // Medium-small
    { n: 1000,    z: 1.782 },    // Solid medium sample
    { n: 2000,    z: 1.697 },    // Medium sample
    { n: 5000,    z: 1.626 },    // Large sample begins
    { n: 10000,   z: 1.576 },    // Large sample
    { n: 20000,   z: 1.541 },    // Very large
    { n: 50000,   z: 1.515 },    // Massive
    { n: 100000,  z: 1.496 },    // Very massive
    { n: 500000,  z: 1.476 },    // Approaching asymptotic
    { n: 1000000, z: 1.645 }     // Asymptotic 90% confidence bound
  ];
  
  // Find surrounding breakpoints for interpolation
  let lower = breakpoints[0];
  let upper = breakpoints[breakpoints.length - 1];
  
  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (n >= breakpoints[i].n && n <= breakpoints[i + 1].n) {
      lower = breakpoints[i];
      upper = breakpoints[i + 1];
      break;
    }
  }
  
  // Linear interpolation between breakpoints
  const range = upper.n - lower.n;
  const zRange = upper.z - lower.z;
  const progress = (n - lower.n) / range;
  const interpolatedZ = lower.z + progress * zRange;
  
  // Apply logarithmic smoothing for extra refinement in small sample ranges
  // This creates even smoother transitions between breakpoints
  if (n < 100) {
    const logSmoothing = Math.log(n + 1) / Math.log(101);
    const smoothingFactor = 1 + (0.05 * (1 - logSmoothing)); // ±5% smoothing
    return interpolatedZ * smoothingFactor;
  }
  
  return interpolatedZ;
};

/**
 * Calculate meta adjustment factor based on dataset size
 * Smaller metas receive a boost to prevent over-conservative ratings
 * This accounts for the fact that small metas have less stable data
 * 
 * @param {number} totalDecks - Total number of decks in meta
 * @returns {number} Adjustment factor from 1.0 (large meta) to 1.3 (tiny meta)
 */
const getMetaAdjustmentFactor = (totalDecks) => {
  const referenceSize = 100;
  if (totalDecks >= referenceSize) return 1.0;
  
  // Boost factor scales inversely with deck count
  const boost = 1 + (referenceSize - totalDecks) / (referenceSize * 4);
  return Math.min(boost, 1.3);  // Cap at 30% boost
};

/**
 * Hierarchical Bayesian ranking with meta adjustment
 * 
 * Uses Beta-Binomial conjugate prior to estimate true win rates with confidence bounds.
 * This approach accounts for sample size uncertainty and regresses extreme values
 * toward the mean when data is limited.
 * 
 * The algorithm:
 * 1. Calculates global meta statistics (mean win rate, variance)
 * 2. Estimates Beta distribution parameters from these statistics
 * 3. Updates each deck's Beta distribution with observed data (posterior)
 * 4. Calculates conservative lower confidence bound for each deck
 * 5. This lower bound becomes the basis for the rating
 * 
 * @param {Array} allData - Array of [rank, name, wins, losses, ties] for each deck
 * @returns {Array} Deck statistics with Bayesian posterior estimates
 */
const hierarchicalBayesian = (allData) => {
  const totalDecks = allData.length;
  const metaAdjustment = getMetaAdjustmentFactor(totalDecks);
  
  // Calculate basic statistics for each deck
  const deckStats = allData.map(([_, __, wins, losses, ties]) => {
    const n = wins + losses + ties;
    const adjWins = wins + 0.5 * ties;
    return { n, winRate: adjWins / n };
  });
  
  // STEP 1: Calculate global meta statistics for Bayesian prior
  const totalGames = deckStats.reduce((sum, d) => sum + d.n, 0);
  
  // Weighted mean accounts for different sample sizes
  const weightedMean = deckStats.reduce((sum, d) => sum + d.winRate * d.n, 0) / totalGames;
  
  // Variance measures spread of win rates across decks
  const variance = deckStats.reduce((sum, d) => 
    sum + d.n * Math.pow(d.winRate - weightedMean, 2), 0) / totalGames;
  
  // STEP 2: Estimate Beta distribution parameters from meta statistics
  // Constrain mean to valid probability range (0.01 to 0.99)
  const meanEst = Math.max(0.01, Math.min(0.99, weightedMean));
  
  // Constrain variance to be less than maximum possible for this mean
  const varEst = Math.max(0.0001, Math.min(meanEst * (1 - meanEst) * 0.85, variance));
  
  // Calculate Beta distribution shape parameters (alpha, beta)
  const alphaBeta = Math.max(1, (meanEst * (1 - meanEst) / varEst) - 1);
  const priorAlpha = meanEst * alphaBeta;
  const priorBeta = (1 - meanEst) * alphaBeta;
  
  // STEP 3: Select base z-score based on total games in meta
  // More data = more confident = more negative z-score (tighter bounds)
  const zScores = { 
    2000: -1.28,      // Very small meta
    10000: -1.645,    // Small meta
    50000: -1.96,     // Medium meta
    Infinity: -2.326  // Large meta
  };
  let baseZ = zScores[Object.keys(zScores).find(key => totalGames < key)] || zScores.Infinity;
  
  // STEP 4: Adjust z-score based on meta diversity
  // More diverse metas (higher variance) get slightly looser bounds
  const metaDiversity = variance / (meanEst * (1 - meanEst));
  const adaptiveZ = baseZ * Math.max(0.8, Math.min(1.2, 1 / (0.3 + metaDiversity)));
  const adjustedZ = adaptiveZ / metaAdjustment;
  
  // STEP 5: Calculate Bayesian posterior for each deck
  return allData.map(([origRank, deckName, wins, losses, ties]) => {
    const n = wins + losses + ties;
    const adjWins = wins + 0.5 * ties;
    const adjLosses = losses + 0.5 * ties;
    
    // Update Beta distribution with observed data (Bayesian update)
    const postAlpha = priorAlpha + adjWins;
    const postBeta = priorBeta + adjLosses;
    
    // Calculate posterior mean (expected true win rate)
    const posteriorMean = postAlpha / (postAlpha + postBeta);
    
    // Calculate posterior variance (uncertainty in estimate)
    const postVariance = (postAlpha * postBeta) / 
      ((postAlpha + postBeta) ** 2 * (postAlpha + postBeta + 1));
    
    // Calculate lower confidence bound (conservative estimate)
    // This penalizes decks with high uncertainty (limited data)
    const lowerBound = Math.max(0, posteriorMean + adjustedZ * Math.sqrt(postVariance));
    const adjustedLowerBound = Math.min(0.99, lowerBound);
    
    return { 
      origRank, 
      deckName, 
      wins, 
      losses, 
      ties, 
      n, 
      posteriorMean, 
      adjustedLowerBound 
    };
  });
};

/**
 * Convert win percentage to strength score (0-100+ scale)
 * 
 * @param {number} winPct - Win percentage on 0-1 scale
 * @returns {number} Strength score (typically 0-180 before normalization)
 */
const calculateStrength = (winPct) => winPct * 1.8;

// Prepare data for hierarchical Bayesian calculation
const bayesianInput = enrichedDecks.map((deck, index) => [
  index + 1,  // Original rank placeholder (not used in calculation)
  deck.deck_name,
  deck.wins,
  deck.losses,
  deck.ties
]);

// Calculate Bayesian ratings for all decks
const bayesianResults = hierarchicalBayesian(bayesianInput);

// Apply Bayesian results to enriched decks
enrichedDecks.forEach((deck, index) => {
  const bayesianData = bayesianResults[index];
  
  // RATING
  // Based on the strength score from the lower confidence bound
  // This conservative approach:
  // - Penalizes decks with limited data
  // - Rewards consistent performance with large sample sizes
  // - Prevents fluky high win rates from dominating rankings
  // Scale: 0-100+ (though typically maxes around 180 before normalization)
  deck.rating = calculateStrength(bayesianData.adjustedLowerBound) * 100;
});

// ============================================================================
// STEP 5: ASSIGN TIERS BASED ON RATING
// ============================================================================

// Tier display mapping - maps internal names to display text
const tier_display_map = {
  'Splus': 'S+',
  'X': 'X',
  'S': 'S',
  'A': 'A',
  'B': 'B',
  'C': 'C',
  'D': 'D',
  'E': 'E',
  'F': 'F',
  'Unranked': 'Unranked'
};

enrichedDecks.forEach(deck => {
  // TIER ASSIGNMENT
  // Tiers are assigned based on rating thresholds
  // Higher tiers indicate stronger competitive performance
  if (deck.rating >= 100) {
    deck.tier = 'X';          // Exceptional
  } else if (deck.rating >= 96) {
    deck.tier = 'Splus';      // Elite+
  } else if (deck.rating >= 92) {
    deck.tier = 'S';          // Elite
  } else if (deck.rating >= 89.5) {
    deck.tier = 'A';          // Excellent
  } else if (deck.rating >= 87) {
    deck.tier = 'B';          // Good
  } else if (deck.rating >= 85) {
    deck.tier = 'C';          // Above Average
  } else if (deck.rating >= 83) {
    deck.tier = 'D';          // Average
  } else if (deck.rating >= 81.5) {
    deck.tier = 'E';          // Below Average
  } else if (deck.rating >= 80) {
    deck.tier = 'F';          // Poor
  } else {
    deck.tier = 'Unranked';   // Very Poor
  }
  
  // Add display text for UI rendering
  deck.tier_display = tier_display_map[deck.tier];
});

// ============================================================================
// STEP 6: CALCULATE RANKINGS
// ============================================================================

// Sort decks by rating in descending order to determine rank positions
const decksByRating = [...enrichedDecks].sort((a, b) => b.rating - a.rating);

decksByRating.forEach((deck, index) => {
  // RANK
  // Position in overall rankings (1 = best, 2 = second best, etc.)
  // Based solely on rating (not win rate or popularity)
  deck.rank = index + 1;
});

// ============================================================================
// STEP 7: CALCULATE ALL PERCENTILES
// ============================================================================

// Prepare sorted arrays for percentile calculations
// All arrays sorted in ASCENDING order (lowest to highest)
const sortedRatings = enrichedDecks.map(d => d.rating).sort((a, b) => a - b);
const sortedCounts = enrichedDecks.map(d => d.count).sort((a, b) => a - b);
const sortedTotalMatches = enrichedDecks.map(d => d.total_matches).sort((a, b) => a - b);
const sortedWinRates = enrichedDecks.map(d => d.win_rate).sort((a, b) => a - b);
const sortedAdjustedWinRates = enrichedDecks.map(d => d.adjusted_win_rate).sort((a, b) => a - b);
const sortedAvgMatches = enrichedDecks.map(d => d.avg_matches_per_entry).sort((a, b) => a - b);
const sortedMetaImpact = enrichedDecks.map(d => d.meta_impact).sort((a, b) => a - b);
const sortedRanks = enrichedDecks.map(d => d.rank).sort((a, b) => a - b);

enrichedDecks.forEach(deck => {
  // RATING PERCENTILE
  // Higher rating = higher percentile
  // 90th percentile means deck is better than 90% of all decks
  deck.rating_pct = calculatePercentile(deck.rating, sortedRatings);
  
  // COUNT PERCENTILE
  // Higher count = higher percentile
  // Measures relative popularity
  deck.count_pct = calculatePercentile(deck.count, sortedCounts);
  
  // TOTAL MATCHES PERCENTILE
  // Higher total matches = higher percentile
  // Indicates how much the deck has been played overall
  deck.total_matches_pct = calculatePercentile(deck.total_matches, sortedTotalMatches);
  
  // WIN RATE PERCENTILE
  // Higher win rate = higher percentile
  // Raw performance metric without sample size consideration
  deck.win_rate_pct = calculatePercentile(deck.win_rate, sortedWinRates);
  
  // ADJUSTED WIN RATE PERCENTILE
  // Higher adjusted win rate = higher percentile
  // Performance metric that treats ties as half-wins
  deck.adjusted_win_rate_pct = calculatePercentile(deck.adjusted_win_rate, sortedAdjustedWinRates);
  
  // AVERAGE MATCHES PER ENTRY PERCENTILE
  // Higher average = higher percentile
  // Indicates tournament depth/success per entry
  deck.avg_matches_per_entry_pct = calculatePercentile(deck.avg_matches_per_entry, sortedAvgMatches);
  
  // META IMPACT PERCENTILE
  // Higher meta impact = higher percentile
  // Measures overall influence on competitive environment
  deck.meta_impact_pct = calculatePercentile(deck.meta_impact, sortedMetaImpact);
  
  // RANK PERCENTILE
  // SPECIAL CASE: Lower rank number = higher percentile
  // We invert ranks (negate) because rank 1 should be 100th percentile
  // Example: Rank 1 (best) = 100th percentile, Rank 10 (worst) = 0th percentile
  deck.rank_pct = calculatePercentile(-deck.rank, sortedRanks.map(r => -r));
});

// ============================================================================
// STEP 8: CALCULATE ROUNDED VALUES
// ============================================================================

enrichedDecks.forEach(deck => {
  // COUNT ROUNDED
  // Rounded for display purposes (e.g., "350+" instead of "347")
  // Uses smart intervals based on magnitude
  const countInterval = getSmartRoundingInterval(deck.count);
  deck.count_rounded = roundToNearest(deck.count, countInterval);
  
  // TOTAL MATCHES ROUNDED
  // Rounded to nearest 100 or 1000 for cleaner display
  const matchesInterval = deck.total_matches < 1000 ? 100 : 1000;
  deck.total_matches_rounded = roundToNearest(deck.total_matches, matchesInterval);
  
  // WIN RATE ROUNDED
  // Rounded to nearest whole percentage for display
  // Example: 52.7% becomes 53%
  deck.win_rate_rounded = Math.round(deck.win_rate);
  
  // SHARE ROUNDED
  // Rounded to nearest whole percentage for display
  // Example: 7.3% becomes 7%
  deck.share_rounded = Math.round(deck.share);
});

// ============================================================================
// OUTPUT RESULTS
// ============================================================================

console.log('='.repeat(80));
console.log('DECK STATISTICS ANALYSIS');
console.log('='.repeat(80));
console.log();

// Sort by rank for display (best to worst)
enrichedDecks
  .sort((a, b) => a.rank - b.rank)
  .forEach(deck => {
    console.log(`Deck: ${deck.deck_name}`);
    console.log('-'.repeat(80));
    
    // BASIC STATISTICS
    console.log('BASIC STATISTICS:');
    console.log(`  Count: ${deck.count} (rounded: ${deck.count_rounded}+)`);
    console.log(`  Total Matches: ${deck.total_matches} (rounded: ${deck.total_matches_rounded}+)`);
    console.log(`  Record: ${deck.wins}W - ${deck.losses}L - ${deck.ties}T`);
    console.log();
    
    // PERFORMANCE METRICS
    console.log('PERFORMANCE METRICS:');
    console.log(`  Win Rate: ${deck.win_rate.toFixed(2)}% (rounded: ${deck.win_rate_rounded}%)`);
    console.log(`  Adjusted Win Rate: ${deck.adjusted_win_rate.toFixed(2)}%`);
    console.log(`  Avg Matches per Entry: ${deck.avg_matches_per_entry.toFixed(2)}`);
    console.log();
    
    // META STATISTICS
    console.log('META STATISTICS:');
    console.log(`  Share: ${deck.share.toFixed(2)}% (rounded: ${deck.share_rounded}%)`);
    console.log(`  Share vs Most Played: ${deck.share_compared_to_most_played_deck.toFixed(2)}%`);
    console.log(`  Meta Impact: ${deck.meta_impact.toFixed(2)}`);
    console.log();
    
    // RANKING & RATING
    console.log('RANKING & RATING:');
    console.log(`  Rank: #${deck.rank}`);
    console.log(`  Rating: ${deck.rating.toFixed(2)}/100`);
    console.log(`  Tier: ${deck.tier}`);
    console.log();
    
    // PERCENTILES
    console.log('PERCENTILES:');
    console.log(`  Rating Percentile: ${deck.rating_pct.toFixed(1)}%`);
    console.log(`  Rank Percentile: ${deck.rank_pct.toFixed(1)}%`);
    console.log(`  Count Percentile: ${deck.count_pct.toFixed(1)}%`);
    console.log(`  Total Matches Percentile: ${deck.total_matches_pct.toFixed(1)}%`);
    console.log(`  Win Rate Percentile: ${deck.win_rate_pct.toFixed(1)}%`);
    console.log(`  Adjusted Win Rate Percentile: ${deck.adjusted_win_rate_pct.toFixed(1)}%`);
    console.log(`  Avg Matches Percentile: ${deck.avg_matches_per_entry_pct.toFixed(1)}%`);
    console.log(`  Meta Impact Percentile: ${deck.meta_impact_pct.toFixed(1)}%`);
    console.log();
    console.log('='.repeat(80));
    console.log();
  });

// ============================================================================
// VERIFICATION: CONFIRM ALL CONDITIONS ARE CALCULATED
// ============================================================================

// This section verifies that all required deck analysis conditions are present
const requiredConditions = [
  'deck_name', 'count', 'wins', 'losses', 'ties',
  'total_matches', 'win_rate', 'adjusted_win_rate', 'avg_matches_per_entry',
  'share', 'share_compared_to_most_played_deck', 'meta_impact',
  'rating', 'tier', 'tier_display', 'rank',
  'rating_pct', 'count_pct', 'total_matches_pct', 'win_rate_pct', 'adjusted_win_rate_pct',
  'avg_matches_per_entry_pct', 'meta_impact_pct', 'rank_pct',
  'count_rounded', 'total_matches_rounded', 'win_rate_rounded', 'share_rounded'
];

const firstDeck = enrichedDecks[0];
const missingConditions = requiredConditions.filter(condition => !(condition in firstDeck));

if (missingConditions.length > 0) {
  console.warn('WARNING: Missing conditions:', missingConditions);
} else {
  console.log('✓ All required deck analysis conditions are present and calculated');
}

// ============================================================================
// EXPORT ENRICHED DATA
// ============================================================================

// Export the enriched deck data for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = enrichedDecks;
} else if (typeof window !== 'undefined') {
  // Make available in browser environment
  window.enrichedDecks = enrichedDecks;
}