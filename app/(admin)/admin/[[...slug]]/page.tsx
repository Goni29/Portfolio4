import { AdminRouterView } from "@/components/admin/views/admin-router-view";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function AdminRoutePage({ params }: PageProps) {
  const resolved = await params;
  return <AdminRouterView segments={resolved.slug ?? []} />;
}
