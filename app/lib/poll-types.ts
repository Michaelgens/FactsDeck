/** FactsDeck article poll — 5 sequential questions per article (stored as JSON on `posts.poll`). */

export type PollQuestionKind = "knowledge" | "opinion" | "experience" | "confidence";

export type PollOption = {
  id: string;
  label: string;
  votes: number;
};

export type PollQuestion = {
  id: string;
  kind: PollQuestionKind;
  prompt: string;
  helpText?: string;
  options: PollOption[];
  /** Required when kind === "knowledge" */
  correctOptionId?: string;
};

/** Funnel metrics stored on `posts.poll.analytics` */
export type PollAnalytics = {
  /** Poll module rendered on article page (once per session) */
  impressions: number;
  /** User clicked Start challenge */
  starts: number;
  /** User answered all questions */
  completions: number;
  /** User chose “Not now” / dismiss */
  skips: number;
};

export type ArticlePoll = {
  enabled: boolean;
  title: string;
  subtitle: string;
  questions: PollQuestion[];
  analytics?: PollAnalytics;
};

export type PollEventType = "impression" | "start" | "complete" | "skip";

export const POLL_QUESTION_COUNT = 5;

const KIND_LABELS: Record<PollQuestionKind, string> = {
  knowledge: "Knowledge check",
  opinion: "Your take",
  experience: "Real life",
  confidence: "Confidence meter",
};

export function pollKindLabel(kind: PollQuestionKind): string {
  return KIND_LABELS[kind];
}

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyOption(label = ""): PollOption {
  return { id: newId("opt"), label, votes: 0 };
}

export function createEmptyQuestion(kind: PollQuestionKind = "opinion"): PollQuestion {
  return {
    id: newId("q"),
    kind,
    prompt: "",
    helpText: "",
    options: [createEmptyOption(""), createEmptyOption(""), createEmptyOption("")],
    ...(kind === "knowledge" ? { correctOptionId: undefined } : {}),
  };
}

export function emptyPollAnalytics(): PollAnalytics {
  return { impressions: 0, starts: 0, completions: 0, skips: 0 };
}

export function createEmptyPoll(): ArticlePoll {
  return {
    enabled: false,
    title: "FactsDeck Quick Check",
    subtitle: "Five quick questions — test what you learned and share your perspective.",
    questions: [],
    analytics: emptyPollAnalytics(),
  };
}

export function parsePollAnalytics(raw: unknown): PollAnalytics {
  if (!raw || typeof raw !== "object") return emptyPollAnalytics();
  const a = raw as Record<string, unknown>;
  return {
    impressions: Math.max(0, Number(a.impressions) || 0),
    starts: Math.max(0, Number(a.starts) || 0),
    completions: Math.max(0, Number(a.completions) || 0),
    skips: Math.max(0, Number(a.skips) || 0),
  };
}

function parseQuestionsFromRaw(o: Record<string, unknown>): PollQuestion[] {
  const questionsRaw = Array.isArray(o.questions) ? o.questions : [];
  const questions: PollQuestion[] = [];
  for (const q of questionsRaw) {
    if (!q || typeof q !== "object") continue;
    const row = q as Record<string, unknown>;
    const optionsRaw = Array.isArray(row.options) ? row.options : [];
    const options: PollOption[] = [];
    for (const opt of optionsRaw) {
      if (!opt || typeof opt !== "object") continue;
      const or = opt as Record<string, unknown>;
      const id = String(or.id ?? "").trim();
      const label = String(or.label ?? "").trim();
      if (!id || !label) continue;
      options.push({
        id,
        label,
        votes: Math.max(0, Number(or.votes) || 0),
      });
    }

    const kind = (["knowledge", "opinion", "experience", "confidence"] as const).includes(
      row.kind as PollQuestionKind
    )
      ? (row.kind as PollQuestionKind)
      : "opinion";

    const id = String(row.id ?? "").trim();
    const prompt = String(row.prompt ?? "").trim();
    if (!id || !prompt || options.length < 2) continue;

    questions.push({
      id,
      kind,
      prompt,
      helpText: row.helpText ? String(row.helpText) : undefined,
      options,
      correctOptionId:
        row.correctOptionId != null ? String(row.correctOptionId) : undefined,
    });
  }
  return questions;
}

/** Full poll payload for admin / DB round-trip (includes disabled polls + analytics). */
export function parsePollForAdmin(raw: unknown): ArticlePoll | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const questions = parseQuestionsFromRaw(o);
  return {
    enabled: Boolean(o.enabled),
    title: String(o.title ?? "FactsDeck Quick Check").trim() || "FactsDeck Quick Check",
    subtitle: String(o.subtitle ?? "").trim(),
    questions,
    analytics: parsePollAnalytics(o.analytics),
  };
}

export function totalPollVotes(poll: ArticlePoll): number {
  return poll.questions.reduce(
    (sum, q) => sum + q.options.reduce((s, o) => s + o.votes, 0),
    0
  );
}

export function votesPerQuestion(poll: ArticlePoll): number[] {
  return poll.questions.map((q) => q.options.reduce((s, o) => s + o.votes, 0));
}

export function pollRates(analytics: PollAnalytics) {
  const { impressions, starts, completions, skips } = analytics;
  const passive = Math.max(0, impressions - starts - skips);
  return {
    participationRate: impressions > 0 ? starts / impressions : null,
    completionRate: starts > 0 ? completions / starts : null,
    skipRate: impressions > 0 ? skips / impressions : null,
    passiveRate: impressions > 0 ? passive / impressions : null,
    passive,
  };
}

/** Default 5-question mix for new articles (edit prompts in admin). */
export function createFactsDeckPollTemplate(articleTitle: string, category = "money"): ArticlePoll {
  const topic = articleTitle.trim() || "this topic";
  const cat = category.toLowerCase();

  const questions: PollQuestion[] = [
    {
      id: newId("q"),
      kind: "knowledge",
      prompt: `Before reading, how familiar are you with the core ideas in “${topic}”?`,
      helpText: "No wrong answer — we use this to personalize your results.",
      options: [
        { id: newId("opt"), label: "Just getting started", votes: 0 },
        { id: newId("opt"), label: "I know the basics", votes: 0 },
        { id: newId("opt"), label: "Pretty confident", votes: 0 },
        { id: newId("opt"), label: "I could teach it", votes: 0 },
      ],
      correctOptionId: undefined,
    },
    {
      id: newId("q"),
      kind: "opinion",
      prompt: `What matters most to you when learning about ${cat}?`,
      options: [
        { id: newId("opt"), label: "Clear, simple explanations", votes: 0 },
        { id: newId("opt"), label: "Real numbers & examples", votes: 0 },
        { id: newId("opt"), label: "Action steps I can use today", votes: 0 },
        { id: newId("opt"), label: "Big-picture strategy", votes: 0 },
      ],
    },
    {
      id: newId("q"),
      kind: "knowledge",
      prompt: `Which statement best matches a key takeaway from “${topic}”?`,
      helpText: "Pick the answer that fits what the article emphasizes.",
      options: [
        { id: newId("opt"), label: "Option A — edit to match your article", votes: 0 },
        { id: newId("opt"), label: "Option B — edit to match your article", votes: 0 },
        { id: newId("opt"), label: "Option C — edit to match your article", votes: 0 },
        { id: newId("opt"), label: "I'm not sure yet", votes: 0 },
      ],
      correctOptionId: undefined,
    },
    {
      id: newId("q"),
      kind: "experience",
      prompt: "Have you applied ideas like these to your own finances in the last 90 days?",
      options: [
        { id: newId("opt"), label: "Not yet — still learning", votes: 0 },
        { id: newId("opt"), label: "I've started small steps", votes: 0 },
        { id: newId("opt"), label: "Yes, with mixed results", votes: 0 },
        { id: newId("opt"), label: "Yes, and it's working", votes: 0 },
      ],
    },
    {
      id: newId("q"),
      kind: "confidence",
      prompt: "After reading, how confident do you feel making a decision on this topic?",
      options: [
        { id: newId("opt"), label: "1 — Need more research", votes: 0 },
        { id: newId("opt"), label: "2 — Somewhat unsure", votes: 0 },
        { id: newId("opt"), label: "3 — Neutral", votes: 0 },
        { id: newId("opt"), label: "4 — Fairly confident", votes: 0 },
        { id: newId("opt"), label: "5 — Ready to act", votes: 0 },
      ],
    },
  ];

  return {
    enabled: true,
    title: "FactsDeck Quick Check",
    subtitle: `Five questions on “${topic}” — see how you stack up and compare with other readers.`,
    questions,
    analytics: emptyPollAnalytics(),
  };
}

/** Active poll for the public article page */
export function normalizePoll(raw: unknown): ArticlePoll | null {
  const parsed = parsePollForAdmin(raw);
  if (!parsed?.enabled || parsed.questions.length === 0) return null;
  return parsed;
}

function normalizeQuestionsForSave(questions: PollQuestion[]): PollQuestion[] {
  return questions
    .slice(0, POLL_QUESTION_COUNT)
    .map((q) => ({
      ...q,
      prompt: q.prompt.trim(),
      helpText: q.helpText?.trim() || undefined,
      options: q.options
        .map((o) => ({ ...o, label: o.label.trim(), votes: Math.max(0, o.votes) }))
        .filter((o) => o.label),
    }))
    .filter((q) => q.prompt && q.options.length >= 2);
}

export function serializePollForDb(poll: ArticlePoll | null | undefined): ArticlePoll | null {
  if (!poll) return null;

  const analytics = poll.analytics ?? emptyPollAnalytics();
  const questions = normalizeQuestionsForSave(poll.questions);

  if (!poll.enabled) {
    if (questions.length === 0 && !analytics.impressions && !analytics.starts) {
      return null;
    }
    return {
      enabled: false,
      title: poll.title.trim(),
      subtitle: poll.subtitle.trim(),
      questions,
      analytics,
    };
  }

  if (questions.length === 0) return null;

  return {
    enabled: true,
    title: poll.title.trim() || "FactsDeck Quick Check",
    subtitle: poll.subtitle.trim(),
    questions,
    analytics,
  };
}

export function bumpPollAnalytics(
  analytics: PollAnalytics,
  event: PollEventType
): PollAnalytics {
  const next = { ...analytics };
  if (event === "impression") next.impressions += 1;
  if (event === "start") next.starts += 1;
  if (event === "complete") next.completions += 1;
  if (event === "skip") next.skips += 1;
  return next;
}

export function validatePollForAdmin(poll: ArticlePoll | null | undefined): string[] {
  if (!poll?.enabled) return [];
  const errors: string[] = [];
  if (!poll.title.trim()) errors.push("Poll title is required when the poll is enabled");
  if (poll.questions.length !== POLL_QUESTION_COUNT) {
    errors.push(`Add exactly ${POLL_QUESTION_COUNT} questions (currently ${poll.questions.length})`);
  }
  poll.questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.prompt.trim()) errors.push(`Question ${n}: prompt is required`);
    const filled = q.options.filter((o) => o.label.trim());
    if (filled.length < 2) errors.push(`Question ${n}: at least 2 answer options required`);
    if (q.kind === "knowledge" && q.correctOptionId) {
      if (!filled.some((o) => o.id === q.correctOptionId)) {
        errors.push(`Question ${n}: correct answer must match one of the options`);
      }
    }
  });
  return errors;
}

export function isPollActive(poll: ArticlePoll | null | undefined): poll is ArticlePoll {
  return Boolean(poll?.enabled && poll.questions.length > 0);
}
