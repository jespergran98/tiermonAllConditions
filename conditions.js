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
  { deck_name: "Grimmsnarl Froslass", count: 1008, wins: 2806, losses: 2218, ties: 100 },
  { deck_name: "Dragapult Dusknoir", count: 986, wins: 2318, losses: 2283, ties: 88 },
  { deck_name: "Ceruledge", count: 983, wins: 2287, losses: 2184, ties: 27 },
  { deck_name: "Gardevoir", count: 872, wins: 2100, losses: 1970, ties: 134 },
  { deck_name: "Charizard Pidgeot", count: 798, wins: 1869, losses: 1789, ties: 113 },
  { deck_name: "Gardevoir Jellicent", count: 781, wins: 1812, losses: 1747, ties: 94 },
  { deck_name: "Gholdengo Lunatone", count: 705, wins: 1825, losses: 1548, ties: 62 },
  { deck_name: "Mega Absol Box", count: 500, wins: 1177, losses: 1059, ties: 68 },
  { deck_name: "Raging Bolt Ogerpon", count: 494, wins: 995, losses: 1086, ties: 37 },
  { deck_name: "Alakazam Dudunsparce", count: 451, wins: 977, losses: 1012, ties: 31 },
  { deck_name: "Tera Box", count: 407, wins: 844, losses: 877, ties: 34 },
  { deck_name: "N's Zoroark", count: 394, wins: 876, losses: 879, ties: 70 },
  { deck_name: "Mega Venusaur", count: 392, wins: 742, losses: 927, ties: 19 },
  { deck_name: "Other", count: 383, wins: 524, losses: 848, ties: 32 },
  { deck_name: "Lucario Hariyama", count: 311, wins: 604, losses: 716, ties: 11 },
  { deck_name: "Pidgeot Control", count: 302, wins: 717, losses: 643, ties: 118 },
  { deck_name: "Gholdengo", count: 268, wins: 596, losses: 625, ties: 34 },
  { deck_name: "Cynthia's Garchomp", count: 251, wins: 582, losses: 586, ties: 30 },
  { deck_name: "Gholdengo Joltik Box", count: 217, wins: 531, losses: 493, ties: 15 },
  { deck_name: "Dragapult Charizard", count: 205, wins: 474, losses: 491, ties: 25 },
  { deck_name: "Crustle", count: 185, wins: 549, losses: 381, ties: 44 },
  { deck_name: "Dragapult", count: 180, wins: 395, losses: 379, ties: 17 },
  { deck_name: "Flareon Noctowl", count: 173, wins: 378, losses: 383, ties: 14 },
  { deck_name: "Joltik Box", count: 163, wins: 439, losses: 352, ties: 13 },
  { deck_name: "Conkeldurr", count: 145, wins: 331, losses: 334, ties: 8 },
  { deck_name: "Ethan's Typhlosion", count: 140, wins: 303, losses: 320, ties: 14 },
  { deck_name: "Slowking", count: 128, wins: 322, losses: 300, ties: 13 },
  { deck_name: "Ho-Oh Armarouge", count: 120, wins: 255, losses: 267, ties: 2 },
  { deck_name: "Manectric Eelektrik", count: 116, wins: 214, losses: 254, ties: 5 },
  { deck_name: "Hydrapple Ogerpon", count: 115, wins: 229, losses: 284, ties: 3 },
  { deck_name: "Kangaskhan Bouffalant", count: 110, wins: 212, losses: 243, ties: 13 },
  { deck_name: "Froslass Munkidori", count: 97, wins: 193, losses: 226, ties: 5 },
  { deck_name: "Poison Latias", count: 93, wins: 164, losses: 224, ties: 2 },
  { deck_name: "Rocket's Mewtwo", count: 86, wins: 258, losses: 231, ties: 6 },
  { deck_name: "Kangaskhan Forretress", count: 78, wins: 142, losses: 178, ties: 4 },
  { deck_name: "Great Tusk Mill", count: 74, wins: 137, losses: 164, ties: 1 },
  { deck_name: "Hydreigon", count: 72, wins: 103, losses: 182, ties: 3 },
  { deck_name: "Archaludon", count: 69, wins: 150, losses: 143, ties: 6 },
  { deck_name: "Festival Lead", count: 66, wins: 175, losses: 154, ties: 6 },
  { deck_name: "Mega Camerupt", count: 62, wins: 70, losses: 136, ties: 3 },
  { deck_name: "Greninja", count: 61, wins: 149, losses: 139, ties: 4 },
  { deck_name: "Roaring Moon", count: 57, wins: 116, losses: 134, ties: 7 },
  { deck_name: "Chien-Pao Baxcalibur", count: 48, wins: 126, losses: 126, ties: 2 },
  { deck_name: "Mega Lucario", count: 47, wins: 80, losses: 102, ties: 3 },
  { deck_name: "Wugtrio Mill", count: 47, wins: 87, losses: 115, ties: 9 },
  { deck_name: "Palafin", count: 44, wins: 62, losses: 103, ties: 0 },
  { deck_name: "Hop's Zacian", count: 39, wins: 62, losses: 84, ties: 2 },
  { deck_name: "Farigiraf Milotic", count: 38, wins: 92, losses: 74, ties: 4 },
  { deck_name: "Feraligatr", count: 38, wins: 55, losses: 86, ties: 4 },
  { deck_name: "Ogerpon Meganium", count: 37, wins: 100, losses: 83, ties: 5 },
  { deck_name: "Okidogi", count: 32, wins: 73, losses: 77, ties: 5 },
  { deck_name: "Zoroark Crustle", count: 31, wins: 89, losses: 66, ties: 4 },
  { deck_name: "Dragapult Blaziken", count: 28, wins: 67, losses: 66, ties: 7 },
  { deck_name: "Marnie's Grimmsnarl", count: 28, wins: 47, losses: 83, ties: 0 },
  { deck_name: "Alakazam", count: 26, wins: 46, losses: 57, ties: 0 },
  { deck_name: "Flareon", count: 25, wins: 36, losses: 64, ties: 1 },
  { deck_name: "Terapagos Noctowl", count: 23, wins: 43, losses: 46, ties: 2 },
  { deck_name: "Charizard Noctowl", count: 22, wins: 50, losses: 46, ties: 3 },
  { deck_name: "Mamoswine", count: 22, wins: 31, losses: 54, ties: 1 },
  { deck_name: "Charizard", count: 20, wins: 31, losses: 43, ties: 4 },
  { deck_name: "Rocket's Porygon-Z", count: 19, wins: 41, losses: 48, ties: 0 },
  { deck_name: "Miraidon Eelektrik", count: 19, wins: 30, losses: 40, ties: 1 },
  { deck_name: "Mega Manectric", count: 19, wins: 28, losses: 50, ties: 0 },
  { deck_name: "Mega Latias", count: 17, wins: 13, losses: 41, ties: 1 },
  { deck_name: "Iron Hands Magneton", count: 16, wins: 31, losses: 33, ties: 1 },
  { deck_name: "Blaziken", count: 16, wins: 35, losses: 46, ties: 3 },
  { deck_name: "Zoroark Lucario", count: 16, wins: 25, losses: 37, ties: 1 },
  { deck_name: "Ethan's Magcargo", count: 15, wins: 47, losses: 32, ties: 0 },
  { deck_name: "Ogerpon", count: 15, wins: 24, losses: 37, ties: 2 },
  { deck_name: "Charizard Dusknoir", count: 14, wins: 28, losses: 30, ties: 1 },
  { deck_name: "Miraidon", count: 13, wins: 27, losses: 32, ties: 1 },
  { deck_name: "United Wings", count: 13, wins: 21, losses: 30, ties: 1 },
  { deck_name: "Blissey", count: 12, wins: 25, losses: 27, ties: 0 },
  { deck_name: "Okidogi", count: 11, wins: 10, losses: 26, ties: 0 },
  { deck_name: "Poison Archaludon", count: 10, wins: 17, losses: 24, ties: 0 },
  { deck_name: "Yanmega", count: 10, wins: 8, losses: 24, ties: 0 },
  { deck_name: "Iron Thorns", count: 10, wins: 6, losses: 18, ties: 1 },
  { deck_name: "Mega Kangaskhan", count: 9, wins: 17, losses: 24, ties: 1 },
  { deck_name: "Azumarill", count: 9, wins: 10, losses: 24, ties: 2 },
  { deck_name: "Tsareena", count: 9, wins: 8, losses: 23, ties: 0 },
  { deck_name: "Farigiraf Crustle", count: 8, wins: 21, losses: 14, ties: 0 },
  { deck_name: "Gholdengo Dudunsparce", count: 8, wins: 17, losses: 21, ties: 0 },
  { deck_name: "Gholdengo Dragapult", count: 8, wins: 12, losses: 18, ties: 2 },
  { deck_name: "Tyranitar", count: 7, wins: 16, losses: 16, ties: 2 },
  { deck_name: "Rocket's Spidops", count: 7, wins: 13, losses: 13, ties: 3 },
  { deck_name: "Toedscruel", count: 7, wins: 12, losses: 16, ties: 0 },
  { deck_name: "Meowscarada", count: 7, wins: 15, losses: 22, ties: 1 },
  { deck_name: "Gengar", count: 7, wins: 14, losses: 22, ties: 2 },
  { deck_name: "Aegislash", count: 6, wins: 10, losses: 12, ties: 1 },
  { deck_name: "Raging Bolt Bellibolt", count: 6, wins: 7, losses: 19, ties: 0 },
  { deck_name: "Slaking", count: 6, wins: 4, losses: 12, ties: 0 },
  { deck_name: "Hydrapple", count: 5, wins: 12, losses: 11, ties: 0 },
  { deck_name: "Archaludon Zoroark", count: 5, wins: 10, losses: 10, ties: 0 },
  { deck_name: "Dudunsparce Control", count: 5, wins: 7, losses: 10, ties: 1 },
  { deck_name: "Future Box", count: 5, wins: 6, losses: 12, ties: 0 },
  { deck_name: "Iron Valiant", count: 5, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Alakazam", count: 5, wins: 2, losses: 14, ties: 0 },
  { deck_name: "Blaziken Zoroark", count: 4, wins: 11, losses: 9, ties: 0 },
  { deck_name: "Dragapult Froslass", count: 4, wins: 10, losses: 10, ties: 0 },
  { deck_name: "Ancient Box", count: 4, wins: 8, losses: 8, ties: 0 },
  { deck_name: "Lillie's Clefairy", count: 4, wins: 9, losses: 11, ties: 0 },
  { deck_name: "Poison Terapagos", count: 4, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Future Hands", count: 4, wins: 6, losses: 10, ties: 1 },
  { deck_name: "Charizard Dragapult", count: 4, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Tinkaton", count: 4, wins: 6, losses: 11, ties: 2 },
  { deck_name: "Chien-Pao Noctowl", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Mimikyu Ogerpon", count: 4, wins: 5, losses: 12, ties: 0 },
  { deck_name: "Scovillain", count: 3, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Raging Bolt", count: 3, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Blaziken", count: 3, wins: 9, losses: 9, ties: 0 },
  { deck_name: "Espathra Xatu", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Dragapult Pidgeot", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Spidops", count: 2, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Scizor", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Forretress", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Copperajah", count: 2, wins: 3, losses: 4, ties: 1 },
  { deck_name: "Seaking Festival Lead", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Sinistcha Ogerpon", count: 2, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Espathra Froslass", count: 2, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Cinderace", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Dragapult Zoroark", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Charizard Greninja", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Roaring Moon Dudunsparce", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Venomoth Froslass", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gouging Fire", count: 2, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Incineroar", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Iono's Bellibolt", count: 2, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Heatran Metang", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Farigiraf", count: 1, wins: 3, losses: 1, ties: 1 },
  { deck_name: "Milotic", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Koraidon", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Clefairy Ogerpon", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Greninja Froslass", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Walking Wake", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Cofagrigus", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Espathra", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Klawf", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Misty's Gyarados", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Ting-Lu", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Raging Bolt Sandy Shocks", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Rocket's Nidoking", count: 1, wins: 0, losses: 2, ties: 0 }
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

// Tier display mapping - maps internal names to display text
const tierDisplayMap = {
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
    deck.tier = 'X';          // Exceptional (100+)
  } else if (deck.rating >= 96) {
    deck.tier = 'Splus';      // Elite+ (96-99)
  } else if (deck.rating >= 93) {
    deck.tier = 'S';          // Elite (93-95)
  } else if (deck.rating >= 90) {
    deck.tier = 'A';          // Excellent (90-92)
  } else if (deck.rating >= 87) {
    deck.tier = 'B';          // Good (88-89)
  } else if (deck.rating >= 85) {
    deck.tier = 'C';          // Above Average (86-87)
  } else if (deck.rating >= 83) {
    deck.tier = 'D';          // Average (84-85)
  } else if (deck.rating >= 81) {
    deck.tier = 'E';          // Below Average (82-83)
  } else if (deck.rating >= 79) {
    deck.tier = 'F';          // Poor (80-81)
  } else {
    deck.tier = 'Unranked';   // Very Poor (<80)
  }
  
  // Add display text for UI rendering
  deck.tierDisplay = tierDisplayMap[deck.tier];
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