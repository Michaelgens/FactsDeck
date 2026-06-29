"use client";

import { Plus, Sparkles, Trash2, Trophy, GripVertical } from "lucide-react";
import {
  QUIZ_MIN_QUESTION_COUNT,
  QUIZ_QUESTION_COUNT,
  createEmptyQuiz,
  createEmptyQuizOption,
  createEmptyQuizQuestion,
  createFactsDeckQuizTemplate,
  DEFAULT_QUIZ_RESULT_BANDS,
  type ArticleQuiz,
  type QuizQuestion,
  type QuizResultBand,
} from "../../lib/quiz-types";
import { admin } from "../components/admin-theme";

type Props = {
  quiz: ArticleQuiz | null | undefined;
  articleTitle: string;
  category?: string;
  onChange: (quiz: ArticleQuiz) => void;
};

export default function PostQuizEditor({ quiz, articleTitle, category, onChange }: Props) {
  const state = quiz ?? createEmptyQuiz();

  const setQuiz = (patch: Partial<ArticleQuiz>) => {
    onChange({ ...state, ...patch });
  };

  const setQuestion = (index: number, patch: Partial<QuizQuestion>) => {
    const questions = state.questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
    onChange({ ...state, questions });
  };

  const addQuestion = () => {
    if (state.questions.length >= QUIZ_QUESTION_COUNT) return;
    onChange({ ...state, questions: [...state.questions, createEmptyQuizQuestion()] });
  };

  const removeQuestion = (index: number) => {
    onChange({ ...state, questions: state.questions.filter((_, i) => i !== index) });
  };

  const loadTemplate = () => {
    onChange(createFactsDeckQuizTemplate(articleTitle, category ?? "General"));
  };

  const resetBands = () => {
    onChange({ ...state, resultBands: DEFAULT_QUIZ_RESULT_BANDS });
  };

  const setBand = (index: number, patch: Partial<QuizResultBand>) => {
    const resultBands = state.resultBands.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange({ ...state, resultBands });
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm ${admin.input} ${admin.focus}`;
  const labelClass = `block text-xs font-semibold uppercase tracking-wide ${admin.subtle} mb-1`;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-violet-50/40 dark:from-amber-950/20 dark:via-zinc-950 dark:to-violet-950/20 dark:border-amber-900/40 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className={`font-display font-bold ${admin.heading}`}>Knowledge Quiz studio</p>
            <p className={`text-sm mt-1 ${admin.subtle}`}>
              Add 1–5 graded questions with a score card at the end. Readers can also take the community poll —
              both open in the same modal.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) => setQuiz({ enabled: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 dark:border-zinc-600 dark:bg-zinc-950"
          />
          <span className={`text-sm font-semibold ${admin.heading}`}>Enable knowledge quiz on this article</span>
        </label>
        <button
          type="button"
          onClick={loadTemplate}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-amber-300/80 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          Generate quiz draft
        </button>
      </div>

      {!state.enabled ? (
        <p className={`text-sm text-center py-10 rounded-xl border border-dashed ${admin.divide} ${admin.subtle}`}>
          Enable the quiz to configure 1–5 graded questions and performance bands.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Quiz title</label>
              <input
                className={inputClass}
                value={state.title}
                onChange={(e) => setQuiz({ title: e.target.value })}
                placeholder="Knowledge Quiz"
              />
            </div>
            <div>
              <label className={labelClass}>Subtitle</label>
              <input
                className={inputClass}
                value={state.subtitle}
                onChange={(e) => setQuiz({ subtitle: e.target.value })}
                placeholder="Up to five questions — earn your score card"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`font-semibold ${admin.heading}`}>
                Questions ({state.questions.length}/{QUIZ_MIN_QUESTION_COUNT}–{QUIZ_QUESTION_COUNT})
              </h3>
              <button
                type="button"
                onClick={addQuestion}
                disabled={state.questions.length >= QUIZ_QUESTION_COUNT}
                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add question
              </button>
            </div>

            <div className="space-y-4">
              {state.questions.map((q, qi) => (
                <div
                  key={q.id}
                  className={`rounded-xl border p-4 space-y-3 ${admin.divide} bg-slate-50/50 dark:bg-zinc-900/40`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase ${admin.subtle}`}>
                      <GripVertical className="h-3.5 w-3.5" />
                      Question {qi + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qi)}
                      disabled={state.questions.length <= QUIZ_MIN_QUESTION_COUNT}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Remove question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div>
                    <label className={labelClass}>Prompt</label>
                    <textarea
                      rows={2}
                      className={`${inputClass} resize-y`}
                      value={q.prompt}
                      onChange={(e) => setQuestion(qi, { prompt: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Helper text (optional)</label>
                    <input
                      className={inputClass}
                      value={q.helpText ?? ""}
                      onChange={(e) => setQuestion(qi, { helpText: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Correct answer</label>
                    <select
                      className={inputClass}
                      value={q.correctOptionId}
                      onChange={(e) => setQuestion(qi, { correctOptionId: e.target.value })}
                    >
                      {q.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label.trim() || "Untitled option"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Answer options</label>
                    {q.options.map((opt, oi) => (
                      <div key={opt.id} className="flex gap-2">
                        <input
                          className={`flex-1 ${inputClass}`}
                          value={opt.label}
                          onChange={(e) => {
                            const options = q.options.map((o, j) =>
                              j === oi ? { ...o, label: e.target.value } : o
                            );
                            setQuestion(qi, { options });
                          }}
                          placeholder={`Option ${oi + 1}`}
                        />
                        <button
                          type="button"
                          disabled={q.options.length <= 2}
                          onClick={() => {
                            const removed = opt.id;
                            const options = q.options.filter((_, j) => j !== oi);
                            const correctOptionId =
                              q.correctOptionId === removed ? options[0]?.id ?? "" : q.correctOptionId;
                            setQuestion(qi, { options, correctOptionId });
                          }}
                          className="p-2 rounded-lg border border-red-200 text-red-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {q.options.length < 5 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setQuestion(qi, { options: [...q.options, createEmptyQuizOption()] })
                        }
                        className="text-xs font-semibold text-amber-700 dark:text-amber-300"
                      >
                        + Add option
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-xl border p-4 space-y-4 ${admin.divide}`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className={`font-semibold ${admin.heading}`}>Performance result bands</h3>
                <p className={`text-xs mt-0.5 ${admin.subtle}`}>
                  Shown on the score card when readers finish (bands use min score out of {QUIZ_QUESTION_COUNT}).
                </p>
              </div>
              <button type="button" onClick={resetBands} className={`text-xs font-semibold ${admin.subtle} hover:underline`}>
                Reset defaults
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {state.resultBands.map((band, bi) => (
                <div key={`${band.minScore}-${bi}`} className={`rounded-lg border p-3 ${admin.divide}`}>
                  <div className="flex gap-2 mb-2">
                    <div className="w-16">
                      <label className={labelClass}>Min</label>
                      <input
                        type="number"
                        min={0}
                        max={QUIZ_QUESTION_COUNT}
                        className={inputClass}
                        value={band.minScore}
                        onChange={(e) =>
                          setBand(bi, { minScore: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <label className={labelClass}>Label</label>
                      <input
                        className={inputClass}
                        value={band.label}
                        onChange={(e) => setBand(bi, { label: e.target.value })}
                      />
                    </div>
                  </div>
                  <label className={labelClass}>Message</label>
                  <textarea
                    rows={2}
                    className={`${inputClass} resize-y`}
                    value={band.message}
                    onChange={(e) => setBand(bi, { message: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
