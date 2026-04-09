import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import ContentDetailClient from './ContentDetailClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEntry(slug: string) {
  const { data: entry, error } = await supabase
    .from('content_entries')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !entry) return null;
  return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    return { title: 'Not Found — ContentCompass' };
  }

  const description = entry.description_en || entry.description_tr || '';
  const imageUrl = entry.photo ?? undefined;

  return {
    title: `${entry.title} — ContentCompass`,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: 'article',
      ...(imageUrl ? { images: [{ url: imageUrl, alt: entry.title }] } : {}),
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title: entry.title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export default async function ContentPage({ params }: Props) {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) notFound();

  // Supabase uses 'id' instead of '_id'
  return <ContentDetailClient entry={entry} />;

}

