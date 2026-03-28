"use client";

import { useState, useEffect, useCallback } from "react";
import {
  incrementPostLikes,
  decrementPostLikes,
  incrementPostBookmarks,
  decrementPostBookmarks,
} from "../lib/post-actions";

const LIKED_KEY = "factsdeck-liked";
const BOOKMARKED_KEY = "factsdeck-bookmarked";

function getLikedSet(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function getBookmarkedSet(): Set<string> {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = localStorage.getItem(BOOKMARKED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set<string>();
  }
}

function saveLikedSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

function saveBookmarkedSet(set: Set<string>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(BOOKMARKED_KEY, JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

export type EngagementState = {
  likes: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
};

/** Shared hook for like/bookmark state. Syncs with localStorage and Supabase. */
export function usePostEngagement(
  postId: string,
  initialLikes: number,
  initialBookmarks: number
) {
  const [likes, setLikes] = useState(initialLikes);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    setLikes(initialLikes);
    setBookmarks(initialBookmarks);
    setIsLiked(getLikedSet().has(postId));
    setIsBookmarked(getBookmarkedSet().has(postId));
  }, [postId, initialLikes, initialBookmarks]);

  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((prev) => (nextLiked ? prev + 1 : prev - 1));

    const s = getLikedSet();
    if (nextLiked) {
      s.add(postId);
      const res = await incrementPostLikes(postId);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(false);
        setLikes((p) => p - 1);
        s.delete(postId);
      }
    } else {
      s.delete(postId);
      const res = await decrementPostLikes(postId);
      if (res.ok && res.likes != null) setLikes(res.likes);
      else if (!res.ok) {
        setIsLiked(true);
        setLikes((p) => p + 1);
        s.add(postId);
      }
    }
    saveLikedSet(s);
  }, [postId, isLiked]);

  const handleBookmark = useCallback(async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarks((prev) => (nextBookmarked ? prev + 1 : prev - 1));

    const s = getBookmarkedSet();
    if (nextBookmarked) {
      s.add(postId);
      const res = await incrementPostBookmarks(postId);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(false);
        setBookmarks((p) => p - 1);
        s.delete(postId);
      }
    } else {
      s.delete(postId);
      const res = await decrementPostBookmarks(postId);
      if (res.ok && res.bookmarks != null) setBookmarks(res.bookmarks);
      else if (!res.ok) {
        setIsBookmarked(true);
        setBookmarks((p) => p + 1);
        s.add(postId);
      }
    }
    saveBookmarkedSet(s);
  }, [postId, isBookmarked]);

  return {
    likes,
    bookmarks,
    isLiked,
    isBookmarked,
    handleLike,
    handleBookmark,
  };
}
