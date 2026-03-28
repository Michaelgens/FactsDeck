# New Article Template

Use this template to create a new article in the admin. Copy the values into the form at `/admin/articles/new`, or use it as a reference for the expected structure.

---

## Article Metadata

| Field | Example | Notes |
|-------|---------|-------|
| **Title** | How to Build an Emergency Fund in 2025 | Clear, descriptive headline |
| **Excerpt** | A step-by-step guide to setting aside 3–6 months of expenses for financial security. | 1–2 sentences, shown in cards and meta |
| **Category** | Personal Finance | Must match a category from site-config (Investing, Banking, Guides, etc.) |
| **Cover Image URL** | https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop | Use Unsplash, Pexels, or Vercel Blob |
| **Content (MD file URL)** | https://xxx.public.blob.vercel-storage.com/article.md | Upload your .md file to Vercel Blob, paste the public URL |
| **Read Time** | 8 min read | Estimated reading time |

---

## Author

| Field | Example |
|-------|---------|
| **Name** | Sarah Chen |
| **Title** | Senior Finance Writer |
| **Avatar** | Choose from 5 preset options (Alex, Jamie, Sam, Riley, Casey) |
| **Bio** | Sarah has 10+ years covering personal finance and investing. |
| **Followers** | 25K |
| **Articles** | 156 |

---

## Tags

Comma-separated, e.g.: `emergency fund, savings, personal finance, budgeting`

---

## Featured Flags

- **Featured** – Show in Featured Articles on homepage
- **Expert Pick** – Appears in Expert Picks
- **Trending** – Shown in Trending sidebar
- **Popular Guide** – Listed in Popular Guides

---

## Body Content (Markdown)

1. Write your article in Markdown
2. Upload the `.md` file to Vercel Blob (link in admin form: "Upload MD to Vercel Blob")
3. Paste the public URL in the **Content (MD file URL)** field

The frontend fetches and renders the MD from the URL.

Example structure:

```markdown
# How to Build an Emergency Fund in 2025

Having a robust emergency fund is one of the cornerstones of financial security. This reserve of cash ensures you’re prepared when life throws the unexpected your way. Here’s a thorough, actionable guide to help you get started—and stay on track—for 2025 and beyond.

## Why an Emergency Fund Matters

Unexpected costs—such as job loss, medical emergencies, or sudden home repairs—can quickly destabilize your finances. By setting aside **three to six months’ worth of living expenses**, you can protect yourself and your family from financial disruptions, avoid debt traps, and gain unbeatable peace of mind.

## Step 1: Determine Your Target Amount

First, list out your essential monthly expenses, including:

- Rent or mortgage payments
- Utilities (electricity, water, internet, etc.)
- Groceries and household supplies
- Insurance premiums
- Transportation costs
- Minimum payments on debts

Add these up to get your total monthly necessity. Multiply that number by at least **3** (for a basic safety net) or **6** (for optimal security).

> **Example:**  
> If your monthly essentials total $2,500, aim for $7,500 (3 months) to $15,000 (6 months). Everyone’s number will be different—customize it to fit your life.

## Step 2: Choose the Right Account

House your emergency fund separately from your regular spending. The best options are high-yield savings accounts that offer easy access and FDIC/NCUA insurance. Compare interest rates (APYs) online—many reputable banks are offering **4% or more** as of 2025.

> 💡 **Tip:** Avoid tying up your emergency fund in investments or accounts that penalize for withdrawal. Liquidity is key.

## Step 3: Set Up Automatic Savings

Consistency beats intensity. Automate your savings by scheduling a recurring transfer from your checking account—ideally every payday. Small, regular amounts add up rapidly:

- $25/week = $1,300/year
- $50/week = $2,600/year
- $100/week = $5,200/year

Even starting with a small amount gets you in the savings habit. Over time, increase your transfer as your budget allows.

## Pro Tips for Success

- **Name Your Account:** Give it a dedicated nickname (e.g. “Safety Net”) to dissuade impulsive withdrawals.
- **Replenish Promptly:** If you dip into your fund, make a plan to rebuild as soon as possible.
- **Celebrate Milestones:** Set mini-goals (first $500, $1,000, etc.) and reward yourself for progress.

## Conclusion

An emergency fund offers freedom and flexibility—you’re prepared for whatever comes next. Start building your buffer today, no matter how small, and make it a non-negotiable part of your financial plan. Your future self will thank you for laying this essential foundation.
```

---

## Full Example (Copy-Paste Ready)

Use these values in the admin form:

- **Title:** How to Build an Emergency Fund in 2025
- **Excerpt:** A step-by-step guide to setting aside 3–6 months of expenses for financial security.
- **Category:** Personal Finance
- **Cover Image URL:** https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop
- **Author Name:** Sarah Chen
- **Author Title:** Senior Finance Writer
- **Avatar:** Pick one of the 5 preset options
- **Bio:** Sarah has 10+ years covering personal finance and investing.
- **Followers:** 25K
- **Articles:** 156
- **Read Time:** 8 min read
- **Tags:** emergency fund, savings, personal finance, budgeting
- **Featured:** Yes (toggle on)
- **Body:** Paste the markdown from the Body Content section above

---

## How the Frontend Uses This Data

1. **Homepage** – Featured, Expert Picks, Trending, Guides pull from posts with those flags set.
2. **Article cards** – Show title, excerpt, cover image, author (avatar + name), read time, views.
3. **Article detail page** – Full markdown body rendered as HTML, author bio, tags, related articles.
4. **Browse by Category** – Categories with at least one article appear; otherwise 4 defaults are shown.

Run the migration `002_add_content_column.sql` before creating articles so content is stored in Supabase.
