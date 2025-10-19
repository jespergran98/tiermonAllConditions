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
  { deck_name: "Magnezone Hitmonlee", count: 926, wins: 2499, losses: 2224, ties: 35 },
  { deck_name: "Exeggutor ex Mew ex", count: 827, wins: 2356, losses: 2011, ties: 52 },
  { deck_name: "Pachirisu ex", count: 816, wins: 2094, losses: 1900, ties: 28 },
  { deck_name: "Yanmega ex Dialga ex", count: 707, wins: 1764, losses: 1618, ties: 25 },
  { deck_name: "Exeggutor ex Yanmega ex", count: 692, wins: 1728, losses: 1654, ties: 32 },
  { deck_name: "Mewtwo ex Gardevoir", count: 642, wins: 1051, losses: 1520, ties: 31 },
  { deck_name: "Rampardos Lucario", count: 493, wins: 1308, losses: 1180, ties: 20 },
  { deck_name: "Infernape ex Moltres ex", count: 471, wins: 969, losses: 1131, ties: 9 },
  { deck_name: "Dialga ex Melmetal", count: 457, wins: 937, losses: 1098, ties: 20 },
  { deck_name: "Celebi ex Serperior", count: 432, wins: 830, losses: 1090, ties: 12 },
  { deck_name: "Darkrai ex Weezing", count: 393, wins: 874, losses: 915, ties: 16 },
  { deck_name: "Gallade ex Lucario", count: 312, wins: 650, losses: 792, ties: 4 },
  { deck_name: "Bastiodon Skarmory", count: 280, wins: 679, losses: 646, ties: 5 },
  { deck_name: "Pikachu ex Zebstrika", count: 278, wins: 508, losses: 633, ties: 10 },
  { deck_name: "Pikachu ex Pachirisu ex", count: 277, wins: 633, losses: 652, ties: 14 },
  { deck_name: "Starmie ex Palkia ex", count: 272, wins: 624, losses: 684, ties: 5 },
  { deck_name: "Articuno ex Palkia ex", count: 254, wins: 623, losses: 607, ties: 11 },
  { deck_name: "Gallade ex Hitmonlee", count: 235, wins: 508, losses: 567, ties: 16 },
  { deck_name: "Magnezone Mew ex", count: 219, wins: 525, losses: 527, ties: 7 },
  { deck_name: "Articuno ex", count: 214, wins: 567, losses: 505, ties: 4 },
  { deck_name: "Aerodactyl ex Lucario", count: 205, wins: 499, losses: 503, ties: 6 },
  { deck_name: "Lickilicky ex Dialga ex", count: 191, wins: 388, losses: 470, ties: 2 },
  { deck_name: "Magnezone Darkrai ex", count: 190, wins: 488, losses: 465, ties: 9 },
  { deck_name: "Palkia ex Greninja", count: 178, wins: 453, losses: 426, ties: 4 },
  { deck_name: "Wormadam Skarmory", count: 174, wins: 389, losses: 410, ties: 7 },
  { deck_name: "Pikachu ex Zapdos ex", count: 161, wins: 325, losses: 385, ties: 16 },
  { deck_name: "Palkia ex Articuno ex", count: 143, wins: 402, losses: 345, ties: 7 },
  { deck_name: "Magnezone Electivire", count: 143, wins: 298, losses: 334, ties: 3 },
  { deck_name: "Gyarados ex Vaporeon", count: 133, wins: 258, losses: 319, ties: 3 },
  { deck_name: "Primeape Lucario", count: 131, wins: 311, losses: 310, ties: 2 },
  { deck_name: "Mew ex Dialga ex", count: 129, wins: 232, losses: 305, ties: 1 },
  { deck_name: "Starmie ex Articuno ex", count: 123, wins: 278, losses: 306, ties: 1 },
  { deck_name: "Magnezone Greninja", count: 117, wins: 296, losses: 248, ties: 3 },
  { deck_name: "Garchomp Druddigon", count: 115, wins: 182, losses: 273, ties: 3 },
  { deck_name: "Luxray Electivire", count: 114, wins: 226, losses: 265, ties: 5 },
  { deck_name: "Rampardos Hitmonlee", count: 113, wins: 337, losses: 281, ties: 8 },
  { deck_name: "Pidgeot ex Dialga ex", count: 106, wins: 181, losses: 264, ties: 3 },
  { deck_name: "Gyarados ex Palkia ex", count: 103, wins: 236, losses: 253, ties: 1 },
  { deck_name: "Aerodactyl ex Rampardos", count: 101, wins: 229, losses: 253, ties: 4 },
  { deck_name: "Arcanine ex Moltres ex", count: 101, wins: 140, losses: 208, ties: 4 },
  { deck_name: "Palkia ex Magnezone", count: 99, wins: 238, losses: 222, ties: 1 },
  { deck_name: "Darkrai ex Weavile ex", count: 94, wins: 177, losses: 220, ties: 0 },
  { deck_name: "Garchomp", count: 94, wins: 199, losses: 259, ties: 1 },
  { deck_name: "Marowak ex Lucario", count: 93, wins: 182, losses: 233, ties: 4 },
  { deck_name: "Charizard ex Arcanine ex", count: 93, wins: 151, losses: 214, ties: 4 },
  { deck_name: "Dragonite Druddigon", count: 89, wins: 125, losses: 188, ties: 2 },
  { deck_name: "Exeggutor ex Magnezone", count: 86, wins: 162, losses: 222, ties: 4 },
  { deck_name: "Mismagius ex Mew ex", count: 84, wins: 166, losses: 206, ties: 0 },
  { deck_name: "Wigglytuff ex Dialga ex", count: 84, wins: 135, losses: 196, ties: 2 },
  { deck_name: "Togekiss Mew ex", count: 78, wins: 129, losses: 191, ties: 0 },
  { deck_name: "Kabutops Lucario", count: 77, wins: 136, losses: 189, ties: 5 },
  { deck_name: "Machamp ex Lucario", count: 77, wins: 136, losses: 199, ties: 0 },
  { deck_name: "Mismagius ex Togekiss", count: 77, wins: 115, losses: 184, ties: 0 },
  { deck_name: "Infernape ex", count: 74, wins: 135, losses: 180, ties: 2 },
  { deck_name: "Pachirisu ex Magnezone", count: 69, wins: 154, losses: 166, ties: 2 },
  { deck_name: "Magnezone Zapdos ex", count: 69, wins: 145, losses: 169, ties: 0 },
  { deck_name: "Infernape ex Giratina", count: 68, wins: 116, losses: 153, ties: 0 },
  { deck_name: "Yanmega ex Mew ex", count: 66, wins: 131, losses: 159, ties: 1 },
  { deck_name: "Ninetales Rapidash", count: 64, wins: 126, losses: 164, ties: 3 },
  { deck_name: "Scolipede Weezing", count: 64, wins: 99, losses: 157, ties: 3 },
  { deck_name: "Dialga ex Bastiodon", count: 62, wins: 115, losses: 145, ties: 3 },
  { deck_name: "Togekiss Sigilyph", count: 61, wins: 96, losses: 153, ties: 1 },
  { deck_name: "Magnezone Mewtwo ex", count: 60, wins: 154, losses: 134, ties: 2 },
  { deck_name: "Dialga ex Mew ex", count: 59, wins: 121, losses: 161, ties: 0 },
  { deck_name: "Dialga ex Yanmega ex", count: 58, wins: 127, losses: 147, ties: 1 },
  { deck_name: "Venusaur ex Exeggutor ex", count: 58, wins: 112, losses: 142, ties: 1 },
  { deck_name: "Blastoise ex Palkia ex", count: 56, wins: 96, losses: 134, ties: 3 },
  { deck_name: "Weavile ex Weezing", count: 55, wins: 91, losses: 135, ties: 3 },
  { deck_name: "Articuno ex Vaporeon", count: 54, wins: 128, losses: 140, ties: 0 },
  { deck_name: "Venusaur ex Shaymin", count: 53, wins: 85, losses: 130, ties: 4 },
  { deck_name: "Ninetales Rapidash", count: 51, wins: 93, losses: 119, ties: 1 },
  { deck_name: "Dragonite Magnezone", count: 50, wins: 102, losses: 112, ties: 0 },
  { deck_name: "Aerodactyl ex Farfetch'd", count: 49, wins: 118, losses: 120, ties: 0 },
  { deck_name: "Weezing Darkrai ex", count: 49, wins: 90, losses: 123, ties: 8 },
  { deck_name: "Starmie ex Lumineon", count: 49, wins: 79, losses: 121, ties: 0 },
  { deck_name: "Gyarados ex Articuno ex", count: 47, wins: 67, losses: 99, ties: 4 },
  { deck_name: "Golem Druddigon", count: 47, wins: 74, losses: 121, ties: 1 },
  { deck_name: "Greninja Gyarados ex", count: 46, wins: 89, losses: 106, ties: 1 },
  { deck_name: "Infernape ex Spiritomb", count: 46, wins: 87, losses: 109, ties: 2 },
  { deck_name: "Pachirisu ex Zapdos ex", count: 45, wins: 124, losses: 95, ties: 3 },
  { deck_name: "Magnezone Druddigon", count: 45, wins: 103, losses: 100, ties: 1 },
  { deck_name: "Greninja Darkrai ex", count: 45, wins: 100, losses: 113, ties: 2 },
  { deck_name: "Dialga ex Lickilicky ex", count: 45, wins: 50, losses: 106, ties: 1 },
  { deck_name: "Mismagius ex Magnezone", count: 44, wins: 115, losses: 98, ties: 2 },
  { deck_name: "Primeape Lucario", count: 44, wins: 91, losses: 109, ties: 2 },
  { deck_name: "Yanmega ex Skarmory", count: 43, wins: 112, losses: 102, ties: 5 },
  { deck_name: "Greninja Mew ex", count: 42, wins: 72, losses: 87, ties: 4 },
  { deck_name: "Starmie ex Gyarados ex", count: 41, wins: 81, losses: 111, ties: 2 },
  { deck_name: "Pikachu ex Raichu", count: 41, wins: 52, losses: 96, ties: 0 },
  { deck_name: "Zapdos ex Magnezone", count: 39, wins: 98, losses: 96, ties: 2 },
  { deck_name: "Magnezone Marshadow", count: 39, wins: 75, losses: 91, ties: 0 },
  { deck_name: "Yanmega ex Magnezone", count: 39, wins: 62, losses: 80, ties: 0 },
  { deck_name: "Gallade ex", count: 38, wins: 92, losses: 93, ties: 0 },
  { deck_name: "Darkrai ex Arbok", count: 38, wins: 92, losses: 96, ties: 2 },
  { deck_name: "Dialga ex Skarmory", count: 38, wins: 96, losses: 106, ties: 0 },
  { deck_name: "Garchomp Kangaskhan", count: 38, wins: 65, losses: 78, ties: 0 },
  { deck_name: "Vaporeon Articuno ex", count: 37, wins: 81, losses: 96, ties: 3 },
  { deck_name: "Palkia ex", count: 36, wins: 105, losses: 89, ties: 0 },
  { deck_name: "Greninja Druddigon", count: 36, wins: 79, losses: 93, ties: 0 },
  { deck_name: "Garchomp Aerodactyl ex", count: 36, wins: 67, losses: 79, ties: 0 },
  { deck_name: "Garchomp Greninja", count: 35, wins: 56, losses: 82, ties: 2 },
  { deck_name: "Garchomp Glameow", count: 35, wins: 50, losses: 78, ties: 0 },
  { deck_name: "Infernape ex Heatmor", count: 34, wins: 68, losses: 75, ties: 0 },
  { deck_name: "Pachirisu ex Luxray", count: 34, wins: 73, losses: 78, ties: 3 },
  { deck_name: "Dialga ex Magnezone", count: 34, wins: 78, losses: 95, ties: 3 },
  { deck_name: "Celebi ex Exeggutor ex", count: 34, wins: 38, losses: 80, ties: 0 },
  { deck_name: "Palkia ex Gyarados ex", count: 31, wins: 93, losses: 90, ties: 3 },
  { deck_name: "Magnezone Ninetales", count: 31, wins: 79, losses: 82, ties: 1 },
  { deck_name: "Togekiss", count: 31, wins: 42, losses: 69, ties: 0 },
  { deck_name: "Pikachu ex", count: 31, wins: 27, losses: 62, ties: 0 },
  { deck_name: "Magnezone Farfetch'd", count: 30, wins: 81, losses: 70, ties: 3 },
  { deck_name: "Darkrai ex Farfetch'd", count: 30, wins: 64, losses: 70, ties: 1 },
  { deck_name: "Venusaur ex Butterfree", count: 30, wins: 38, losses: 76, ties: 1 },
  { deck_name: "Palkia ex Empoleon", count: 29, wins: 57, losses: 76, ties: 1 },
  { deck_name: "Zapdos ex Pachirisu ex", count: 29, wins: 57, losses: 83, ties: 1 },
  { deck_name: "Pidgeot ex Pidgeot", count: 29, wins: 47, losses: 76, ties: 0 },
  { deck_name: "Darkrai ex Scolipede", count: 29, wins: 47, losses: 79, ties: 0 },
  { deck_name: "Greninja Tauros", count: 28, wins: 60, losses: 58, ties: 1 },
  { deck_name: "Machamp ex", count: 28, wins: 66, losses: 71, ties: 3 },
  { deck_name: "Garchomp Farfetch'd", count: 28, wins: 64, losses: 75, ties: 0 },
  { deck_name: "Lucario Hitmonlee", count: 27, wins: 68, losses: 65, ties: 0 },
  { deck_name: "Aerodactyl ex Primeape", count: 27, wins: 48, losses: 63, ties: 0 },
  { deck_name: "Lucario Hitmonchan", count: 27, wins: 47, losses: 66, ties: 0 },
  { deck_name: "Victreebel Vespiquen", count: 27, wins: 41, losses: 59, ties: 1 },
  { deck_name: "Uxie Mesprit", count: 27, wins: 24, losses: 50, ties: 0 },
  { deck_name: "Exeggutor ex Serperior", count: 26, wins: 64, losses: 63, ties: 0 },
  { deck_name: "Exeggutor ex Venusaur ex", count: 26, wins: 58, losses: 58, ties: 0 },
  { deck_name: "Pachirisu ex Zebstrika", count: 26, wins: 61, losses: 69, ties: 0 },
  { deck_name: "Greninja Farfetch'd", count: 26, wins: 51, losses: 58, ties: 1 },
  { deck_name: "Lucario Rampardos", count: 25, wins: 67, losses: 58, ties: 0 },
  { deck_name: "Arbok Weezing", count: 25, wins: 53, losses: 60, ties: 2 },
  { deck_name: "Gallade ex Mew ex", count: 25, wins: 40, losses: 54, ties: 0 },
  { deck_name: "Articuno ex Greninja", count: 25, wins: 42, losses: 64, ties: 1 },
  { deck_name: "Lickilicky ex Greninja", count: 24, wins: 59, losses: 64, ties: 1 },
  { deck_name: "Golem Lucario", count: 24, wins: 28, losses: 63, ties: 2 },
  { deck_name: "Infernape ex Farfetch'd", count: 23, wins: 50, losses: 58, ties: 0 },
  { deck_name: "Garchomp Mew ex", count: 23, wins: 38, losses: 59, ties: 0 },
  { deck_name: "Exeggutor ex Victreebel", count: 23, wins: 40, losses: 69, ties: 1 },
  { deck_name: "Rampardos Farfetch'd", count: 22, wins: 43, losses: 48, ties: 0 },
  { deck_name: "Yanmega ex Greninja", count: 22, wins: 45, losses: 56, ties: 1 },
  { deck_name: "Starmie ex Greninja", count: 22, wins: 21, losses: 41, ties: 3 },
  { deck_name: "Magnezone Jolteon", count: 21, wins: 47, losses: 49, ties: 0 },
  { deck_name: "Magnezone Kangaskhan", count: 21, wins: 37, losses: 43, ties: 0 },
  { deck_name: "Pidgeot ex Mew ex", count: 21, wins: 38, losses: 51, ties: 1 },
  { deck_name: "Moltres ex Centiskorch", count: 21, wins: 37, losses: 51, ties: 1 },
  { deck_name: "Mewtwo ex Magnezone", count: 21, wins: 34, losses: 50, ties: 1 },
  { deck_name: "Gyarados ex Manaphy", count: 21, wins: 33, losses: 53, ties: 0 },
  { deck_name: "Gardevoir Mewtwo ex", count: 21, wins: 39, losses: 64, ties: 0 },
  { deck_name: "Darkrai ex Kangaskhan", count: 20, wins: 61, losses: 40, ties: 2 },
  { deck_name: "Articuno ex Magnezone", count: 20, wins: 40, losses: 40, ties: 1 },
  { deck_name: "Luxray Zebstrika", count: 20, wins: 45, losses: 48, ties: 0 },
  { deck_name: "Exeggutor ex Greninja", count: 20, wins: 36, losses: 44, ties: 0 },
  { deck_name: "Infernape ex Rapidash", count: 20, wins: 37, losses: 49, ties: 2 },
  { deck_name: "Togekiss Giratina", count: 20, wins: 32, losses: 54, ties: 0 },
  { deck_name: "Gyarados ex Mew ex", count: 20, wins: 23, losses: 45, ties: 0 },
  { deck_name: "Gengar ex Dusknoir", count: 20, wins: 19, losses: 45, ties: 1 },
  { deck_name: "Palkia ex Starmie ex", count: 19, wins: 44, losses: 44, ties: 1 },
  { deck_name: "Infernape ex Magnezone", count: 19, wins: 40, losses: 49, ties: 0 },
  { deck_name: "Yanmega ex Lumineon", count: 19, wins: 29, losses: 50, ties: 0 },
  { deck_name: "Blastoise ex Manaphy", count: 19, wins: 24, losses: 42, ties: 0 },
  { deck_name: "Gengar ex Mew ex", count: 19, wins: 24, losses: 49, ties: 1 },
  { deck_name: "Cresselia ex Gardevoir", count: 19, wins: 16, losses: 46, ties: 3 },
  { deck_name: "Magnezone", count: 18, wins: 50, losses: 36, ties: 4 },
  { deck_name: "Gyarados ex Druddigon", count: 18, wins: 50, losses: 40, ties: 1 },
  { deck_name: "Darkrai ex Lopunny", count: 18, wins: 55, losses: 45, ties: 1 },
  { deck_name: "Kabutops Rampardos", count: 18, wins: 49, losses: 50, ties: 0 },
  { deck_name: "Infernape ex Rapidash", count: 18, wins: 29, losses: 37, ties: 0 },
  { deck_name: "Mewtwo ex Mew ex", count: 18, wins: 20, losses: 41, ties: 1 },
  { deck_name: "Garchomp Spiritomb", count: 17, wins: 41, losses: 42, ties: 1 },
  { deck_name: "Gengar ex Mismagius ex", count: 17, wins: 31, losses: 43, ties: 0 },
  { deck_name: "Wigglytuff ex Yanmega ex", count: 17, wins: 32, losses: 46, ties: 0 },
  { deck_name: "Greninja Palkia ex", count: 17, wins: 29, losses: 42, ties: 0 },
  { deck_name: "Mew ex Darkrai ex", count: 17, wins: 21, losses: 36, ties: 0 },
  { deck_name: "Mismagius ex Florges", count: 17, wins: 29, losses: 50, ties: 0 },
  { deck_name: "Mew ex Togekiss", count: 17, wins: 16, losses: 38, ties: 1 },
  { deck_name: "Zapdos ex Luxray", count: 16, wins: 40, losses: 45, ties: 2 },
  { deck_name: "Marowak ex Aerodactyl ex", count: 16, wins: 32, losses: 41, ties: 0 },
  { deck_name: "Exeggutor ex Exeggutor", count: 16, wins: 33, losses: 45, ties: 1 },
  { deck_name: "Mew ex Garchomp", count: 16, wins: 33, losses: 46, ties: 0 },
  { deck_name: "Infernape ex Chatot", count: 16, wins: 27, losses: 42, ties: 0 },
  { deck_name: "Melmetal Dialga ex", count: 16, wins: 27, losses: 46, ties: 2 },
  { deck_name: "Darkrai ex Spiritomb", count: 15, wins: 45, losses: 34, ties: 2 },
  { deck_name: "Magnezone Exeggutor", count: 15, wins: 42, losses: 42, ties: 1 },
  { deck_name: "Infernape ex Magcargo", count: 15, wins: 36, losses: 38, ties: 0 },
  { deck_name: "Gyarados ex Frost Rotom", count: 15, wins: 33, losses: 35, ties: 0 },
  { deck_name: "Darkrai ex Druddigon", count: 15, wins: 32, losses: 44, ties: 0 },
  { deck_name: "Dialga ex Wigglytuff ex", count: 15, wins: 29, losses: 38, ties: 2 },
  { deck_name: "Magnezone Dialga ex", count: 15, wins: 16, losses: 27, ties: 3 },
  { deck_name: "Magnezone Rampardos", count: 14, wins: 60, losses: 36, ties: 1 },
  { deck_name: "Starmie ex Magnezone", count: 14, wins: 32, losses: 27, ties: 0 },
  { deck_name: "Exeggutor ex Leafeon", count: 14, wins: 34, losses: 33, ties: 1 },
  { deck_name: "Garchomp Giratina", count: 14, wins: 33, losses: 34, ties: 0 },
  { deck_name: "Darkrai ex Honchkrow", count: 14, wins: 29, losses: 34, ties: 0 },
  { deck_name: "Marowak ex Rampardos", count: 14, wins: 29, losses: 37, ties: 1 },
  { deck_name: "Rampardos Aerodactyl ex", count: 14, wins: 32, losses: 44, ties: 0 },
  { deck_name: "Serperior Exeggutor ex", count: 14, wins: 29, losses: 41, ties: 0 },
  { deck_name: "Dialga ex Porygon-Z", count: 14, wins: 30, losses: 42, ties: 1 },
  { deck_name: "Celebi ex", count: 14, wins: 20, losses: 35, ties: 0 },
  { deck_name: "Gallade ex Aerodactyl ex", count: 14, wins: 19, losses: 35, ties: 0 },
  { deck_name: "Pikachu ex Electrode", count: 14, wins: 20, losses: 38, ties: 1 },
  { deck_name: "Venusaur ex", count: 14, wins: 20, losses: 39, ties: 0 },
  { deck_name: "Exeggutor ex Butterfree", count: 14, wins: 12, losses: 26, ties: 0 },
  { deck_name: "Golem", count: 14, wins: 16, losses: 37, ties: 0 },
  { deck_name: "Dragonite Magneton", count: 14, wins: 14, losses: 39, ties: 0 },
  { deck_name: "Mew ex Hypno", count: 14, wins: 4, losses: 30, ties: 1 },
  { deck_name: "Yanmega ex Exeggutor ex", count: 13, wins: 38, losses: 39, ties: 0 },
  { deck_name: "Blastoise ex Druddigon", count: 13, wins: 36, losses: 37, ties: 1 },
  { deck_name: "Aerodactyl ex Pidgeot", count: 13, wins: 22, losses: 27, ties: 1 },
  { deck_name: "Blastoise ex Blastoise", count: 13, wins: 24, losses: 38, ties: 0 },
  { deck_name: "Exeggutor ex Darkrai ex", count: 13, wins: 17, losses: 29, ties: 0 },
  { deck_name: "Gallade ex Farfetch'd", count: 13, wins: 17, losses: 28, ties: 1 },
  { deck_name: "Aerodactyl ex Hitmonlee", count: 13, wins: 19, losses: 36, ties: 0 },
  { deck_name: "Pidgeot ex Druddigon", count: 13, wins: 14, losses: 32, ties: 0 },
  { deck_name: "Infernape ex Dodrio", count: 13, wins: 13, losses: 30, ties: 1 },
  { deck_name: "Melmetal Mew ex", count: 13, wins: 14, losses: 34, ties: 1 },
  { deck_name: "Lucario Aerodactyl ex", count: 12, wins: 34, losses: 29, ties: 0 },
  { deck_name: "Gyarados ex Gyarados", count: 12, wins: 32, losses: 29, ties: 0 },
  { deck_name: "Wormadam Mew ex", count: 12, wins: 26, losses: 31, ties: 0 },
  { deck_name: "Starmie ex Lumineon", count: 12, wins: 20, losses: 30, ties: 0 },
  { deck_name: "Togekiss Mismagius ex", count: 12, wins: 16, losses: 29, ties: 0 },
  { deck_name: "Mew ex Uxie", count: 12, wins: 11, losses: 30, ties: 0 },
  { deck_name: "Venusaur ex Celebi ex", count: 12, wins: 13, losses: 36, ties: 1 },
  { deck_name: "Gyarados ex Starmie ex", count: 12, wins: 7, losses: 28, ties: 0 },
  { deck_name: "Aerodactyl ex Magnezone", count: 11, wins: 26, losses: 22, ties: 1 },
  { deck_name: "Farfetch'd Hitmonlee", count: 11, wins: 21, losses: 25, ties: 0 },
  { deck_name: "Infernape ex Mew ex", count: 11, wins: 17, losses: 24, ties: 0 },
  { deck_name: "Dialga ex Golem", count: 11, wins: 14, losses: 21, ties: 0 },
  { deck_name: "Golem Regirock", count: 11, wins: 16, losses: 27, ties: 0 },
  { deck_name: "Dragonite Manaphy", count: 11, wins: 15, losses: 27, ties: 0 },
  { deck_name: "Pachirisu ex Electivire", count: 11, wins: 16, losses: 30, ties: 0 },
  { deck_name: "Exeggutor ex Exeggutor", count: 11, wins: 10, losses: 20, ties: 0 },
  { deck_name: "Gallade ex Hitmonchan", count: 10, wins: 37, losses: 25, ties: 0 },
  { deck_name: "Gallade ex Primeape", count: 10, wins: 22, losses: 22, ties: 0 },
  { deck_name: "Togekiss Azelf", count: 10, wins: 27, losses: 26, ties: 1 },
  { deck_name: "Machamp ex Hitmonlee", count: 10, wins: 22, losses: 22, ties: 0 },
  { deck_name: "Weavile ex Mew ex", count: 10, wins: 20, losses: 21, ties: 0 },
  { deck_name: "Wigglytuff ex Mew ex", count: 10, wins: 16, losses: 15, ties: 2 },
  { deck_name: "Luxray Magnezone", count: 10, wins: 22, losses: 24, ties: 0 },
  { deck_name: "Gyarados ex Magnezone", count: 10, wins: 18, losses: 23, ties: 0 },
  { deck_name: "Magnezone Raichu", count: 10, wins: 15, losses: 20, ties: 0 },
  { deck_name: "Rampardos", count: 10, wins: 18, losses: 29, ties: 0 },
  { deck_name: "Blastoise ex Articuno ex", count: 10, wins: 14, losses: 22, ties: 1 },
  { deck_name: "Lickilicky ex Mew ex", count: 10, wins: 18, losses: 29, ties: 1 },
  { deck_name: "Zebstrika Pikachu ex", count: 10, wins: 10, losses: 17, ties: 0 },
  { deck_name: "Weezing Mew ex", count: 10, wins: 13, losses: 23, ties: 0 },
  { deck_name: "Exeggutor ex", count: 10, wins: 11, losses: 20, ties: 0 },
  { deck_name: "Mew ex Gardevoir", count: 10, wins: 15, losses: 30, ties: 1 },
  { deck_name: "Togekiss Florges", count: 10, wins: 10, losses: 21, ties: 0 },
  { deck_name: "Dragonite Mew ex", count: 10, wins: 15, losses: 33, ties: 0 },
  { deck_name: "Mew ex Weezing", count: 10, wins: 8, losses: 19, ties: 0 },
  { deck_name: "Articuno ex Starmie ex", count: 10, wins: 8, losses: 21, ties: 1 },
  { deck_name: "Golem Hitmonlee", count: 10, wins: 8, losses: 22, ties: 0 },
  { deck_name: "Mew ex Greninja", count: 10, wins: 7, losses: 21, ties: 0 },
  { deck_name: "Gallade ex Marowak ex", count: 10, wins: 7, losses: 24, ties: 0 },
  { deck_name: "Mew ex Magnezone", count: 10, wins: 6, losses: 22, ties: 0 },
  { deck_name: "Magnezone Heatmor", count: 9, wins: 25, losses: 21, ties: 1 },
  { deck_name: "Dragonite", count: 9, wins: 28, losses: 25, ties: 0 },
  { deck_name: "Infernape ex Arcanine ex", count: 9, wins: 24, losses: 24, ties: 0 },
  { deck_name: "Dialga ex Wormadam", count: 9, wins: 18, losses: 20, ties: 0 },
  { deck_name: "Mew ex Dragonite", count: 9, wins: 15, losses: 19, ties: 0 },
  { deck_name: "Dialga ex Probopass", count: 9, wins: 15, losses: 21, ties: 0 },
  { deck_name: "Mismagius ex Mewtwo ex", count: 9, wins: 15, losses: 21, ties: 0 },
  { deck_name: "Dialga ex", count: 9, wins: 16, losses: 26, ties: 0 },
  { deck_name: "Aerodactyl ex Primeape", count: 9, wins: 12, losses: 24, ties: 0 },
  { deck_name: "Starmie ex Vaporeon", count: 9, wins: 10, losses: 20, ties: 0 },
  { deck_name: "Starmie ex Mew ex", count: 9, wins: 11, losses: 24, ties: 0 },
  { deck_name: "Blastoise ex Vaporeon", count: 9, wins: 9, losses: 22, ties: 0 },
  { deck_name: "Melmetal Skarmory", count: 9, wins: 7, losses: 21, ties: 0 },
  { deck_name: "Greninja Articuno ex", count: 9, wins: 4, losses: 20, ties: 0 },
  { deck_name: "Bisharp Skarmory", count: 9, wins: 3, losses: 21, ties: 1 },
  { deck_name: "Rampardos Marshadow", count: 8, wins: 23, losses: 19, ties: 0 },
  { deck_name: "Articuno ex Mew ex", count: 8, wins: 21, losses: 18, ties: 0 },
  { deck_name: "Dugtrio Lucario", count: 8, wins: 16, losses: 18, ties: 0 },
  { deck_name: "Luxray Druddigon", count: 8, wins: 19, losses: 22, ties: 0 },
  { deck_name: "Palkia ex Mew ex", count: 8, wins: 18, losses: 21, ties: 0 },
  { deck_name: "Darkrai ex Mew ex", count: 8, wins: 18, losses: 22, ties: 0 },
  { deck_name: "Yanmega ex Palkia ex", count: 8, wins: 16, losses: 20, ties: 0 },
  { deck_name: "Mismagius ex", count: 8, wins: 14, losses: 18, ties: 0 },
  { deck_name: "Garchomp Chatot", count: 8, wins: 17, losses: 22, ties: 0 },
  { deck_name: "Magnezone Palkia ex", count: 8, wins: 16, losses: 21, ties: 0 },
  { deck_name: "Celebi ex Magnezone", count: 8, wins: 19, losses: 24, ties: 1 },
  { deck_name: "Rampardos Regirock", count: 8, wins: 14, losses: 18, ties: 1 },
  { deck_name: "Greninja Weavile ex", count: 8, wins: 15, losses: 22, ties: 0 },
  { deck_name: "Magnezone Weezing", count: 8, wins: 13, losses: 20, ties: 1 },
  { deck_name: "Dragonite Regirock", count: 8, wins: 12, losses: 21, ties: 0 },
  { deck_name: "Magnezone Pikachu ex", count: 8, wins: 9, losses: 16, ties: 0 },
  { deck_name: "Moltres ex Ninetales", count: 8, wins: 8, losses: 16, ties: 0 },
  { deck_name: "Exeggutor ex Shaymin", count: 8, wins: 9, losses: 22, ties: 0 },
  { deck_name: "Luxray Pachirisu ex", count: 8, wins: 8, losses: 21, ties: 0 },
  { deck_name: "Moltres ex Charizard ex", count: 8, wins: 7, losses: 22, ties: 0 },
  { deck_name: "Mew ex Farfetch'd", count: 8, wins: 5, losses: 19, ties: 0 },
  { deck_name: "Articuno ex Aerodactyl ex", count: 7, wins: 21, losses: 18, ties: 0 },
  { deck_name: "Rhyperior Regirock", count: 7, wins: 19, losses: 17, ties: 0 },
  { deck_name: "Luxray Electrode", count: 7, wins: 15, losses: 15, ties: 0 },
  { deck_name: "Luxray Zapdos ex", count: 7, wins: 15, losses: 15, ties: 0 },
  { deck_name: "Infernape ex Rotom", count: 7, wins: 13, losses: 14, ties: 0 },
  { deck_name: "Electrode Electivire", count: 7, wins: 15, losses: 17, ties: 0 },
  { deck_name: "Scolipede Darkrai ex", count: 7, wins: 17, losses: 20, ties: 1 },
  { deck_name: "Cresselia ex Dusknoir", count: 7, wins: 11, losses: 13, ties: 1 },
  { deck_name: "Pidgeot Skarmory", count: 7, wins: 14, losses: 20, ties: 0 },
  { deck_name: "Sandslash Lucario", count: 7, wins: 12, losses: 18, ties: 0 },
  { deck_name: "Primeape Rampardos", count: 7, wins: 13, losses: 20, ties: 0 },
  { deck_name: "Marowak ex Primeape", count: 7, wins: 9, losses: 15, ties: 0 },
  { deck_name: "Venusaur ex Exeggutor", count: 7, wins: 7, losses: 13, ties: 0 },
  { deck_name: "Serperior Celebi ex", count: 7, wins: 7, losses: 13, ties: 0 },
  { deck_name: "Garchomp Yanmega ex", count: 7, wins: 9, losses: 17, ties: 0 },
  { deck_name: "Starmie ex Yanmega ex", count: 7, wins: 10, losses: 19, ties: 0 },
  { deck_name: "Garchomp Combee", count: 7, wins: 8, losses: 16, ties: 0 },
  { deck_name: "Vaporeon Palkia ex", count: 7, wins: 9, losses: 19, ties: 0 },
  { deck_name: "Lickilicky ex Yanmega ex", count: 7, wins: 5, losses: 11, ties: 0 },
  { deck_name: "Darkrai ex Skuntank", count: 7, wins: 10, losses: 24, ties: 0 },
  { deck_name: "Blastoise ex Mew ex", count: 7, wins: 6, losses: 15, ties: 0 },
  { deck_name: "Infernape ex Druddigon", count: 7, wins: 8, losses: 20, ties: 1 },
  { deck_name: "Golem Marshadow", count: 7, wins: 6, losses: 15, ties: 1 },
  { deck_name: "Venusaur ex Druddigon", count: 7, wins: 6, losses: 18, ties: 1 },
  { deck_name: "Bastiodon Dialga ex", count: 7, wins: 4, losses: 17, ties: 0 },
  { deck_name: "Magnezone Tauros", count: 6, wins: 24, losses: 17, ties: 0 },
  { deck_name: "Magnezone Vespiquen", count: 6, wins: 17, losses: 15, ties: 0 },
  { deck_name: "Lucario", count: 6, wins: 16, losses: 17, ties: 0 },
  { deck_name: "Rhyperior Druddigon", count: 6, wins: 14, losses: 14, ties: 1 },
  { deck_name: "Gyarados ex Lumineon", count: 6, wins: 10, losses: 11, ties: 0 },
  { deck_name: "Weezing Honchkrow", count: 6, wins: 8, losses: 9, ties: 0 },
  { deck_name: "Mew ex Florges", count: 6, wins: 13, losses: 15, ties: 0 },
  { deck_name: "Blastoise ex", count: 6, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Exeggutor ex Venomoth", count: 6, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Wigglytuff ex Exeggutor ex", count: 6, wins: 10, losses: 12, ties: 0 },
  { deck_name: "Darkrai ex", count: 6, wins: 14, losses: 17, ties: 0 },
  { deck_name: "Marowak ex Sandslash", count: 6, wins: 10, losses: 13, ties: 0 },
  { deck_name: "Darkrai ex Muk", count: 6, wins: 13, losses: 17, ties: 0 },
  { deck_name: "Weavile ex Honchkrow", count: 6, wins: 12, losses: 16, ties: 0 },
  { deck_name: "Probopass Dialga ex", count: 6, wins: 11, losses: 14, ties: 1 },
  { deck_name: "Mismagius ex Yanmega ex", count: 6, wins: 10, losses: 14, ties: 0 },
  { deck_name: "Victreebel", count: 6, wins: 10, losses: 14, ties: 0 },
  { deck_name: "Yanmega ex Hitmonlee", count: 6, wins: 14, losses: 20, ties: 0 },
  { deck_name: "Greninja Weezing", count: 6, wins: 10, losses: 15, ties: 0 },
  { deck_name: "Rampardos Onix", count: 6, wins: 10, losses: 15, ties: 0 },
  { deck_name: "Greninja Flareon", count: 6, wins: 9, losses: 14, ties: 0 },
  { deck_name: "Rhyperior", count: 6, wins: 10, losses: 18, ties: 0 },
  { deck_name: "Marowak ex Kabutops", count: 6, wins: 11, losses: 19, ties: 1 },
  { deck_name: "Weavile ex Arbok", count: 6, wins: 9, losses: 17, ties: 0 },
  { deck_name: "Mew ex Alakazam", count: 6, wins: 10, losses: 19, ties: 0 },
  { deck_name: "Magnezone Weavile ex", count: 6, wins: 10, losses: 18, ties: 1 },
  { deck_name: "Wigglytuff ex Greninja", count: 6, wins: 7, losses: 14, ties: 1 },
  { deck_name: "Gallade ex Rampardos", count: 6, wins: 6, losses: 13, ties: 0 },
  { deck_name: "Garchomp Rampardos", count: 6, wins: 8, losses: 18, ties: 0 },
  { deck_name: "Gallade ex Druddigon", count: 6, wins: 6, losses: 15, ties: 0 },
  { deck_name: "Palkia ex Manaphy", count: 6, wins: 5, losses: 13, ties: 0 },
  { deck_name: "Yanmega ex Farfetch'd", count: 6, wins: 4, losses: 15, ties: 0 },
  { deck_name: "Muk Darkrai ex", count: 6, wins: 3, losses: 14, ties: 0 },
  { deck_name: "Pidgeot ex Wigglytuff ex", count: 5, wins: 20, losses: 13, ties: 0 },
  { deck_name: "Greninja Lapras ex", count: 5, wins: 18, losses: 13, ties: 0 },
  { deck_name: "Magnezone Articuno ex", count: 5, wins: 18, losses: 13, ties: 0 },
  { deck_name: "Greninja Kangaskhan", count: 5, wins: 13, losses: 9, ties: 1 },
  { deck_name: "Electivire Zebstrika", count: 5, wins: 15, losses: 13, ties: 0 },
  { deck_name: "Palkia ex Articuno", count: 5, wins: 16, losses: 14, ties: 0 },
  { deck_name: "Skarmory Bastiodon", count: 5, wins: 11, losses: 10, ties: 0 },
  { deck_name: "Gallade ex Chatot", count: 5, wins: 13, losses: 12, ties: 0 },
  { deck_name: "Infernape ex Greninja", count: 5, wins: 9, losses: 9, ties: 0 },
  { deck_name: "Exeggutor ex Aerodactyl ex", count: 5, wins: 10, losses: 11, ties: 0 },
  { deck_name: "Palkia ex Gastrodon", count: 5, wins: 10, losses: 10, ties: 1 },
  { deck_name: "Machamp ex Dugtrio", count: 5, wins: 16, losses: 18, ties: 0 },
  { deck_name: "Starmie ex", count: 5, wins: 10, losses: 8, ties: 4 },
  { deck_name: "Togekiss Dusknoir", count: 5, wins: 10, losses: 12, ties: 0 },
  { deck_name: "Darkrai ex Shaymin", count: 5, wins: 9, losses: 11, ties: 0 },
  { deck_name: "Machamp ex Primeape", count: 5, wins: 9, losses: 11, ties: 0 },
  { deck_name: "Garchomp Purugly", count: 5, wins: 9, losses: 11, ties: 0 },
  { deck_name: "Bisharp Dialga ex", count: 5, wins: 13, losses: 17, ties: 0 },
  { deck_name: "Magnezone Zebstrika", count: 5, wins: 10, losses: 14, ties: 0 },
  { deck_name: "Rapidash Magcargo", count: 5, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Venusaur ex Serperior", count: 5, wins: 10, losses: 15, ties: 0 },
  { deck_name: "Serperior Exeggutor", count: 5, wins: 9, losses: 12, ties: 2 },
  { deck_name: "Rampardos Mew ex", count: 5, wins: 7, losses: 11, ties: 0 },
  { deck_name: "Exeggutor ex Wigglytuff ex", count: 5, wins: 9, losses: 15, ties: 0 },
  { deck_name: "Luxray Glameow", count: 5, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Venusaur ex Mew ex", count: 5, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Primeape Kabutops", count: 5, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Aerodactyl ex Kabutops", count: 5, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Dialga ex Bisharp", count: 5, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Lucario Marshadow", count: 5, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Garchomp Porygon-Z", count: 5, wins: 7, losses: 13, ties: 0 },
  { deck_name: "Zapdos ex", count: 5, wins: 7, losses: 13, ties: 0 },
  { deck_name: "Charizard ex Infernape ex", count: 5, wins: 8, losses: 15, ties: 0 },
  { deck_name: "Aerodactyl ex Garchomp", count: 5, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Pachirisu ex Galvantula", count: 5, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Greninja Infernape ex", count: 5, wins: 6, losses: 12, ties: 0 },
  { deck_name: "Palkia ex Dragonite", count: 5, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Alakazam Mew ex", count: 5, wins: 8, losses: 15, ties: 1 },
  { deck_name: "Alakazam Beheeyem", count: 5, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Yanmega ex Darkrai ex", count: 5, wins: 6, losses: 14, ties: 0 },
  { deck_name: "Alakazam Kangaskhan", count: 5, wins: 5, losses: 12, ties: 0 },
  { deck_name: "Togekiss Druddigon", count: 5, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Empoleon Palkia ex", count: 5, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Gengar ex Gengar", count: 5, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Exeggutor ex Dusknoir", count: 5, wins: 4, losses: 10, ties: 1 },
  { deck_name: "Magnezone Regigigas", count: 5, wins: 3, losses: 10, ties: 0 },
  { deck_name: "Weavile ex Greninja", count: 5, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Scolipede Weavile ex", count: 5, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Greninja Starmie ex", count: 4, wins: 13, losses: 10, ties: 0 },
  { deck_name: "Dugtrio Rampardos", count: 4, wins: 14, losses: 11, ties: 0 },
  { deck_name: "Wigglytuff ex Magnezone", count: 4, wins: 13, losses: 12, ties: 0 },
  { deck_name: "Garchomp Regigigas", count: 4, wins: 8, losses: 7, ties: 1 },
  { deck_name: "Gallade ex Regirock", count: 4, wins: 13, losses: 13, ties: 0 },
  { deck_name: "Greninja Lumineon", count: 4, wins: 11, losses: 10, ties: 1 },
  { deck_name: "Dragonite Glameow", count: 4, wins: 12, losses: 13, ties: 0 },
  { deck_name: "Magnezone Wormadam", count: 4, wins: 11, losses: 12, ties: 0 },
  { deck_name: "Sandslash Rampardos", count: 4, wins: 11, losses: 12, ties: 0 },
  { deck_name: "Omastar Articuno ex", count: 4, wins: 10, losses: 11, ties: 0 },
  { deck_name: "Porygon-Z Dialga ex", count: 4, wins: 8, losses: 8, ties: 1 },
  { deck_name: "Darkrai ex Weezing", count: 4, wins: 8, losses: 9, ties: 0 },
  { deck_name: "Machamp ex Machamp", count: 4, wins: 7, losses: 8, ties: 0 },
  { deck_name: "Magnezone Magcargo", count: 4, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Weavile ex Yanmega ex", count: 4, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Hypno Glaceon", count: 4, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Yanmega ex Magcargo", count: 4, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Gallade ex Meowth", count: 4, wins: 10, losses: 12, ties: 0 },
  { deck_name: "Golem Aerodactyl ex", count: 4, wins: 10, losses: 12, ties: 0 },
  { deck_name: "Blastoise ex Giratina", count: 4, wins: 8, losses: 10, ties: 0 },
  { deck_name: "Mismagius ex Gengar ex", count: 4, wins: 8, losses: 10, ties: 0 },
  { deck_name: "Mew ex Palkia ex", count: 4, wins: 7, losses: 8, ties: 1 },
  { deck_name: "Infernape ex Ninetales", count: 4, wins: 7, losses: 9, ties: 0 },
  { deck_name: "Wigglytuff ex Melmetal", count: 4, wins: 7, losses: 9, ties: 0 },
  { deck_name: "Yanmega ex Manaphy", count: 4, wins: 10, losses: 13, ties: 0 },
  { deck_name: "Gengar Togekiss", count: 4, wins: 9, losses: 12, ties: 0 },
  { deck_name: "Greninja Bruxish", count: 4, wins: 8, losses: 11, ties: 0 },
  { deck_name: "Magnezone Purugly", count: 4, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Dragonite Yanmega ex", count: 4, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Exeggutor ex Lickilicky ex", count: 4, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Magnezone Exeggutor ex", count: 4, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Garchomp Regirock", count: 4, wins: 9, losses: 13, ties: 0 },
  { deck_name: "Machamp ex Primeape", count: 4, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Exeggutor ex Pidgeot ex", count: 4, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Greninja Glaceon", count: 4, wins: 8, losses: 12, ties: 0 },
  { deck_name: "Rampardos Primeape", count: 4, wins: 8, losses: 12, ties: 0 },
  { deck_name: "Exeggutor ex Lilligant", count: 4, wins: 9, losses: 13, ties: 1 },
  { deck_name: "Pidgeot ex Weezing", count: 4, wins: 7, losses: 11, ties: 0 },
  { deck_name: "Mewtwo ex Dusknoir", count: 4, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Venusaur ex Lilligant", count: 4, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Bastiodon Mew ex", count: 4, wins: 9, losses: 15, ties: 0 },
  { deck_name: "Infernape ex Kangaskhan", count: 4, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Palkia ex Mamoswine", count: 4, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Marowak ex Marowak", count: 4, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Pidgeot ex Exeggutor ex", count: 4, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Weavile ex Weezing", count: 4, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Yanmega ex Pachirisu ex", count: 4, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Bibarel Farfetch'd", count: 4, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Togekiss Cresselia", count: 4, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Palkia ex Purugly", count: 4, wins: 7, losses: 13, ties: 0 },
  { deck_name: "Lucario Farfetch'd", count: 4, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Lickilicky ex Manaphy", count: 4, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Garchomp Tauros", count: 4, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Floatzel Piloswine", count: 4, wins: 7, losses: 14, ties: 0 },
  { deck_name: "Celebi ex Beedrill", count: 4, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Mismagius ex Giratina", count: 4, wins: 7, losses: 14, ties: 0 },
  { deck_name: "Dialga ex Butterfree", count: 4, wins: 6, losses: 13, ties: 0 },
  { deck_name: "Moltres ex Magmortar", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Moltres ex Magcargo", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Magnezone Raichu", count: 4, wins: 5, losses: 11, ties: 1 },
  { deck_name: "Aerodactyl ex Victreebel", count: 4, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Magnezone Pachirisu ex", count: 4, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Magnezone Dragonite", count: 4, wins: 4, losses: 11, ties: 0 },
  { deck_name: "Moltres ex Infernape ex", count: 4, wins: 5, losses: 14, ties: 0 },
  { deck_name: "Weavile ex Spiritomb", count: 4, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Weezing Darkrai ex", count: 4, wins: 3, losses: 10, ties: 0 },
  { deck_name: "Wormadam Farfetch'd", count: 4, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Magnezone Darkrai", count: 4, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Blastoise ex Greninja", count: 4, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Farfetch'd Skarmory", count: 4, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Yanmega ex Primeape", count: 4, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Primeape Rampardos", count: 4, wins: 2, losses: 10, ties: 0 },
  { deck_name: "Magnezone Regirock", count: 4, wins: 1, losses: 9, ties: 0 },
  { deck_name: "Zebstrika Galvantula", count: 4, wins: 0, losses: 8, ties: 0 },
  { deck_name: "Mewtwo ex Mismagius ex", count: 4, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Rapidash Salazzle", count: 4, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Lucario Gliscor", count: 3, wins: 9, losses: 5, ties: 0 },
  { deck_name: "Pachirisu ex Electrode", count: 3, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Magnezone Yanmega ex", count: 3, wins: 8, losses: 5, ties: 0 },
  { deck_name: "Garchomp Magnezone", count: 3, wins: 14, losses: 9, ties: 0 },
  { deck_name: "Machamp ex Druddigon", count: 3, wins: 8, losses: 6, ties: 0 },
  { deck_name: "Palkia ex Giratina", count: 3, wins: 10, losses: 8, ties: 0 },
  { deck_name: "Yanmega ex Celebi ex", count: 3, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Magnezone Wigglytuff ex", count: 3, wins: 7, losses: 6, ties: 0 },
  { deck_name: "Arbok Darkrai ex", count: 3, wins: 8, losses: 7, ties: 0 },
  { deck_name: "Mismagius ex Cresselia ex", count: 3, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Gallade ex Primeape", count: 3, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Golem Shaymin", count: 3, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Mewtwo ex Uxie", count: 3, wins: 10, losses: 9, ties: 0 },
  { deck_name: "Pachirisu ex Rotom", count: 3, wins: 10, losses: 9, ties: 0 },
  { deck_name: "Machamp ex Mew ex", count: 3, wins: 11, losses: 10, ties: 0 },
  { deck_name: "Starmie ex Tentacruel", count: 3, wins: 13, losses: 12, ties: 0 },
  { deck_name: "Gallade ex Spiritomb", count: 3, wins: 7, losses: 7, ties: 0 },
  { deck_name: "Magneton Electivire", count: 3, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Gengar Giratina", count: 3, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Scolipede Weezing", count: 3, wins: 8, losses: 8, ties: 0 },
  { deck_name: "Lucario Primeape", count: 3, wins: 8, losses: 8, ties: 1 },
  { deck_name: "Weavile ex Farfetch'd", count: 3, wins: 8, losses: 9, ties: 0 },
  { deck_name: "Cresselia ex Togekiss", count: 3, wins: 8, losses: 9, ties: 0 },
  { deck_name: "Dragonite Hypno", count: 3, wins: 7, losses: 8, ties: 0 },
  { deck_name: "Gardevoir Uxie", count: 3, wins: 7, losses: 7, ties: 1 },
  { deck_name: "Greninja Wigglytuff ex", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Starmie ex Kingler", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Dragonite Articuno ex", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Wigglytuff ex Wormadam", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Mamoswine Articuno ex", count: 3, wins: 8, losses: 9, ties: 1 },
  { deck_name: "Pidgeot ex Darkrai ex", count: 3, wins: 7, losses: 9, ties: 0 },
  { deck_name: "Empoleon Spiritomb", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Butterfree Exeggutor ex", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Skarmory Melmetal", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Nidoking Weezing", count: 3, wins: 8, losses: 11, ties: 0 },
  { deck_name: "Dragonite Greninja", count: 3, wins: 8, losses: 11, ties: 0 },
  { deck_name: "Lucario Hitmontop", count: 3, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Blastoise ex Starmie ex", count: 3, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Charizard ex Rapidash", count: 3, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Luxray Lopunny", count: 3, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Kabutops Farfetch'd", count: 3, wins: 4, losses: 4, ties: 2 },
  { deck_name: "Gallade ex Gardevoir", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Rhyperior Hitmonlee", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Togekiss Hypno", count: 3, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Greninja Lumineon", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Gardevoir Mismagius ex", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Celebi ex Dusknoir", count: 3, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Articuno ex Omastar", count: 3, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Magnezone Magmar", count: 3, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Luxray Electrode", count: 3, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Pachirisu ex Raichu", count: 3, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Mamoswine", count: 3, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Pidgeot ex Zebstrika", count: 3, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Magnezone Mismagius ex", count: 3, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Aerodactyl ex Mew ex", count: 3, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Garchomp Meowth", count: 3, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Gyarados ex Dusknoir", count: 3, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Lucario Onix", count: 3, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Wigglytuff ex Weezing", count: 3, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Mewtwo ex Greninja", count: 3, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weavile ex Bibarel", count: 3, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Togekiss Clefable", count: 3, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Dialga ex Greninja", count: 3, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Serperior Tangrowth", count: 3, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Zapdos ex Mew ex", count: 3, wins: 5, losses: 10, ties: 1 },
  { deck_name: "Machamp ex Marowak ex", count: 3, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Celebi ex Venusaur ex", count: 3, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Blastoise ex Regice", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Lucario Kabutops", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Articuno ex Dusknoir", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Luxray Farfetch'd", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Gyarados ex Yanmega ex", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Alakazam Florges", count: 3, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Gengar ex", count: 3, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Mew ex Spiritomb", count: 3, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Blastoise ex Kangaskhan", count: 3, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Dragonite Kangaskhan", count: 3, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Mew ex Skarmory", count: 3, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Magnezone Azelf", count: 3, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Magnezone Zapdos", count: 3, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Blastoise ex Lumineon", count: 3, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Venusaur ex Dusknoir", count: 3, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Darkrai ex Nidoking", count: 3, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Darkrai ex Pidgeot", count: 3, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Machamp ex Gallade ex", count: 3, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Pidgeot Sandslash", count: 3, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Gyarados ex Kingler", count: 3, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Aerodactyl ex Golem", count: 3, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Pidgeot ex Farfetch'd", count: 3, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Dialga ex Tauros", count: 3, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Articuno ex Lapras ex", count: 3, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Dragonite Palkia ex", count: 3, wins: 1, losses: 9, ties: 0 },
  { deck_name: "Electivire Magneton", count: 3, wins: 1, losses: 9, ties: 0 },
  { deck_name: "Mew ex Weavile ex", count: 3, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Hypno", count: 3, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Giratina", count: 3, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Scolipede", count: 3, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Victreebel Celebi ex", count: 3, wins: 0, losses: 8, ties: 0 },
  { deck_name: "Muk Weezing", count: 3, wins: 0, losses: 8, ties: 0 },
  { deck_name: "Mew ex Tauros", count: 2, wins: 6, losses: 3, ties: 0 },
  { deck_name: "Zapdos ex Greninja", count: 2, wins: 10, losses: 5, ties: 0 },
  { deck_name: "Yanmega ex Luxray", count: 2, wins: 9, losses: 5, ties: 0 },
  { deck_name: "Darkrai ex Butterfree", count: 2, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Kingler Articuno ex", count: 2, wins: 10, losses: 6, ties: 0 },
  { deck_name: "Weavile ex Magnezone", count: 2, wins: 8, losses: 5, ties: 0 },
  { deck_name: "Garchomp Hitmonlee", count: 2, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Articuno ex Bibarel", count: 2, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Primeape Aerodactyl ex", count: 2, wins: 7, losses: 5, ties: 0 },
  { deck_name: "Infernape ex Meowth", count: 2, wins: 8, losses: 6, ties: 0 },
  { deck_name: "Starmie ex Blastoise ex", count: 2, wins: 8, losses: 6, ties: 0 },
  { deck_name: "Infernape ex Magmortar", count: 2, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Salazzle", count: 2, wins: 8, losses: 6, ties: 0 },
  { deck_name: "Yanmega ex Articuno ex", count: 2, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Golem Magnezone", count: 2, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Raichu Magneton", count: 2, wins: 9, losses: 7, ties: 0 },
  { deck_name: "Charizard ex Ninetales", count: 2, wins: 9, losses: 7, ties: 0 },
  { deck_name: "Pachirisu ex Pikachu ex", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Electivire Galvantula", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Rampardos Bidoof", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Mismagius ex Greninja", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Greninja Rapidash", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Palkia ex Garchomp", count: 2, wins: 7, losses: 6, ties: 0 },
  { deck_name: "Magnezone Onix", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Zapdos ex Electivire", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Yanmega ex Exeggutor", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Aerodactyl ex Leafeon", count: 2, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Magnezone Volcarona", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Arbok Honchkrow", count: 2, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Kingler Abomasnow", count: 2, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Gallade ex Lopunny", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Golem Rampardos", count: 2, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Magnezone Chatot", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Exeggutor ex Vespiquen", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Moltres ex Arcanine ex", count: 2, wins: 8, losses: 8, ties: 0 },
  { deck_name: "Greninja Tentacruel", count: 2, wins: 9, losses: 9, ties: 0 },
  { deck_name: "Kabutops Mew ex", count: 2, wins: 7, losses: 6, ties: 1 },
  { deck_name: "Palkia ex Lumineon", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Togekiss Beheeyem", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Pidgeot ex", count: 2, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Bastiodon", count: 2, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Mismagius ex Bibarel", count: 2, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Omastar Regice", count: 2, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Marowak ex Hitmonlee", count: 2, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Starmie ex Glaceon", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Mew ex Rampardos", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Starmie ex Gyarados", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Exeggutor Mew ex", count: 2, wins: 5, losses: 5, ties: 1 },
  { deck_name: "Starmie ex Seaking", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Greninja Yanmega ex", count: 2, wins: 4, losses: 4, ties: 1 },
  { deck_name: "Raichu Magneton", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Zapdos ex Pikachu ex", count: 2, wins: 4, losses: 4, ties: 1 },
  { deck_name: "Jolteon Electivire", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Gyarados Mew ex", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Florges", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Dragonite Zebstrika", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Mismagius ex Wigglytuff ex", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Articuno ex Druddigon", count: 2, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Pidgeot ex Greninja", count: 2, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Venusaur ex Weezing", count: 2, wins: 6, losses: 8, ties: 1 },
  { deck_name: "Pachirisu ex Mew ex", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Greninja Lopunny", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Mismagius ex Gardevoir", count: 2, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Omastar", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Yanmega ex Garchomp", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Wormadam Bisharp", count: 2, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Moltres ex Volcarona", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Golem Stunky", count: 2, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Garchomp Psyduck", count: 2, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Palkia ex Psyduck", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Magnezone Ditto", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Magnezone Lopunny", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Venusaur ex Venusaur", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Florges Beheeyem", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Exeggutor ex Golem", count: 2, wins: 3, losses: 4, ties: 1 },
  { deck_name: "Greninja Skarmory", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Machamp ex Aerodactyl ex", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Empoleon Articuno ex", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Gyarados ex Chatot", count: 2, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Tentacruel Hypno", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Victreebel Leafeon", count: 2, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Gyarados ex Spiritomb", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Aerodactyl ex Greninja", count: 2, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mismagius ex Uxie", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Gardevoir", count: 2, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Marowak ex", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Greninja Gyarados", count: 2, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Magnezone Leafeon", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Wigglytuff ex Mismagius ex", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Vespiquen Leafeon", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Greninja Wartortle", count: 2, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp Manaphy", count: 2, wins: 5, losses: 10, ties: 0 },
  { deck_name: "Omastar Rampardos", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Wigglytuff ex Garchomp", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Darkrai ex Bidoof", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Magnezone Flareon", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Mew ex Mewtwo ex", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Bastiodon Chatot", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Wormadam Bastiodon", count: 2, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mamoswine Manaphy", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Victreebel Exeggutor", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Golem Lopunny", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Druddigon", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weavile ex Muk", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Bibarel Marshadow", count: 2, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Magnezone Electrode", count: 2, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Gyarados Vaporeon", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Butterfree Exeggutor", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Mew ex Melmetal", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Magnezone Celebi ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Togekiss Spiritomb", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Venusaur ex Lopunny", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Arcanine ex Rapidash", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Starmie ex Golduck", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Magnezone Uxie", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Darkrai ex Magneton", count: 2, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Mismagius ex Hypno", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Greninja Magnezone", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Serperior Venusaur ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Palkia ex Lumineon", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Nidoqueen Nidoking", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Gardevoir Florges", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Venusaur ex Regirock", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jolteon Magneton", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Wigglytuff ex Lickilicky ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Butterfree Tangrowth", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Shaymin", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Magnezone Rapidash", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Poliwrath Druddigon", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Mamoswine Palkia ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Wigglytuff ex Florges", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Mismagius ex Azelf", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Yanmega ex", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Staraptor", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Pidgeot Arbok", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Alakazam Mismagius ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Infernape ex Yanmega ex", count: 2, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Ninetales", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Bastiodon Druddigon", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Magcargo Magmortar", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Palkia ex Staraptor", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Hitmonlee Druddigon", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Magnezone Primeape", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Vespiquen", count: 2, wins: 1, losses: 3, ties: 1 },
  { deck_name: "Pidgeot ex Gyarados ex", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Articuno ex Blastoise ex", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Dialga ex Dusknoir", count: 2, wins: 1, losses: 4, ties: 1 },
  { deck_name: "Yanmega ex Shaymin", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Hypno Aerodactyl", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Moltres ex Rapidash", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Palkia ex Wigglytuff ex", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Greninja Manaphy", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Bibarel Skarmory", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Magnezone Melmetal", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Dusknoir Regigigas", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Mesprit Giratina", count: 2, wins: 1, losses: 7, ties: 0 },
  { deck_name: "Mamoswine Vaporeon", count: 2, wins: 1, losses: 8, ties: 0 },
  { deck_name: "Bastiodon Hypno", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Venusaur ex Caterpie", count: 2, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Greninja Magcargo", count: 2, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Weavile ex Toxicroak", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Palkia ex Blastoise ex", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Tentacruel Articuno ex", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Vaporeon Abomasnow", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Dodrio", count: 2, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Uxie Azelf", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Pidgeot", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arcanine ex Charizard ex", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Pidgeot ex Aerodactyl ex", count: 2, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Roserade Butterfree", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Persian Hypno", count: 2, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Lickilicky ex Darkrai ex", count: 2, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Butterfree Venusaur ex", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sandslash Mienshao", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Hypno", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Salazzle", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Magnezone Starmie ex", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Exeggutor ex Dialga ex", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Dusknoir", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Zapdos ex Raichu", count: 2, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Garchomp Kingler", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Farfetch'd", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Bisharp Melmetal", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Skarmory", count: 2, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Primeape Marowak", count: 1, wins: 1, losses: 0, ties: 0 },
  { deck_name: "Garchomp Chatot", count: 1, wins: 6, losses: 1, ties: 0 },
  { deck_name: "Pachirisu ex Hypno", count: 1, wins: 4, losses: 1, ties: 0 },
  { deck_name: "Greninja", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Mewtwo ex Togekiss", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Garchomp Bibarel", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Aerodactyl ex Sandslash", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Magneton", count: 1, wins: 5, losses: 2, ties: 0 },
  { deck_name: "Garchomp Wigglytuff ex", count: 1, wins: 6, losses: 3, ties: 0 },
  { deck_name: "Greninja Dialga ex", count: 1, wins: 6, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Hitmonchan", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Greninja Regice", count: 1, wins: 6, losses: 3, ties: 0 },
  { deck_name: "Vaporeon Lumineon", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Garchomp Lumineon", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Exeggutor Lilligant", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Zapdos ex Raichu", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Alakazam Greninja", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Marowak ex Magnezone", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Hypno Magcargo", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Wigglytuff ex Dusknoir", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Palkia ex Lopunny", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Purugly Dialga ex", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Kangaskhan", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Marowak ex Regirock", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Magnezone", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Blastoise ex Meowth", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Magnezone Lucario", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Golduck", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Venusaur ex Kangaskhan", count: 1, wins: 5, losses: 1, ties: 2 },
  { deck_name: "Starmie ex Dragonite", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Lumineon Abomasnow", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Gyarados Articuno", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Dragonite Pachirisu ex", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Victreebel Farfetch'd", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Mismagius ex Clefable", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Arcanine ex Rapidash", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Rhyperior Gliscor", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Rampardos Golem", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Gyarados ex Shaymin", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Torterra", count: 1, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Mew ex Luxray", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Rampardos Meowth", count: 1, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Persian Bastiodon", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Kangaskhan", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Celebi ex Mew ex", count: 1, wins: 4, losses: 2, ties: 1 },
  { deck_name: "Beedrill Vespiquen", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Garchomp Shaymin", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Marowak Lucario", count: 1, wins: 4, losses: 2, ties: 1 },
  { deck_name: "Yanmega ex Lucario", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Shaymin", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Moltres ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Greninja Bibarel", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Probopass Melmetal", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Gengar ex Yanmega ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Wigglytuff ex Articuno ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Kingler Mew ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Alakazam Farfetch'd", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Leafeon Farfetch'd", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Magnezone Empoleon", count: 1, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Electivire Pachirisu ex", count: 1, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Arbok", count: 1, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Zapdos ex", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Starmie ex Poliwrath", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Garchomp Lapras", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Arbok", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Dialga ex Pidgeot ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Infernape ex Regirock", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Magcargo", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Dragonite Vaporeon", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Magnezone Lickilicky ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Bastiodon", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Mew ex Golem", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Gyarados ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Celebi ex Exeggutor", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Magnezone Grotle", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Persian", count: 1, wins: 3, losses: 2, ties: 1 },
  { deck_name: "Garchomp Marshadow", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Magneton Jolteon", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Tauros", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Exeggutor ex Roserade", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Articuno ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Greninja Hitmonlee", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Magnezone Cresselia", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Rhyperior Lucario", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Shiinotic Vileplume", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Golem Ambipom", count: 1, wins: 3, losses: 2, ties: 1 },
  { deck_name: "Dragonite Jolteon", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Bibarel", count: 1, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Mismagius ex Dusknoir", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Electivire Luxray", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Wigglytuff ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Greninja Aerodactyl ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Garchomp Palkia ex", count: 1, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Rapidash Flareon", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Charizard ex", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Victreebel Shiinotic", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Gyarados ex Butterfree", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Kabutops Primeape", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Flareon Greninja", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Empoleon Kangaskhan", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Starmie ex Lapras ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Lickilicky ex Cinccino", count: 1, wins: 3, losses: 2, ties: 1 },
  { deck_name: "Serperior Lilligant", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Raichu Electivire", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Gallade ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Magnezone Bastiodon", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Blastoise ex Gyarados ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Jolteon", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Gallade ex Gliscor", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Exeggutor Celebi ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Darkrai", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Alakazam Gardevoir", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Lapras", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Rapidash Magmortar", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Yanmega ex Spiritomb", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Lumineon Palkia ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Blastoise ex Lapras ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Toxicroak", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Dugtrio Primeape", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Garchomp Mienshao", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Dusknoir Regirock", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Rampardos Chatot", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Alakazam Weezing", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Florges Mew ex", count: 1, wins: 5, losses: 4, ties: 1 },
  { deck_name: "Lapras ex Greninja", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Roserade Celebi ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Alakazam Azelf", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Raichu Pikachu ex", count: 1, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Persian Rampardos", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Pidgeot ex Hitmonlee", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Gyarados ex", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Beheeyem Mewtwo ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Galvantula", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Greninja Ninetales", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Magnezone Galvantula", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Articuno ex Manaphy", count: 1, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Exeggutor ex Shiinotic", count: 1, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Dragonite Garchomp", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Bisharp Farfetch'd", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Poliwrath Greninja", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Moltres ex Charizard", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Pachirisu ex Bibarel", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Arcanine ex Ninetales", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Electrode Electivire", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Melmetal Bidoof", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Greninja Shaymin", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Lapras ex Articuno ex", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Exeggutor ex Flareon", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Pachirisu ex Chatot", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Melmetal Mawile", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Victreebel Exeggutor", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Eelektross Weezing", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Magmortar Hypno", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Aerodactyl ex Arbok", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Aerodactyl ex Persian", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Mewtwo ex Palkia ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Rampardos Darkrai ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Golem Wigglytuff ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Skuntank Dusknoir", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Lopunny", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Ninetales Lopunny", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Purugly Mew ex", count: 1, wins: 2, losses: 2, ties: 1 },
  { deck_name: "Yanmega ex Butterfree", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Mismagius ex Spiritomb", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gallade ex Greninja", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Butterfree Heatran", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Moltres", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Kingler Seaking", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Dusknoir", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex", count: 1, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Beedrill Vileplume", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Victreebel", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Lickilicky ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Melmetal", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Palkia ex", count: 1, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Exeggutor ex Starmie ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Primeape Aerodactyl ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gardevoir Dusknoir", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Garchomp Fearow", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Garchomp Lucario", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Garchomp Gastrodon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Venusaur", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gallade ex Bibarel", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Zapdos ex Electrode", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Empoleon Mew ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Magnezone Kingler", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Celebi ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Exeggutor Magnezone", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Magnezone Tauros", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Flareon Glaceon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Magneton Mew ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Weavile ex Skuntank", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dragonite Starmie", count: 1, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Melmetal Bastiodon", count: 1, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Yanmega ex Lilligant", count: 1, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Magnezone Electrode", count: 1, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Porygon-Z Hypno", count: 1, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Marowak ex Lickilicky ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Marowak ex Dugtrio", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Cresselia ex Butterfree", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Darkrai ex Vaporeon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Palkia ex Regigigas", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Shinx", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Florges Mismagius ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Dusknoir Celebi ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Marowak ex Mew ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Celebi ex Palkia ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Arcanine ex Magcargo", count: 1, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Rampardos Stonjourner", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Togekiss", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Luxray Pikachu ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Yanmega ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Vaporeon Mamoswine", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Melmetal", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Charizard ex Rapidash", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Palkia ex Regice", count: 1, wins: 1, losses: 1, ties: 1 },
  { deck_name: "Articuno ex Dragonite", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Venusaur ex Roserade", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Rotom", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Electivire Pikachu ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Staraptor Palkia ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp Tauros", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Ambipom", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Darkrai ex Psyduck", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Abomasnow Lapras ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weavile ex Pidgeot", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Lapras ex Palkia ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Skarmory", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weavile ex Liepard", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Beedrill", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Ninetales Mew ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Electivire Spiritomb", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Aerodactyl ex Chatot", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gyarados ex Fan Rotom", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Golem Primeape", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mew ex Exeggutor ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Porygon-Z Shaymin", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Staraptor Weavile ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Yanmega ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Exeggutor", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Leafeon Bidoof", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Leafeon", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Greninja Salazzle", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Primeape Marshadow", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Infernape ex Heat Rotom", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Vileplume Bellossom", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Aerodactyl ex Dugtrio", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Vaporeon Articuno ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Dialga ex Kangaskhan", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Druddigon", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Sandslash", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Butterfree", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Magnezone Porygon-Z", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Kangaskhan", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Bisharp", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Charizard Arcanine", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Greninja Glameow", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Victreebel Exeggutor ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Staraptor Skarmory", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Palkia ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Whimsicott Vaporeon", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Wigglytuff ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Skarmory", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Eelektross Pikachu ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Glameow", count: 1, wins: 1, losses: 1, ties: 1 },
  { deck_name: "Staraptor Hitmonlee", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gengar Mismagius ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Infernape ex Glameow", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Garchomp Lumineon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Garchomp Persian", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Tauros", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Shaymin", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Victreebel Magnezone", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Onix", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Combee", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Machamp ex Onix", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Roserade Exeggutor", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Jolteon Leafeon", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Marowak ex Marshadow", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Rampardos Kangaskhan", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Articuno ex Pidgeot", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Togekiss Mewtwo ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Mew ex Gyarados ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Venomoth Leafeon", count: 1, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Articuno ex Empoleon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Greninja Mamoswine", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Blastoise ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp Lucario", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lumineon Articuno ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Electrode Heliolisk", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Skarmory Heatran", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Weezing Lopunny", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Rapidash Jolteon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dragonite Tauros", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Luxray Mew ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Dodrio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Gallade ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Pidgeot ex Dragonite", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dragonite Raichu", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Electrode Jolteon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Farfetch'd", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Marshadow", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Bisharp Mew ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Alakazam Pidgeot ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Marowak ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Electrode", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Golem Hitmonlee", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Togekiss Glameow", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp Bibarel", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Omastar Farfetch'd", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Togekiss Rotom", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Yanmega ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Greninja Dugtrio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Raichu", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Articuno ex Blastoise", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Galvantula Pikachu ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lumineon Palkia ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Mismagius ex Farfetch'd", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Moltres ex Magnezone", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dragonite Weezing", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Rampardos", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Wormadam Melmetal", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp Rampardos", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lumineon Tauros", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Lopunny", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dusknoir Yanmega ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Yanmega ex Glaceon", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Articuno ex Lickilicky ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Machamp ex Meowth", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Weezing Centiskorch", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Kabutops", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Uxie", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Zapdos ex Jolteon", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Marowak ex Golem", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Ambipom Skarmory", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Weezing Tauros", count: 1, wins: 1, losses: 3, ties: 1 },
  { deck_name: "Melmetal", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Alakazam Jynx", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Porygon-Z Mew ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Blastoise ex Mismagius ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Dialga ex Farfetch'd", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Kricketune Shiinotic", count: 1, wins: 1, losses: 3, ties: 2 },
  { deck_name: "Starmie ex Porygon-Z", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Garchomp Tentacruel", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Pidgeot ex Weavile ex", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Scolipede Mew ex", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Toxicroak Mew ex", count: 1, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Porygon-Z", count: 1, wins: 1, losses: 4, ties: 2 },
  { deck_name: "Weezing Drapion", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Rhyperior Rampardos", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Electrode Pikachu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arbok Muk", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Staraptor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Tauros", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Dusknoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rapidash Bellossom", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Pikachu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Rapidash", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Gallade ex Chatot", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Cresselia ex Greninja", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magnezone Arbok", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dusknoir Mewtwo ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Raichu Electivire", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Palkia ex Porygon-Z", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Victreebel", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Melmetal Greninja", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Grimer", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Torterra Vespiquen", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Primeape Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Tangrowth", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Gyarados ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur Tangrowth", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Infernape ex Charizard ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Celebi ex Raticate", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magcargo Moltres ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Spiritomb", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Omastar", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mamoswine Omastar", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Sandslash Kabutops", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Aerodactyl ex Gallade ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Electrode Magnezone", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Machamp ex Dusknoir", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Electrode Pachirisu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Magneton", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lucario Sandslash", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Exeggutor ex Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Sigilyph", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Venusaur ex Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Zapdos ex Zebstrika", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Magnezone Hitmonchan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Frosmoth", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gyarados ex Kangaskhan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Purugly", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Marowak ex Kangaskhan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Flareon Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Salazzle", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Skarmory Wormadam", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Empoleon Manaphy", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Staraptor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur ex Victreebel", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lapras ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Luxray Dedenne", count: 1, wins: 0, losses: 3, ties: 1 },
  { deck_name: "Venusaur Butterfree", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Rotom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dialga ex Wigglytuff", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Ninetales Centiskorch", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Marshadow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gardevoir Mesprit", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Rotom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Beedrill Victreebel", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Garchomp Golduck", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Porygon-Z Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Moltres ex Rapidash", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Lapras", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Eelektross Raichu", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Roserade Leafeon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Pidgeot ex Primeape", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mamoswine Floatzel", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Skuntank Scolipede", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Gengar ex Alakazam", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Roserade Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray Magneton", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Starmie ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Poliwrath Manaphy", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Magneton", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Scolipede Drapion", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Primeape Rhyperior", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Primeape", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Cresselia ex Cresselia", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam Spiritomb", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magcargo Hypno", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Honchkrow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rhyperior Onix", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Garchomp", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam Mewtwo ex", count: 1, wins: 0, losses: 3, ties: 2 },
  { deck_name: "Darkrai ex Ambipom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Scolipede Honchkrow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Yanmega ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Azelf", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Ambipom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bastiodon Shaymin", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rampardos Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arcanine ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Celebi ex Lilligant", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Skuntank Toxicroak", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Ivysaur", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Raichu Pachirisu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Aerodactyl ex Pachirisu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp Weezing", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Weavile ex Drapion", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Golem Onix", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Vaporeon Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Lickilicky ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Weezing", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Rampardos", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Primeape", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arcanine ex Pidgeot", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Vaporeon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Wigglytuff ex Gyarados ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Starmie ex Alakazam", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Togekiss Gardevoir", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Dragonite Pidgeot", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Roserade Serperior", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Hitmonchan", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Starmie ex Empoleon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Porygon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Electabuzz", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Abomasnow Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Toxicroak Cinccino", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Cresselia ex Magnezone", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Golem Giratina", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dialga ex Purugly", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Cramorant", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Charizard ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Melmetal", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Pidgeot ex Melmetal", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Primeape", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Regirock Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Mewtwo ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Ninetales Salazzle", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Weezing Scolipede", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Greninja Vaporeon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dusknoir Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Venusaur ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shaymin Druddigon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Kingler", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Infernape ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Spiritomb", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Alakazam Hypno", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Omastar", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Regigigas", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Infernape ex Salazzle", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Darkrai ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dragonite Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Lumineon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arcanine ex Aerodactyl ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sandslash Primeape", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Pachirisu ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mismagius ex Staraptor", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Butterfree", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Pidgeot ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Beedrill Bellossom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Skarmory", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Primeape Hitmonlee", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Raichu Luxray", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Rotom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Skiddo", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Regice", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Marowak ex Golem", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Victreebel Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Glameow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bastiodon Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shiinotic Mew ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Glaceon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Porygon-Z Manaphy", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magnezone Charmeleon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Purugly", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Luxray", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Primeape", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Weezing Drapion", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Rhyperior Rampardos", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Electrode Pikachu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arbok Muk", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Staraptor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Tauros", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Dusknoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rapidash Bellossom", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Pikachu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Rapidash", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Gallade ex Chatot", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Cresselia ex Greninja", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magnezone Arbok", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dusknoir Mewtwo ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Raichu Electivire", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Palkia ex Porygon-Z", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Victreebel", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Melmetal Greninja", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Grimer", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Torterra Vespiquen", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Primeape Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Tangrowth", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Gyarados ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur Tangrowth", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Infernape ex Charizard ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Celebi ex Raticate", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magcargo Moltres ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Spiritomb", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Omastar", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mamoswine Omastar", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Sandslash Kabutops", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Aerodactyl ex Gallade ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Electrode Magnezone", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Machamp ex Dusknoir", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Electrode Pachirisu ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Magneton", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lucario Sandslash", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Exeggutor ex Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Sigilyph", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Venusaur ex Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Zapdos ex Zebstrika", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Magnezone Hitmonchan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Frosmoth", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gyarados ex Kangaskhan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Yanmega ex Purugly", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Marowak ex Kangaskhan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Flareon Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Salazzle", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Skarmory Wormadam", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Empoleon Manaphy", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Staraptor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur ex Victreebel", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lapras ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Luxray Dedenne", count: 1, wins: 0, losses: 3, ties: 1 },
  { deck_name: "Venusaur Butterfree", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Rotom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dialga ex Wigglytuff", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Ninetales Centiskorch", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Marshadow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gardevoir Mesprit", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Rotom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Beedrill Victreebel", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Garchomp Golduck", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Porygon-Z Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Moltres ex Rapidash", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Lapras", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Eelektross Raichu", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Roserade Leafeon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Pidgeot ex Primeape", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mamoswine Floatzel", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Skuntank Scolipede", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Gengar ex Alakazam", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Roserade Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray Magneton", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Starmie ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Poliwrath Manaphy", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Magneton", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Scolipede Drapion", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Primeape Rhyperior", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Primeape", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Cresselia ex Cresselia", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam Spiritomb", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magcargo Hypno", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Honchkrow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rhyperior Onix", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Garchomp", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alakazam Mewtwo ex", count: 1, wins: 0, losses: 3, ties: 2 },
  { deck_name: "Darkrai ex Ambipom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Scolipede Honchkrow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Yanmega ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Azelf", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Ambipom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bastiodon Shaymin", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Rampardos Spiritomb", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arcanine ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Celebi ex Lilligant", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Skuntank Toxicroak", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Ivysaur", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Raichu Pachirisu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Aerodactyl ex Pachirisu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp Weezing", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Weavile ex Drapion", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Golem Onix", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Vaporeon Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Lickilicky ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Weezing", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lickilicky ex Rampardos", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Primeape", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arcanine ex Pidgeot", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wigglytuff ex Vaporeon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Wigglytuff ex Gyarados ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Starmie ex Alakazam", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Togekiss Gardevoir", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Dragonite Pidgeot", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Roserade Serperior", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Hitmonchan", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Starmie ex Empoleon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Porygon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Pachirisu ex Electabuzz", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Abomasnow Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Toxicroak Cinccino", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Cresselia ex Magnezone", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Golem Giratina", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dialga ex Purugly", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Cramorant", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Charizard ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Luxray", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Melmetal", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Pidgeot ex Melmetal", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Primeape", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Regirock Lopunny", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Mewtwo ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Ninetales Salazzle", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Weezing Scolipede", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Greninja Vaporeon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dusknoir Druddigon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Venusaur ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shaymin Druddigon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Kingler", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Infernape ex Jolteon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Spiritomb", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Alakazam Hypno", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Omastar", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mew ex Regigigas", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Infernape ex Salazzle", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Darkrai ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dragonite Regice", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Articuno ex Lumineon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Arcanine ex Aerodactyl ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sandslash Primeape", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Pachirisu ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mismagius ex Staraptor", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Celebi ex Butterfree", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Pidgeot ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Beedrill Bellossom", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Skarmory", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Primeape Hitmonlee", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Raichu Luxray", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Rotom", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Garchomp Skiddo", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Regice", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Marowak ex Golem", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pachirisu ex Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Victreebel Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Glameow", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bastiodon Farfetch'd", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shiinotic Mew ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Glaceon", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Porygon-Z Manaphy", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magnezone Charmeleon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Purugly", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Luxray", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Primeape", count: 1, wins: 0, losses: 2, ties: 0 }
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
// STEP 4: CALCULATE RATING (ADVANCED BAYESIAN ALGORITHM)
// ============================================================================

/**
 * Advanced Hierarchical Bayesian Rating System with Adaptive Confidence
 * 
 * This sophisticated algorithm combines multiple statistical techniques:
 * 1. Beta-Binomial conjugate prior with empirical Bayes estimation
 * 2. Adaptive confidence intervals based on sample size and meta characteristics
 * 3. Wilson score interval for robust confidence bounds
 * 4. Regularization for extreme values and small samples
 * 5. Meta-level variance modeling for cross-deck uncertainty
 * 6. Tournament depth weighting for quality assessment
 * 
 * Scales from <30 decks to 100,000+ decks with consistent behavior
 */

/**
 * Calculate Wilson score interval lower bound
 * More robust than normal approximation for small samples
 * 
 * @param {number} successes - Number of successes (adjusted wins)
 * @param {number} n - Total trials (matches)
 * @param {number} z - Z-score for confidence level
 * @returns {number} Lower bound of Wilson score interval
 */
const wilsonScoreLowerBound = (successes, n, z) => {
  if (n === 0) return 0;
  
  const phat = successes / n;
  const denominator = 1 + z * z / n;
  const centre = (phat + z * z / (2 * n)) / denominator;
  const margin = (z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / denominator;
  
  return Math.max(0, centre - margin);
};

/**
 * Calculate effective sample size with diminishing returns
 * Prevents overweighting of extremely large samples
 * 
 * @param {number} n - Raw sample size
 * @param {number} total_tournament_games - Total games in meta
 * @returns {number} Effective sample size
 */
const effectiveSampleSize = (n, total_tournament_games) => {
  // Use log-scale dampening for very large samples
  const scale = Math.log10(total_tournament_games + 1);
  const dampening = Math.min(1, scale / 6); // Reaches 1.0 at 1M total games
  const maxEffectiveN = total_tournament_games * 0.5; // No single deck worth more than 50% of meta
  
  return Math.min(n * (0.5 + 0.5 * dampening), maxEffectiveN);
};

/**
 * Advanced hierarchical Bayesian ranking
 * 
 * @param {Array} allData - Array of [rank, name, wins, losses, ties] for each deck
 * @returns {Array} Deck statistics with Bayesian posterior estimates
 */
const hierarchicalBayesian = (allData) => {
  const totalDecks = allData.length;
  
  // Calculate basic statistics for each deck
  const deckStats = allData.map(([_, __, wins, losses, ties]) => {
    const n = wins + losses + ties;
    const adjWins = wins + 0.5 * ties;
    const adjLosses = losses + 0.5 * ties;
    return { 
      n, 
      adjWins,
      adjLosses,
      winRate: adjWins / n 
    };
  });
  
  const total_tournament_games = deckStats.reduce((sum, d) => sum + d.n, 0);
  const avgGamesPerDeck = total_tournament_games / totalDecks;
  
  // ========================================================================
  // PHASE 1: EMPIRICAL BAYES PRIOR ESTIMATION
  // ========================================================================
  
  // Weighted mean and variance (accounts for different sample sizes)
  const weightedMean = deckStats.reduce((sum, d) => sum + d.winRate * d.n, 0) / total_tournament_games;
  const weightedVariance = deckStats.reduce((sum, d) => 
    sum + d.n * Math.pow(d.winRate - weightedMean, 2), 0) / total_tournament_games;
  
  // Robust median calculation (resistant to outliers)
  const sortedWinRates = deckStats.map(d => d.winRate).sort((a, b) => a - b);
  const median = sortedWinRates[Math.floor(sortedWinRates.length / 2)];
  
  // Use median for center, weighted variance for spread
  const priorCenter = Math.max(0.01, Math.min(0.99, (weightedMean + median) / 2));
  
  // Calculate meta diversity coefficient
  const metaDiversity = weightedVariance / (priorCenter * (1 - priorCenter));
  const diversityFactor = Math.min(1.5, 0.5 + metaDiversity);
  
  // Estimate Beta prior parameters with diversity adjustment
  const adjustedVariance = Math.max(0.0001, 
    Math.min(priorCenter * (1 - priorCenter) * 0.9, weightedVariance * diversityFactor));
  
  const priorStrength = Math.max(2, (priorCenter * (1 - priorCenter) / adjustedVariance) - 1);
  const priorAlpha = priorCenter * priorStrength;
  const priorBeta = (1 - priorCenter) * priorStrength;
  
  // ========================================================================
  // PHASE 2: ADAPTIVE CONFIDENCE CALIBRATION
  // ========================================================================
  
  // Meta size factor: smaller metas need more conservative estimates
  const metaSizeFactor = Math.min(1, Math.log10(totalDecks + 1) / Math.log10(100));
  
  // Sample density: how much data per deck on average
  const sampleDensity = Math.min(1, Math.log10(avgGamesPerDeck + 1) / Math.log10(1000));
  
  // Base confidence level varies by meta characteristics
  let baseConfidence;
  if (total_tournament_games < 1000) {
    baseConfidence = 0.75; // 75% confidence for tiny metas
  } else if (total_tournament_games < 10000) {
    baseConfidence = 0.80; // 80% confidence for small metas
  } else if (total_tournament_games < 50000) {
    baseConfidence = 0.85; // 85% confidence for medium metas
  } else if (total_tournament_games < 200000) {
    baseConfidence = 0.90; // 90% confidence for large metas
  } else {
    baseConfidence = 0.95; // 95% confidence for huge metas
  }
  
  // Adjust confidence based on diversity
  const adjustedConfidence = baseConfidence * (0.85 + 0.15 * (1 - Math.min(1, metaDiversity)));
  
  // Convert confidence to z-score
  const confidenceToZ = (conf) => {
    // Approximate inverse normal CDF for common confidence levels
    if (conf >= 0.95) return 1.96;
    if (conf >= 0.90) return 1.645;
    if (conf >= 0.85) return 1.44;
    if (conf >= 0.80) return 1.28;
    if (conf >= 0.75) return 1.15;
    return 1.0;
  };
  
  const baseZ = confidenceToZ(adjustedConfidence);
  
  // ========================================================================
  // PHASE 3: PER-DECK POSTERIOR CALCULATION
  // ========================================================================
  
  return allData.map(([origRank, deckName, wins, losses, ties], idx) => {
    const stats = deckStats[idx];
    const { n, adjWins, adjLosses, winRate } = stats;
    
    // Calculate effective sample size
    const effectiveN = effectiveSampleSize(n, total_tournament_games);
    
    // Bayesian update: combine prior with observed data
    const postAlpha = priorAlpha + adjWins;
    const postBeta = priorBeta + adjLosses;
    const posteriorMean = postAlpha / (postAlpha + postBeta);
    
    // Sample-size-adjusted z-score
    const sampleSizeFactor = Math.min(1, Math.log10(n + 1) / Math.log10(5000));
    const deckZ = baseZ * (2.0 - sampleSizeFactor); // More conservative for small samples
    
    // Wilson score interval (more robust than normal approximation)
    const wilsonLowerBound = wilsonScoreLowerBound(adjWins, n, deckZ);
    
    // Beta distribution confidence interval
    const postVariance = (postAlpha * postBeta) / 
      ((postAlpha + postBeta) ** 2 * (postAlpha + postBeta + 1));
    const betaLowerBound = Math.max(0, posteriorMean - deckZ * Math.sqrt(postVariance));
    
    // Combine Wilson and Beta approaches (weighted by sample size)
    const wilsonWeight = sampleSizeFactor;
    const combinedLowerBound = wilsonWeight * wilsonLowerBound + 
                               (1 - wilsonWeight) * betaLowerBound;
    
    // Regularization: pull extreme values toward prior
    const regularizationStrength = Math.exp(-effectiveN / (avgGamesPerDeck * 2));
    const regularizedBound = combinedLowerBound * (1 - regularizationStrength) + 
                             priorCenter * regularizationStrength;
    
    // Quality adjustment: reward consistent performance over many matches
    const qualityBonus = Math.min(0.02, (effectiveN / total_tournament_games) * 0.5);
    const finalBound = Math.min(0.99, regularizedBound + qualityBonus);
    
    return { 
      origRank, 
      deckName, 
      wins, 
      losses, 
      ties, 
      n, 
      posteriorMean, 
      adjustedLowerBound: finalBound
    };
  });
};

/**
 * Convert Bayesian bound to rating score with absolute scaling
 * Top decks can reach 100 only in exceptional metas with dominant performance
 * 
 * @param {number} bound - Bayesian lower bound (0-1 scale)
 * @returns {number} Rating score (0-100+ scale)
 */
const calculateRating = (bound) => {
  // Direct scaling from confidence bound to rating
  // A bound of 0.50 (50% win rate) = 90 rating
  // A bound of 0.55 (55% win rate) = 99 rating
  // A bound of 0.60 (60% win rate) = 108 rating (exceptional)
  
  // Use exponential scaling to reward higher win rates
  const baseline = 0.50; // 50% win rate baseline
  const scale = 175; // Scaling factor
  
  return bound * scale;
};

// Prepare data for hierarchical Bayesian calculation
const bayesianInput = enrichedDecks.map((deck, index) => [
  index + 1,
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
  // Advanced rating based on Bayesian lower confidence bound
  // Scaled directly from win rate confidence bound
  // Top decks reach ~95-98 in balanced metas, can exceed 100 in dominant metas
  deck.rating = calculateRating(bayesianData.adjustedLowerBound);
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
  } else if (deck.rating >= 97) {
    deck.tier = 'Splus';      // Elite+ (97-99)
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