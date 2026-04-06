/** Interactive FI snapshot journey (before AdvancedFiSnapshot). */

export const FACTS_DECK_FI_SNAPSHOT_TEST = "Facts Deck Freedom Snapshot";

export const FACTS_DECK_FI_SNAPSHOT_TOOL = "Facts Deck Net Worth & Financial Independence Snapshot";

export type FiSnapshotGoal = "freedom" | "clarity" | "milestone" | "exploring";

/** Quick-test answers (mirrored into the full workspace as initial values). */
export type FiSnapshotJourneyAnswers = {
  goal: FiSnapshotGoal;
  liquidCash: number;
  invested: number;
  otherAssets: number;
  liabilities: number;
  monthlyExpenses: number;
  monthlyInvesting: number;
};

export const FI_SNAPSHOT_JOURNEY_DEFAULTS: FiSnapshotJourneyAnswers = {
  goal: "clarity",
  liquidCash: 18_000,
  invested: 112_000,
  otherAssets: 45_000,
  liabilities: 22_000,
  monthlyExpenses: 5_200,
  monthlyInvesting: 1_800,
};
