"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  Brain,
  ChevronRight,
  CircleHelp,
  Gauge,
  MessageCircleQuestion,
  MessageSquare,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { ArticlePoll, PollQuestion, PollQuestionKind } from "../../lib/poll-types";
import { isPollActive, POLL_QUESTION_COUNT, totalPollVotes } from "../../lib/poll-types";
import { recordPollAnswer, recordPollEvent } from "../../lib/poll-actions";
import type { ArticleQuiz, QuizQuestion } from "../../lib/quiz-types";
import { isQuizActive, QUIZ_QUESTION_COUNT, quizScoreBand } from "../../lib/quiz-types";
import { recordQuizEvent } from "../../lib/quiz-actions";
import {
  ENGAGEMENT_OPEN_EVENT,
  type EngagementMode,
} from "../../lib/poll-open-event";

type ActiveMode = EngagementMode | "pick";

const pollStorageKey = (postId: string) => `factsdeck-poll-${postId}`;
const pollImpressionKey = (postId: string) => `factsdeck-poll-impression-${postId}`;
const pollStartedKey = (postId: string) => `factsdeck-poll-started-${postId}`;
const pollCompleteKey = (postId: string) => `factsdeck-poll-complete-event-${postId}`;
const pollSkipKey = (postId: string) => `factsdeck-poll-skip-${postId}`;

const quizStorageKey = (postId: string) => `factsdeck-quiz-${postId}`;
const quizImpressionKey = (postId: string) => `factsdeck-quiz-impression-${postId}`;
const quizStartedKey = (postId: string) => `factsdeck-quiz-started-${postId}`;
const quizCompleteKey = (postId: string) => `factsdeck-quiz-complete-event-${postId}`;
const quizSkipKey = (postId: string) => `factsdeck-quiz-skip-${postId}`;
const pollVoterTokenKey = (postId: string) => `factsdeck-poll-voter-${postId}`;

type StoredAnswers = {
  answers: Record<string, string>;
  completedAt?: string;
};

type EngagementContextValue = {
  poll: ArticlePoll | null;
  quiz: ArticleQuiz | null;
  postId: string;
  hasPoll: boolean;
  hasQuiz: boolean;
  mode: ActiveMode | null;
  modalOpen: boolean;
  closeModal: () => void;
  dismissModal: () => void;
  pickMode: (mode: EngagementMode) => void;
  pollStep: number;
  pollTotal: number;
  pollCompleted: boolean;
  pollAnswers: Record<string, string>;
  livePoll: ArticlePoll | null;
  startPoll: () => void;
  selectPollOption: (questionId: string, optionId: string) => Promise<void>;
  pollSubmitting: boolean;
  pollVoteError: string | null;
  pollScore: { correct: number; gradable: number };
  quizStep: number;
  quizTotal: number;
  quizCompleted: boolean;
  quizAnswers: Record<string, string>;
  startQuiz: () => void;
  selectQuizOption: (questionId: string, optionId: string) => void;
  quizSubmitting: boolean;
  quizScore: number;
  quizBand: ReturnType<typeof quizScoreBand> | null;
};

const EngagementContext = createContext<EngagementContextValue | null>(null);

function useEngagementContext(): EngagementContextValue {
  const ctx = useContext(EngagementContext);
  if (!ctx) throw new Error("ArticleEngagementExperience must wrap engagement UI");
  return ctx;
}

function kindIcon(kind: PollQuestionKind) {
  switch (kind) {
    case "knowledge":
      return Brain;
    case "opinion":
      return MessageSquare;
    case "experience":
      return Users;
    case "confidence":
      return Gauge;
    default:
      return CircleHelp;
  }
}

function loadStored(keyFn: (id: string) => string, postId: string): StoredAnswers | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(keyFn(postId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredAnswers;
  } catch {
    return null;
  }
}

function saveStored(keyFn: (id: string) => string, postId: string, data: StoredAnswers) {
  localStorage.setItem(keyFn(postId), JSON.stringify(data));
}

function getPollVoterToken(postId: string): string {
  const key = pollVoterTokenKey(postId);
  let token = localStorage.getItem(key);
  if (!token) {
    token =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, token);
  }
  return token;
}

function optionPercent(votes: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((votes / total) * 100);
}

function EngagementStepShell({
  stepKey,
  children,
  className = "",
}: {
  stepKey: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div key={stepKey} className={`engagement-step-in ${className}`.trim()}>
      {children}
    </div>
  );
}

function EngagementLoadingOverlay({
  variant,
  message,
}: {
  variant: "poll" | "quiz";
  message: string;
}) {
  return (
    <div
      className="engagement-loading-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="engagement-loading-card">
        <div
          className={`engagement-loading-spinner ${
            variant === "quiz" ? "engagement-loading-spinner-quiz" : ""
          }`}
          aria-hidden
        />
        <p className="engagement-loading-message">{message}</p>
      </div>
    </div>
  );
}

function QuizConfetti() {
  const dots = [
    { left: "12%", top: "28%", delay: "0s", color: "#f59e0b" },
    { left: "28%", top: "18%", delay: "0.08s", color: "#f97316" },
    { left: "44%", top: "32%", delay: "0.16s", color: "#eab308" },
    { left: "62%", top: "22%", delay: "0.12s", color: "#fb923c" },
    { left: "78%", top: "30%", delay: "0.2s", color: "#fbbf24" },
    { left: "88%", top: "20%", delay: "0.05s", color: "#ea580c" },
  ];
  return (
    <div className="engagement-quiz-confetti" aria-hidden>
      {dots.map((d) => (
        <span
          key={`${d.left}-${d.delay}`}
          style={{
            left: d.left,
            top: d.top,
            backgroundColor: d.color,
            animationDelay: d.delay,
          }}
        />
      ))}
    </div>
  );
}

function dialogShellClass(mode: ActiveMode | null): string {
  if (mode === "quiz") return "engagement-dialog-quiz";
  if (mode === "poll") return "engagement-dialog-poll";
  return "engagement-dialog-pick";
}

export function ArticleEngagementProvider({
  poll,
  quiz,
  postId,
  children,
}: {
  poll?: ArticlePoll | null;
  quiz?: ArticleQuiz | null;
  postId: string;
  children: ReactNode;
}) {
  const hasPoll = isPollActive(poll ?? null);
  const hasQuiz = isQuizActive(quiz ?? null);

  const [livePoll, setLivePoll] = useState(poll ?? null);
  const [modalOpen, setModalOpen] = useState(false);
  const [mode, setMode] = useState<ActiveMode | null>(null);

  const [pollStep, setPollStep] = useState(0);
  const [pollAnswers, setPollAnswers] = useState<Record<string, string>>({});
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [pollVoteError, setPollVoteError] = useState<string | null>(null);
  const [pollHydrated, setPollHydrated] = useState(false);

  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizHydrated, setQuizHydrated] = useState(false);

  const pollQuestions = (livePoll?.questions ?? []).slice(0, POLL_QUESTION_COUNT);
  const pollTotal = pollQuestions.length;
  const pollCompleted = pollStep > pollTotal;

  const quizQuestions = (quiz?.questions ?? []).slice(0, QUIZ_QUESTION_COUNT);
  const quizTotal = quizQuestions.length;
  const quizCompleted = quizStep > quizTotal;

  useEffect(() => {
    setLivePoll(poll ?? null);
  }, [poll]);

  useEffect(() => {
    if (!hasPoll) return;
    const stored = loadStored(pollStorageKey, postId);
    if (stored?.answers) {
      setPollAnswers(stored.answers);
      const answered = Object.keys(stored.answers).length;
      if (stored.completedAt || answered >= pollTotal) {
        setPollStep(pollTotal + 1);
      } else if (answered > 0) {
        setPollStep(answered + 1);
      }
    }
    setPollHydrated(true);
  }, [postId, pollTotal, hasPoll]);

  useEffect(() => {
    if (!hasQuiz) return;
    const stored = loadStored(quizStorageKey, postId);
    if (stored?.answers) {
      setQuizAnswers(stored.answers);
      const answered = Object.keys(stored.answers).length;
      if (stored.completedAt || answered >= quizTotal) {
        setQuizStep(quizTotal + 1);
      } else if (answered > 0) {
        setQuizStep(answered + 1);
      }
    }
    setQuizHydrated(true);
  }, [postId, quizTotal, hasQuiz]);

  useEffect(() => {
    if (!pollHydrated || !hasPoll || typeof window === "undefined") return;
    if (sessionStorage.getItem(pollImpressionKey(postId))) return;
    sessionStorage.setItem(pollImpressionKey(postId), "1");
    void recordPollEvent(postId, "impression");
  }, [pollHydrated, postId, hasPoll]);

  useEffect(() => {
    if (!quizHydrated || !hasQuiz || typeof window === "undefined") return;
    if (sessionStorage.getItem(quizImpressionKey(postId))) return;
    sessionStorage.setItem(quizImpressionKey(postId), "1");
    void recordQuizEvent(postId, "impression");
  }, [quizHydrated, postId, hasQuiz]);

  const pollScore = useMemo(() => {
    let correct = 0;
    let gradable = 0;
    for (const q of pollQuestions) {
      if (q.kind !== "knowledge" || !q.correctOptionId) continue;
      gradable += 1;
      if (pollAnswers[q.id] === q.correctOptionId) correct += 1;
    }
    return { correct, gradable };
  }, [pollQuestions, pollAnswers]);

  const quizScore = useMemo(() => {
    let correct = 0;
    for (const q of quizQuestions) {
      if (quizAnswers[q.id] === q.correctOptionId) correct += 1;
    }
    return correct;
  }, [quizQuestions, quizAnswers]);

  const quizBand = useMemo(() => {
    if (!quizCompleted || !quiz) return null;
    return quizScoreBand(quizScore, quiz.resultBands);
  }, [quizCompleted, quiz, quizScore]);

  const persistPoll = useCallback(
    (nextAnswers: Record<string, string>, done: boolean) => {
      saveStored(pollStorageKey, postId, {
        answers: nextAnswers,
        ...(done ? { completedAt: new Date().toISOString() } : {}),
      });
    },
    [postId]
  );

  const persistQuiz = useCallback(
    (nextAnswers: Record<string, string>, done: boolean) => {
      saveStored(quizStorageKey, postId, {
        answers: nextAnswers,
        ...(done ? { completedAt: new Date().toISOString() } : {}),
      });
    },
    [postId]
  );

  const trackPollStart = useCallback(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem(pollStartedKey(postId))) {
      sessionStorage.setItem(pollStartedKey(postId), "1");
      void recordPollEvent(postId, "start");
    }
  }, [postId]);

  const trackQuizStart = useCallback(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem(quizStartedKey(postId))) {
      sessionStorage.setItem(quizStartedKey(postId), "1");
      void recordQuizEvent(postId, "start");
    }
  }, [postId]);

  const selectPollOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (pollSubmitting || pollAnswers[questionId] || !livePoll) return;
      setPollSubmitting(true);
      setPollVoteError(null);
      const voterToken =
        typeof window !== "undefined" ? getPollVoterToken(postId) : "";
      const res = await recordPollAnswer(postId, questionId, optionId, voterToken);
      if (!res.ok) {
        setPollVoteError(res.error ?? "Could not record your vote. Please try again.");
        setPollSubmitting(false);
        return;
      }
      if (res.poll) setLivePoll(res.poll);
      const next = { ...pollAnswers, [questionId]: optionId };
      setPollAnswers(next);
      const qIndex = pollQuestions.findIndex((q) => q.id === questionId);
      const isLast = qIndex >= pollTotal - 1;
      if (isLast) {
        setPollStep(pollTotal + 1);
        persistPoll(next, true);
        if (!sessionStorage.getItem(pollCompleteKey(postId))) {
          sessionStorage.setItem(pollCompleteKey(postId), "1");
          void recordPollEvent(postId, "complete");
        }
      } else {
        setPollStep(qIndex + 2);
        persistPoll(next, false);
      }
      setPollSubmitting(false);
    },
    [pollSubmitting, pollAnswers, livePoll, postId, pollQuestions, pollTotal, persistPoll]
  );

  const selectQuizOption = useCallback(
    (questionId: string, optionId: string) => {
      if (quizSubmitting || quizAnswers[questionId]) return;
      setQuizSubmitting(true);
      const next = { ...quizAnswers, [questionId]: optionId };
      const qIndex = quizQuestions.findIndex((q) => q.id === questionId);
      const isLast = qIndex >= quizTotal - 1;

      const finish = () => {
        setQuizAnswers(next);
        if (isLast) {
          setQuizStep(quizTotal + 1);
          persistQuiz(next, true);
          if (!sessionStorage.getItem(quizCompleteKey(postId))) {
            sessionStorage.setItem(quizCompleteKey(postId), "1");
            let correct = 0;
            for (const q of quizQuestions) {
              if (next[q.id] === q.correctOptionId) correct += 1;
            }
            void recordQuizEvent(postId, "complete", correct);
          }
        } else {
          setQuizStep(qIndex + 2);
          persistQuiz(next, false);
        }
        setQuizSubmitting(false);
      };

      window.setTimeout(finish, isLast ? 720 : 280);
    },
    [quizSubmitting, quizAnswers, quizQuestions, quizTotal, persistQuiz, postId]
  );

  const startPoll = useCallback(() => {
    setMode("poll");
    trackPollStart();
    if (pollStep === 0) setPollStep(1);
  }, [pollStep, trackPollStart]);

  const startQuiz = useCallback(() => {
    setMode("quiz");
    trackQuizStart();
    if (quizStep === 0) setQuizStep(1);
  }, [quizStep, trackQuizStart]);

  const pickMode = useCallback(
    (next: EngagementMode) => {
      setMode(next);
      if (next === "poll") {
        trackPollStart();
        if (Object.keys(pollAnswers).length > 0) {
          setPollStep(pollTotal + 1);
        } else {
          setPollStep(0);
        }
      } else {
        trackQuizStart();
        const answered = Object.keys(quizAnswers).length;
        if (quizCompleted) {
          setQuizStep(quizTotal + 1);
        } else if (answered > 0) {
          setQuizStep(Math.min(answered + 1, quizTotal));
        } else {
          setQuizStep(0);
        }
      }
    },
    [
      pollAnswers,
      pollTotal,
      quizAnswers,
      quizCompleted,
      quizTotal,
      trackPollStart,
      trackQuizStart,
    ]
  );

  const resolveInitialMode = useCallback(
    (requested?: EngagementMode): ActiveMode => {
      if (requested === "poll" && hasPoll) return "poll";
      if (requested === "quiz" && hasQuiz) return "quiz";
      if (hasPoll && hasQuiz) return "pick";
      if (hasPoll) return "poll";
      return "quiz";
    },
    [hasPoll, hasQuiz]
  );

  const openModal = useCallback(
    (requested?: EngagementMode) => {
      const nextMode = resolveInitialMode(requested);
      setMode(nextMode);
      if (nextMode === "poll" && Object.keys(pollAnswers).length > 0) {
        setPollStep(pollTotal + 1);
      }
      if (nextMode === "quiz") {
        const answered = Object.keys(quizAnswers).length;
        if (quizCompleted || answered >= quizTotal) {
          setQuizStep(quizTotal + 1);
        } else if (answered > 0) {
          setQuizStep(Math.min(answered + 1, quizTotal));
        }
      }
      setModalOpen(true);
    },
    [resolveInitialMode, pollAnswers, pollTotal, quizAnswers, quizCompleted, quizTotal]
  );

  const dismissModal = useCallback(() => {
    if (typeof window !== "undefined") {
      if (mode === "poll" && !sessionStorage.getItem(pollSkipKey(postId))) {
        sessionStorage.setItem(pollSkipKey(postId), "1");
        void recordPollEvent(postId, "skip");
      }
      if (mode === "quiz" && !sessionStorage.getItem(quizSkipKey(postId))) {
        sessionStorage.setItem(quizSkipKey(postId), "1");
        void recordQuizEvent(postId, "skip");
      }
      if (mode === "pick") {
        if (hasPoll && !sessionStorage.getItem(pollSkipKey(postId))) {
          sessionStorage.setItem(pollSkipKey(postId), "1");
          void recordPollEvent(postId, "skip");
        }
        if (hasQuiz && !sessionStorage.getItem(quizSkipKey(postId))) {
          sessionStorage.setItem(quizSkipKey(postId), "1");
          void recordQuizEvent(postId, "skip");
        }
      }
    }
    setModalOpen(false);
  }, [mode, postId, hasPoll, hasQuiz]);

  const closeModal = dismissModal;

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ postId: string; mode?: EngagementMode }>).detail;
      if (detail?.postId !== postId) return;
      openModal(detail.mode);
    };
    window.addEventListener(ENGAGEMENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(ENGAGEMENT_OPEN_EVENT, onOpen);
  }, [postId, openModal]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const value: EngagementContextValue = {
    poll: livePoll,
    quiz: quiz ?? null,
    postId,
    hasPoll,
    hasQuiz,
    mode,
    modalOpen,
    closeModal,
    dismissModal,
    pickMode,
    pollStep,
    pollTotal,
    pollCompleted,
    pollAnswers,
    livePoll,
    startPoll,
    selectPollOption,
    pollSubmitting,
    pollVoteError,
    pollScore,
    quizStep,
    quizTotal,
    quizCompleted,
    quizAnswers,
    startQuiz,
    selectQuizOption,
    quizSubmitting,
    quizScore,
    quizBand,
  };

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}

function ModePicker() {
  const { livePoll, quiz, hasPoll, hasQuiz, pickMode, dismissModal, pollTotal, quizTotal } =
    useEngagementContext();

  return (
    <div className="py-4 sm:py-6 space-y-6 engagement-step-in-up">
      <div className="text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80 ring-2 ring-violet-400/50 shadow-2xl mb-4 engagement-hero-icon">
          <div className="h-12 w-12 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 rounded-full flex items-center justify-center shadow-inner">
            <img
              src="/logo.png"
              alt="FactsDeck Logo"
              className="h-8 w-8"
              style={{ display: "block" }}
              draggable={false}
            />
          </div>
        </div>
  
  
        <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          How do you want to engage?
        </h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
          Share your perspective in the community poll, test your recall with the graded quiz — or
          both when you have a minute.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 engagement-step-stagger">
        {hasPoll && livePoll ? (
          <button
            type="button"
            onClick={() => pickMode("poll")}
            className="engagement-mode-card engagement-mode-card-poll group rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 text-left dark:border-cyan-800/60 dark:from-cyan-950/30 dark:to-zinc-950 dark:hover:border-cyan-600"
          >
            <div className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white mb-3 group-hover:scale-105 transition-transform engagement-mode-icon">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <p className="relative z-[1] font-display font-bold text-zinc-900 dark:text-zinc-50">{livePoll.title}</p>
            <p className="relative z-[1] mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {livePoll.subtitle || "Vote once — see live community results in the modal."}
            </p>
            <span className="relative z-[1] mt-3 inline-flex items-center gap-1 text-sm font-bold text-blue-700 dark:text-cyan-300">
              Take the poll <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        ) : null}

        {hasQuiz && quiz ? (
          <button
            type="button"
            onClick={() => pickMode("quiz")}
            className="engagement-mode-card engagement-mode-card-quiz group rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5 text-left dark:border-amber-800/60 dark:from-amber-950/30 dark:to-zinc-950 dark:hover:border-amber-600"
          >
            <div className="relative z-[1] flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white mb-3 group-hover:scale-105 transition-transform engagement-mode-icon engagement-mode-icon-quiz">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="relative z-[1] font-display font-bold text-zinc-900 dark:text-zinc-50">{quiz.title}</p>
            <p className="relative z-[1] mt-1 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
              {quiz.subtitle ||
                `${quizTotal} graded question${quizTotal === 1 ? "" : "s"} — earn your score card.`}
            </p>
            <span className="relative z-[1] mt-3 inline-flex items-center gap-1 text-sm font-bold text-amber-800 dark:text-amber-300">
              Take the quiz <ChevronRight className="h-4 w-4" />
            </span>
          </button>
        ) : null}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={dismissModal}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function PollQuestionStep({ question }: { question: PollQuestion }) {
  const { pollAnswers, selectPollOption, pollSubmitting, pollVoteError } = useEngagementContext();
  const chosen = pollAnswers[question.id];
  const Icon = kindIcon(question.kind);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-cyan-300">
        <Icon className="h-4 w-4" aria-hidden />
        Community poll
        <span className="text-zinc-500 dark:text-zinc-500 font-medium normal-case">
          ·{" "}
          {question.kind === "knowledge"
            ? "Knowledge"
            : question.kind === "opinion"
              ? "Your take"
              : question.kind === "experience"
                ? "Experience"
                : "Confidence"}
        </span>
      </div>
      <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
        {question.prompt}
      </h3>
      {question.helpText ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{question.helpText}</p>
      ) : null}

      <ul className="space-y-2 engagement-step-stagger" role="listbox" aria-label="Answer choices">
        {question.options.map((opt) => {
          const selected = chosen === opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={Boolean(chosen) || pollSubmitting}
                onClick={() => selectPollOption(question.id, opt.id)}
                className={`engagement-option-press w-full rounded-xl border px-4 py-3.5 text-left text-sm font-semibold ${
                  selected
                    ? "border-blue-600 bg-blue-50 text-blue-950 dark:border-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-50"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-orange-300 hover:bg-orange-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-cyan-700 dark:hover:bg-zinc-800"
                } disabled:cursor-default`}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>

      {pollVoteError ? (
        <p className="text-sm font-semibold rounded-lg px-3 py-2 bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200 engagement-step-in-up">
          {pollVoteError}
        </p>
      ) : null}
    </div>
  );
}

function PollResults() {
  const { livePoll, pollAnswers, hasQuiz, pickMode } = useEngagementContext();
  if (!livePoll) return null;

  const question = livePoll.questions[0];
  if (!question) return null;

  const liveQ = livePoll.questions.find((q) => q.id === question.id) ?? question;
  const chosen = pollAnswers[question.id];
  const totalVotes = liveQ.options.reduce((s, o) => s + o.votes, 0);
  const readers = Math.max(totalVotes, totalPollVotes(livePoll));
  const isCorrect =
    question.kind === "knowledge" &&
    question.correctOptionId &&
    chosen === question.correctOptionId;
  const isWrong =
    question.kind === "knowledge" &&
    question.correctOptionId &&
    chosen &&
    chosen !== question.correctOptionId;
  const chosenLabel = liveQ.options.find((o) => o.id === chosen)?.label;

  return (
    <div className="space-y-5 py-2 sm:py-4 engagement-step-in-up">
      <div className="text-center engagement-step-in">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-cyan-950/50 dark:text-cyan-300 mb-3 engagement-hero-icon">
          <Users className="h-6 w-6" />
        </div>
        <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50">
          Community results
        </h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {readers > 0 ? (
            <>
              <strong className="tabular-nums text-zinc-800 dark:text-zinc-200">{readers}</strong>{" "}
              reader{readers === 1 ? "" : "s"} voted
            </>
          ) : (
            "Be the first to share your take."
          )}
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/50 p-4 space-y-4">
        <p className="font-display font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
          {question.prompt}
        </p>

        <ul className="space-y-3 engagement-step-stagger" aria-label="Poll results">
          {liveQ.options.map((opt, oi) => {
            const pct = optionPercent(opt.votes, totalVotes);
            const isYours = chosen === opt.id;
            return (
              <li key={opt.id} style={{ animationDelay: `${0.08 + oi * 0.07}s` }}>
                <div className="flex items-center justify-between gap-2 text-sm mb-1">
                  <span
                    className={`font-semibold ${isYours ? "text-blue-800 dark:text-cyan-300" : "text-zinc-800 dark:text-zinc-200"}`}
                  >
                    {opt.label}
                    {isYours ? (
                      <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-cyan-400">
                        Your vote
                      </span>
                    ) : null}
                  </span>
                  <span className="tabular-nums text-xs font-bold text-zinc-500 dark:text-zinc-400 shrink-0">
                    {pct}%
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full engagement-result-bar-fill ${
                      isYours
                        ? "bg-gradient-to-r from-blue-600 to-violet-500 dark:from-emerald-500 dark:to-cyan-400"
                        : "bg-blue-200/80 dark:bg-cyan-500/30"
                    }`}
                    style={
                      { "--eng-bar-pct": `${pct}%`, animationDelay: `${0.15 + oi * 0.08}s` } as CSSProperties
                    }
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {chosenLabel ? (
        <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
          You chose: <strong className="text-zinc-900 dark:text-zinc-100">{chosenLabel}</strong>
        </p>
      ) : null}

      {chosen && question.kind === "knowledge" && question.correctOptionId ? (
        <p
          className={`text-sm font-semibold rounded-lg px-3 py-2 text-center ${
            isCorrect
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : isWrong
                ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                : ""
          }`}
        >
          {isCorrect
            ? "Nice — that matches the article's key takeaway."
            : "Good effort — re-read the highlighted sections to sharpen your recall."}
        </p>
      ) : chosen ? (
        <p className="text-sm text-center text-zinc-600 dark:text-zinc-400">
          Thanks — your answer is counted in the community pulse above.
        </p>
      ) : null}

      {hasQuiz ? (
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => pickMode("quiz")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 transition-transform hover:scale-[1.03] active:scale-[0.98]"
          >
            <Trophy className="h-4 w-4" />
            Try the knowledge quiz next
          </button>
        </div>
      ) : null}
    </div>
  );
}

function PollIntro() {
  const { livePoll, startPoll, dismissModal } = useEngagementContext();
  if (!livePoll) return null;

  return (
    <div className="text-center py-4 sm:py-6 engagement-step-in-up">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg mb-4 engagement-hero-icon">
        <MessageCircleQuestion className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        {livePoll.title}
      </h3>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
        {livePoll.subtitle || "Answer one question and see how other readers voted."}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={startPoll}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          Vote & see results
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={dismissModal}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function PollWizardBody() {
  const { livePoll, pollStep, pollCompleted } = useEngagementContext();
  if (!livePoll) return null;
  const question = livePoll.questions[0];
  if (!question) return null;

  if (pollStep === 0) {
    return (
      <EngagementStepShell stepKey="poll-intro">
        <PollIntro />
      </EngagementStepShell>
    );
  }
  if (pollCompleted) {
    return (
      <EngagementStepShell stepKey="poll-results">
        <PollResults />
      </EngagementStepShell>
    );
  }

  return (
    <EngagementStepShell stepKey="poll-vote">
      <PollQuestionStep question={question} />
    </EngagementStepShell>
  );
}

function QuizQuestionStep({ question, index }: { question: QuizQuestion; index: number }) {
  const { quizAnswers, selectQuizOption, quizSubmitting, quizTotal } = useEngagementContext();
  const chosen = quizAnswers[question.id];
  const isCorrect = chosen === question.correctOptionId;
  const isWrong = Boolean(chosen && !isCorrect);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
        <Brain className="h-4 w-4" aria-hidden />
        Question {index} of {quizTotal}
        <span className="text-zinc-500 font-medium normal-case">· Graded</span>
      </div>
      <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
        {question.prompt}
      </h3>
      {question.helpText ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{question.helpText}</p>
      ) : null}

      <ul className="space-y-2 engagement-step-stagger" role="listbox" aria-label="Quiz choices">
        {question.options.map((opt) => {
          const selected = chosen === opt.id;
          const showCorrect = Boolean(chosen) && opt.id === question.correctOptionId;
          const showWrong = Boolean(chosen) && selected && !isCorrect;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={Boolean(chosen) || quizSubmitting}
                onClick={() => selectQuizOption(question.id, opt.id)}
                className={`engagement-option-press w-full rounded-xl border px-4 py-3.5 text-left text-sm font-semibold ${
                  showCorrect
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200"
                    : showWrong
                      ? "border-red-400 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-200"
                      : selected
                        ? "border-amber-600 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-950/40 dark:text-amber-50"
                        : "border-zinc-200 bg-white text-zinc-800 hover:border-amber-300 hover:bg-amber-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-amber-700 dark:hover:bg-zinc-800"
                } disabled:cursor-default`}
              >
                {opt.label}
              </button>
            </li>
          );
        })}
      </ul>

      {chosen ? (
        <p
          className={`text-sm font-semibold rounded-lg px-3 py-2 ${
            isCorrect
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : isWrong
                ? "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                : ""
          }`}
        >
          {isCorrect
            ? "Correct — you're retaining the material."
            : "Not quite — the highlighted answer reflects what the article teaches."}
        </p>
      ) : null}
    </div>
  );
}

function QuizIntro() {
  const { quiz, quizTotal, startQuiz, dismissModal } = useEngagementContext();
  if (!quiz) return null;

  return (
    <div className="text-center py-4 sm:py-6 engagement-step-in-up">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg mb-4 engagement-hero-icon-quiz">
        <Trophy className="h-7 w-7" />
      </div>
      <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">{quiz.title}</h3>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
        {quiz.subtitle}
      </p>
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={startQuiz}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-amber-700 transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          {quizTotal === 1 ? "Start quiz" : `Start ${quizTotal}-question quiz`}
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={dismissModal}
          className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
        >
          Not now
        </button>
      </div>
    </div>
  );
}

function QuizComplete() {
  const { quizScore, quizTotal, quizBand, hasPoll, pickMode } = useEngagementContext();
  const pct = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 0;

  return (
    <div className="text-center py-4 sm:py-6 space-y-5 engagement-step-in-up">
      <div className="relative inline-flex engagement-score-pop">
        <QuizConfetti />
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
          <span className="font-display text-2xl font-bold tabular-nums">
            {quizScore}/{quizTotal}
          </span>
        </div>
        <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-zinc-900 border-2 border-amber-400">
          <Trophy className="h-4 w-4 text-amber-600" />
        </div>
      </div>

      {quizBand ? (
        <>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Your performance
            </p>
            <h3 className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">
              {quizBand.label}
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
              {quizBand.message}
            </p>
          </div>
          <div className="mx-auto max-w-xs engagement-step-in">
            <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 engagement-result-bar-fill engagement-progress-glow-quiz"
                style={{ "--eng-bar-pct": `${pct}%` } as CSSProperties}
              />
            </div>
            <p className="mt-1 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">{pct}% correct</p>
          </div>
        </>
      ) : null}

      {hasPoll ? (
        <button
          type="button"
          onClick={() => pickMode("poll")}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-bold text-blue-900 hover:bg-blue-100 dark:border-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-200 transition-transform hover:scale-[1.03] active:scale-[0.98]"
        >
          <MessageCircleQuestion className="h-4 w-4" />
          Share your take in the poll
        </button>
      ) : null}
    </div>
  );
}

function QuizWizardBody() {
  const { quiz, quizStep, quizTotal, quizCompleted } = useEngagementContext();
  if (!quiz) return null;
  const questions = quiz.questions.slice(0, QUIZ_QUESTION_COUNT);

  if (quizStep === 0) {
    return (
      <EngagementStepShell stepKey="quiz-intro">
        <QuizIntro />
      </EngagementStepShell>
    );
  }
  if (quizCompleted) {
    return (
      <EngagementStepShell stepKey="quiz-complete">
        <QuizComplete />
      </EngagementStepShell>
    );
  }

  const current = questions[quizStep - 1];
  if (!current) return null;
  return (
    <EngagementStepShell stepKey={`quiz-q-${quizStep}`}>
      <QuizQuestionStep question={current} index={quizStep} />
    </EngagementStepShell>
  );
}

function EngagementProgressBar() {
  const { mode, pollStep, pollTotal, pollCompleted, quizStep, quizTotal, quizCompleted } =
    useEngagementContext();

  let pct = 0;
  if (mode === "poll") {
    pct = pollCompleted ? 100 : Math.round(((Math.max(pollStep, 1) - 1) / pollTotal) * 100);
  } else if (mode === "quiz") {
    pct = quizCompleted ? 100 : Math.round(((Math.max(quizStep, 1) - 1) / quizTotal) * 100);
  }

  if (mode === "pick") return null;

  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden" aria-hidden>
      <div
        className={`h-full rounded-full engagement-progress-glow ${
          mode === "quiz"
            ? "bg-gradient-to-r from-amber-500 to-orange-500 engagement-progress-glow-quiz"
            : "bg-gradient-to-r from-blue-600 to-violet-500 dark:from-emerald-500 dark:to-cyan-400"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function modalMeta(mode: ActiveMode | null, livePoll: ArticlePoll | null, quiz: ArticleQuiz | null) {
  if (mode === "quiz" && quiz) {
    return {
      eyebrow: "Knowledge Quiz",
      title: quiz.title,
      accent: "text-amber-600 dark:text-amber-400",
    };
  }
  if (mode === "pick") {
    return {
      eyebrow: "Reader engagement",
      title: "Poll or quiz",
      accent: "text-violet-600 dark:text-violet-400",
    };
  }
  return {
    eyebrow: "FactsDeck Quick Check",
    title: livePoll?.title ?? "Community poll",
    accent: "text-violet-600 dark:text-violet-400",
  };
}

function stepLabel(mode: ActiveMode | null, ctx: EngagementContextValue): string | null {
  if (mode === "poll") {
    if (ctx.pollCompleted) return "Results";
    if (ctx.pollStep > 0) return ctx.pollStep === 1 ? "Vote" : "Results";
  }
  if (mode === "quiz") {
    if (ctx.quizCompleted) return "Done";
    if (ctx.quizStep > 0) return `${Math.min(ctx.quizStep, ctx.quizTotal)}/${ctx.quizTotal}`;
  }
  return null;
}

export function ArticleEngagementModal() {
  const ctx = useEngagementContext();
  const {
    modalOpen,
    closeModal,
    mode,
    livePoll,
    quiz,
    pollSubmitting,
    quizSubmitting,
    quizStep,
    quizTotal,
  } = ctx;
  const dialogRef = useRef<HTMLDivElement>(null);
  const [present, setPresent] = useState(modalOpen);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (modalOpen) {
      setPresent(true);
      setClosing(false);
      return;
    }
    if (!present) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setPresent(false);
      setClosing(false);
    }, 280);
    return () => window.clearTimeout(t);
  }, [modalOpen, present]);

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closing) closeModal();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [present, closeModal, closing]);

  if (!present) return null;

  const meta = modalMeta(mode, livePoll, quiz);
  const label = stepLabel(mode, ctx);
  const shellClass = dialogShellClass(mode);
  const isLoading = pollSubmitting || quizSubmitting;
  const loadingVariant = mode === "quiz" ? "quiz" : "poll";
  const loadingMessage = pollSubmitting
    ? "Recording your vote…"
    : quizStep >= quizTotal
      ? "Preparing your score card…"
      : "Checking your answer…";

  const handleClose = () => {
    if (!closing && !isLoading) closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      role="presentation"
    >
      <button
        type="button"
        className={`absolute inset-0 bg-zinc-950/60 backdrop-blur-sm ${
          closing ? "engagement-overlay-out" : "engagement-overlay-in"
        }`}
        onClick={handleClose}
        aria-label="Close"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`relative z-10 flex w-full max-h-[92dvh] sm:max-h-[min(90vh,720px)] sm:max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 outline-none engagement-dialog-shell ${shellClass} ${
          closing ? "engagement-dialog-out" : "engagement-dialog-in"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-engagement-modal-title"
        aria-busy={isLoading}
      >
        <div className="engagement-dialog-inner">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:px-5 shrink-0">
            <div className="min-w-0">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${meta.accent}`}>
                {meta.eyebrow}
              </p>
              <h2
                id="article-engagement-modal-title"
                className="font-display font-bold text-zinc-900 dark:text-zinc-100 truncate"
              >
                {meta.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {label ? (
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    label === "Done" || label === "Results"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {label}
                </span>
              ) : null}
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="px-4 pt-3 sm:px-5 shrink-0">
            <EngagementProgressBar />
          </div>
          <div className="relative flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 min-h-[200px]">
            {mode === "pick" ? (
              <EngagementStepShell stepKey="pick">
                <ModePicker />
              </EngagementStepShell>
            ) : null}
            {mode === "poll" ? <PollWizardBody /> : null}
            {mode === "quiz" ? <QuizWizardBody /> : null}

            {isLoading ? (
              <EngagementLoadingOverlay variant={loadingVariant} message={loadingMessage} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticleEngagementShell({
  poll,
  quiz,
  postId,
}: {
  poll?: ArticlePoll | null;
  quiz?: ArticleQuiz | null;
  postId: string;
}) {
  return (
    <ArticleEngagementProvider poll={poll} quiz={quiz} postId={postId}>
      <ArticleEngagementModal />
    </ArticleEngagementProvider>
  );
}

export const ArticlePollProvider = ArticleEngagementProvider;
export const ArticlePollModal = ArticleEngagementModal;
export function ArticlePollShell({
  poll,
  postId,
}: {
  poll: ArticlePoll;
  postId: string;
}) {
  return <ArticleEngagementShell poll={poll} postId={postId} />;
}
