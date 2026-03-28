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
      };
      posts: {
        Row: {
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
        };
        Insert: Omit<Database["public"]["Tables"]["posts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
    };
  };
}
