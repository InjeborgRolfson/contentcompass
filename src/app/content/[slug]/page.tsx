import { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import ContentEntry from "@/models/ContentEntry";
import ContentDetailClient from "./ContentDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEntry(slug: string) {
  await dbConnect();
  const entry = await ContentEntry.findOne({ slug }).lean<{
    _id: any;
    type: string;
    title: string;
    creator: string;
    year: string;
    description_en: string;
    description_tr: string;
    photo: string | null;
    tags: string[];
    slug: string;
  }>();
  return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getEntry(slug);

  if (!entry) {
    return { title: "Not Found — ContentCompass" };
  }

  const description = entry.description_en || entry.description_tr || "";
  const imageUrl = entry.photo ?? undefined;

  return {
    title: `${entry.title} — ContentCompass`,
    description,
    openGraph: {
      title: entry.title,
      description,
      type: "article",
      ...(imageUrl ? { images: [{ url: imageUrl, alt: entry.title }] } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
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

  const serialized = {
    ...entry,
    _id: String(entry._id),
  };

  return <ContentDetailClient entry={serialized} />;
}
