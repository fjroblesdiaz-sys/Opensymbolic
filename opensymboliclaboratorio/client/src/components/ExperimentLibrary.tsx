import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Trash2, Download } from "lucide-react";
import type { Experiment } from "@shared/schema";
import { format } from "date-fns";

interface ExperimentLibraryProps {
  experiments: Experiment[];
  onLoadExperiment: (experiment: Experiment) => void;
  onDeleteExperiment: (id: string) => void;
}

export function ExperimentLibrary({
  experiments,
  onLoadExperiment,
  onDeleteExperiment,
}: ExperimentLibraryProps) {
  return (
    <Card data-testid="card-experiment-library">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Experimentos Guardados</CardTitle>
        <Badge variant="secondary" data-testid="badge-experiment-count">
          {experiments.length}
        </Badge>
      </CardHeader>
      <CardContent>
        {experiments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground border border-border rounded-md">
            No hay experimentos guardados aún
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {experiments.map((experiment) => (
                <Card
                  key={experiment.id}
                  className="flex-shrink-0 w-64 hover-elevate active-elevate-2 cursor-pointer transition-all"
                  onClick={() => onLoadExperiment(experiment)}
                  data-testid={`card-experiment-${experiment.id}`}
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-semibold line-clamp-1">
                        {experiment.name}
                      </CardTitle>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteExperiment(experiment.id);
                        }}
                        data-testid={`button-delete-${experiment.id}`}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-2">
                    {experiment.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {experiment.description}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {experiment.conceptrons.length} conceptrones
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {experiment.chains.length} cadenas
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {format(new Date(experiment.createdAt), 'dd/MM/yyyy')}
                      </span>
                      <Download className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
