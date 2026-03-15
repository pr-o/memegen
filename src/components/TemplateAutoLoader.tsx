"use client";

import { useEffect } from "react";
import { templates } from "@/data/templates";
import { useEditorStore } from "@/hooks/useEditorStore";

const CANVAS_WIDTH = 600;

export default function TemplateAutoLoader({ id }: { id: string }) {
  const { loadTemplate } = useEditorStore();

  useEffect(() => {
    const template = templates.find((t) => t.id === id);
    if (template) {
      loadTemplate(template, CANVAS_WIDTH);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return null;
}
