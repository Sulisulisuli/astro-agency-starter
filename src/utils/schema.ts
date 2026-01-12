export function generateSchema(data: any) {
    return JSON.stringify(data);
}

export function organizationSchema(config: { name: string; url: string; logo?: string; sameAs?: string[] }) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": config.name,
        "url": config.url,
        "logo": config.logo,
        "sameAs": config.sameAs || []
    };
}

export function websiteSchema(config: { name: string; url: string; description?: string }) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": config.name,
        "url": config.url,
        "description": config.description
    };
}
