import { useEffect } from 'react';
import type { SeoProps } from '../types';

export function SeoHead({
    title,
    description,
    canonicalUrl,
    keywords = [],
    ogType = 'website',
    ogImage = '/blog-og.png',
    publishedTime,
    modifiedTime,
    authorName,
    articleSection,
    tags = [],
    jsonLd,
}: SeoProps) {
    useEffect(() => {
        // 1. Document Title
        const fullTitle = `${title} | BananINT`;
        document.title = fullTitle;

        // Helper to update or create meta tags
        const setMetaTag = (attrName: string, attrVal: string, content: string) => {
            let el = document.querySelector(`meta[${attrName}="${attrVal}"]`) as HTMLMetaElement | null;
            if (!el) {
                el = document.createElement('meta');
                el.setAttribute(attrName, attrVal);
                document.head.appendChild(el);
            }
            el.setAttribute('content', content);
        };

        // Helper to update or create link tags
        const setLinkTag = (rel: string, href: string) => {
            let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
            if (!el) {
                el = document.createElement('link');
                el.setAttribute('rel', rel);
                document.head.appendChild(el);
            }
            el.setAttribute('href', href);
        };

        // 2. Standard Meta Tags
        setMetaTag('name', 'description', description);
        if (keywords.length > 0) {
            setMetaTag('name', 'keywords', keywords.join(', '));
        }
        setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

        // 3. Canonical URL
        const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');
        if (currentUrl) {
            setLinkTag('canonical', currentUrl);
        }

        // 4. Open Graph Meta Tags
        setMetaTag('property', 'og:title', fullTitle);
        setMetaTag('property', 'og:description', description);
        setMetaTag('property', 'og:type', ogType);
        setMetaTag('property', 'og:url', currentUrl);
        setMetaTag('property', 'og:site_name', 'BananINT');
        setMetaTag('property', 'og:locale', 'fr_FR');

        const absoluteImage = ogImage.startsWith('http') 
            ? ogImage 
            : `${typeof window !== 'undefined' ? window.location.origin : ''}${ogImage}`;
        setMetaTag('property', 'og:image', absoluteImage);

        document.querySelectorAll('meta[property^="article:"]').forEach(el => el.remove());
        if (ogType === 'article') {
            if (publishedTime) setMetaTag('property', 'article:published_time', publishedTime);
            if (modifiedTime) setMetaTag('property', 'article:modified_time', modifiedTime);
            if (authorName) setMetaTag('property', 'article:author', authorName);
            if (articleSection) setMetaTag('property', 'article:section', articleSection);
            tags.forEach((tag) => {
                const el = document.createElement('meta');
                el.setAttribute('property', 'article:tag');
                el.setAttribute('content', tag);
                document.head.appendChild(el);
            });
        }

        // 5. Twitter Card Tags
        setMetaTag('name', 'twitter:card', 'summary_large_image');
        setMetaTag('name', 'twitter:title', fullTitle);
        setMetaTag('name', 'twitter:description', description);
        setMetaTag('name', 'twitter:image', absoluteImage);

        // 6. JSON-LD Structured Data
        let scriptTag = document.querySelector('#seo-json-ld') as HTMLScriptElement | null;
        if (jsonLd) {
            if (!scriptTag) {
                scriptTag = document.createElement('script');
                scriptTag.id = 'seo-json-ld';
                scriptTag.type = 'application/ld+json';
                document.head.appendChild(scriptTag);
            }
            scriptTag.textContent = JSON.stringify(jsonLd);
        } else if (scriptTag) {
            scriptTag.remove();
        }

        // Clean-up on unmount
        return () => {
            const dynamicScript = document.querySelector('#seo-json-ld');
            if (dynamicScript) dynamicScript.remove();
        };
    }, [
        title,
        description,
        canonicalUrl,
        keywords,
        ogType,
        ogImage,
        publishedTime,
        modifiedTime,
        authorName,
        articleSection,
        tags,
        jsonLd,
    ]);

    return null;
}
