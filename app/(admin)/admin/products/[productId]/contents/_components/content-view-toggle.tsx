"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, FileText } from "lucide-react";

interface ContentViewToggleProps {
  onViewChange: (view: "modules" | "contents") => void;
  defaultView?: "modules" | "contents";
}

export default function ContentViewToggle({
  onViewChange,
  defaultView = "modules",
}: ContentViewToggleProps) {
  const [view, setView] = useState<"modules" | "contents">(defaultView);

  const handleViewChange = (newView: "modules" | "contents") => {
    setView(newView);
    onViewChange(newView);
  };

  return (
    <div className="flex justify-center mb-6">
      <Tabs
        defaultValue={view}
        value={view}
        onValueChange={(v) => handleViewChange(v as "modules" | "contents")}
        className="w-full max-w-md"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Módulos</span>
          </TabsTrigger>
          <TabsTrigger value="contents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Conteúdos</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
