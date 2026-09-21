import { notFound } from "next/navigation";
import { catalog } from "@/data/catalog";
import Investigation from "@/components/game/Investigation";
export default async function CasePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!catalog.some((c) => c.id === id)) notFound();
  return <Investigation id={id} />;
}
