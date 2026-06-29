/** Supabase-generated shape — must satisfy @supabase/postgrest-js GenericSchema (Tables + Views + Functions; Relationships on each table). */

import type { ArticlePoll } from "../poll-types";
import type { ArticleQuiz } from "../quiz-types";

export type PostRow = {
  id: string;
  title: string;
  excerpt: string;
  categories: string[];
  published: boolean;
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
  /** FactsDeck 5-question reader poll (jsonb) */
  poll: ArticlePoll | null;
  /** FactsDeck 5-question knowledge quiz (jsonb) */
  quiz: ArticleQuiz | null;
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
      email_campaigns: {
        Row: {
          id: string;
          name: string;
          subject: string;
          headline: string | null;
          email_type: string;
          template: Record<string, unknown>;
          status: string;
          targeted_count: number;
          sent_count: number;
          failed_count: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          name: string;
          subject: string;
          headline?: string | null;
          email_type?: string;
          template?: Record<string, unknown>;
          status?: string;
          targeted_count?: number;
          sent_count?: number;
          failed_count?: number;
          completed_at?: string | null;
        };
        Update: Partial<{
          status: string;
          sent_count: number;
          failed_count: number;
          completed_at: string | null;
        }>;
        Relationships: [];
      };
      email_sends: {
        Row: {
          id: string;
          email_type: string;
          recipient_email: string;
          message_id: string | null;
          status: string;
          failed_reason: string | null;
          sent_at: string;
          created_at: string;
          campaign_id: string | null;
        };
        Insert: {
          email_type: string;
          recipient_email: string;
          message_id?: string | null;
          status?: string;
          failed_reason?: string | null;
          sent_at?: string;
          campaign_id?: string | null;
        };
        Update: Partial<{
          message_id: string | null;
          status: string;
          failed_reason: string | null;
          sent_at: string;
        }>;
        Relationships: [];
      };
      email_events: {
        Row: {
          id: string;
          send_id: string | null;
          email_type: string;
          event_type: string;
          recipient_email: string;
          link_url: string | null;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          send_id?: string | null;
          email_type: string;
          event_type: string;
          recipient_email: string;
          link_url?: string | null;
          metadata?: Record<string, unknown> | null;
        };
        Update: Partial<{
          send_id: string | null;
          link_url: string | null;
          metadata: Record<string, unknown> | null;
        }>;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
      tool_analytics: {
        Row: {
          tool_slug: string;
          analytics: Record<string, unknown>;
          updated_at: string;
        };
        Insert: {
          tool_slug: string;
          analytics?: Record<string, unknown>;
          updated_at?: string;
        };
        Update: Partial<{
          analytics: Record<string, unknown>;
          updated_at: string;
        }>;
        Relationships: [];
      };
      support_tickets: {
        Row: {
          id: string;
          ticket_number: string;
          name: string;
          email: string;
          department: string;
          priority: string;
          subject: string;
          message: string;
          status: string;
          assigned_admin_email: string | null;
          created_at: string;
          updated_at: string;
          resolved_at: string | null;
          last_reply_at: string | null;
          last_reply_by: string | null;
        };
        Insert: {
          ticket_number: string;
          name: string;
          email: string;
          department?: string;
          priority?: string;
          subject: string;
          message: string;
          status?: string;
          assigned_admin_email?: string | null;
          resolved_at?: string | null;
          last_reply_at?: string | null;
          last_reply_by?: string | null;
        };
        Update: Partial<{
          status: string;
          priority: string;
          assigned_admin_email: string | null;
          updated_at: string;
          resolved_at: string | null;
          last_reply_at: string | null;
          last_reply_by: string | null;
        }>;
        Relationships: [];
      };
      support_ticket_messages: {
        Row: {
          id: string;
          ticket_id: string;
          direction: string;
          author_name: string;
          author_email: string;
          body: string;
          email_message_id: string | null;
          created_at: string;
        };
        Insert: {
          ticket_id: string;
          direction: string;
          author_name: string;
          author_email: string;
          body: string;
          email_message_id?: string | null;
        };
        Update: Partial<{
          email_message_id: string | null;
        }>;
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
