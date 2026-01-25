-- Remove deprecated/redundant config keys
DELETE FROM SiteConfig WHERE key IN ('site_name', 'site_description', 'contact_email', 'social_links');
