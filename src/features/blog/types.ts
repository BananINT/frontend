export type BlogCategory = 
    | 'campus'
    | 'coulisses'
    | 'tutoriel'
    | 'guide'
    | 'strategie'
    | 'telechargement'
    | 'architecture';

export interface BlogAuthor {
    name: string;
    role: string;
    avatar?: string;
}

export interface BlogDownload {
    title: string;
    description: string;
    filename: string;
    size: string;
    format: string;
    downloadUrl: string;
    sha256?: string;
}

export interface BlogFaq {
    question: string;
    answer: string;
}

export interface BlogArticle {
    id: string;
    slug: string;
    title: string;
    subtitle: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    category: BlogCategory;
    tags: string[];
    author: BlogAuthor;
    publishedAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
    readingTime: string;
    featuredImage?: string;
    featured?: boolean;
    downloads?: BlogDownload[];
    faqs?: BlogFaq[];
    content: string; // Markdown text
}

export interface SeoProps {
    title: string;
    description: string;
    canonicalUrl?: string;
    keywords?: string[];
    ogType?: 'website' | 'article';
    ogImage?: string;
    publishedTime?: string;
    modifiedTime?: string;
    authorName?: string;
    articleSection?: string;
    tags?: string[];
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}
