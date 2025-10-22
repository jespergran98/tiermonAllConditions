/**
 * ============================================================================
 * DECK STATISTICS CALCULATOR
 * ============================================================================
 * 
 * Calculates comprehensive tournament deck statistics including win rates,
 * rankings, tiers, and meta impact using hierarchical Bayesian analysis.
 * 
 * Pipeline: Basic Metrics → Share Metrics → Meta Impact → Bayesian Ratings
 *           → Tiers → Rankings → Percentiles → Display Formatting
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  bayesian: {
    // WIN RATE Z-SCORE (Conservative Estimation)
    // Controls how conservative the win rate estimates are
    // • Higher values (2.5+) = More conservative, harder for decks to rank high
    // • Lower values (1.0-1.5) = Less conservative, ratings reflect raw performance more
    // • 2.0 = 95% confidence interval (standard choice)
    // Effect: A deck with 55% win rate and small sample will be rated lower with higher z-scores
    winRateZScore: 2.0,
    
    // SHARE Z-SCORE (Popularity Conservative Estimation)
    // Controls how conservative the popularity estimates are
    // • Higher values = Punishes low-sample decks more severely
    // • Lower values = Gives benefit of doubt to newer/less played decks
    // • 1.5 = ~87% confidence interval (slightly less conservative than win rate)
    // Effect: Determines how quickly a deck can rise in rankings as it gains play
    shareZScore: 1.5,
    
    // WIN RATE WEIGHT (Performance vs Popularity Balance)
    // Determines the importance of performance vs popularity in final ratings
    // • 1.0 = Pure performance-based (ignores popularity entirely)
    // • 0.5 = Equal weight to performance and popularity
    // • 0.9 = Heavily favors performance, but popularity still matters
    // Effect: With 0.9, a deck with 60% WR and 1% share beats a 52% WR with 30% share
    //         With 0.5, the popular deck would rank higher despite lower win rate
    winRateWeight: 0.9,
    shareWeight: 0.1,  // Must sum to 1.0 with winRateWeight
    
    // META ADJUSTMENT K (Dataset Size Sensitivity)
    // Controls how z-scores scale with total dataset size
    // • Higher values (300+) = Takes longer to reach full confidence, more conservative overall
    // • Lower values (50-100) = Quickly reaches full confidence, less conservative
    // • 150 = Balanced, reaches ~63% of full confidence at 150 total deck instances
    // Effect: At 50 instances with k=150, z-scores are reduced by ~28% (less conservative)
    //         At 500 instances, z-scores are at ~97% strength (nearly full conservative)
    // Formula: adjustment = 1 - e^(-totalInstances/k)
    metaAdjustmentK: 150,
    
    // SHARE PENALTY K (Low Popularity Dampening)
    // Exponentially reduces ratings for decks with very low play rates
    // • Higher values (3.0+) = Less penalty, even rare decks can rank high if they perform well
    // • Lower values (1.0-1.5) = Severe penalty, only popular decks can rank high
    // • 2.2 = Balanced, allows strong niche decks to appear but prevents outliers
    // Effect: At 0.5% share with k=2.2, rating is multiplied by ~0.67 (33% penalty)
    //         At 5% share, penalty is only ~0.01 (essentially no penalty)
    //         At 0.01% share, penalty is ~0.02 (98% penalty - almost eliminates rating)
    // Formula: penalty = 1 - e^(-k * share)
    sharePenaltyK: 2.3,

    // TIE WEIGHT (How much ties count toward wins)
    // • 0.5 = Standard, ties count as half a win
    tieWeight: 0.5,
    
    // BETA DISTRIBUTION CLAMPING
    // Prevents extreme values in beta distribution calculations
    meanMin: 0.001,
    meanMax: 0.999,
    varianceMin: 0.00001,
    varianceMaxScale: 0.9,  // Max variance as fraction of theoretical maximum
    alphaMin: 0.5,
    betaMin: 0.5,
    
    // RATING SCALE
    // Final rating is multiplied by this to get 0-100 scale
    ratingScale: 195

  },
  tiers: {
    X: 100,        // Exceptional
    Splus: 95,     // Elite+
    S: 90,         // Elite
    A: 85,         // Excellent
    B: 78,         // Good
    C: 72,         // Above Average
    D: 65,         // Average
    E: 58,         // Below Average
    F: 50          // Poor
  },
  tierDisplay: {
    'Splus': 'S+', 'X': 'X', 'S': 'S', 'A': 'A', 'B': 'B',
    'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'Unranked': 'Unranked'
  }
};

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
  { deck_name: "Arceus ex Pichu", count: 211, wins: 537, losses: 514, ties: 15 }
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculatePercentile = (value, sortedArray) => {
  const rank = sortedArray.filter(v => v < value).length;
  return (rank / sortedArray.length) * 100;
};

const formatWithK = (num) => {
  if (num < 1000) return num.toString();
  const k = num / 1000;
  if (k >= 5) return Math.floor(k) + 'k+';
  const rounded = Math.round(k * 10) / 10;
  return (rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1)) + 'k';
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// ============================================================================
// BAYESIAN ALGORITHM
// ============================================================================

const getMetaAdjustmentFactor = (totalInstances) => {
  return 1 - Math.exp(-totalInstances / CONFIG.bayesian.metaAdjustmentK);
};

const calculateSharePenalty = (share) => {
  return 1 - Math.exp(-CONFIG.bayesian.sharePenaltyK * share);
};

const calculateBetaParams = (mean, variance) => {
  const clampedMean = clamp(mean, CONFIG.bayesian.meanMin, CONFIG.bayesian.meanMax);
  const maxVar = clampedMean * (1 - clampedMean);
  const clampedVar = clamp(variance, CONFIG.bayesian.varianceMin, maxVar * CONFIG.bayesian.varianceMaxScale);
  const scale = (clampedMean * (1 - clampedMean)) / clampedVar - 1;
  
  return {
    alpha: Math.max(CONFIG.bayesian.alphaMin, clampedMean * scale),
    beta: Math.max(CONFIG.bayesian.betaMin, (1 - clampedMean) * scale)
  };
};

const hierarchicalBayesianHybrid = (allData) => {
  const totalDecks = allData.length;
  const totalInstances = allData.reduce((sum, d) => sum + d.count, 0);
  const metaAdjustment = getMetaAdjustmentFactor(totalInstances);
  
  // Calculate win rate priors
  const totalGames = allData.reduce((sum, d) => sum + d.total_matches, 0);
  const weightedWinRateMean = allData.reduce((sum, d) => 
    sum + d.adjusted_win_rate_raw * d.total_matches, 0) / totalGames;
  const winRateVariance = allData.reduce((sum, d) => 
    sum + Math.pow(d.adjusted_win_rate_raw - weightedWinRateMean, 2) * d.total_matches, 0) / totalGames;
  const winRatePrior = calculateBetaParams(weightedWinRateMean, winRateVariance);
  
  // Calculate share priors
  const weightedShareMean = allData.reduce((sum, d) => 
    sum + d.share_raw * d.count, 0) / totalInstances;
  const shareVariance = allData.reduce((sum, d) => 
    sum + Math.pow(d.share_raw - weightedShareMean, 2) * d.count, 0) / totalInstances;
  const sharePrior = calculateBetaParams(weightedShareMean, shareVariance);
  
  // Calculate posteriors for each deck
  return allData.map(deck => {
    const adjustedWRZ = CONFIG.bayesian.winRateZScore * metaAdjustment;
    const adjustedShareZ = CONFIG.bayesian.shareZScore * metaAdjustment;
    
    // Win rate posterior
    const postAlphaWR = winRatePrior.alpha + deck.wins + CONFIG.bayesian.tieWeight * deck.ties;
    const postBetaWR = winRatePrior.beta + deck.losses + CONFIG.bayesian.tieWeight * deck.ties;
    const posteriorWinRate = postAlphaWR / (postAlphaWR + postBetaWR);
    const posteriorWinRateVar = (postAlphaWR * postBetaWR) / 
      ((postAlphaWR + postBetaWR) ** 2 * (postAlphaWR + postBetaWR + 1));
    const lowerBoundWR = Math.max(0, posteriorWinRate - 
      adjustedWRZ * Math.sqrt(posteriorWinRateVar));
    
    // Share posterior
    const postAlphaShare = sharePrior.alpha + deck.count;
    const postBetaShare = sharePrior.beta + (totalInstances - deck.count);
    const posteriorShare = postAlphaShare / (postAlphaShare + postBetaShare);
    const posteriorShareVar = (postAlphaShare * postBetaShare) / 
      ((postAlphaShare + postBetaShare) ** 2 * (postAlphaShare + postBetaShare + 1));
    const lowerBoundShare = Math.max(0, posteriorShare - 
      adjustedShareZ * Math.sqrt(posteriorShareVar));
    
    // Combined metric
    const { winRateWeight: wr, shareWeight: sr } = CONFIG.bayesian;
    const combinedLowerBound = wr * lowerBoundWR + sr * lowerBoundShare;
    const combinedVariance = (wr ** 2) * posteriorWinRateVar + (sr ** 2) * posteriorShareVar;
    
    // Apply share penalty
    const sharePenalty = calculateSharePenalty(deck.share);
    const lowerBound = clamp(combinedLowerBound * sharePenalty, 0, 0.99);
    
    return {
      ...deck,
      rating: lowerBound * CONFIG.bayesian.ratingScale,
      bayesianDetails: {
        posteriorMean: wr * posteriorWinRate + sr * posteriorShare,
        lowerBound,
        lowerBoundBeforePenalty: combinedLowerBound,
        sharePenalty,
        zScoreWinRate: adjustedWRZ,
        zScoreShare: adjustedShareZ,
        sampleSize: deck.total_matches,
        deckCount: deck.count,
        posteriorStdDev: Math.sqrt(combinedVariance),
        posteriorWinRate,
        posteriorShare,
        lowerBoundWinRate: lowerBoundWR,
        lowerBoundShare: lowerBoundShare,
        winRateWeight: wr,
        shareWeight: sr
      }
    };
  });
};

// ============================================================================
// TIER ASSIGNMENT
// ============================================================================

const assignTier = (rating) => {
  for (const [tier, threshold] of Object.entries(CONFIG.tiers)) {
    if (rating >= threshold) return tier;
  }
  return 'Unranked';
};

// ============================================================================
// MAIN CALCULATION PIPELINE
// ============================================================================

const calculateDeckStatistics = (rawDecks) => {
  // Step 1: Calculate basic metrics
  const withBasics = rawDecks.map(deck => {
    const total_matches = deck.wins + deck.losses + deck.ties;
    return {
      ...deck,
      total_matches,
      win_rate: (deck.wins / total_matches) * 100,
      adjusted_win_rate: ((deck.wins + CONFIG.bayesian.tieWeight * deck.ties) / total_matches) * 100,
      adjusted_win_rate_raw: (deck.wins + CONFIG.bayesian.tieWeight * deck.ties) / total_matches,
      avg_tournament_depth: total_matches / deck.count
    };
  });
  
  // Step 2: Calculate share metrics
  const totalCount = withBasics.reduce((sum, d) => sum + d.count, 0);
  const mostPlayedCount = Math.max(...withBasics.map(d => d.count));
  const mostPlayedShare = (mostPlayedCount / totalCount) * 100;
  
  const withShares = withBasics.map(deck => ({
    ...deck,
    share: (deck.count / totalCount) * 100,
    share_raw: deck.count / totalCount,
    share_compared_to_most_played_deck: ((deck.count / totalCount) * 100) / mostPlayedShare * 100
  }));
  
  // Step 3: Calculate meta impact and apply Bayesian analysis
  const withBayesian = hierarchicalBayesianHybrid(withShares.map(deck => ({
    ...deck,
    meta_impact: deck.adjusted_win_rate * deck.share
  })));
  
  // Step 4: Assign tiers
  const withTiers = withBayesian.map(deck => ({
    ...deck,
    tier: assignTier(deck.rating),
    tier_display: CONFIG.tierDisplay[assignTier(deck.rating)]
  }));
  
  // Step 5: Calculate rankings
  const sorted = [...withTiers].sort((a, b) => b.rating - a.rating);
  sorted.forEach((deck, i) => deck.rank = i + 1);
  
  // Step 6: Calculate percentiles (create sorted arrays once)
  const metrics = {
    rating: [...sorted.map(d => d.rating)].sort((a, b) => a - b),
    count: [...sorted.map(d => d.count)].sort((a, b) => a - b),
    total_matches: [...sorted.map(d => d.total_matches)].sort((a, b) => a - b),
    win_rate: [...sorted.map(d => d.win_rate)].sort((a, b) => a - b),
    adjusted_win_rate: [...sorted.map(d => d.adjusted_win_rate)].sort((a, b) => a - b),
    avg_tournament_depth: [...sorted.map(d => d.avg_tournament_depth)].sort((a, b) => a - b),
    meta_impact: [...sorted.map(d => d.meta_impact)].sort((a, b) => a - b)
  };
  
  const withPercentiles = sorted.map(deck => ({
    ...deck,
    rating_pct: calculatePercentile(deck.rating, metrics.rating),
    count_pct: calculatePercentile(deck.count, metrics.count),
    total_matches_pct: calculatePercentile(deck.total_matches, metrics.total_matches),
    win_rate_pct: calculatePercentile(deck.win_rate, metrics.win_rate),
    adjusted_win_rate_pct: calculatePercentile(deck.adjusted_win_rate, metrics.adjusted_win_rate),
    avg_tournament_depth_pct: calculatePercentile(deck.avg_tournament_depth, metrics.avg_tournament_depth),
    meta_impact_pct: calculatePercentile(deck.meta_impact, metrics.meta_impact)
  }));
  
  // Step 7: Add display formatting
  return withPercentiles.map(deck => ({
    ...deck,
    count_rounded: formatWithK(deck.count),
    total_matches_rounded: formatWithK(deck.total_matches),
    win_rate_rounded: Math.round(deck.win_rate),
    share_rounded: Math.round(deck.share)
  }));
};

// ============================================================================
// EXECUTION & OUTPUT
// ============================================================================

const enrichedDecks = calculateDeckStatistics(decks);

console.log('='.repeat(80));
console.log('DECK STATISTICS ANALYSIS - TOP 10 DECKS BY RATING');
console.log('='.repeat(80));
console.log();

enrichedDecks.slice(0, 10).forEach(deck => {
  console.log(`Deck: ${deck.deck_name}`);
  console.log('-'.repeat(80));
  console.log('BASIC STATISTICS:');
  console.log(`  Count: ${deck.count} (rounded: ${deck.count_rounded})`);
  console.log(`  Total Matches: ${deck.total_matches} (rounded: ${deck.total_matches_rounded})`);
  console.log(`  Record: ${deck.wins}W - ${deck.losses}L - ${deck.ties}T`);
  console.log();
  console.log('PERFORMANCE METRICS:');
  console.log(`  Win Rate: ${deck.win_rate.toFixed(2)}% (rounded: ${deck.win_rate_rounded}%)`);
  console.log(`  Adjusted Win Rate: ${deck.adjusted_win_rate.toFixed(2)}%`);
  console.log(`  Avg Tournament Depth: ${deck.avg_tournament_depth.toFixed(2)}`);
  console.log();
  console.log('META STATISTICS:');
  console.log(`  Share: ${deck.share.toFixed(2)}% (rounded: ${deck.share_rounded}%)`);
  console.log(`  Share vs Most Played: ${deck.share_compared_to_most_played_deck.toFixed(2)}%`);
  console.log(`  Meta Impact: ${deck.meta_impact.toFixed(2)}`);
  console.log();
  console.log('RANKING & RATING:');
  console.log(`  Rank: #${deck.rank}`);
  console.log(`  Rating: ${deck.rating.toFixed(2)}/100+`);
  console.log(`  Tier: ${deck.tier_display}`);
  console.log();
  console.log('PERCENTILES:');
  console.log(`  Rating Percentile: ${deck.rating_pct.toFixed(1)}%`);
  console.log(`  Count Percentile: ${deck.count_pct.toFixed(1)}%`);
  console.log(`  Total Matches Percentile: ${deck.total_matches_pct.toFixed(1)}%`);
  console.log(`  Win Rate Percentile: ${deck.win_rate_pct.toFixed(1)}%`);
  console.log(`  Adjusted Win Rate Percentile: ${deck.adjusted_win_rate_pct.toFixed(1)}%`);
  console.log(`  Avg Matches Percentile: ${deck.avg_tournament_depth_pct.toFixed(1)}%`);
  console.log(`  Meta Impact Percentile: ${deck.meta_impact_pct.toFixed(1)}%`);
  console.log();
  console.log('='.repeat(80));
  console.log();
});

console.log(`Note: Showing top 10 decks out of ${enrichedDecks.length} total decks analyzed.`);

// ============================================================================
// VERIFICATION: CONFIRM ALL CONDITIONS ARE CALCULATED
// ============================================================================

const requiredConditions = [
  'deck_name', 'count', 'wins', 'losses', 'ties',
  'total_matches', 'win_rate', 'adjusted_win_rate', 'avg_tournament_depth',
  'share', 'share_compared_to_most_played_deck', 'meta_impact',
  'rating', 'tier', 'tier_display', 'rank',
  'rating_pct', 'count_pct', 'total_matches_pct', 'win_rate_pct', 'adjusted_win_rate_pct',
  'avg_tournament_depth_pct', 'meta_impact_pct',
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
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = enrichedDecks;
} else if (typeof window !== 'undefined') {
  window.enrichedDecks = enrichedDecks;
}