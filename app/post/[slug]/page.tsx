import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlugOrId, getPostContent } from "../../lib/posts";
import PostPageView from "../../components/PostPageView";
import { SITE_URL, absoluteUrl } from "../../lib/seo";
import { postPublicPath } from "../../lib/post-url";
import { isUuid } from "../../lib/slug";
import { siteTools } from "../../lib/site-config";
import { pickDailyTools } from "../../lib/tools-utils";

/** Fresh DB read per request; avoids a cached 404 right after publishing. */
export const dynamic = "force-dynamic";

function canonicalPostUrl(post: { id: string; slug: string | null }) {
  return `${SITE_URL.replace(/\/$/, "")}${postPublicPath(post)}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: param } = await params;
  const post = await getPostBySlugOrId(param);
  if (!post) return { title: "Post Not Found", robots: { index: false, follow: true } };

  const canonicalUrl = canonicalPostUrl(post);
  const ogImage = post.image ? absoluteUrl(post.image) : undefined;
  const keywordList = [...(post.categories ?? []), ...(post.tags ?? [])].filter(Boolean);

  return {
    title: post.title,
    description: post.excerpt,
    keywords: keywordList.length ? keywordList : undefined,
    authors: post.author ? [{ name: post.author.name }] : undefined,
    category: post.categories?.[0],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: canonicalUrl,
      siteName: "Facts Deck",
      locale: "en_US",
      publishedTime: post.publishDate,
      modifiedTime: post.publishDate,
      section: post.categories?.[0],
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
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug: param } = await params;
  const { from } = await searchParams;

  const post = await getPostBySlugOrId(param);
  if (!post) notFound();

  if (post.slug?.trim() && isUuid(param)) {
    redirect(postPublicPath(post));
  }

  const content = await getPostContent(post.content, post.contentUrl);

  const sidebarTools = pickDailyTools(siteTools, 5, `post-article-${post.id}`);

  const canonicalUrl = canonicalPostUrl(post);
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
        dateModified: post.publishDate,
        author: post.author
          ? { "@type": "Person", name: post.author.name }
          : undefined,
        publisher: { "@id": `${SITE_URL}/#organization` },
        articleSection: post.categories?.join(", "),
        keywords: [...(post.categories ?? []), ...(post.tags ?? [])].join(", ") || undefined,
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
      <PostPageView article={post} content={content} from={from} sidebarTools={sidebarTools} />
    </>
  );
}
