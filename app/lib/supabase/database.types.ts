/** Supabase-generated shape — must satisfy @supabase/postgrest-js GenericSchema (Tables + Views + Functions; Relationships on each table). */

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string;
  content_url: string | null;
  content: string | null;
  author_name: string;
  author_title: string;
  author_image: string;
  author_bio: string | null;
  author_followers: string | null;
  author_articles: number | null;
  publish_date: string;
  read_time: string;
  views: string;
  likes: number;
  bookmarks: number;
  tags: string[];
  featured: boolean;
  expert_picks: boolean;
  trending: boolean;
  guides: boolean;
  created_at: string;
  /** SEO slug for /post/[slug]; null allowed for legacy rows */
  slug: string | null;
};

export type PostInsert = Omit<PostRow, "id" | "created_at">;
export type PostUpdate = Partial<PostInsert>;

export interface Database {
  public: {
    Tables: {
      subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: { email: string };
        Update: Partial<{ email: string }>;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_post_by_slug: {
        Args: { p_slug: string };
        Returns: PostRow[];
      };
    };
  };
}
