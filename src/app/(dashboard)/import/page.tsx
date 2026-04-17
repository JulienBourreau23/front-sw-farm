"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, FileJson, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runesApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function ImportPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: (file: File) => runesApi.import(file),
    onSuccess: (data) => {
      toast.success(`Import réussi — ${data.rune_count} runes importées`);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["averages"] });
      queryClient.invalidateQueries({ queryKey: ["total-runes"] });
      queryClient.invalidateQueries({ queryKey: ["top-sets"] });
      queryClient.invalidateQueries({ queryKey: ["all-sets-count"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'import");
    },
  });

  function handleFileSelect(file: File) {
    if (!file.name.endsWith(".json")) {
      toast.error("Le fichier doit être un JSON");
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleSubmit() {
    if (!selectedFile) return;
    importMutation.mutate(selectedFile);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Import</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Importe ton fichier JSON exporté depuis Summoners War
        </p>
      </div>

      {importMutation.isSuccess && (
        <div className="rounded-xl border bg-card p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium">Import réussi</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {importMutation.data.rune_count} runes importées — compte :{" "}
              {importMutation.data.wizard_name}
            </p>
          </div>
        </div>
      )}

      {/* Zone de drop */}
      <button
        type="button"
        className={cn(
          "rounded-xl border-2 border-dashed transition-colors cursor-pointer w-full text-left",
          dragOver
            ? "border-primary bg-primary/5"
            : selectedFile
              ? "border-primary/50 bg-primary/5"
              : "border-border hover:border-primary/40 hover:bg-accent/30",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          {selectedFile ? (
            <>
              <FileJson className="w-12 h-12 text-primary mb-3" />
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(1)} Mo
              </p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="font-medium text-sm">Glisse ton fichier JSON ici</p>
              <p className="text-xs text-muted-foreground mt-1">
                ou clique pour sélectionner · max 100 Mo
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleInputChange}
          onClick={(e) => e.stopPropagation()}
        />
      </button>

      <Button
        className="w-full"
        disabled={!selectedFile || importMutation.isPending}
        onClick={handleSubmit}
      >
        {importMutation.isPending ? "Import en cours..." : "Importer"}
      </Button>

      <div className="rounded-xl border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-medium text-muted-foreground">
            Comment obtenir le fichier JSON ?
          </p>
        </div>
        <ol className="text-xs text-muted-foreground space-y-1 ml-6 list-decimal">
          <li>
            Télécharge <strong className="text-foreground">SWEX</strong>{" "}
            (Summoners War Exporter)
          </li>
          <li>Lance l'export depuis l'application</li>
          <li>
            Récupère le fichier <code className="text-primary">.json</code>{" "}
            généré
          </li>
          <li>Importe-le ici</li>
        </ol>
      </div>
    </div>
  );
}
