import type { Metadata } from 'next';
import { BRAND } from '../../../config/brand';
import { API_BASE_URL } from '../../../config/env';
import WatchPageClient from './WatchPageClient';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await fetch(`${API_BASE_URL}/video/${id}/meta`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return {
        title: `${BRAND.name} — Watch`,
        description: BRAND.tagline,
      };
    }
    const video = (await res.json()) as {
      title?: string;
      description?: string;
      thumbnailPath?: string;
      previewPath?: string;
    };
    const title = video.title
      ? `${video.title} | ${BRAND.name}`
      : `${BRAND.name} — Watch`;
    const description =
      (video.description || '').slice(0, 160) || BRAND.tagline;
    const image = video.previewPath || video.thumbnailPath || BRAND.ogImage;
    const url = `${BRAND.siteUrl}/watch/${id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: BRAND.name,
        type: 'video.other',
        images: [{ url: image.startsWith('http') ? image : `${BRAND.siteUrl}${image}` }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image.startsWith('http') ? image : `${BRAND.siteUrl}${image}`],
      },
    };
  } catch {
    return {
      title: `${BRAND.name} — Watch`,
      description: BRAND.tagline,
    };
  }
}

export default function WatchPage() {
  return <WatchPageClient />;
}
