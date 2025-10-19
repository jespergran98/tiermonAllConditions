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
  { deck_name: "Tapu Koko ex Pikachu ex", count: 93, wins: 229, losses: 201, ties: 5 },
  { deck_name: "Silvally Pichu", count: 92, wins: 222, losses: 231, ties: 5 },
  { deck_name: "Umbreon ex Eevee ex", count: 86, wins: 199, losses: 204, ties: 5 },
  { deck_name: "Charizard ex Sylveon ex", count: 81, wins: 148, losses: 187, ties: 7 },
  { deck_name: "Solgaleo ex Entei ex", count: 80, wins: 183, losses: 196, ties: 15 },
  { deck_name: "Pikachu ex Tapu Koko ex", count: 79, wins: 236, losses: 180, ties: 11 },
  { deck_name: "Guzzlord ex Naganadel", count: 76, wins: 189, losses: 177, ties: 10 },
  { deck_name: "Raikou ex Arceus ex", count: 64, wins: 156, losses: 161, ties: 5 },
  { deck_name: "Crobat ex Darkrai ex", count: 63, wins: 162, losses: 157, ties: 2 },
  { deck_name: "Snorlax ex Darkrai ex", count: 60, wins: 159, losses: 143, ties: 7 },
  { deck_name: "Buzzwole ex Celesteela", count: 56, wins: 155, losses: 148, ties: 8 },
  { deck_name: "Silvally Oricorio", count: 51, wins: 121, losses: 116, ties: 5 },
  { deck_name: "Weavile ex Darkrai ex", count: 50, wins: 123, losses: 121, ties: 1 },
  { deck_name: "Skarmory ex", count: 48, wins: 131, losses: 121, ties: 7 },
  { deck_name: "Suicune ex Palkia ex", count: 48, wins: 125, losses: 124, ties: 2 },
  { deck_name: "Flareon ex Sylveon ex", count: 46, wins: 142, losses: 134, ties: 11 },
  { deck_name: "Suicune ex Gyarados", count: 45, wins: 95, losses: 114, ties: 4 },
  { deck_name: "Incineroar ex", count: 44, wins: 127, losses: 114, ties: 8 },
  { deck_name: "Silvally Giratina ex", count: 44, wins: 106, losses: 111, ties: 3 },
  { deck_name: "Mewtwo ex Gardevoir", count: 43, wins: 65, losses: 96, ties: 3 },
  { deck_name: "Alolan Raichu ex Raikou ex", count: 42, wins: 102, losses: 109, ties: 2 },
  { deck_name: "Crobat ex Nihilego", count: 42, wins: 99, losses: 112, ties: 5 },
  { deck_name: "Donphan ex Rampardos", count: 39, wins: 95, losses: 93, ties: 2 },
  { deck_name: "Pikachu ex Raikou ex", count: 39, wins: 103, losses: 102, ties: 5 },
  { deck_name: "Meowscarada", count: 39, wins: 57, losses: 87, ties: 0 },
  { deck_name: "Arceus ex Oricorio", count: 37, wins: 65, losses: 80, ties: 4 },
  { deck_name: "Donphan ex Lucario", count: 37, wins: 64, losses: 88, ties: 1 },
  { deck_name: "Pikachu ex Oricorio", count: 35, wins: 100, losses: 93, ties: 3 },
  { deck_name: "Flareon ex Leafeon ex", count: 35, wins: 58, losses: 83, ties: 0 },
  { deck_name: "Snorlax ex Ho-Oh ex", count: 33, wins: 74, losses: 76, ties: 2 },
  { deck_name: "Suicune ex Milotic", count: 32, wins: 71, losses: 86, ties: 1 },
  { deck_name: "Sylveon ex Greninja", count: 31, wins: 59, losses: 85, ties: 2 },
  { deck_name: "Arceus ex Tapu Koko ex", count: 30, wins: 106, losses: 69, ties: 7 },
  { deck_name: "Charizard ex Moltres ex", count: 30, wins: 56, losses: 67, ties: 3 },
  { deck_name: "Infernape ex Entei ex", count: 29, wins: 61, losses: 69, ties: 2 },
  { deck_name: "Suicune ex Greninja", count: 28, wins: 83, losses: 72, ties: 13 },
  { deck_name: "Lugia ex Ho-Oh ex", count: 28, wins: 54, losses: 66, ties: 2 },
  { deck_name: "Charizard ex Entei ex", count: 27, wins: 71, losses: 66, ties: 3 },
  { deck_name: "Slurpuff Alcremie", count: 27, wins: 64, losses: 71, ties: 0 },
  { deck_name: "Pikachu ex Oricorio", count: 26, wins: 87, losses: 62, ties: 8 },
  { deck_name: "Giratina ex Latias", count: 26, wins: 67, losses: 72, ties: 1 },
  { deck_name: "Giratina ex Silvally", count: 26, wins: 60, losses: 68, ties: 3 },
  { deck_name: "Arceus ex Crobat", count: 24, wins: 51, losses: 58, ties: 2 },
  { deck_name: "Poliwrath ex Politoed", count: 24, wins: 38, losses: 61, ties: 2 },
  { deck_name: "Solgaleo ex Suicune ex", count: 23, wins: 37, losses: 62, ties: 2 },
  { deck_name: "Altaria Silvally", count: 23, wins: 33, losses: 59, ties: 0 },
  { deck_name: "Exeggutor ex Celebi ex", count: 21, wins: 45, losses: 53, ties: 2 },
  { deck_name: "Meowscarada Decidueye ex", count: 21, wins: 44, losses: 57, ties: 0 },
  { deck_name: "Tapu Koko ex Raikou ex", count: 20, wins: 44, losses: 49, ties: 0 },
  { deck_name: "Garchomp ex Garchomp", count: 20, wins: 35, losses: 43, ties: 1 },
  { deck_name: "Pikachu ex", count: 20, wins: 25, losses: 45, ties: 3 },
  { deck_name: "Guzzlord ex Nihilego", count: 19, wins: 41, losses: 44, ties: 2 },
  { deck_name: "Arceus ex Darkrai ex", count: 19, wins: 36, losses: 39, ties: 2 },
  { deck_name: "Garchomp ex Rampardos", count: 19, wins: 36, losses: 50, ties: 0 },
  { deck_name: "Suicune ex Magnezone", count: 19, wins: 32, losses: 42, ties: 3 },
  { deck_name: "Solgaleo ex Raikou ex", count: 19, wins: 35, losses: 52, ties: 2 },
  { deck_name: "Magcargo", count: 19, wins: 31, losses: 52, ties: 2 },
  { deck_name: "Espeon ex Eevee ex", count: 18, wins: 35, losses: 42, ties: 1 },
  { deck_name: "Raikou ex Luxray", count: 17, wins: 31, losses: 39, ties: 1 },
  { deck_name: "Sylveon ex Solgaleo ex", count: 17, wins: 33, losses: 46, ties: 0 },
  { deck_name: "Poliwrath ex Lucario", count: 17, wins: 26, losses: 42, ties: 2 },
  { deck_name: "Darkrai ex Miltank", count: 17, wins: 27, losses: 46, ties: 0 },
  { deck_name: "Giratina ex Darkrai ex", count: 16, wins: 49, losses: 35, ties: 4 },
  { deck_name: "Incineroar ex Entei ex", count: 16, wins: 32, losses: 40, ties: 0 },
  { deck_name: "Solgaleo ex Shiinotic", count: 16, wins: 34, losses: 40, ties: 3 },
  { deck_name: "Jumpluff ex Oricorio", count: 16, wins: 23, losses: 37, ties: 1 },
  { deck_name: "Greninja Suicune ex", count: 16, wins: 24, losses: 42, ties: 1 },
  { deck_name: "Flareon ex Flareon", count: 15, wins: 33, losses: 37, ties: 0 },
  { deck_name: "Umbreon ex Umbreon", count: 15, wins: 31, losses: 42, ties: 1 },
  { deck_name: "Gyarados ex Suicune ex", count: 15, wins: 25, losses: 37, ties: 0 },
  { deck_name: "Magcargo Magby", count: 14, wins: 39, losses: 33, ties: 1 },
  { deck_name: "Sylveon ex Eevee ex", count: 14, wins: 25, losses: 34, ties: 0 },
  { deck_name: "Tapu Koko ex", count: 14, wins: 21, losses: 35, ties: 1 },
  { deck_name: "Wugtrio ex Suicune ex", count: 13, wins: 28, losses: 31, ties: 0 },
  { deck_name: "Silvally Arceus ex", count: 13, wins: 29, losses: 33, ties: 1 },
  { deck_name: "Beedrill ex Beedrill", count: 13, wins: 23, losses: 37, ties: 0 },
  { deck_name: "Pikachu ex Zapdos ex", count: 12, wins: 32, losses: 30, ties: 1 },
  { deck_name: "Giratina ex Mewtwo ex", count: 12, wins: 26, losses: 26, ties: 0 },
  { deck_name: "Porygon-Z", count: 12, wins: 30, losses: 29, ties: 2 },
  { deck_name: "Suicune ex Silvally", count: 12, wins: 27, losses: 30, ties: 0 },
  { deck_name: "Sylveon ex Stoutland", count: 12, wins: 25, losses: 28, ties: 1 },
  { deck_name: "Solgaleo ex Galarian Cursola", count: 12, wins: 25, losses: 32, ties: 5 },
  { deck_name: "Silvally Darkrai ex", count: 12, wins: 17, losses: 29, ties: 0 },
  { deck_name: "Celebi ex Serperior", count: 12, wins: 15, losses: 33, ties: 0 },
  { deck_name: "Primarina ex Primarina", count: 12, wins: 10, losses: 26, ties: 0 },
  { deck_name: "Raichu ex Alolan Raichu ex", count: 11, wins: 29, losses: 27, ties: 1 },
  { deck_name: "Giratina ex Greninja", count: 11, wins: 33, losses: 32, ties: 2 },
  { deck_name: "Naganadel Guzzlord ex", count: 11, wins: 29, losses: 26, ties: 4 },
  { deck_name: "Suicune ex Gyarados ex", count: 11, wins: 25, losses: 26, ties: 1 },
  { deck_name: "Dragonite ex Mantyke", count: 11, wins: 18, losses: 20, ties: 2 },
  { deck_name: "Suicune ex Sylveon ex", count: 11, wins: 21, losses: 24, ties: 3 },
  { deck_name: "Lucario Rampardos", count: 10, wins: 24, losses: 20, ties: 1 },
  { deck_name: "Crobat ex Umbreon ex", count: 10, wins: 25, losses: 27, ties: 0 },
  { deck_name: "Tapu Koko ex Arceus ex", count: 10, wins: 17, losses: 20, ties: 0 },
  { deck_name: "Lugia ex Altaria", count: 10, wins: 16, losses: 25, ties: 0 },
  { deck_name: "Umbreon ex Darkrai ex", count: 10, wins: 14, losses: 22, ties: 0 },
  { deck_name: "Darkrai ex Silvally", count: 10, wins: 17, losses: 29, ties: 0 },
  { deck_name: "Gyarados ex Gyarados", count: 10, wins: 14, losses: 22, ties: 2 },
  { deck_name: "Moltres ex Entei ex", count: 10, wins: 12, losses: 25, ties: 0 },
  { deck_name: "Ho-Oh ex Lugia ex", count: 10, wins: 11, losses: 29, ties: 0 },
  { deck_name: "Darkrai ex Magnezone", count: 9, wins: 19, losses: 19, ties: 0 },
  { deck_name: "Jumpluff ex Glaceon ex", count: 9, wins: 18, losses: 23, ties: 0 },
  { deck_name: "Lunala ex Giratina ex", count: 9, wins: 17, losses: 26, ties: 0 },
  { deck_name: "Dugtrio Lucario", count: 9, wins: 15, losses: 23, ties: 0 },
  { deck_name: "Pikachu ex Arceus ex", count: 9, wins: 19, losses: 30, ties: 0 },
  { deck_name: "Suicune ex Primarina ex", count: 9, wins: 15, losses: 23, ties: 1 },
  { deck_name: "Sylveon ex Togekiss", count: 9, wins: 17, losses: 27, ties: 1 },
  { deck_name: "Giratina ex", count: 9, wins: 12, losses: 23, ties: 0 },
  { deck_name: "Paldean Clodsire ex Nihilego", count: 9, wins: 8, losses: 21, ties: 0 },
  { deck_name: "Primarina ex", count: 8, wins: 24, losses: 21, ties: 3 },
  { deck_name: "Tsareena", count: 8, wins: 20, losses: 20, ties: 4 },
  { deck_name: "Jumpluff ex Sylveon ex", count: 8, wins: 15, losses: 18, ties: 1 },
  { deck_name: "Solgaleo ex Skarmory", count: 8, wins: 17, losses: 20, ties: 2 },
  { deck_name: "Flareon ex Jolteon", count: 8, wins: 16, losses: 19, ties: 2 },
  { deck_name: "Skarmory ex Skarmory", count: 8, wins: 10, losses: 16, ties: 1 },
  { deck_name: "Entei ex Magby", count: 8, wins: 11, losses: 21, ties: 0 },
  { deck_name: "Ho-Oh ex Celebi ex", count: 8, wins: 9, losses: 22, ties: 2 },
  { deck_name: "Miltank", count: 8, wins: 7, losses: 24, ties: 0 },
  { deck_name: "Jumpluff ex Raikou ex", count: 7, wins: 16, losses: 14, ties: 0 },
  { deck_name: "Arceus ex Raikou ex", count: 7, wins: 18, losses: 17, ties: 0 },
  { deck_name: "Darkrai ex Guzzlord ex", count: 7, wins: 20, losses: 19, ties: 0 },
  { deck_name: "Leafeon ex Sylveon ex", count: 7, wins: 15, losses: 17, ties: 0 },
  { deck_name: "Giratina ex Galarian Cursola", count: 7, wins: 18, losses: 22, ties: 0 },
  { deck_name: "Silvally Pikachu ex", count: 7, wins: 12, losses: 16, ties: 0 },
  { deck_name: "Jumpluff ex Snorlax ex", count: 7, wins: 12, losses: 19, ties: 0 },
  { deck_name: "Entei ex Typhlosion", count: 7, wins: 9, losses: 15, ties: 0 },
  { deck_name: "Dragonite ex Suicune ex", count: 7, wins: 11, losses: 19, ties: 0 },
  { deck_name: "Darkrai ex Tyranitar", count: 7, wins: 10, losses: 18, ties: 0 },
  { deck_name: "Leafeon ex Alolan Exeggutor", count: 7, wins: 11, losses: 20, ties: 0 },
  { deck_name: "Meowscarada Pheromosa", count: 7, wins: 8, losses: 19, ties: 0 },
  { deck_name: "Gyarados ex Mantyke", count: 7, wins: 5, losses: 13, ties: 1 },
  { deck_name: "Magnezone Raikou ex", count: 7, wins: 6, losses: 19, ties: 0 },
  { deck_name: "Crabominable ex Palkia ex", count: 6, wins: 20, losses: 15, ties: 1 },
  { deck_name: "Raikou ex Alolan Raichu ex", count: 6, wins: 18, losses: 15, ties: 0 },
  { deck_name: "Jumpluff ex Darkrai ex", count: 6, wins: 18, losses: 15, ties: 0 },
  { deck_name: "Sylveon ex Magnezone", count: 6, wins: 15, losses: 13, ties: 0 },
  { deck_name: "Sylveon ex Leafeon ex", count: 6, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Jumpluff ex Suicune ex", count: 6, wins: 11, losses: 16, ties: 0 },
  { deck_name: "Dragonite ex Pichu", count: 6, wins: 11, losses: 16, ties: 0 },
  { deck_name: "Sylveon ex Galarian Cursola", count: 6, wins: 10, losses: 14, ties: 1 },
  { deck_name: "Sylveon ex Suicune ex", count: 6, wins: 7, losses: 11, ties: 0 },
  { deck_name: "Poliwrath ex Sylveon ex", count: 6, wins: 7, losses: 14, ties: 0 },
  { deck_name: "Aerodactyl ex Rampardos", count: 6, wins: 6, losses: 14, ties: 0 },
  { deck_name: "Starmie ex Suicune ex", count: 6, wins: 6, losses: 14, ties: 1 },
  { deck_name: "Alolan Raichu ex Raichu ex", count: 6, wins: 4, losses: 17, ties: 0 },
  { deck_name: "Zapdos ex Pikachu ex", count: 6, wins: 0, losses: 18, ties: 0 },
  { deck_name: "Alolan Exeggutor Leafeon", count: 5, wins: 22, losses: 11, ties: 3 },
  { deck_name: "Dragonite ex", count: 5, wins: 18, losses: 12, ties: 0 },
  { deck_name: "Alolan Raichu ex Dialga ex", count: 5, wins: 19, losses: 14, ties: 0 },
  { deck_name: "Garchomp ex Sylveon ex", count: 5, wins: 12, losses: 11, ties: 0 },
  { deck_name: "Ampharos Raikou ex", count: 5, wins: 16, losses: 14, ties: 1 },
  { deck_name: "Alolan Raichu ex Zeraora", count: 5, wins: 11, losses: 12, ties: 0 },
  { deck_name: "Tsareena Celebi ex", count: 5, wins: 10, losses: 11, ties: 0 },
  { deck_name: "Skarmory ex Wigglytuff", count: 5, wins: 9, losses: 10, ties: 0 },
  { deck_name: "Entei ex Flareon ex", count: 5, wins: 12, losses: 14, ties: 0 },
  { deck_name: "Raikou ex Pikachu ex", count: 5, wins: 9, losses: 11, ties: 0 },
  { deck_name: "Gallade ex Lucario", count: 5, wins: 11, losses: 14, ties: 0 },
  { deck_name: "Jumpluff ex Zangoose", count: 5, wins: 11, losses: 15, ties: 0 },
  { deck_name: "Guzzlord ex", count: 5, wins: 13, losses: 15, ties: 3 },
  { deck_name: "Darkrai ex Giratina ex", count: 5, wins: 9, losses: 13, ties: 0 },
  { deck_name: "Tsareena", count: 5, wins: 10, losses: 15, ties: 0 },
  { deck_name: "Darkrai ex Zoroark", count: 5, wins: 10, losses: 16, ties: 0 },
  { deck_name: "Umbreon ex Sylveon ex", count: 5, wins: 8, losses: 13, ties: 0 },
  { deck_name: "Pikachu ex Raikou ex", count: 5, wins: 8, losses: 13, ties: 0 },
  { deck_name: "Electivire Pichu", count: 5, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Crobat ex Sylveon ex", count: 5, wins: 8, losses: 15, ties: 0 },
  { deck_name: "Alolan Exeggutor Tsareena", count: 5, wins: 8, losses: 15, ties: 0 },
  { deck_name: "Magnezone Galvantula", count: 5, wins: 8, losses: 16, ties: 0 },
  { deck_name: "Decidueye ex Pheromosa", count: 5, wins: 6, losses: 12, ties: 0 },
  { deck_name: "Primarina ex Suicune ex", count: 5, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Alolan Raichu ex Tapu Koko ex", count: 5, wins: 6, losses: 14, ties: 1 },
  { deck_name: "Raikou ex Oricorio", count: 5, wins: 5, losses: 13, ties: 0 },
  { deck_name: "Mewtwo ex Giratina ex", count: 5, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Silvally Raikou ex", count: 5, wins: 4, losses: 11, ties: 0 },
  { deck_name: "Poliwrath ex Suicune ex", count: 5, wins: 6, losses: 17, ties: 0 },
  { deck_name: "Gyarados ex Zangoose", count: 5, wins: 4, losses: 14, ties: 0 },
  { deck_name: "Solgaleo ex Skarmory ex", count: 5, wins: 0, losses: 13, ties: 0 },
  { deck_name: "Gyarados ex Greninja", count: 4, wins: 18, losses: 6, ties: 0 },
  { deck_name: "Giratina ex Magnezone", count: 4, wins: 19, losses: 8, ties: 0 },
  { deck_name: "Yanmega ex Dialga ex", count: 4, wins: 14, losses: 6, ties: 0 },
  { deck_name: "Ampharos Zeraora", count: 4, wins: 17, losses: 9, ties: 0 },
  { deck_name: "Decidueye Meowscarada", count: 4, wins: 18, losses: 10, ties: 2 },
  { deck_name: "Suicune ex Primarina", count: 4, wins: 12, losses: 9, ties: 0 },
  { deck_name: "Palkia ex Silvally", count: 4, wins: 14, losses: 11, ties: 0 },
  { deck_name: "Lycanroc Rampardos", count: 4, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Jumpluff ex Pikachu ex", count: 4, wins: 11, losses: 11, ties: 0 },
  { deck_name: "Alolan Muk ex Weezing", count: 4, wins: 7, losses: 7, ties: 0 },
  { deck_name: "Weezing Darkrai ex", count: 4, wins: 10, losses: 10, ties: 0 },
  { deck_name: "Tapu Koko ex Luxray", count: 4, wins: 8, losses: 8, ties: 0 },
  { deck_name: "Snorlax ex Arceus ex", count: 4, wins: 10, losses: 11, ties: 0 },
  { deck_name: "Raikou ex Greninja", count: 4, wins: 9, losses: 8, ties: 2 },
  { deck_name: "Incineroar ex Sylveon ex", count: 4, wins: 11, losses: 13, ties: 0 },
  { deck_name: "Paldean Clodsire ex Darkrai ex", count: 4, wins: 10, losses: 11, ties: 1 },
  { deck_name: "Togekiss Cleffa", count: 4, wins: 8, losses: 10, ties: 0 },
  { deck_name: "Giratina ex Arceus ex", count: 4, wins: 8, losses: 10, ties: 0 },
  { deck_name: "Darkrai ex Umbreon ex", count: 4, wins: 7, losses: 9, ties: 0 },
  { deck_name: "Garchomp ex", count: 4, wins: 10, losses: 13, ties: 0 },
  { deck_name: "Infernape ex Flareon ex", count: 4, wins: 9, losses: 12, ties: 0 },
  { deck_name: "Lanturn ex Pichu", count: 4, wins: 9, losses: 12, ties: 0 },
  { deck_name: "Gyarados ex Palkia ex", count: 4, wins: 9, losses: 11, ties: 1 },
  { deck_name: "Suicune ex Araquanid", count: 4, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Suicune ex Alolan Raichu ex", count: 4, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Decidueye", count: 4, wins: 8, losses: 11, ties: 1 },
  { deck_name: "Arceus ex Lucario ex", count: 4, wins: 11, losses: 16, ties: 1 },
  { deck_name: "Leafeon ex Eevee ex", count: 4, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Pikachu ex Pichu", count: 4, wins: 6, losses: 10, ties: 0 },
  { deck_name: "Umbreon ex Malamar", count: 4, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Silvally", count: 4, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Sylveon ex Gengar ex", count: 4, wins: 7, losses: 12, ties: 1 },
  { deck_name: "Tyranitar Naganadel", count: 4, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Dialga ex Arceus ex", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Alolan Raichu ex Pichu", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Leafeon ex Meowscarada", count: 4, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Poliwrath ex Mantyke", count: 4, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Boltund Tapu Koko ex", count: 4, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Solgaleo ex", count: 4, wins: 4, losses: 11, ties: 0 },
  { deck_name: "Gyarados ex Manaphy", count: 4, wins: 4, losses: 11, ties: 0 },
  { deck_name: "Venusaur ex Leafeon ex", count: 4, wins: 4, losses: 12, ties: 0 },
  { deck_name: "Gyarados Suicune ex", count: 4, wins: 3, losses: 11, ties: 0 },
  { deck_name: "Suicune ex Pidgeot ex", count: 4, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Blastoise ex Blastoise", count: 4, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Gengar ex Gengar", count: 4, wins: 2, losses: 10, ties: 0 },
  { deck_name: "Poliwrath ex Garchomp", count: 4, wins: 2, losses: 11, ties: 0 },
  { deck_name: "Weavile ex Zoroark", count: 4, wins: 1, losses: 12, ties: 0 },
  { deck_name: "Arceus ex Tyranitar", count: 4, wins: 0, losses: 10, ties: 0 },
  { deck_name: "Golem Druddigon", count: 4, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Suicune ex Wugtrio ex", count: 3, wins: 14, losses: 5, ties: 0 },
  { deck_name: "Lanturn ex Zeraora", count: 3, wins: 14, losses: 6, ties: 0 },
  { deck_name: "Charizard ex Magby", count: 3, wins: 12, losses: 6, ties: 0 },
  { deck_name: "Palkia ex Gyarados", count: 3, wins: 16, losses: 5, ties: 3 },
  { deck_name: "Arceus ex Altaria", count: 3, wins: 10, losses: 5, ties: 0 },
  { deck_name: "Luxray Oricorio", count: 3, wins: 13, losses: 8, ties: 0 },
  { deck_name: "Jumpluff ex Zeraora", count: 3, wins: 9, losses: 6, ties: 0 },
  { deck_name: "Crobat Arceus", count: 3, wins: 12, losses: 8, ties: 0 },
  { deck_name: "Alolan Raichu ex Entei ex", count: 3, wins: 10, losses: 8, ties: 0 },
  { deck_name: "Electivire Raikou ex", count: 3, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Gallade ex Hitmontop", count: 3, wins: 9, losses: 7, ties: 1 },
  { deck_name: "Mismagius ex Giratina ex", count: 3, wins: 9, losses: 8, ties: 0 },
  { deck_name: "Altaria Ultra Necrozma ex", count: 3, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Ninetales Rapidash", count: 3, wins: 7, losses: 7, ties: 0 },
  { deck_name: "Incineroar ex Cleffa", count: 3, wins: 10, losses: 9, ties: 1 },
  { deck_name: "Luxray Pichu", count: 3, wins: 8, losses: 8, ties: 0 },
  { deck_name: "Entei ex Giratina ex", count: 3, wins: 8, losses: 7, ties: 2 },
  { deck_name: "Beedrill ex Exeggutor ex", count: 3, wins: 7, losses: 8, ties: 0 },
  { deck_name: "Pikachu ex Zebstrika", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Lucario Hitmontop", count: 3, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Raichu ex Pikachu ex", count: 3, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Alolan Raichu ex Altaria", count: 3, wins: 10, losses: 12, ties: 0 },
  { deck_name: "Jolteon Pikachu ex", count: 3, wins: 9, losses: 10, ties: 1 },
  { deck_name: "Luxray Raikou ex", count: 3, wins: 8, losses: 9, ties: 1 },
  { deck_name: "Kingdra ex Greninja", count: 3, wins: 7, losses: 9, ties: 0 },
  { deck_name: "Ho-Oh ex Dragonite", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Alolan Raichu ex Darkrai ex", count: 3, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Guzzlord ex Tyranitar", count: 3, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Dragonite Pichu", count: 3, wins: 5, losses: 6, ties: 1 },
  { deck_name: "Donphan ex Donphan", count: 3, wins: 7, losses: 10, ties: 0 },
  { deck_name: "Solgaleo ex Silvally", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Darkrai ex Crobat ex", count: 3, wins: 6, losses: 9, ties: 0 },
  { deck_name: "Snorlax ex Lugia ex", count: 3, wins: 7, losses: 11, ties: 0 },
  { deck_name: "Ho-Oh ex Darkrai ex", count: 3, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Raikou ex Electivire", count: 3, wins: 7, losses: 11, ties: 1 },
  { deck_name: "Donphan ex Tyrogue", count: 3, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Slowking Articuno ex", count: 3, wins: 4, losses: 6, ties: 1 },
  { deck_name: "Guzzlord ex Darkrai ex", count: 3, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Zapdos ex Arceus ex", count: 3, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Beedrill ex Shuckle ex", count: 3, wins: 5, losses: 8, ties: 1 },
  { deck_name: "Decidueye ex", count: 3, wins: 6, losses: 11, ties: 0 },
  { deck_name: "Scolipede Weezing", count: 3, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Giratina ex Sylveon ex", count: 3, wins: 4, losses: 8, ties: 0 },
  { deck_name: "Decidueye ex Raikou ex", count: 3, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Meowscarada Shuckle ex", count: 3, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Palkia ex Manaphy", count: 3, wins: 4, losses: 9, ties: 0 },
  { deck_name: "Alolan Dugtrio ex Skarmory ex", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Meowscarada Celebi", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Paldean Clodsire ex Grafaiai", count: 3, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Crobat ex Paldean Clodsire ex", count: 3, wins: 5, losses: 12, ties: 0 },
  { deck_name: "Exeggutor ex Alolan Exeggutor", count: 3, wins: 4, losses: 10, ties: 0 },
  { deck_name: "Incineroar ex Incineroar", count: 3, wins: 4, losses: 9, ties: 1 },
  { deck_name: "Suicune ex Arceus ex", count: 3, wins: 3, losses: 7, ties: 1 },
  { deck_name: "Palkia ex Mantyke", count: 3, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Arceus ex Carnivine", count: 3, wins: 3, losses: 9, ties: 0 },
  { deck_name: "Paldean Clodsire ex Weezing", count: 3, wins: 3, losses: 10, ties: 0 },
  { deck_name: "Kingdra ex Suicune ex", count: 3, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Dragonite", count: 3, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Moltres ex Charizard ex", count: 3, wins: 2, losses: 8, ties: 0 },
  { deck_name: "Blastoise ex Palkia ex", count: 3, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Pikachu ex Tapu Koko ex", count: 3, wins: 2, losses: 9, ties: 0 },
  { deck_name: "Darkrai ex Umbreon", count: 3, wins: 2, losses: 11, ties: 0 },
  { deck_name: "Naganadel Darkrai ex", count: 3, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Blastoise ex Articuno ex", count: 3, wins: 1, losses: 7, ties: 0 },
  { deck_name: "Wigglytuff ex Arceus ex", count: 3, wins: 1, losses: 7, ties: 0 },
  { deck_name: "Zapdos ex Pichu", count: 3, wins: 1, losses: 8, ties: 0 },
  { deck_name: "Arceus ex Pikachu ex", count: 3, wins: 1, losses: 8, ties: 0 },
  { deck_name: "Charizard ex Moltres ex", count: 3, wins: 1, losses: 8, ties: 1 },
  { deck_name: "Ho-Oh ex Dragonite ex", count: 3, wins: 0, losses: 7, ties: 0 },
  { deck_name: "Guzzlord ex Celesteela", count: 3, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Infernape ex Moltres ex", count: 2, wins: 5, losses: 2, ties: 0 },
  { deck_name: "Greninja Snorlax", count: 2, wins: 7, losses: 3, ties: 0 },
  { deck_name: "Tapu Koko ex Oricorio", count: 2, wins: 11, losses: 6, ties: 0 },
  { deck_name: "Darkrai ex Snorlax ex", count: 2, wins: 7, losses: 4, ties: 0 },
  { deck_name: "Pikachu ex Zapdos ex", count: 2, wins: 9, losses: 6, ties: 0 },
  { deck_name: "Alolan Muk ex Igglybuff", count: 2, wins: 7, losses: 5, ties: 0 },
  { deck_name: "Raichu ex Zeraora", count: 2, wins: 7, losses: 5, ties: 0 },
  { deck_name: "Primarina ex Pyukumuku", count: 2, wins: 8, losses: 6, ties: 0 },
  { deck_name: "Gallade ex Rampardos", count: 2, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Arcanine ex Moltres ex", count: 2, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Gyarados ex", count: 2, wins: 5, losses: 4, ties: 0 },
  { deck_name: "Magnezone Oricorio", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Wugtrio ex Palkia ex", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Gyarados Corsola", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Gallade ex Hitmonlee", count: 2, wins: 6, losses: 5, ties: 0 },
  { deck_name: "Alolan Raichu ex Magnezone", count: 2, wins: 7, losses: 6, ties: 0 },
  { deck_name: "Lanturn ex Galvantula", count: 2, wins: 7, losses: 5, ties: 1 },
  { deck_name: "Palkia ex Origin Forme Palkia", count: 2, wins: 9, losses: 7, ties: 1 },
  { deck_name: "Raikou ex Decidueye ex", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Sylveon ex", count: 2, wins: 7, losses: 7, ties: 0 },
  { deck_name: "Glaceon ex Palkia ex", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Arceus ex Suicune ex", count: 2, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Beedrill ex Meowscarada", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Infernape ex", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Milotic Suicune ex", count: 2, wins: 5, losses: 5, ties: 0 },
  { deck_name: "Dragonite ex Zeraora", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Raichu ex Tapu Koko ex", count: 2, wins: 7, losses: 7, ties: 0 },
  { deck_name: "Sylveon ex Rampardos", count: 2, wins: 6, losses: 6, ties: 0 },
  { deck_name: "Arceus ex Zeraora", count: 2, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Espeon ex", count: 2, wins: 6, losses: 6, ties: 1 },
  { deck_name: "Donphan ex", count: 2, wins: 6, losses: 7, ties: 0 },
  { deck_name: "Eevee ex Espeon ex", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Incineroar ex Salazzle", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Electivire Galvantula", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Snorlax ex Giratina ex", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Flareon ex Eevee ex", count: 2, wins: 5, losses: 6, ties: 0 },
  { deck_name: "Tapu Koko ex Zapdos ex", count: 2, wins: 4, losses: 4, ties: 1 },
  { deck_name: "Sylveon ex Luxray", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Luxray Electivire", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Porygon-Z Giratina ex", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Tapu Koko ex Zeraora", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Electivire Zeraora", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Gallade ex Magnezone", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Starmie ex Articuno ex", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Pikachu ex Raichu", count: 2, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Buzzwole ex Pheromosa", count: 2, wins: 6, losses: 6, ties: 2 },
  { deck_name: "Entei ex Charizard ex", count: 2, wins: 6, losses: 8, ties: 0 },
  { deck_name: "Donphan ex Lycanroc", count: 2, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Zapdos ex Raikou ex", count: 2, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Alolan Golem Pichu", count: 2, wins: 5, losses: 6, ties: 1 },
  { deck_name: "Venusaur ex", count: 2, wins: 5, losses: 7, ties: 0 },
  { deck_name: "Dragonite Suicune ex", count: 2, wins: 4, losses: 5, ties: 1 },
  { deck_name: "Infernape ex Shiinotic", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Primarina ex Palkia ex", count: 2, wins: 4, losses: 5, ties: 1 },
  { deck_name: "Silvally Meowscarada", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Espeon ex Mismagius ex", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Altaria Darkrai ex", count: 2, wins: 4, losses: 6, ties: 0 },
  { deck_name: "Alolan Raichu ex Oricorio", count: 2, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Ampharos", count: 2, wins: 5, losses: 8, ties: 0 },
  { deck_name: "Garchomp Mantyke", count: 2, wins: 5, losses: 7, ties: 1 },
  { deck_name: "Arceus ex Snorlax ex", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Melmetal Skarmory", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Poliwrath ex Rampardos", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Meowscarada Leafeon", count: 2, wins: 3, losses: 5, ties: 0 },
  { deck_name: "Shuckle ex Meowscarada", count: 2, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Skarmory ex Bastiodon", count: 2, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Meowscarada Tyrogue", count: 2, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Kabutops Rampardos", count: 2, wins: 4, losses: 7, ties: 0 },
  { deck_name: "Porygon-Z Mantyke", count: 2, wins: 5, losses: 9, ties: 0 },
  { deck_name: "Umbreon Darkrai ex", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Suicune ex Feraligatr", count: 2, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex", count: 2, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Glaceon ex Alolan Raichu ex", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Giratina ex Gardevoir", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Lunala ex", count: 2, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Raichu ex Raikou ex", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Suicune ex Omastar", count: 2, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Starmie ex Milotic", count: 2, wins: 3, losses: 5, ties: 1 },
  { deck_name: "Dragonite ex Raikou ex", count: 2, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Lickilicky ex Lickilicky", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Raikou ex Crobat", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Luxray Zeraora", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Celebi ex Meowscarada", count: 2, wins: 3, losses: 6, ties: 1 },
  { deck_name: "Mismagius ex Sylveon ex", count: 2, wins: 3, losses: 7, ties: 0 },
  { deck_name: "Sylveon ex Giratina ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Lugia ex Silvally", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Meowscarada", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Pidgeot ex Dialga ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Infernape ex Magby", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Suicune ex Dragonite ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Decidueye ex Lurantis", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Vanilluxe Alcremie", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Yanmega ex Raikou ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Decidueye ex Suicune ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Beedrill ex", count: 2, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Meowscarada Celebi ex", count: 2, wins: 3, losses: 8, ties: 0 },
  { deck_name: "Pikachu ex Magnezone", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Primeape", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Umbreon ex Zoroark", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Tinkaton ex Dialga ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Alolan Exeggutor Pichu", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Silvally", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Flareon ex Entei ex", count: 2, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Pikachu ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Jumpluff ex Arceus ex", count: 2, wins: 2, losses: 6, ties: 0 },
  { deck_name: "Crobat ex Crobat", count: 2, wins: 2, losses: 7, ties: 0 },
  { deck_name: "Lanturn ex Tapu Koko ex", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Porygon-Z Pichu", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Umbreon ex Giratina ex", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Donphan ex Silvally", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Altaria Druddigon", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Darkrai ex", count: 2, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gyarados ex Articuno ex", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Luxray Galvantula", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Silvally Suicune ex", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Suicune ex Slowking", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Paldean Clodsire ex Naganadel", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Tinkaton ex Pichu", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Umbreon ex Greninja", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Skarmory ex Melmetal", count: 2, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Mew ex Gardevoir", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Pikachu ex Pachirisu ex", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Sylveon ex Ampharos", count: 2, wins: 1, losses: 6, ties: 0 },
  { deck_name: "Garchomp ex Lucario", count: 2, wins: 1, losses: 8, ties: 0 },
  { deck_name: "Incineroar ex Charizard ex", count: 2, wins: 1, losses: 9, ties: 0 },
  { deck_name: "Dialga ex Gholdengo", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Gengar", count: 2, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alolan Raichu ex Sylveon ex", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Gardevoir", count: 2, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Crobat ex Guzzlord ex", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Silvally Magby", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Gholdengo", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Leafeon ex Aerodactyl ex", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Ninetales Rapidash", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Decidueye ex Swanna", count: 2, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Mamoswine Regirock", count: 2, wins: 0, losses: 6, ties: 0 },
  { deck_name: "Blastoise ex Lapras", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Galarian Cursola Latias", count: 2, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Mewtwo ex", count: 1, wins: 6, losses: 1, ties: 0 },
  { deck_name: "Charizard ex Incineroar ex", count: 1, wins: 4, losses: 1, ties: 0 },
  { deck_name: "Steelix Mantyke", count: 1, wins: 7, losses: 2, ties: 0 },
  { deck_name: "Espeon ex Gardevoir", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Charizard ex Flareon ex", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Gardevoir", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Jumpluff Snorlax", count: 1, wins: 6, losses: 1, ties: 1 },
  { deck_name: "Silvally Zeraora", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Flareon ex Turtonator", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Palkia ex Gyarados ex", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Mew ex", count: 1, wins: 3, losses: 1, ties: 0 },
  { deck_name: "Espeon ex Giratina ex", count: 1, wins: 6, losses: 2, ties: 0 },
  { deck_name: "Guzzlord ex Umbreon", count: 1, wins: 5, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Palkia ex", count: 1, wins: 5, losses: 2, ties: 0 },
  { deck_name: "Dugtrio Rampardos", count: 1, wins: 5, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Bibarel ex", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Flareon ex Flareon", count: 1, wins: 2, losses: 1, ties: 0 },
  { deck_name: "Porygon-Z Stoutland", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Flareon ex Magby", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Lycanroc ex Pichu", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Melmetal Alolan Dugtrio", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Pawmot Zangoose", count: 1, wins: 6, losses: 2, ties: 1 },
  { deck_name: "Skarmory ex Wigglytuff", count: 1, wins: 6, losses: 2, ties: 1 },
  { deck_name: "Rampardos Lucario", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Magnezone Hitmonlee", count: 1, wins: 4, losses: 2, ties: 0 },
  { deck_name: "Meowscarada Kartana", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Pidgeot ex Banette", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Umbreon ex Naganadel", count: 1, wins: 5, losses: 2, ties: 1 },
  { deck_name: "Magnezone Skarmory", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Entei ex Infernape ex", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Tyranitar Snorlax", count: 1, wins: 5, losses: 2, ties: 1 },
  { deck_name: "Magby Turtonator", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Weavile ex Malamar", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Dragonite ex Oricorio", count: 1, wins: 5, losses: 3, ties: 0 },
  { deck_name: "Alolan Raichu ex Silvally", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Dugtrio Tyrogue", count: 1, wins: 6, losses: 4, ties: 0 },
  { deck_name: "Altaria Arceus ex", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Xatu Grafaiai", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Glaceon ex Greninja", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Palkia ex", count: 1, wins: 6, losses: 3, ties: 1 },
  { deck_name: "Togekiss Galarian Cursola", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Venusaur ex Mantyke", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Weavile ex Paldean Clodsire ex", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Machamp ex Lucario ex", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Lanturn ex Pikachu ex", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Wishiwashi ex Wishiwashi", count: 1, wins: 3, losses: 2, ties: 0 },
  { deck_name: "Marowak ex Aerodactyl ex", count: 1, wins: 4, losses: 2, ties: 1 },
  { deck_name: "Raikou ex Pidgeot ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Naganadel", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Espeon ex Gengar ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Arceus ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Dragonite ex Dragonite", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Arceus ex Alolan Raichu ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Meowscarada Sylveon ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Rampardos Type: Null", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Alolan Raichu ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Rampardos Aerodactyl ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Rampardos Silvally", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Giratina ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Tsareena Celebi ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Kingdra ex Wugtrio ex", count: 1, wins: 4, losses: 2, ties: 1 },
  { deck_name: "Gengar Mismagius", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Magby Torkoal", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Altaria Oricorio", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Ho-Oh ex", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Zoroark Silvally", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Alolan Exeggutor", count: 1, wins: 4, losses: 3, ties: 0 },
  { deck_name: "Arceus ex Crobat ex", count: 1, wins: 5, losses: 3, ties: 1 },
  { deck_name: "Tyranitar Toxicroak", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Umbreon ex Eevee ex", count: 1, wins: 3, losses: 2, ties: 1 },
  { deck_name: "Umbreon ex Arceus ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Miltank", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Decidueye ex Silvally", count: 1, wins: 4, losses: 3, ties: 1 },
  { deck_name: "Decidueye ex Shuckle ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Feraligatr Articuno", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Wugtrio ex Mantyke", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Charizard ex Entei ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Charizard ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Togekiss Shiinotic", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Exeggutor ex Leafeon ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Suicune ex Starmie ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Entei ex Magnezone", count: 1, wins: 4, losses: 3, ties: 1 },
  { deck_name: "Donphan ex Sylveon ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Machamp Tyrogue", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Espeon ex Leafeon ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Primarina Miltank", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Solgaleo ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Probopass ex Magby", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Giratina ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Kommo-o Pichu", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Magnezone Arceus ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Lucario Kabutops", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Exeggutor ex Yanmega ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Ampharos", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Ninetales Magby", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Exeggutor Leafeon", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Arceus ex Silvally", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Slowking Palkia ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Glaceon ex Primarina ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Gengar ex Gengar", count: 1, wins: 4, losses: 3, ties: 1 },
  { deck_name: "Galarian Cursola Banette", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Snorlax ex Miltank", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Scolipede Zoroark", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Greninja Dragonite", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Silvally Buzzwole ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Venusaur ex Pichu", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Zapdos ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Incineroar Shiinotic", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Dugtrio Donphan", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Beedrill ex Lurantis", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Ampharos Zapdos ex", count: 1, wins: 3, losses: 2, ties: 1 },
  { deck_name: "Raichu ex Pichu", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Dugtrio Hitmonlee", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Silvally Altaria", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Mismagius", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Tapu Koko ex Jolteon", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Rampardos Meowth", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Umbreon ex Leafeon ex", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Buzzwole ex", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Toucannon", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Zoroark Darkrai ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Meowscarada Cleffa", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Butterfree Alolan Exeggutor", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Alolan Raichu ex Pikachu ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Pyukumuku", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Magcargo", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Gallade ex Stoutland", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Greninja Giratina ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Oricorio Zeraora", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Incineroar ex", count: 1, wins: 3, losses: 3, ties: 0 },
  { deck_name: "Ho-Oh ex Rayquaza ex", count: 1, wins: 2, losses: 2, ties: 0 },
  { deck_name: "Decidueye ex Meowscarada", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Kingdra ex Milotic", count: 1, wins: 4, losses: 4, ties: 0 },
  { deck_name: "Buzzwole ex Celebi", count: 1, wins: 1, losses: 1, ties: 0 },
  { deck_name: "Alolan Raichu ex Elekid", count: 1, wins: 4, losses: 5, ties: 0 },
  { deck_name: "Raikou ex Tapu Koko ex", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Entei ex Salazzle", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Lycanroc ex Lycanroc", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Pikachu ex", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Charizard ex Entei ex", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Solgaleo ex Melmetal", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Infernape ex Sylveon ex", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Crobat ex", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Entei ex Greninja", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Celebi ex Mantyke", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Solgaleo ex Entei ex", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Giratina ex Latios", count: 1, wins: 3, losses: 3, ties: 1 },
  { deck_name: "Altaria Pichu", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Staraptor Rampardos", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Raichu Pikachu ex", count: 1, wins: 3, losses: 4, ties: 0 },
  { deck_name: "Decidueye ex Decidueye", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Decidueye ex Tsareena", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Tyranitar Umbreon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gardevoir Latias", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Lucario ex Lycanroc ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dusknoir Espeon ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Meowth", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Jolteon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Alolan Raichu ex Raichu", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Kabutops", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Beedrill ex Celebi", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Guzzlord ex Mantyke", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Primarina ex Mantyke", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Blacephalon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Cleffa", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gardevoir Mewtwo ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Primeape", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Entei ex Rayquaza ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Weezing", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Jolteon Oricorio", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Arceus ex Shaymin", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Snorlax ex Entei ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Rayquaza ex Ho-Oh ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Pichu", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Silvally Tapu Koko ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Rampardos", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Alolan Dugtrio ex Dialga ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Electivire Pikachu ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Skarmory Bastiodon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Kingdra ex Sylveon ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Vaporeon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Togekiss", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Electrode", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Celebi ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Skarmory ex Giratina ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Guzzlord ex Zoroark", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Alolan Exeggutor", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Krookodile", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Articuno ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dragonite ex Altaria", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Snorlax ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Jumpluff ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Lucario", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Pikachu ex Oricorio", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Sylveon ex Lugia ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Mew ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Mismagius ex Galarian Cursola", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Abomasnow", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Pidgeot", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Aerodactyl ex Exeggutor ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Primarina ex Milotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Paldean Clodsire ex Nihilego", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mew ex Snorlax ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Bastiodon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Eevee ex Flareon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Hitmonlee", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Eevee ex Pikachu ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pikachu ex Magnezone", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mew ex Ho-Oh ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Tapu Koko ex Silvally", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Pikachu ex Mew ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Umbreon ex Paldean Clodsire ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weezing Naganadel", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Zoroark Nihilego", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Donphan ex Dugtrio", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Silvally", count: 1, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Articuno ex Palkia ex", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Solgaleo ex Sylveon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Buzzwole ex Shuckle ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Articuno ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mismagius ex Shiinotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Rayquaza ex Meowscarada", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Yanmega ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Silvally", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Altaria", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Stantler Zangoose", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Crobat", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Mew ex Giratina ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Raichu Electrode", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Guzzlord ex Pichu", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Meowscarada Beedrill ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Umbreon ex Silvally", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Tinkaton ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Greninja", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Boltund", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Poliwrath ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Tapu Koko ex Ampharos", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Silvally Guzzlord ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Kingdra ex Vaporeon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Wigglytuff ex Eevee ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pikachu ex Raichu", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Solgaleo ex Drampa", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Tapu Koko ex Giratina ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Dragonite Greninja", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Lucario ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Meowscarada Alolan Exeggutor", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Milotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Eevee ex Umbreon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Tentacruel", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp Pyukumuku", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Passimian ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Paldean Clodsire ex Scolipede", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Crobat ex Paldean Clodsire ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Greninja Darkrai ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Suicune ex Suicune", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Blastoise ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Greninja", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Mantyke", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Bibarel ex Bibarel", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Shuckle ex Exeggutor ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Alakazam", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dragonite Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lucario ex Dugtrio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Garchomp Cleffa", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Melmetal", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Mismagius ex Galarian Cursola", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lanturn ex Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Garchomp ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Altaria", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Galarian Cursola", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Suicune ex Blissey", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Miltank", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Rayquaza ex Dialga ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Incineroar Flareon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Rampardos Hitmonchan", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Silvally Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Articuno", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Vaporeon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Paldean Clodsire ex Absol", count: 1, wins: 1, losses: 2, ties: 1 },
  { deck_name: "Sylveon ex Garchomp ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Crobat Nihilego", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Decidueye ex Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Crawdaunt", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Umbreon Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Umbreon ex Weavile ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Paldean Clodsire ex Crobat ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Wugtrio ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise Vaporeon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Altaria Mantyke", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Shiinotic", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gengar ex Sylveon ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Zebstrika Heliolisk", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Arceus ex Zapdos ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Silvally Espeon", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gallade ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Mew ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Guzzlord ex Celesteela", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Arcanine ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Boltund Pikachu ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Weezing Nihilego", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Garchomp Poliwrath ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Espeon ex Gengar", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Luxray", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Alolan Exeggutor Rampardos", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Incineroar ex", count: 1, wins: 1, losses: 3, ties: 1 },
  { deck_name: "Crobat ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Crabominable ex Greninja", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Rampardos", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Altaria", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Beedrill ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Lunala ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Magnezone Arceus", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Primarina ex Seaking", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Sylveon ex Aerodactyl", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Altaria Guzzlord ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Tapu Koko ex Pikachu ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Umbreon ex Raikou ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Infernape ex", count: 1, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Leafeon ex Celebi ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Dhelmise", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Alolan Exeggutor", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Galvantula Pawmot", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Dugtrio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Buzzwole ex Altaria", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Giratina ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jolteon Zapdos", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Leafeon ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Exeggutor ex Meowscarada", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Glaceon ex Mantyke", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Raichu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Blissey ex Blissey", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Galarian Cursola", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Kingdra ex Feraligatr", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Kangaskhan", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Meowscarada Silvally", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Eevee ex Giratina ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lanturn ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Gardevoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Suicune ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Darkrai ex Malamar", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Dugtrio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Altaria Lugia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Altaria", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Primarina ex Articuno ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Togekiss Banette", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Togekiss", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Passimian ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Swanna", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Igglybuff", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Snorlax ex Rampardos", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Arceus ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Miltank Zangoose", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Crawdaunt Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Articuno ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Cleffa", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Alolan Exeggutor Exeggutor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Farfetch'd Igglybuff", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Passimian ex Dugtrio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Palkia ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Zapdos ex Oricorio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Raikou", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Mewtwo ex Swanna", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lunala ex Gardevoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Exeggutor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Jumpluff ex Sylveon ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Leafeon ex Decidueye ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dragonite ex Sylveon ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Luxray Zeraora", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Eevee ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Sylveon ex Decidueye ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Moltres ex Entei ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Leafeon ex Serperior", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Darkrai ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Hitmonchan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Froslass", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Beedrill ex Alolan Exeggutor", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Dragonite", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Poliwrath ex Snorlax", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Galarian Cursola Giratina ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Eevee ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Kartana", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Miltank", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Gengar", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Snorlax ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Umbreon ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Blissey", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Muk ex Murkrow", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Altaria Snorlax ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Sandslash", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Jumpluff ex Palkia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Buzzwole ex Pichu", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Lanturn ex Zapdos ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Rampardos", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Crobat ex Toxicroak", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Tinkaton ex Alolan Dugtrio ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp ex Lucario ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mantyke", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Giratina ex Unown", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Oricorio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Entei ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Scolipede", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bisharp Melmetal", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magcargo Miltank", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Altaria Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Electivire Arceus ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Dialga ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Crabominable ex Kingdra ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Kingdra ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Decidueye ex Greninja", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Leafeon ex Shuckle ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Rampardos Miltank", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Glaceon ex Articuno ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Slowking Swanna", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wishiwashi ex Gyarados", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Paldean Clodsire ex Umbreon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Tinkaton ex Skarmory", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Jumpluff ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Galarian Cursola Mismagius", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magnezone Mewtwo ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Aerodactyl ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Zapdos ex Zeraora", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Giratina ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Articuno ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Ninetales Palkia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Pyukumuku", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Sudowoodo", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Lucario", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Mismagius ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lycanroc ex Hitmonlee", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Pikachu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Guzzlord ex Magby", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Mismagius Florges", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Entei ex Moltres ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Naganadel Nihilego", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Staraptor Oricorio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Lunala ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Ditto", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Garchomp ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Meowscarada", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Tauros Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shaymin Oricorio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Flareon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur ex Lilligant", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Suicune ex Decidueye ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Mantyke", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Swanna", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Salazzle", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Ho-Oh ex Snorlax ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Tapu Koko ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Gallade ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alolan Raichu ex Togedemaru", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lanturn ex Raikou ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Guzzlord ex Mantyke", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Primarina ex Mantyke", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Blacephalon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Cleffa", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Gardevoir Mewtwo ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Primeape", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Entei ex Rayquaza ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Weezing", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Jolteon Oricorio", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Arceus ex Shaymin", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Snorlax ex Entei ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Rayquaza ex Ho-Oh ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Pichu", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Silvally Tapu Koko ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Rampardos", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Alolan Dugtrio ex Dialga ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Electivire Pikachu ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Skarmory Bastiodon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Kingdra ex Sylveon ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Vaporeon", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Togekiss", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Pikachu ex Electrode", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Celebi ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Skarmory ex Giratina ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Guzzlord ex Zoroark", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Alolan Exeggutor", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Krookodile", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Articuno ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dragonite ex Altaria", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Dialga ex Snorlax ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Jumpluff ex", count: 1, wins: 2, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Lucario", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Pikachu ex Oricorio", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Sylveon ex Lugia ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Mew ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Mismagius ex Galarian Cursola", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Abomasnow", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Pidgeot", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Aerodactyl ex Exeggutor ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Primarina ex Milotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Paldean Clodsire ex Nihilego", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mew ex Snorlax ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Bastiodon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Eevee ex Flareon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Hitmonlee", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Eevee ex Pikachu ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pikachu ex Magnezone", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mew ex Ho-Oh ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Tapu Koko ex Silvally", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Pikachu ex Mew ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Umbreon ex Paldean Clodsire ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Weezing Naganadel", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Zoroark Nihilego", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Donphan ex Dugtrio", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Silvally", count: 1, wins: 3, losses: 6, ties: 0 },
  { deck_name: "Articuno ex Palkia ex", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Solgaleo ex Sylveon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Buzzwole ex Shuckle ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Articuno ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Mismagius ex Shiinotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Rayquaza ex Meowscarada", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Yanmega ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Silvally", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Altaria", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Stantler Zangoose", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Crobat", count: 1, wins: 2, losses: 3, ties: 1 },
  { deck_name: "Mew ex Giratina ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Raichu Electrode", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Guzzlord ex Pichu", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Meowscarada Beedrill ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Umbreon ex Silvally", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Tinkaton ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Greninja", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Boltund", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Poliwrath ex", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Tapu Koko ex Ampharos", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Silvally Guzzlord ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Kingdra ex Vaporeon", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Wigglytuff ex Eevee ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Pikachu ex Raichu", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Solgaleo ex Drampa", count: 1, wins: 2, losses: 4, ties: 0 },
  { deck_name: "Tapu Koko ex Giratina ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Dragonite Greninja", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Lucario ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Meowscarada Alolan Exeggutor", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Milotic", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Eevee ex Umbreon ex", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Tentacruel", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Garchomp Pyukumuku", count: 1, wins: 1, losses: 2, ties: 0 },
  { deck_name: "Gallade ex Passimian ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Paldean Clodsire ex Scolipede", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Crobat ex Paldean Clodsire ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Greninja Darkrai ex", count: 1, wins: 2, losses: 5, ties: 0 },
  { deck_name: "Suicune ex Suicune", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Palkia ex Blastoise ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Infernape ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Greninja", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Mantyke", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Bibarel ex Bibarel", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Shuckle ex Exeggutor ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Alakazam", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Dragonite Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lucario ex Dugtrio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Garchomp Cleffa", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Melmetal", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Mismagius ex Galarian Cursola", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Lanturn ex Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Machamp ex Garchomp ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Darkrai ex Altaria", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Solgaleo ex Galarian Cursola", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Suicune ex Blissey", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gyarados ex Miltank", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Rayquaza ex Dialga ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Incineroar Flareon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Rampardos Hitmonchan", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Giratina ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Silvally Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Starmie ex Articuno", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Vaporeon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Paldean Clodsire ex Absol", count: 1, wins: 1, losses: 2, ties: 1 },
  { deck_name: "Sylveon ex Garchomp ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Crobat Nihilego", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Decidueye ex Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Oricorio", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Crawdaunt", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Umbreon Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Umbreon ex Weavile ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Paldean Clodsire ex Crobat ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Silvally", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Wugtrio ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Blastoise Vaporeon", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Zoroark", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Giratina ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Altaria Mantyke", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Magnezone Shiinotic", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Gengar ex Sylveon ex", count: 1, wins: 1, losses: 3, ties: 0 },
  { deck_name: "Zebstrika Heliolisk", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Arceus ex Zapdos ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Silvally Espeon", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gallade ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Gengar ex Mew ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Guzzlord ex Celesteela", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Arcanine ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Boltund Pikachu ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Weezing Nihilego", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Garchomp Poliwrath ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Espeon ex Gengar", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Raikou ex Luxray", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Alolan Exeggutor Rampardos", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Charizard ex Incineroar ex", count: 1, wins: 1, losses: 3, ties: 1 },
  { deck_name: "Crobat ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Crabominable ex Greninja", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Rampardos", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Altaria", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Beedrill ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Lunala ex Sylveon ex", count: 1, wins: 1, losses: 4, ties: 0 },
  { deck_name: "Magnezone Arceus", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Primarina ex Seaking", count: 1, wins: 1, losses: 5, ties: 0 },
  { deck_name: "Sylveon ex Aerodactyl", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Altaria Guzzlord ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Tapu Koko ex Pikachu ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Umbreon ex Raikou ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Infernape ex", count: 1, wins: 0, losses: 5, ties: 0 },
  { deck_name: "Leafeon ex Celebi ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Dhelmise", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Sylveon ex Alolan Exeggutor", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Galvantula Pawmot", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Dugtrio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Buzzwole ex Altaria", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp Giratina ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jolteon Zapdos", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Leafeon ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Exeggutor ex Meowscarada", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Glaceon ex Mantyke", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Raikou ex Raichu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Blissey ex Blissey", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Jumpluff ex Galarian Cursola", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Kingdra ex Feraligatr", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Blastoise ex Kangaskhan", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Meowscarada Silvally", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Eevee ex Giratina ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lanturn ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Gardevoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Suicune ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Darkrai ex Malamar", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Dugtrio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Altaria Lugia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Sylveon ex Altaria", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Primarina ex Articuno ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Togekiss Banette", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Togekiss", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Passimian ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Swanna", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Mew ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Igglybuff", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Snorlax ex Rampardos", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Crobat ex Arceus ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Miltank Zangoose", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Crawdaunt Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Articuno ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Garchomp ex Cleffa", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Alolan Exeggutor Exeggutor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Farfetch'd Igglybuff", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Passimian ex Dugtrio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mew ex Palkia ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Zapdos ex Oricorio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Raikou", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Mewtwo ex Swanna", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lunala ex Gardevoir", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Exeggutor", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Jumpluff ex Sylveon ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Leafeon ex Decidueye ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Dragonite ex Sylveon ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Luxray Zeraora", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Eevee ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Sylveon ex Decidueye ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Pidgeot ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Moltres ex Entei ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Leafeon ex Serperior", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Darkrai ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Hitmonchan", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dragonite Froslass", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Beedrill ex Alolan Exeggutor", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Dragonite", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Poliwrath ex Snorlax", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Galarian Cursola Giratina ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Eevee ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Serperior Celebi ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Yanmega ex Kartana", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Arceus ex Miltank", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Sylveon ex Gengar", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Snorlax ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Umbreon ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Dialga ex Blissey", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Muk ex Murkrow", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Altaria Snorlax ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Marowak ex Sandslash", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Jumpluff ex Palkia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Buzzwole ex Pichu", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Lanturn ex Zapdos ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Rampardos", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Magnezone", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Crobat ex Toxicroak", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Tinkaton ex Alolan Dugtrio ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Garchomp ex Lucario ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Mantyke", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Giratina ex Unown", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Oricorio", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Entei ex Suicune ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Scolipede", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Bisharp Melmetal", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magcargo Miltank", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Altaria Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Electivire Arceus ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Lickilicky ex Dialga ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Crabominable ex Kingdra ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Suicune ex Kingdra ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Decidueye ex Greninja", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Leafeon ex Shuckle ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Rampardos Miltank", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Glaceon ex Articuno ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Slowking Swanna", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Wishiwashi ex Gyarados", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Paldean Clodsire ex Umbreon", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Tinkaton ex Skarmory", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Exeggutor ex Jumpluff ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Galarian Cursola Mismagius", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Magnezone Mewtwo ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Aerodactyl ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Zapdos ex Zeraora", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Giratina ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Greninja Articuno ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Ninetales Palkia ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Crabominable ex Pyukumuku", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Donphan ex Sudowoodo", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Aerodactyl ex Lucario", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Gengar ex Mismagius ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lycanroc ex Hitmonlee", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Alolan Raichu ex Pikachu ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Guzzlord ex Magby", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Mismagius Florges", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Entei ex Moltres ex", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Naganadel Nihilego", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Staraptor Oricorio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Greninja Lunala ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Ditto", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Porygon-Z Garchomp ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Magnezone Meowscarada", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Darkrai ex Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Tauros Magby", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Shaymin Oricorio", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Charizard ex Flareon", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Venusaur ex Lilligant", count: 1, wins: 0, losses: 4, ties: 0 },
  { deck_name: "Suicune ex Decidueye ex", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Blastoise ex Mantyke", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Mewtwo ex Swanna", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Salazzle", count: 1, wins: 0, losses: 3, ties: 0 },
  { deck_name: "Ho-Oh ex Snorlax ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Tapu Koko ex", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Jumpluff ex Gallade ex", count: 1, wins: 0, losses: 1, ties: 0 },
  { deck_name: "Alolan Raichu ex Togedemaru", count: 1, wins: 0, losses: 2, ties: 0 },
  { deck_name: "Lanturn ex Raikou ex", count: 1, wins: 0, losses: 1, ties: 0 }
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