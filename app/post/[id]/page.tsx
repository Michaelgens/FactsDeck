import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getPostById,
  getPostContent,
  getRelatedPosts,
  getPartitionedPosts,
  getCategoriesWithCounts,
} from "../../lib/posts";
import PostPageClient from "../../components/PostPageClient";
import { SITE_URL, absoluteUrl } from "../../lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return { title: "Post Not Found", robots: { index: false, follow: true } };

  const canonicalUrl = `${SITE_URL}/post/${id}`;
  const ogImage = post.image ? absoluteUrl(post.image) : undefined;
  const keywordList = [
    post.category,
    ...(post.tags ?? []),
  ].filter(Boolean);

  return {
    title: post.title,
    description: post.excerpt,
    keywords: keywordList.length ? keywordList : undefined,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    category: post.category,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
      siteName: "Facts Deck",
      locale: "en_US",
      publishedTime: post.publishDate,
      modifiedTime: post.createdAt || post.publishDate,
      section: post.category,
      tags: post.tags?.length ? post.tags : undefined,
      authors: post.author ? [post.author.name] : undefined,
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: { canonical: canonicalUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function PostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  const post = await getPostById(id);
  if (!post) notFound();

  const [content, relatedPosts, partitioned, categoriesWithCounts] =
    await Promise.all([
      getPostContent(post.content, post.contentUrl),
      getRelatedPosts(post.id, post.category, 3),
      getPartitionedPosts(post.id),
      getCategoriesWithCounts(),
    ]);

  const canonicalUrl = `${SITE_URL}/post/${id}`;
  const imageUrl = post.image ? absoluteUrl(post.image) : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${canonicalUrl}#article`,
        headline: post.title,
        description: post.excerpt,
        image: imageUrl
          ? {
              "@type": "ImageObject",
              url: imageUrl,
              width: 1200,
              height: 630,
            }
          : undefined,
        datePublished: post.publishDate,
        dateModified: post.createdAt || post.publishDate,
        author: post.author
          ? { "@type": "Person", name: post.author.name }
          : undefined,
        publisher: { "@id": `${SITE_URL}/#organization` },
        articleSection: post.category,
        keywords: post.tags?.length ? post.tags.join(", ") : undefined,
        inLanguage: "en-US",
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
        isPartOf: { "@id": `${SITE_URL}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Articles",
            item: `${SITE_URL}/post`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.title,
            item: canonicalUrl,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Facts Deck",
        url: SITE_URL,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Facts Deck",
        url: SITE_URL,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostPageClient
      article={post}
      content={content}
      from={from}
      relatedArticles={relatedPosts}
      trendingPosts={partitioned.trending}
      guidePosts={partitioned.guides}
      categoriesWithCounts={categoriesWithCounts}
    />
    </>
  );
}
