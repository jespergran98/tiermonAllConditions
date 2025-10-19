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
  {
    deck_name: "Suicune ex Greninja",
    count: 2473,
    wins: 6996,
    losses: 5981,
    ties: 306
  },
  {
    deck_name: "Giratina ex Darkrai ex",
    count: 1450,
    wins: 3981,
    losses: 3546,
    ties: 212
  },
  {
    deck_name: "Guzzlord ex",
    count: 805,
    wins: 2130,
    losses: 1966,
    ties: 101
  },
  {
    deck_name: "Flareon ex Eevee ex",
    count: 578,
    wins: 1552,
    losses: 1433,
    ties: 49
  },
  {
    deck_name: "Espeon ex Sylveon ex",
    count: 350,
    wins: 880,
    losses: 832,
    ties: 32
  },
  {
    deck_name: "Darkrai ex Arceus ex",
    count: 264,
    wins: 715,
    losses: 672,
    ties: 27
  },
  {
    deck_name: "Buzzwole ex Pheromosa",
    count: 256,
    wins: 652,
    losses: 636,
    ties: 22
  },
  {
    deck_name: "Dragonite ex Dragonite",
    count: 214,
    wins: 460,
    losses: 523,
    ties: 17
  },
  {
    deck_name: "Arceus ex Pichu",
    count: 211,
    wins: 537,
    losses: 514,
    ties: 15
  },
  {
    deck_name: "Greninja Oricorio",
    count: 207,
    wins: 585,
    losses: 462,
    ties: 46
  }
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
  // Formula: (wins + 0.5 × ties) / total_matches × 100
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
  // Formula: (count / totalCount) × 100
  // Example: If deck has 500 entries out of 5000 total, share = 10%
  deck.share = (deck.count / totalCount) * 100;
  
  // SHARE COMPARED TO MOST PLAYED DECK
  // Relative popularity compared to the #1 most played deck
  // Formula: (deck.share / most_played_share) × 100
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
  // Formula: adjusted_win_rate × share
  // High values indicate decks that are both popular AND successful
  // Low values indicate niche or underperforming decks
  deck.meta_impact = deck.adjusted_win_rate * deck.share;
});

// ============================================================================
// STEP 4: CALCULATE RATING (HIERARCHICAL BAYESIAN ALGORITHM)
// ============================================================================

/**
 * Get dynamic z-score based on sample size
 * Smaller samples use more conservative z-scores for wider confidence intervals
 * This prevents over-confidence in limited data
 * 
 * @param {number} n - Sample size (number of matches)
 * @returns {number} Z-score for confidence interval calculation
 */
const getDynamicZScore = (n) => {
  if (n < 30) return 2.576;  // 99% confidence for tiny samples
  if (n < 200) return 2.576 + (2.326 - 2.576) * ((n - 30) / 170);  // Interpolate
  if (n < 1000) return 2.326 + (1.96 - 2.326) * ((n - 200) / 800);  // Interpolate
  return 1.96;  // 95% confidence for large samples
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

enrichedDecks.forEach(deck => {
  // TIER ASSIGNMENT
  // Tiers are assigned based on rating thresholds
  // Higher tiers indicate stronger competitive performance
  if (deck.rating >= 100) {
    deck.tier = 'X';          // Exceptional (100+)
  } else if (deck.rating >= 97) {
    deck.tier = 'S+';         // Elite+ (97-99)
  } else if (deck.rating >= 94) {
    deck.tier = 'S';          // Elite (94-96)
  } else if (deck.rating >= 91) {
    deck.tier = 'A';          // Excellent (91-93)
  } else if (deck.rating >= 88) {
    deck.tier = 'B';          // Good (88-90)
  } else if (deck.rating >= 85) {
    deck.tier = 'C';          // Above Average (85-87)
  } else if (deck.rating >= 82) {
    deck.tier = 'D';          // Average (82-84)
  } else if (deck.rating >= 79) {
    deck.tier = 'E';          // Below Average (79-81)
  } else if (deck.rating >= 76) {
    deck.tier = 'F';          // Poor (76-78)
  } else {
    deck.tier = 'Unranked';   // Very Poor (<76)
  }
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
// EXPORT ENRICHED DATA
// ============================================================================

// Export the enriched deck data for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = enrichedDecks;
} else if (typeof window !== 'undefined') {
  // Make available in browser environment
  window.enrichedDecks = enrichedDecks;
}