"use client";

import { Plus, Sparkles, Trash2 } from "lucide-react";
import {
  createEmptyPoll,
  createEmptyQuestion,
  createEmptyOption,
  createFactsDeckPollTemplate,
  pollKindLabel,
  POLL_QUESTION_COUNT,
  type ArticlePoll,
  type PollQuestion,
  type PollQuestionKind,
} from "../../lib/poll-types";
import { admin } from "../components/admin-theme";

const KINDS: PollQuestionKind[] = ["knowledge", "opinion", "experience", "confidence"];

type Props = {
  poll: ArticlePoll | null | undefined;
  articleTitle: string;
  category?: string;
  onChange: (poll: ArticlePoll) => void;
};

function ensureSingleQuestion(poll: ArticlePoll): ArticlePoll {
  if (poll.questions.length === POLL_QUESTION_COUNT) return poll;
  const first = poll.questions[0] ?? createEmptyQuestion("opinion");
  return { ...poll, questions: [first] };
}

export default function PostPollEditor({ poll, articleTitle, category, onChange }: Props) {
  const state = ensureSingleQuestion(poll ?? createEmptyPoll());
  const q: PollQuestion = state.questions[0] ?? createEmptyQuestion("opinion");

  const setPoll = (patch: Partial<ArticlePoll>) => {
    onChange(ensureSingleQuestion({ ...state, ...patch }));
  };

  const setQuestion = (patch: Partial<PollQuestion>) => {
    onChange(ensureSingleQuestion({ ...state, questions: [{ ...q, ...patch }] }));
  };

  const loadTemplate = () => {
    onChange(createFactsDeckPollTemplate(articleTitle, category ?? "General"));
  };

  const handleEnable = (enabled: boolean) => {
    if (enabled) {
      onChange(ensureSingleQuestion({ ...state, enabled: true }));
    } else {
      onChange({ ...state, enabled: false });
    }
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-sm ${admin.input} ${admin.focus}`;
  const labelClass = `block text-xs font-semibold uppercase tracking-wide ${admin.subtle} mb-1`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <label className="inline-flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={state.enabled}
            onChange={(e) => handleEnable(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-600 dark:bg-zinc-950"
          />
          <span className={`text-sm font-semibold ${admin.heading}`}>Enable reader poll on this article</span>
        </label>
        <button
          type="button"
          onClick={loadTemplate}
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-violet-200 dark:border-violet-500/40 text-purple-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors`}
        >
          <Sparkles className="h-4 w-4" />
          Load FactsDeck template
        </button>
      </div>

      {!state.enabled ? (
        <p className={`text-sm ${admin.body} rounded-xl border border-dashed border-slate-200 dark:border-zinc-700 px-4 py-6 text-center`}>
          Turn on the poll to add one community question. Readers vote once and see live results in the modal.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Poll title</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => setPoll({ title: e.target.value })}
                className={inputClass}
                placeholder="Community Poll"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Subtitle</label>
              <input
                type="text"
                value={state.subtitle}
                onChange={(e) => setPoll({ subtitle: e.target.value })}
                className={inputClass}
                placeholder="One quick question — vote and see how readers responded"
              />
            </div>
          </div>

          <p className={`text-xs ${admin.subtle}`}>
            Exactly <strong>one</strong> question per article. After voting, readers see community percentages in the
            engagement modal.
          </p>

          <div className={`rounded-xl border ${admin.divide} ${admin.muted} p-4 space-y-3`}>
            <p className={`text-sm font-bold ${admin.heading}`}>Poll question</p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={q.kind}
                  onChange={(e) =>
                    setQuestion({
                      kind: e.target.value as PollQuestionKind,
                      correctOptionId:
                        e.target.value === "knowledge" ? q.correctOptionId : undefined,
                    })
                  }
                  className={inputClass}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {pollKindLabel(k)}
                    </option>
                  ))}
                </select>
              </div>
              {q.kind === "knowledge" ? (
                <div>
                  <label className={labelClass}>Correct answer (optional)</label>
                  <select
                    value={q.correctOptionId ?? ""}
                    onChange={(e) =>
                      setQuestion({
                        correctOptionId: e.target.value || undefined,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="">None — opinion-style check-in</option>
                    {q.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label || "(empty option)"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            <div>
              <label className={labelClass}>Prompt</label>
              <textarea
                rows={2}
                value={q.prompt}
                onChange={(e) => setQuestion({ prompt: e.target.value })}
                className={inputClass}
                placeholder="What would you ask the reader?"
              />
            </div>

            <div>
              <label className={labelClass}>Helper text (optional)</label>
              <input
                type="text"
                value={q.helpText ?? ""}
                onChange={(e) => setQuestion({ helpText: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <span className={labelClass}>Answer options</span>
              {q.options.map((opt, oi) => (
                <div key={opt.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => {
                      const options = q.options.map((o, j) =>
                        j === oi ? { ...o, label: e.target.value } : o
                      );
                      setQuestion({ options });
                    }}
                    className={`flex-1 ${inputClass}`}
                    placeholder={`Option ${oi + 1}`}
                  />
                  <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500 w-12 text-right">
                    {opt.votes} votes
                  </span>
                  {q.options.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const options = q.options.filter((_, j) => j !== oi);
                        const correctOptionId =
                          q.correctOptionId === opt.id ? undefined : q.correctOptionId;
                        setQuestion({ options, correctOptionId });
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              ))}
              {q.options.length < 5 ? (
                <button
                  type="button"
                  onClick={() =>
                    setQuestion({
                      options: [...q.options, createEmptyOption()],
                    })
                  }
                  className="text-sm font-semibold text-purple-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add option
                </button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
