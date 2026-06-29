export type SubscriberImportReport = {
  ok: boolean;
  error?: string;
  parsedTokens: number;
  validCount: number;
  duplicateInInput: number;
  alreadySubscribed: number;
  newlyAdded: number;
  invalidCount: number;
  /** Emails already in Supabase (not inserted again). */
  duplicateEmails: string[];
  /** Emails inserted this run. */
  addedEmails: string[];
  /** Invalid format (sample). */
  invalidSamples: string[];
};

export type AdminTestSendReport = {
  ok: boolean;
  error?: string;
  sent: number;
  failed: number;
  /** Up to 8 failure lines. */
  failures: string[];
};
