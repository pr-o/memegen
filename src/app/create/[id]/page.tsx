import TemplateAutoLoader from "@/components/TemplateAutoLoader";

export default async function CreateWithTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TemplateAutoLoader id={id} />;
}
