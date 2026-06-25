import { Metadata } from 'next';
import { getPageMetadata } from "@/lib/seo";
import { MandalsList } from '@/components/mandals/MandalsList';

export async function generateMetadata(): Promise<Metadata> {
  const fallback: Metadata = {
    title: 'Browse Mandals - DevBhakti',
    description: 'Explore sacred mandals across India. Donate to mandals, view events, and connect with divine experiences.',
  };

  return getPageMetadata("mandal-list", fallback);
}

export default function MandalsPage() {
  return <MandalsList />;
}