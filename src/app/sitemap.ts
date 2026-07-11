import type { MetadataRoute } from 'next';
import { BRAND } from './config/brand';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.siteUrl;
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/search`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/subscriptions`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/login`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cookies`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/dmca`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/support`, changeFrequency: 'monthly', priority: 0.4 },
  ];
}
