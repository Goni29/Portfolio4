import { AccountRouterView } from "@/components/account/views/account-router-view";

interface PageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

export default async function AccountRoutePage({ params }: PageProps) {
  const resolved = await params;
  return <AccountRouterView segments={resolved.slug ?? []} />;
}
