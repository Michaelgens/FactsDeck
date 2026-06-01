"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Brain,
  ChevronRight,
  CircleHelp,
  Gauge,
  MessageSquare,
  Sparkles,
  Trophy,
  Users,
  X,
} from "lucide-react";
import type { ArticlePoll, PollQuestion, PollQuestionKind } from "../../lib/poll-types";
import { POLL_QUESTION_COUNT } from "../../lib/poll-types";
import { recordPollAnswer, recordPollEvent } from "../../lib/poll-actions";
import { POLL_OPEN_EVENT } from "../../lib/poll-open-event";

const STORAGE_KEY = (postId: string) => `factsdeck-poll-${postId}`;
const IMPRESSION_KEY = (postId: string) => `factsdeck-poll-impression-${postId}`;
const STARTED_KEY = (postId: string) => `factsdeck-poll-started-${postId}`;
const COMPLETE_EVENT_KEY = (postId: string) => `factsdeck-poll-complete-event-${postId}`;
const SKIP_KEY = (postId: string) => `factsdeck-poll-skip-${postId}`;

type StoredPoll = {
  answers: Record<string, string>;
  completedAt?: string;
};

type PollContextValue = {
  poll: ArticlePoll;
  postId: string;
  step: number;
  total: number;
  completed: boolean;
  answers: Record<string, string>;
  livePoll: ArticlePoll;
  startPoll: () => void;
  openPoll: () => void;
  closePoll: () => void;
  modalOpen: boolean;
  selectOption: (questionId: string, optionId: string) => Promise<void>;
  dismissPoll: () => void;
  submitting: boolean;
  score: { correct: number; gradable: number };
};

const PollContext = createContext<PollContextValue | null>(null);

function usePollContext(): PollContextValue {
  const ctx = useContext(PollContext);
  if (!ctx) throw new Error("ArticlePollExperience must wrap poll UI");
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

function loadStored(postId: string): StoredPoll | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY(postId));
    if (!raw) return null;
    return JSON.parse(raw) as StoredPoll;
  } catch {
    return null;
  }
}

function saveStored(postId: string, data: StoredPoll) {
  localStorage.setItem(STORAGE_KEY(postId), JSON.stringify(data));
}

function optionPercent(votes: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((votes / total) * 100);
}

export function ArticlePollProvider({
  poll,
  postId,
  children,
}: {
  poll: ArticlePoll;
  postId: string;
  children: ReactNode;
}) {
  const [livePoll, setLivePoll] = useState(poll);
  const [step, setStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const questions = livePoll.questions.slice(0, POLL_QUESTION_COUNT);
  const total = questions.length;
  const completed = step > total;

  useEffect(() => {
    setLivePoll(poll);
  }, [poll]);

  useEffect(() => {
    const stored = loadStored(postId);
    if (stored?.answers) {
      setAnswers(stored.answers);
      const answered = Object.keys(stored.answers).length;
      if (stored.completedAt || answered >= total) {
        setStep(total + 1);
      } else if (answered > 0) {
        setStep(answered + 1);
      }
    }
    setHydrated(true);
  }, [postId, total]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    if (sessionStorage.getItem(IMPRESSION_KEY(postId))) return;
    sessionStorage.setItem(IMPRESSION_KEY(postId), "1");
    void recordPollEvent(postId, "impression");
  }, [hydrated, postId]);

  const score = useMemo(() => {
    let correct = 0;
    let gradable = 0;
    for (const q of questions) {
      if (q.kind !== "knowledge" || !q.correctOptionId) continue;
      gradable += 1;
      if (answers[q.id] === q.correctOptionId) correct += 1;
    }
    return { correct, gradable };
  }, [questions, answers]);

  const persist = useCallback(
    (nextAnswers: Record<string, string>, done: boolean) => {
      saveStored(postId, {
        answers: nextAnswers,
        ...(done ? { completedAt: new Date().toISOString() } : {}),
      });
    },
    [postId]
  );

  const selectOption = useCallback(
    async (questionId: string, optionId: string) => {
      if (submitting || answers[questionId]) return;
      setSubmitting(true);
      const res = await recordPollAnswer(postId, questionId, optionId);
      if (res.ok && res.poll) setLivePoll(res.poll);
      const next = { ...answers, [questionId]: optionId };
      setAnswers(next);
      const qIndex = questions.findIndex((q) => q.id === questionId);
      const isLast = qIndex >= total - 1;
      if (isLast) {
        setStep(total + 1);
        persist(next, true);
        if (!sessionStorage.getItem(COMPLETE_EVENT_KEY(postId))) {
          sessionStorage.setItem(COMPLETE_EVENT_KEY(postId), "1");
          void recordPollEvent(postId, "complete");
        }
      } else {
        setStep(qIndex + 2);
        persist(next, false);
      }
      setSubmitting(false);
    },
    [answers, postId, persist, questions, submitting, total]
  );

  const trackStart = useCallback(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem(STARTED_KEY(postId))) {
      sessionStorage.setItem(STARTED_KEY(postId), "1");
      void recordPollEvent(postId, "start");
    }
  }, [postId]);

  const startPoll = useCallback(() => {
    setModalOpen(true);
    trackStart();
    if (step === 0) setStep(1);
  }, [step, trackStart]);

  const dismissPoll = useCallback(() => {
    if (typeof window !== "undefined" && !sessionStorage.getItem(SKIP_KEY(postId))) {
      sessionStorage.setItem(SKIP_KEY(postId), "1");
      void recordPollEvent(postId, "skip");
    }
    setModalOpen(false);
  }, [postId]);

  const openPollModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const closePoll = useCallback(() => setModalOpen(false), []);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<{ postId: string }>).detail;
      if (detail?.postId === postId) openPollModal();
    };
    window.addEventListener(POLL_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(POLL_OPEN_EVENT, onOpen);
  }, [postId, openPollModal]);

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  const value: PollContextValue = {
    poll: livePoll,
    postId,
    step,
    total,
    completed,
    answers,
    livePoll,
    startPoll,
    openPoll: openPollModal,
    closePoll,
    modalOpen,
    selectOption,
    dismissPoll,
    submitting,
    score,
  };

  return <PollContext.Provider value={value}>{children}</PollContext.Provider>;
}

function QuestionStep({ question, index }: { question: PollQuestion; index: number }) {
  const { answers, selectOption, submitting, livePoll } = usePollContext();
  const chosen = answers[question.id];
  const liveQ = livePoll.questions.find((q) => q.id === question.id) ?? question;
  const totalVotes = liveQ.options.reduce((s, o) => s + o.votes, 0);
  const Icon = kindIcon(question.kind);
  const isCorrect =
    question.kind === "knowledge" &&
    question.correctOptionId &&
    chosen === question.correctOptionId;
  const isWrong =
    question.kind === "knowledge" &&
    question.correctOptionId &&
    chosen &&
    chosen !== question.correctOptionId;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-cyan-300">
        <Icon className="h-4 w-4" aria-hidden />
        Question {index} of {POLL_QUESTION_COUNT}
        <span className="text-zinc-500 dark:text-zinc-500 font-medium normal-case">
          · {question.kind === "knowledge" ? "Knowledge" : question.kind === "opinion" ? "Your take" : question.kind === "experience" ? "Experience" : "Confidence"}
        </span>
      </div>
      <h3 className="font-display text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-snug">
        {question.prompt}
      </h3>
      {question.helpText ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{question.helpText}</p>
      ) : null}

      <ul className="space-y-2" role="listbox" aria-label="Answer choices">
        {liveQ.options.map((opt) => {
          const selected = chosen === opt.id;
          const pct = optionPercent(opt.votes, totalVotes);
          const showResults = Boolean(chosen);
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={Boolean(chosen) || submitting}
                onClick={() => selectOption(question.id, opt.id)}
                className={`relative w-full overflow-hidden rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition-all ${
                  selected
                    ? "border-blue-600 bg-blue-50 text-blue-950 dark:border-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-50"
                    : "border-zinc-200 bg-white text-zinc-800 hover:border-orange-300 hover:bg-orange-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-cyan-700 dark:hover:bg-zinc-800"
                } disabled:cursor-default`}
              >
                {showResults ? (
                  <span
                    className="absolute inset-y-0 left-0 bg-blue-200/40 dark:bg-cyan-500/15 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                    aria-hidden
                  />
                ) : null}
                <span className="relative flex items-center justify-between gap-3">
                  <span>{opt.label}</span>
                  {showResults ? (
                    <span className="tabular-nums text-xs font-bold text-zinc-600 dark:text-zinc-400">
                      {pct}%
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {chosen && question.kind === "knowledge" && question.correctOptionId ? (
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
            ? "Nice — that matches the article’s key takeaway."
            : "Good effort — re-read the highlighted sections to sharpen your recall."}
        </p>
      ) : chosen ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Thanks — your answer is in. See how other readers responded above.
        </p>
      ) : null}
    </div>
  );
}

function PollWizardBody() {
  const { livePoll, step, total, completed, score, startPoll, dismissPoll } = usePollContext();
  const questions = livePoll.questions.slice(0, POLL_QUESTION_COUNT);

  if (step === 0) {
    return (
      <div className="text-center py-4 sm:py-6">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg mb-4">
          <Sparkles className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {livePoll.title}
        </h3>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300 max-w-md mx-auto text-sm leading-relaxed">
          {livePoll.subtitle}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={startPoll}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors"
          >
            Start {total}-question challenge
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={dismissPoll}
            className="text-sm font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline-offset-2 hover:underline"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="text-center py-4 sm:py-6 space-y-4">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          You&apos;re all caught up!
        </h3>
        {score.gradable > 0 ? (
          <p className="text-zinc-600 dark:text-zinc-300">
            Knowledge score:{" "}
            <strong className="text-blue-800 dark:text-cyan-300">
              {score.correct}/{score.gradable}
            </strong>{" "}
            on graded questions.
          </p>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-300">
            Thanks for sharing your perspective — you helped shape the community pulse on this article.
          </p>
        )}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Bookmark the article or explore related stories below to keep learning.
        </p>
      </div>
    );
  }

  const current = questions[step - 1];
  if (!current) return null;
  return <QuestionStep question={current} index={step} />;
}

function ProgressBar() {
  const { step, total, completed } = usePollContext();
  const pct = completed ? 100 : Math.round(((Math.max(step, 1) - 1) / total) * 100);
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden" aria-hidden>
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-violet-500 dark:from-emerald-500 dark:to-cyan-400 transition-all duration-500"
        style={{ width: `${completed ? 100 : pct}%` }}
      />
    </div>
  );
}

/** Poll modal — all screen sizes; questions shown one at a time. */
export function ArticlePollModal() {
  const { modalOpen, closePoll, livePoll, step, total, completed } = usePollContext();
  if (!modalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
        onClick={closePoll}
        aria-label="Close poll"
      />
      <div
        className="relative z-10 flex w-full max-h-[92dvh] sm:max-h-[min(90vh,720px)] sm:max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
        role="dialog"
        aria-modal="true"
        aria-labelledby="article-poll-modal-title"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sm:px-5 shrink-0">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              FactsDeck Quick Check
            </p>
            <h2
              id="article-poll-modal-title"
              className="font-display font-bold text-zinc-900 dark:text-zinc-100 truncate"
            >
              {livePoll.title}
            </h2>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!completed && step > 0 ? (
              <span className="text-xs font-semibold tabular-nums text-zinc-500 dark:text-zinc-400">
                {Math.min(step, total)}/{total}
              </span>
            ) : completed ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
            ) : null}
            <button
              type="button"
              onClick={closePoll}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Close poll"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="px-4 pt-3 sm:px-5 shrink-0">
          <ProgressBar />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
          <PollWizardBody />
        </div>
      </div>
    </div>
  );
}

/** Provider + poll modal. */
export function ArticlePollShell({
  poll,
  postId,
}: {
  poll: ArticlePoll;
  postId: string;
}) {
  return (
    <ArticlePollProvider poll={poll} postId={postId}>
      <ArticlePollModal />
    </ArticlePollProvider>
  );
}
