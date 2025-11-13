import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Trash2, Save } from "lucide-react";
import type { Conceptron, ConceptronChain } from "@shared/schema";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChainSequencerProps {
  conceptrons: Conceptron[];
  chain: ConceptronChain | null;
  onPlayChain: () => void;
  onClearChain: () => void;
  onRemoveFromChain: (index: number) => void;
  onSaveExperiment: () => void;
}

export function ChainSequencer({
  conceptrons,
  chain,
  onPlayChain,
  onClearChain,
  onRemoveFromChain,
  onSaveExperiment,
}: ChainSequencerProps) {
  const chainConceptrons = chain?.conceptrons.map(id => 
    conceptrons.find(c => c.id === id)
  ).filter(Boolean) as Conceptron[] || [];

  return (
    <Card data-testid="card-chain-sequencer">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Cadena de Conceptrones</CardTitle>
        <Badge variant="secondary" data-testid="badge-chain-count">
          {chainConceptrons.length} elementos
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-32 w-full rounded-md border border-border p-3">
          {chainConceptrons.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              La cadena está vacía. Añade conceptrones para comenzar.
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {chainConceptrons.map((conceptron, index) => (
                <button
                  key={`${conceptron.id}-${index}`}
                  onClick={() => onRemoveFromChain(index)}
                  className="group relative flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card hover-elevate active-elevate-2 transition-all"
                  title={`${conceptron.shape} - ${conceptron.tone}Hz`}
                  data-testid={`button-chain-item-${index}`}
                >
                  <div
                    className="w-6 h-6 rounded-sm border border-border"
                    style={{ backgroundColor: conceptron.color }}
                  />
                  <span className="font-mono text-xs">{conceptron.tone}Hz</span>
                  <Trash2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-destructive" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2">
          <Button
            onClick={onPlayChain}
            disabled={chainConceptrons.length === 0}
            variant="default"
            className="flex-1"
            data-testid="button-play-chain"
          >
            <Play className="w-4 h-4 mr-2" />
            Reproducir Cadena
          </Button>
          <Button
            onClick={onClearChain}
            disabled={chainConceptrons.length === 0}
            variant="outline"
            data-testid="button-clear-chain"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        <Button
          onClick={onSaveExperiment}
          disabled={chainConceptrons.length === 0}
          variant="secondary"
          className="w-full"
          data-testid="button-save-experiment"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Experimento
        </Button>
      </CardContent>
    </Card>
  );
}
