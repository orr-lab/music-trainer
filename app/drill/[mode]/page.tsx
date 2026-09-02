import { DrillSession } from "@/components/DrillSession";

export default async function DrillPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  return <DrillSession modeId={mode} />;
}
