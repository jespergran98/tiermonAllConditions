/**
 * ============================================================================
 * DECK STATISTICS CALCULATOR
 * ============================================================================
 * 
 * This module calculates comprehensive statistics for tournament deck data,
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
  { deck_name: "Suicune ex Greninja", count: 2473, wins: 6996, losses: 5981, ties: 306 },
  { deck_name: "Giratina ex Darkrai ex", count: 1450, wins: 3981, losses: 3546, ties: 212 },
  { deck_name: "Guzzlord ex", count: 805, wins: 2130, losses: 1966, ties: 101 },
  { deck_name: "Flareon ex Eevee ex", count: 578, wins: 1552, losses: 1433, ties: 49 },
  { deck_name: "Espeon ex Sylveon ex", count: 350, wins: 880, losses: 832, ties: 32 },
  { deck_name: "Darkrai ex Arceus ex", count: 264, wins: 715, losses: 672, ties: 27 },
  { deck_name: "Buzzwole ex Pheromosa", count: 256, wins: 652, losses: 636, ties: 22 },
  { deck_name: "Dragonite ex Dragonite", count: 214, wins: 460, losses: 523, ties: 17 },
  { deck_name: "Arceus ex Pichu", count: 211, wins: 537, losses: 514, ties: 15 },
  { deck_name: "Greninja Oricorio", count: 207, wins: 585, losses: 462, ties: 46 },
  { deck_name: "Charizard ex", count: 160, wins: 401, losses: 382, ties: 17 },
  { deck_name: "Decidueye ex Decidueye", count: 158, wins: 379, losses: 378, ties: 28 },
  { deck_name: "Silvally Rampardos", count: 152, wins: 440, losses: 397, ties: 26 },
  { deck_name: "Silvally Zeraora", count: 150, wins: 396, losses: 368, ties: 17 },
  { deck_name: "Suicune ex Giratina ex", count: 148, wins: 415, losses: 358, ties: 17 },
  { deck_name: "Raikou ex Magnezone", count: 147, wins: 332, losses: 371, ties: 7 },
  { deck_name: "Dragonite ex Sylveon ex", count: 125, wins: 321, losses: 305, ties: 7 },
  { deck_name: "Tapu Koko ex Oricorio", count: 123, wins: 319, losses: 324, ties: 9 },
  { deck_name: "Raikou ex Pikachu ex", count: 115, wins: 268, losses: 321, ties: 3 },
  { deck_name: "Raikou ex Tapu Koko ex", count: 112, wins: 286, losses: 270, ties: 11 },
  { deck_name: "Exeggutor ex Alolan Exeggutor", count: 108, wins: 257, losses: 291, ties: 6 },
  { deck_name: "Tapu Koko ex Pikachu ex", count: 93, wins: 229, losses: 201, ties: 5 }
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
  // Formula: (wins + 0.5 * ties) / total_matches * 100
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
  // Formula: (count / totalCount) * 100
  // Example: If deck has 500 entries out of 5000 total, share = 10%
  deck.share = (deck.count / totalCount) * 100;
  
  // SHARE COMPARED TO MOST PLAYED DECK
  // Relative popularity compared to the #1 most played deck
  // Formula: (deck.share / most_played_share) * 100
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
  // Formula: adjusted_win_rate * share
  // High values indicate decks that are both popular AND successful
  // Low values indicate niche or underperforming decks
  deck.meta_impact = deck.adjusted_win_rate * deck.share;
});

// ============================================================================
// STEP 4: CALCULATE RATING (HIERARCHICAL BAYESIAN ALGORITHM) - FIXED
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
    { n: 1,       z: 3.536 },    // Very conservative for single game
    { n: 5,       z: 3.463 },    
    { n: 10,      z: 3.404 },    
    { n: 20,      z: 3.350 },    
    { n: 30,      z: 3.302 },    
    { n: 50,      z: 3.256 },    
    { n: 100,     z: 3.201 },    
    { n: 200,     z: 3.151 },    
    { n: 500,     z: 3.101 },    
    { n: 1000,    z: 3.063 },    
    { n: 2000,    z: 3.035 },    
    { n: 5000,    z: 3.007 },    
    { n: 10000,   z: 2.987 },    
    { n: 20000,   z: 2.972 },    
    { n: 50000,   z: 2.955 },    
    { n: 100000,  z: 2.943 },    
    { n: 500000,  z: 2.931 },    
    { n: 1000000, z: 2.931 }     // Asymptotic around 99.7% confidence
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
 * Smaller metas receive a boost to confidence (lower z-scores) to account for reduced data stability
 * This prevents over-conservatism when ranking within small metas
 * 
 * @param {number} totalDecks - Total number of decks in meta
 * @returns {number} Adjustment factor from 1.0 (large meta) to 0.8 (tiny meta)
 */
const getMetaAdjustmentFactor = (totalDecks) => {
  const referenceSize = 100;
  if (totalDecks >= referenceSize) return 1.0;
  
  // Adjustment factor scales inversely with deck count
  // Smaller metas = tighter bounds (lower z-scores) to be more decisive within limited data
  const adjustment = 0.8 + (0.2 * totalDecks / referenceSize);
  return Math.max(0.8, Math.min(adjustment, 1.0));  // Range: 0.8 to 1.0
};

/**
 * Hierarchical Bayesian ranking with sample-size aware confidence bounds
 * 
 * Uses Beta-Binomial conjugate prior to estimate true win rates with confidence bounds.
 * This approach accounts for sample size uncertainty and regresses extreme values
 * toward the mean when data is limited.
 * 
 * The algorithm:
 * 1. Calculates global meta statistics (mean win rate, between-deck variance)
 * 2. Estimates Beta distribution parameters from these statistics
 * 3. For each deck, applies deck-specific dynamic z-score based on its sample size
 * 4. Updates each deck's Beta distribution with observed data (posterior)
 * 5. Calculates conservative lower confidence bound for each deck
 * 6. This lower bound becomes the basis for the rating
 * 
 * @param {Array} allData - Array of [rank, name, wins, losses, ties] for each deck
 * @returns {Array} Deck statistics with Bayesian posterior estimates
 */
const hierarchicalBayesian = (allData) => {
  const totalDecks = allData.length;
  const metaAdjustment = getMetaAdjustmentFactor(totalDecks);
  
  // Calculate basic statistics for each deck
  // Use integer game counts for Beta-Binomial conjugacy (don't fractionally adjust ties yet)
  const deckStats = allData.map(([_, __, wins, losses, ties]) => {
    const n = wins + losses + ties;
    // For initial statistics, count ties as draws (50% to each outcome)
    const effectiveWins = wins + 0.5 * ties;
    return { n, wins, losses, ties, winRate: effectiveWins / n };
  });
  
  // STEP 1: Calculate global meta statistics for Bayesian prior
  // Use total games to weight deck statistics
  const totalGames = deckStats.reduce((sum, d) => sum + d.n, 0);
  
  // Weighted mean of win rates across all decks
  const weightedMean = deckStats.reduce((sum, d) => sum + d.winRate * d.n, 0) / totalGames;
  
  // Between-deck variance: how much individual deck win rates vary from the mean
  // This measures true heterogeneity in meta (not sampling uncertainty)
  const betweenDeckVariance = deckStats.reduce((sum, d) => 
    sum + Math.pow(d.winRate - weightedMean, 2), 0) / totalDecks;
  
  // STEP 2: Estimate Beta distribution parameters from meta statistics
  // Constrain mean to valid probability range (0.01 to 0.99)
  const meanEst = Math.max(0.01, Math.min(0.99, weightedMean));
  
  // Maximum possible variance for a Beta distribution with this mean
  const maxVariance = meanEst * (1 - meanEst);
  
  // Constrain variance: use between-deck variance, capped at 85% of theoretical max
  const varEst = Math.max(0.0001, Math.min(betweenDeckVariance, maxVariance * 0.85));
  
  // Calculate Beta distribution shape parameters (alpha, beta) using method of moments
  // These represent the prior belief about the distribution of win rates
  const alphaBetaScale = (meanEst * (1 - meanEst)) / varEst - 1;
  const priorAlpha = Math.max(0.5, meanEst * alphaBetaScale);
  const priorBeta = Math.max(0.5, (1 - meanEst) * alphaBetaScale);
  
  // STEP 3: Calculate Bayesian posterior for each deck
  // Each deck gets its own z-score based on its sample size
  return allData.map(([origRank, deckName, wins, losses, ties]) => {
    const n = wins + losses + ties;
    
    // STEP 3A: Get deck-specific z-score based on this deck's sample size
    // Decks with more data get tighter confidence intervals (higher z-scores)
    const deckZScore = getDynamicZScore(n);
    
    // Apply meta-level adjustment: small metas get slightly tighter bounds
    const adjustedZ = deckZScore * metaAdjustment;
    
    // STEP 3B: Update Beta distribution with observed data (Bayesian posterior)
    // Use integer counts for proper Beta-Binomial conjugacy
    const postAlpha = priorAlpha + wins;
    const postBeta = priorBeta + losses;
    
    // Add ties as fractional updates (0.5 to each)
    // This is done after integer updates to maintain mathematical consistency
    const finalAlpha = postAlpha + 0.5 * ties;
    const finalBeta = postBeta + 0.5 * ties;
    
    // Calculate posterior mean (expected true win rate)
    const posteriorMean = finalAlpha / (finalAlpha + finalBeta);
    
    // Calculate posterior variance (uncertainty in our estimate)
    const posteriorVariance = (finalAlpha * finalBeta) / 
      ((finalAlpha + finalBeta) ** 2 * (finalAlpha + finalBeta + 1));
    
    // STEP 3C: Calculate lower confidence bound (conservative estimate)
    // Subtract z*sqrt(variance) to get the lower bound
    // Higher z-scores = tighter bounds = more conservative estimates
    const posteriorStdDev = Math.sqrt(posteriorVariance);
    const lowerBound = Math.max(0, posteriorMean - adjustedZ * posteriorStdDev);
    
    // Clamp to valid probability range
    const adjustedLowerBound = Math.min(0.99, lowerBound);
    
    return { 
      origRank, 
      deckName, 
      wins, 
      losses, 
      ties, 
      n, 
      posteriorMean,
      posteriorStdDev,
      posteriorVariance,
      zScore: adjustedZ,
      lowerBound: adjustedLowerBound
    };
  });
};

/**
 * Convert win percentage to strength score (0-180 scale)
 * A deck with 50% win rate (meta average) scores 90
 * A deck with 60% win rate scores 108, etc.
 * 
 * @param {number} winPct - Win percentage on 0-1 scale (e.g., 0.55 for 55%)
 * @returns {number} Strength score (0-180 scale)
 */
const calculateStrength = (winPct) => winPct * 180;

// Prepare data for hierarchical Bayesian calculation
const bayesianInput = enrichedDecks.map((deck, index) => [
  index + 1,  // Original rank placeholder
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
  // Based on lower confidence bound with sample-size adjustment
  // The lower bound naturally includes Bayesian shrinkage:
  // - Small samples get pulled toward meta mean (higher z-score = lower bound)
  // - Large samples get tighter bounds with higher confidence
  // This approach:
  // - Penalizes decks with limited data through conservative estimation
  // - Rewards consistent performance with large sample sizes
  // - Prevents fluky high win rates from dominating rankings
  // - Produces ratings in the expected 0-100 range (50 = meta average)
  const ratingWinRate = bayesianData.lowerBound;
  
  deck.rating = calculateStrength(ratingWinRate);
  
  // Optional: Store diagnostic information
  deck.bayesianDetails = {
    posteriorMean: bayesianData.posteriorMean,
    lowerBound: bayesianData.lowerBound,
    zScore: bayesianData.zScore,
    sampleSize: bayesianData.n,
    posteriorStdDev: bayesianData.posteriorStdDev
  };
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
  } else if (deck.rating >= 97) {
    deck.tier = 'Splus';      // Elite+
  } else if (deck.rating >= 93) {
    deck.tier = 'S';          // Elite
  } else if (deck.rating >= 90) {
    deck.tier = 'A';          // Excellent
  } else if (deck.rating >= 87) {
    deck.tier = 'B';          // Good
  } else if (deck.rating >= 84) {
    deck.tier = 'C';          // Above Average
  } else if (deck.rating >= 81) {
    deck.tier = 'D';          // Average
  } else if (deck.rating >= 78) {
    deck.tier = 'E';          // Below Average
  } else if (deck.rating >= 75) {
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
// OUTPUT RESULTS - TOP 10 DECKS
// ============================================================================

console.log('='.repeat(80));
console.log('DECK STATISTICS ANALYSIS - TOP 10 DECKS BY RATING');
console.log('='.repeat(80));
console.log();

// Sort by rank and take only top 10 decks for display
enrichedDecks
  .sort((a, b) => a.rank - b.rank)
  .slice(0, 10)
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
    console.log(`  Rating: ${deck.rating.toFixed(2)}/100+`);
    console.log(`  Tier: ${deck.tier_display}`);
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

console.log(`Note: Showing top 10 decks out of ${enrichedDecks.length} total decks analyzed.`);
console.log();

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