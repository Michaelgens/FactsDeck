/** Standard post data structure - all posts use this shape */
export interface Post {
  id: string;
  /** SEO path segment for /post/[slug]; null = legacy, use id in URL */
  slug: string | null;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  contentUrl: string | null;
  content?: string | null;
  author: {
    name: string;
    title: string;
    image: string;
    bio?: string;
    followers?: string;
    articles?: number;
  };
  publishDate: string;
  readTime: string;
  views: string;
  likes: number;
  bookmarks: number;
  tags: string[];
  featured: boolean;
  expertPicks: boolean;
  trending: boolean;
  guides: boolean;
  createdAt: string;
}

export type PostSummary = Pick<
  Post,
  | "id"
  | "slug"
  | "title"
  | "excerpt"
  | "category"
  | "image"
  | "readTime"
  | "publishDate"
  | "author"
  | "views"
  | "likes"
  | "tags"
>;
