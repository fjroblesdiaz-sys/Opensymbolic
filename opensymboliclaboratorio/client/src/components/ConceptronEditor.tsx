import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Play, Plus } from "lucide-react";
import type { Conceptron, ConceptronShape } from "@shared/schema";
import { useState } from "react";

interface ConceptronEditorProps {
  conceptron: Conceptron;
  onChange: (conceptron: Conceptron) => void;
  onPlay: () => void;
  onAddToChain: () => void;
  isActive?: boolean;
}

const SHAPES: { value: ConceptronShape; icon: string; label: string }[] = [
  { value: "circle", icon: "●", label: "Círculo" },
  { value: "triangle", icon: "▲", label: "Triángulo" },
  { value: "square", icon: "■", label: "Cuadrado" },
  { value: "hexagon", icon: "⬡", label: "Hexágono" },
  { value: "pentagon", icon: "⬟", label: "Pentágono" },
];

export function ConceptronEditor({
  conceptron,
  onChange,
  onPlay,
  onAddToChain,
  isActive = false,
}: ConceptronEditorProps) {
  const [metadataText, setMetadataText] = useState(
    conceptron.metadata ? JSON.stringify(conceptron.metadata, null, 2) : ""
  );

  const handleColorChange = (color: string) => {
    onChange({ ...conceptron, color });
  };

  const handleShapeChange = (shape: ConceptronShape) => {
    onChange({ ...conceptron, shape });
  };

  const handleToneChange = (values: number[]) => {
    onChange({ ...conceptron, tone: values[0] });
  };

  const handleMetadataChange = (text: string) => {
    setMetadataText(text);
    try {
      const parsed = text.trim() ? JSON.parse(text) : undefined;
      onChange({ ...conceptron, metadata: parsed });
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`} data-testid="card-conceptron-editor">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-lg font-semibold">Conceptrón Activo</CardTitle>
        {isActive && <Badge variant="default" data-testid="badge-active">Activo</Badge>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="color-input" className="text-sm font-medium">
            Color (C)
          </Label>
          <div className="flex gap-2 items-center">
            <div
              className="w-12 h-12 rounded-md border-2 border-border cursor-pointer hover-elevate active-elevate-2 transition-transform"
              style={{ backgroundColor: conceptron.color }}
              onClick={() => document.getElementById('color-picker')?.click()}
              data-testid="button-color-swatch"
            />
            <Input
              id="color-picker"
              type="color"
              value={conceptron.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-0 h-0 opacity-0 absolute"
              data-testid="input-color-picker"
            />
            <Input
              id="color-input"
              type="text"
              value={conceptron.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="font-mono text-sm flex-1"
              placeholder="#FF5733"
              maxLength={7}
              data-testid="input-color-hex"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Forma (F)</Label>
          <div className="grid grid-cols-5 gap-2">
            {SHAPES.map((shape) => (
              <button
                key={shape.value}
                onClick={() => handleShapeChange(shape.value)}
                className={`aspect-square rounded-md border-2 flex items-center justify-center text-3xl transition-all hover-elevate active-elevate-2 ${
                  conceptron.shape === shape.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card'
                }`}
                title={shape.label}
                data-testid={`button-shape-${shape.value}`}
              >
                {shape.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="tone-slider" className="text-sm font-medium">
              Tono (T)
            </Label>
            <span className="font-mono text-base font-semibold text-primary" data-testid="text-tone-value">
              {conceptron.tone} Hz
            </span>
          </div>
          <Slider
            id="tone-slider"
            min={20}
            max={2000}
            step={1}
            value={[conceptron.tone]}
            onValueChange={handleToneChange}
            className="w-full"
            data-testid="slider-tone"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>20 Hz</span>
            <span>2000 Hz</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="metadata-input" className="text-sm font-medium">
            Metadatos (N) - JSON opcional
          </Label>
          <Textarea
            id="metadata-input"
            value={metadataText}
            onChange={(e) => handleMetadataChange(e.target.value)}
            placeholder='{"descripcion": "Alerta urgente", "peso": 1.5}'
            className="font-mono text-sm resize-none min-h-[80px]"
            data-testid="textarea-metadata"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={onPlay}
            className="flex-1"
            variant="default"
            data-testid="button-play-conceptron"
          >
            <Play className="w-4 h-4 mr-2" />
            Reproducir
          </Button>
          <Button
            onClick={onAddToChain}
            variant="outline"
            className="flex-1"
            data-testid="button-add-to-chain"
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir a Cadena
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
