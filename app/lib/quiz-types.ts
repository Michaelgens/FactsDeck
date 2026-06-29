/** FactsDeck article quiz — 1–5 graded knowledge questions (stored as JSON on `posts.quiz`). */

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  helpText?: string;
  options: QuizOption[];
  correctOptionId: string;
};

export type QuizResultBand = {
  minScore: number;
  label: string;
  message: string;
};

export type QuizAnalytics = {
  impressions: number;
  starts: number;
  completions: number;
  skips: number;
  /** Count of completions by score (keys "0".."5") */
  scoreBuckets?: Record<string, number>;
};

export type ArticleQuiz = {
  enabled: boolean;
  title: string;
  subtitle: string;
  questions: QuizQuestion[];
  resultBands: QuizResultBand[];
  analytics?: QuizAnalytics;
};

export type QuizEventType = "impression" | "start" | "complete" | "skip";

export const QUIZ_MIN_QUESTION_COUNT = 1;
/** Maximum graded questions per quiz */
export const QUIZ_QUESTION_COUNT = 5;

export const DEFAULT_QUIZ_RESULT_BANDS: QuizResultBand[] = [
  {
    minScore: 5,
    label: "Expert",
    message: "Flawless — you really absorbed this article.",
  },
  {
    minScore: 4,
    label: "Strong",
    message: "Solid grasp. One detail to revisit, but you're ahead of most readers.",
  },
  {
    minScore: 3,
    label: "On track",
    message: "Good foundation — skim the key sections once more to lock it in.",
  },
  {
    minScore: 0,
    label: "Keep exploring",
    message: "No worries — re-read the article and try again when you're ready.",
  },
];

function newId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyQuizOption(label = ""): QuizOption {
  return { id: newId("qopt"), label };
}

export function createEmptyQuizQuestion(): QuizQuestion {
  const a = createEmptyQuizOption("");
  const b = createEmptyQuizOption("");
  const c = createEmptyQuizOption("");
  return {
    id: newId("qq"),
    prompt: "",
    helpText: "",
    options: [a, b, c],
    correctOptionId: a.id,
  };
}

export function emptyQuizAnalytics(): QuizAnalytics {
  return { impressions: 0, starts: 0, completions: 0, skips: 0, scoreBuckets: {} };
}

function parseScoreBuckets(raw: unknown): Record<string, number> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const buckets: Record<string, number> = {};
  for (const [key, val] of Object.entries(o)) {
    const n = Math.max(0, Number(val) || 0);
    if (n > 0) buckets[key] = n;
  }
  return Object.keys(buckets).length ? buckets : undefined;
}

export function createEmptyQuiz(): ArticleQuiz {
  return {
    enabled: false,
    title: "FactsDeck Knowledge Quiz",
    subtitle: "Answer up to five graded questions — see how well you retained the article.",
    questions: [],
    resultBands: DEFAULT_QUIZ_RESULT_BANDS,
    analytics: emptyQuizAnalytics(),
  };
}

function parseQuestionsFromRaw(o: Record<string, unknown>): QuizQuestion[] {
  const questionsRaw = Array.isArray(o.questions) ? o.questions : [];
  const questions: QuizQuestion[] = [];

  for (const q of questionsRaw) {
    if (!q || typeof q !== "object") continue;
    const row = q as Record<string, unknown>;
    const optionsRaw = Array.isArray(row.options) ? row.options : [];
    const options: QuizOption[] = [];
    for (const opt of optionsRaw) {
      if (!opt || typeof opt !== "object") continue;
      const or = opt as Record<string, unknown>;
      const id = String(or.id ?? "").trim();
      const label = String(or.label ?? "").trim();
      if (!id || !label) continue;
      options.push({ id, label });
    }

    const id = String(row.id ?? "").trim();
    const prompt = String(row.prompt ?? "").trim();
    const correctOptionId = String(row.correctOptionId ?? "").trim();
    if (!id || !prompt || options.length < 2 || !correctOptionId) continue;
    if (!options.some((o) => o.id === correctOptionId)) continue;

    questions.push({
      id,
      prompt,
      helpText: row.helpText ? String(row.helpText) : undefined,
      options,
      correctOptionId,
    });
  }

  return questions;
}

function parseResultBands(raw: unknown): QuizResultBand[] {
  if (!Array.isArray(raw) || raw.length === 0) return DEFAULT_QUIZ_RESULT_BANDS;
  const bands: QuizResultBand[] = [];
  for (const b of raw) {
    if (!b || typeof b !== "object") continue;
    const row = b as Record<string, unknown>;
    const label = String(row.label ?? "").trim();
    const message = String(row.message ?? "").trim();
    if (!label) continue;
    bands.push({
      minScore: Math.max(0, Math.min(QUIZ_QUESTION_COUNT, Number(row.minScore) || 0)),
      label,
      message: message || label,
    });
  }
  return bands.length ? bands.sort((a, b) => b.minScore - a.minScore) : DEFAULT_QUIZ_RESULT_BANDS;
}

export function parseQuizAnalytics(raw: unknown): QuizAnalytics {
  if (!raw || typeof raw !== "object") return emptyQuizAnalytics();
  const a = raw as Record<string, unknown>;
  const scoreBuckets = parseScoreBuckets(a.scoreBuckets);
  return {
    impressions: Math.max(0, Number(a.impressions) || 0),
    starts: Math.max(0, Number(a.starts) || 0),
    completions: Math.max(0, Number(a.completions) || 0),
    skips: Math.max(0, Number(a.skips) || 0),
    ...(scoreBuckets ? { scoreBuckets } : {}),
  };
}

export function parseQuizForAdmin(raw: unknown): ArticleQuiz | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    enabled: Boolean(o.enabled),
    title: String(o.title ?? "FactsDeck Knowledge Quiz").trim() || "FactsDeck Knowledge Quiz",
    subtitle: String(o.subtitle ?? "").trim(),
    questions: parseQuestionsFromRaw(o),
    resultBands: parseResultBands(o.resultBands),
    analytics: parseQuizAnalytics(o.analytics),
  };
}

export function normalizeQuiz(raw: unknown): ArticleQuiz | null {
  const parsed = parseQuizForAdmin(raw);
  if (!parsed?.enabled) return null;
  const count = parsed.questions.length;
  if (count < QUIZ_MIN_QUESTION_COUNT || count > QUIZ_QUESTION_COUNT) return null;
  return parsed;
}

export function isQuizActive(quiz: ArticleQuiz | null | undefined): quiz is ArticleQuiz {
  const count = quiz?.questions.length ?? 0;
  return Boolean(
    quiz?.enabled && count >= QUIZ_MIN_QUESTION_COUNT && count <= QUIZ_QUESTION_COUNT
  );
}

export function quizScoreBand(
  score: number,
  bands: QuizResultBand[] = DEFAULT_QUIZ_RESULT_BANDS
): QuizResultBand {
  const sorted = [...bands].sort((a, b) => b.minScore - a.minScore);
  return sorted.find((b) => score >= b.minScore) ?? sorted[sorted.length - 1];
}

export function createFactsDeckQuizTemplate(articleTitle: string, category = "money"): ArticleQuiz {
  const topic = articleTitle.trim() || "this article";
  const cat = category.toLowerCase();

  const mkQ = (
    prompt: string,
    options: [string, string, string, string],
    correctIndex: number,
    helpText?: string
  ): QuizQuestion => {
    const opts = options.map((label) => createEmptyQuizOption(label));
    return {
      id: newId("qq"),
      prompt,
      helpText,
      options: opts,
      correctOptionId: opts[correctIndex].id,
    };
  };

  return {
    enabled: true,
    title: "Knowledge Quiz",
    subtitle: `Up to five graded questions on “${topic}” — earn your score card when you finish.`,
    resultBands: DEFAULT_QUIZ_RESULT_BANDS,
    analytics: emptyQuizAnalytics(),
    questions: [
      mkQ(
        `What is the central idea this article wants you to remember about ${cat}?`,
        [
          "Edit option A to match your article",
          "Edit option B to match your article",
          "Edit option C to match your article",
          "None of the above",
        ],
        0,
        "Pick the answer that best reflects the article's main takeaway."
      ),
      mkQ(
        "Which detail from the piece is factually accurate according to the author?",
        ["Statement A — edit me", "Statement B — edit me", "Statement C — edit me", "All are accurate"],
        0
      ),
      mkQ(
        "If a reader applied one lesson from this story, it would most likely be:",
        ["A practical habit change", "A tax or legal loophole", "A guaranteed return", "Timing the market perfectly"],
        0
      ),
      mkQ(
        "Which misconception does the article push back on?",
        ["Misconception A — edit", "Misconception B — edit", "The article agrees with all common advice", "Not sure"],
        0
      ),
      mkQ(
        "What should a careful reader do next after finishing this piece?",
        ["Edit the best next step from your article", "Ignore context and act immediately", "Wait for perfect certainty", "Only trust headlines"],
        0
      ),
    ],
  };
}

function normalizeQuestionsForSave(questions: QuizQuestion[]): QuizQuestion[] {
  return questions
    .slice(0, QUIZ_QUESTION_COUNT)
    .map((q) => {
      const options = q.options
        .map((o) => ({ ...o, label: o.label.trim() }))
        .filter((o) => o.label);
      const correctOptionId = options.some((o) => o.id === q.correctOptionId)
        ? q.correctOptionId
        : options[0]?.id ?? "";
      return {
        ...q,
        prompt: q.prompt.trim(),
        helpText: q.helpText?.trim() || undefined,
        options,
        correctOptionId,
      };
    })
    .filter((q) => q.prompt && q.options.length >= 2 && q.correctOptionId);
}

export function serializeQuizForDb(quiz: ArticleQuiz | null | undefined): ArticleQuiz | null {
  if (!quiz) return null;

  const analytics = quiz.analytics ?? emptyQuizAnalytics();
  const questions = normalizeQuestionsForSave(quiz.questions);
  const resultBands =
    quiz.resultBands?.length > 0 ? quiz.resultBands : DEFAULT_QUIZ_RESULT_BANDS;

  if (!quiz.enabled) {
    if (questions.length === 0 && !analytics.impressions && !analytics.starts) {
      return null;
    }
    return {
      enabled: false,
      title: quiz.title.trim(),
      subtitle: quiz.subtitle.trim(),
      questions,
      resultBands,
      analytics,
    };
  }

  if (questions.length === 0) return null;

  return {
    enabled: true,
    title: quiz.title.trim() || "FactsDeck Knowledge Quiz",
    subtitle: quiz.subtitle.trim(),
    questions,
    resultBands,
    analytics,
  };
}

export function bumpQuizAnalytics(
  analytics: QuizAnalytics,
  event: QuizEventType,
  score?: number
): QuizAnalytics {
  const next = { ...analytics };
  if (event === "impression") next.impressions += 1;
  if (event === "start") next.starts += 1;
  if (event === "complete") next.completions += 1;
  if (event === "skip") next.skips += 1;
  if (
    event === "complete" &&
    score !== undefined &&
    score >= 0 &&
    score <= QUIZ_QUESTION_COUNT
  ) {
    const buckets = { ...(next.scoreBuckets ?? {}) };
    const key = String(score);
    buckets[key] = (buckets[key] ?? 0) + 1;
    next.scoreBuckets = buckets;
  }
  return next;
}

export function quizRates(analytics: QuizAnalytics) {
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

export function validateQuizForAdmin(quiz: ArticleQuiz | null | undefined): string[] {
  if (!quiz?.enabled) return [];
  const errors: string[] = [];
  if (!quiz.title.trim()) errors.push("Quiz title is required when the quiz is enabled");
  if (quiz.questions.length < QUIZ_MIN_QUESTION_COUNT) {
    errors.push(`Add at least ${QUIZ_MIN_QUESTION_COUNT} quiz question`);
  } else if (quiz.questions.length > QUIZ_QUESTION_COUNT) {
    errors.push(`Quiz can have at most ${QUIZ_QUESTION_COUNT} questions (currently ${quiz.questions.length})`);
  }
  quiz.questions.forEach((q, i) => {
    const n = i + 1;
    if (!q.prompt.trim()) errors.push(`Quiz Q${n}: prompt is required`);
    const filled = q.options.filter((o) => o.label.trim());
    if (filled.length < 2) errors.push(`Quiz Q${n}: at least 2 answer options required`);
    if (!filled.some((o) => o.id === q.correctOptionId)) {
      errors.push(`Quiz Q${n}: select a correct answer`);
    }
  });
  errors.push(...validateQuizResultBands(quiz.resultBands));
  return errors;
}

export function validateQuizResultBands(bands: QuizResultBand[]): string[] {
  const errors: string[] = [];
  if (!bands.length) {
    errors.push("Add at least one score result band");
    return errors;
  }
  bands.forEach((band, i) => {
    const n = i + 1;
    if (!band.label.trim()) errors.push(`Result band ${n}: label is required`);
    if (!band.message.trim()) errors.push(`Result band ${n}: message is required`);
    if (band.minScore < 0 || band.minScore > QUIZ_QUESTION_COUNT) {
      errors.push(
        `Result band ${n}: min score must be between 0 and ${QUIZ_QUESTION_COUNT}`
      );
    }
  });
  return errors;
}

/** Preserve server-managed quiz analytics when an admin saves from the editor. */
export function mergeQuizServerFields(
  saved: ArticleQuiz | null,
  existingRaw: unknown
): ArticleQuiz | null {
  if (!saved) return null;
  const existing = parseQuizForAdmin(existingRaw);
  const buckets = existing?.analytics?.scoreBuckets;
  if (!buckets || Object.keys(buckets).length === 0) return saved;
  return {
    ...saved,
    analytics: {
      ...(saved.analytics ?? emptyQuizAnalytics()),
      scoreBuckets: buckets,
    },
  };
}
