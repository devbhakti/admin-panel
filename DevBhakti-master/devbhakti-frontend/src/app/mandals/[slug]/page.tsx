import { Metadata } from 'next';
import { MandalDetail } from '@/components/mandals/MandalDetail';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: 'Mandal Details - DevBhakti',
    description: 'View mandal details, events, and donate',
  };
}

export default async function MandalDetailPage(
  { params }: PageProps
) {
  const { slug } = await params;

  console.log('PAGE SLUG:', slug);

  return <MandalDetail slug={slug} />;
}