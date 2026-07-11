import type { MetadataRoute } from 'next';
import { BRAND } from './config/brand';
import { API_BASE_URL } from './config/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = BRAND.siteUrl;
  const staticEntries: MetadataRoute.Sitemap = [
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
    { url: `${base}/2257`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/support`, changeFrequency: 'monthly', priority: 0.4 },
  ];

  let videoEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE_URL}/video/sitemap-ids?limit=5000`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        videos?: Array<{ _id: string; updatedAt?: string }>;
      };
      videoEntries = (data.videos || []).map((v) => ({
        url: `${base}/watch/${v._id}`,
        lastModified: v.updatedAt ? new Date(v.updatedAt) : undefined,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch {
    // API unavailable at build time — static routes only
  }

  return [...staticEntries, ...videoEntries];
}
