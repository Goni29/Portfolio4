import { PublicRouterView } from "@/components/public/public-router-view";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function PublicRoutePage({ params }: PageProps) {
  const resolved = await params;
  return <PublicRouterView segments={resolved.slug ?? []} />;
}
