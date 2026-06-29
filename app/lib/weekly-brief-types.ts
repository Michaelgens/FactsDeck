export type WeeklyBriefSection = {
  title: string;
  summary: string;
  url?: string;
};

export type WeeklyBriefTemplate = {
  issueLabel: string;
  subject: string;
  preheader: string;
  headline: string;
  intro: string;
  editorsNote: string;
  sections: WeeklyBriefSection[];
  ctaLabel: string;
  ctaUrl: string;
};

export type BriefPostPick = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishDate: string;
  url: string;
};

export type WeeklyBriefEdition = {
  id: string;
  name: string;
  subject: string;
  headline: string;
  issueLabel: string;
  status: string;
  createdAt: string;
  targeted: number;
  delivered: number;
  failed: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  deliveryRate: number;
  openRate: number;
  clickThroughRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
};

export type WeeklyBriefRecipientSelection =
  | { mode: "explicit"; emails: string[] }
  | { mode: "all"; excludeEmails: string[] };

export function getCurrentIssueLabel(date = new Date()): string {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const week = getIsoWeek(start);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Week ${week} · ${fmt(start)}–${fmt(end)}`;
}

function getIsoWeek(d: Date): number {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function buildDefaultWeeklyBrief(issueLabel?: string): WeeklyBriefTemplate {
  const issue = issueLabel || getCurrentIssueLabel();
  return {
    issueLabel: issue,
    subject: `Facts Deck Weekly Brief — ${issue}`,
    preheader: "Your desk-side roundup: what to read this week on Facts Deck.",
    headline: "The week in clear finance",
    intro:
      "Here is your editorial roundup — what moved markets, what households should watch, and where to dig deeper on Facts Deck.",
    editorsNote: "",
    sections: [],
    ctaLabel: "Open Facts Deck",
    ctaUrl: "https://factsdeck.com",
  };
}

export function buildBriefTemplateFromPosts(
  posts: BriefPostPick[],
  base?: WeeklyBriefTemplate
): WeeklyBriefTemplate {
  const template = base ? { ...base, sections: [...base.sections] } : buildDefaultWeeklyBrief();
  if (posts.length === 0) return template;

  template.sections = posts.map((p) => ({
    title: p.title,
    summary: p.excerpt || "Read the full piece on Facts Deck.",
    url: p.url,
  }));

  const lead = posts[0];
  const defaultHeadline = buildDefaultWeeklyBrief().headline;
  if (!template.headline || template.headline === defaultHeadline) {
    template.headline = lead.title.length > 60 ? "This week on Facts Deck" : lead.title;
  }

  template.intro = `Our desk flagged ${posts.length} stor${posts.length === 1 ? "y" : "ies"} for your week — starting with ${lead.category.toLowerCase()} coverage you may have missed.`;
  template.subject = `Facts Deck Weekly Brief — ${template.issueLabel}`;
  template.preheader = `${posts.length} curated reads · ${template.issueLabel}`;

  return template;
}

export const WEEKLY_BRIEF_PRESETS: {
  id: string;
  label: string;
  template: Partial<WeeklyBriefTemplate>;
}[] = [
  {
    id: "markets",
    label: "Market pulse",
    template: {
      headline: "Rates, housing, and the week that was",
      intro:
        "Markets and policy shifted again this week. We pulled the stories that explain what changed — and what it means for your next decision.",
      preheader: "Markets & macro — curated for Facts Deck readers.",
    },
  },
  {
    id: "household",
    label: "Household essentials",
    template: {
      headline: "Money moves for real households",
      intro:
        "Budgets, borrowing, and everyday trade-offs — this week's reads focus on decisions you might actually make this month.",
      preheader: "Practical finance — no jargon required.",
    },
  },
  {
    id: "deep",
    label: "Deep reads",
    template: {
      headline: "Long reads worth your Sunday",
      intro:
        "When you have twenty minutes and want substance, start here. Our editors flagged the week's most rewarding deep dives.",
      preheader: "Editor's picks for thoughtful readers.",
    },
  },
];
