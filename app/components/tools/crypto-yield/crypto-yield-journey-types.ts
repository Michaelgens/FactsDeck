/** Interactive crypto yield journey (before AdvancedCryptoYieldLab). */

export const FACTS_DECK_CRYPTO_YIELD_TEST = "Facts Deck Crypto Yield Lab Test";

export const FACTS_DECK_CRYPTO_YIELD_LAB = "Facts Deck Crypto Staking & Yield Lab";

export type CryptoYieldGoal = "compounding" | "compare" | "exploring";

export type CompoundingMode = "annual" | "monthly" | "daily";

export type CryptoYieldJourneyAnswers = {
  goal: CryptoYieldGoal;
  principal: number;
  apyPercent: number;
  months: number;
  compounding: CompoundingMode;
};

export const CRYPTO_YIELD_JOURNEY_DEFAULTS: CryptoYieldJourneyAnswers = {
  goal: "compare",
  principal: 2_500,
  apyPercent: 4.5,
  months: 12,
  compounding: "monthly",
};
