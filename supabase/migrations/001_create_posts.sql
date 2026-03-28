-- Facts Deck: posts table
-- Content URL points to Vercel Blob (markdown file)
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  content_url TEXT,
  author_name TEXT NOT NULL,
  author_title TEXT NOT NULL DEFAULT 'Writer',
  author_image TEXT NOT NULL,
  author_bio TEXT,
  author_followers TEXT,
  author_articles INTEGER,
  publish_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_time TEXT NOT NULL DEFAULT '5 min read',
  views TEXT NOT NULL DEFAULT '0',
  likes INTEGER NOT NULL DEFAULT 0,
  bookmarks INTEGER NOT NULL DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  expert_picks BOOLEAN NOT NULL DEFAULT FALSE,
  trending BOOLEAN NOT NULL DEFAULT FALSE,
  guides BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON posts(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_posts_featured ON posts(featured) WHERE featured;
CREATE INDEX IF NOT EXISTS idx_posts_expert_picks ON posts(expert_picks) WHERE expert_picks;
CREATE INDEX IF NOT EXISTS idx_posts_trending ON posts(trending) WHERE trending;
CREATE INDEX IF NOT EXISTS idx_posts_guides ON posts(guides) WHERE guides;
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
