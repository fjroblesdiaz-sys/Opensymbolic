import { useState, useCallback } from "react";
import { ConceptronEditor } from "@/components/ConceptronEditor";
import { CanvasVisualization } from "@/components/CanvasVisualization";
import { ChainSequencer } from "@/components/ChainSequencer";
import { ExperimentLibrary } from "@/components/ExperimentLibrary";
import { SaveExperimentDialog } from "@/components/SaveExperimentDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAudioEngine } from "@/hooks/use-audio-engine";
import { useToast } from "@/hooks/use-toast";
import { FileText, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { Conceptron, ConceptronChain, Experiment } from "@shared/schema";
import { nanoid } from "nanoid";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Laboratory() {
  const { toast } = useToast();
  const { playTone, playConceptronChain } = useAudioEngine();

  const [currentConceptron, setCurrentConceptron] = useState<Conceptron>({
    id: nanoid(),
    color: "#3B82F6",
    shape: "circle",
    tone: 440,
    metadata: undefined,
  });

  const [allConceptrons, setAllConceptrons] = useState<Conceptron[]>([]);
  const [currentChain, setCurrentChain] = useState<ConceptronChain>({
    id: nanoid(),
    conceptrons: [],
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const { data: experiments = [], isLoading: experimentsLoading } = useQuery<Experiment[]>({
    queryKey: ["/api/experiments"],
  });

  const createExperimentMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const chainToSave = {
        id: currentChain.id,
        conceptrons: [...currentChain.conceptrons],
        name: currentChain.name,
      };
      
      return await apiRequest("POST", "/api/experiments", {
        name: data.name,
        description: data.description || null,
        conceptrons: [...allConceptrons],
        chains: [chainToSave],
        tags: null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiments"] });
    },
  });

  const deleteExperimentMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/experiments/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiments"] });
    },
  });

  const handlePlayConceptron = useCallback(() => {
    if (!audioEnabled) {
      toast({
        title: "Audio desactivado",
        description: "Activa el audio para escuchar los tonos",
        variant: "destructive",
      });
      return;
    }

    setIsPlaying(true);
    playTone(currentConceptron.tone, 500);
    setTimeout(() => setIsPlaying(false), 500);

    toast({
      title: "Conceptrón reproducido",
      description: `${currentConceptron.shape} - ${currentConceptron.tone}Hz`,
    });
  }, [currentConceptron, playTone, audioEnabled, toast]);

  const handleAddToChain = useCallback(() => {
    const conceptronExists = allConceptrons.find(c => c.id === currentConceptron.id);
    
    if (!conceptronExists) {
      setAllConceptrons(prev => [...prev, currentConceptron]);
    }

    setCurrentChain(prev => ({
      ...prev,
      conceptrons: [...prev.conceptrons, currentConceptron.id],
    }));

    setCurrentConceptron({
      id: nanoid(),
      color: currentConceptron.color,
      shape: currentConceptron.shape,
      tone: currentConceptron.tone,
      metadata: undefined,
    });

    toast({
      title: "Añadido a la cadena",
      description: "Conceptrón añadido exitosamente",
    });
  }, [currentConceptron, allConceptrons, toast]);

  const handlePlayChain = useCallback(async () => {
    if (!audioEnabled) {
      toast({
        title: "Audio desactivado",
        description: "Activa el audio para escuchar la cadena",
        variant: "destructive",
      });
      return;
    }

    const frequencies = currentChain.conceptrons
      .map(id => allConceptrons.find(c => c.id === id)?.tone)
      .filter(Boolean) as number[];

    if (frequencies.length > 0) {
      setIsPlaying(true);
      await playConceptronChain(frequencies, 600);
      setIsPlaying(false);

      toast({
        title: "Cadena reproducida",
        description: `${frequencies.length} conceptrones reproducidos`,
      });
    }
  }, [currentChain, allConceptrons, playConceptronChain, audioEnabled, toast]);

  const handleClearChain = useCallback(() => {
    setCurrentChain({
      id: nanoid(),
      conceptrons: [],
    });

    toast({
      title: "Cadena limpiada",
      description: "La cadena ha sido vaciada",
    });
  }, [toast]);

  const handleRemoveFromChain = useCallback((index: number) => {
    setCurrentChain(prev => ({
      ...prev,
      conceptrons: prev.conceptrons.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSaveExperiment = useCallback(async (data: { name: string; description: string }) => {
    try {
      await createExperimentMutation.mutateAsync(data);
      
      toast({
        title: "Experimento guardado",
        description: `"${data.name}" ha sido guardado en la biblioteca`,
      });
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el experimento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [allConceptrons, currentChain, createExperimentMutation, toast]);

  const handleLoadExperiment = useCallback((experiment: Experiment) => {
    setAllConceptrons([...experiment.conceptrons]);
    
    if (experiment.chains.length > 0) {
      const loadedChain = experiment.chains[0];
      setCurrentChain({
        id: loadedChain.id,
        conceptrons: [...loadedChain.conceptrons],
        name: loadedChain.name,
      });
    } else {
      setCurrentChain({
        id: nanoid(),
        conceptrons: [],
      });
    }

    if (experiment.conceptrons.length > 0) {
      const lastConceptron = experiment.conceptrons[experiment.conceptrons.length - 1];
      setCurrentConceptron({
        ...lastConceptron,
        id: nanoid(),
      });
    }

    toast({
      title: "Experimento cargado",
      description: `"${experiment.name}" ha sido cargado`,
    });
  }, [toast]);

  const handleDeleteExperiment = useCallback(async (id: string) => {
    try {
      await deleteExperimentMutation.mutateAsync(id);
      
      toast({
        title: "Experimento eliminado",
        description: "El experimento ha sido eliminado de la biblioteca",
      });
    } catch (error) {
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el experimento. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [deleteExperimentMutation, toast]);

  const handleExportData = useCallback(() => {
    const data = {
      conceptrons: allConceptrons,
      chains: [currentChain],
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `opensymbolic-experiment-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Datos exportados",
      description: "El archivo JSON ha sido descargado",
    });
  }, [allConceptrons, currentChain, toast]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">OpenSymbolic OS2</h1>
            </div>
            <Separator orientation="vertical" className="h-8" />
            <Badge variant="outline" className="font-mono">
              Laboratorio de Conceptrones
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? "Desactivar audio" : "Activar audio"}
              data-testid="button-toggle-audio"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={allConceptrons.length === 0}
              data-testid="button-export-data"
            >
              <FileText className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[35%] border-r border-border bg-sidebar p-6 space-y-4 overflow-y-auto">
          <ConceptronEditor
            conceptron={currentConceptron}
            onChange={setCurrentConceptron}
            onPlay={handlePlayConceptron}
            onAddToChain={handleAddToChain}
            isActive={isPlaying}
          />

          <ChainSequencer
            conceptrons={allConceptrons}
            chain={currentChain}
            onPlayChain={handlePlayChain}
            onClearChain={handleClearChain}
            onRemoveFromChain={handleRemoveFromChain}
            onSaveExperiment={() => setSaveDialogOpen(true)}
          />
        </aside>

        <main className="flex-1 relative">
          <CanvasVisualization
            conceptron={currentConceptron}
            isPlaying={isPlaying}
            className="absolute inset-0"
          />
        </main>
      </div>

      <footer className="border-t border-border bg-card p-4">
        {experimentsLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-8" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-32 w-64" />
              <Skeleton className="h-32 w-64" />
              <Skeleton className="h-32 w-64" />
            </div>
          </div>
        ) : (
          <ExperimentLibrary
            experiments={experiments}
            onLoadExperiment={handleLoadExperiment}
            onDeleteExperiment={handleDeleteExperiment}
          />
        )}
      </footer>

      <SaveExperimentDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSaveExperiment}
      />
    </div>
  );
}
