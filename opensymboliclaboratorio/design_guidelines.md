# OpenSymbolic OS2 Experimentation Environment - Design Guidelines

## Design Approach

**Hybrid Approach**: Functional laboratory interface inspired by audio production tools (Ableton, synthesizer UIs) and scientific visualization software, combined with reactive artistic canvas displays. The design balances technical precision with creative expression.

**Core Principle**: A digital laboratory where form follows function, but visualization creates emotional engagement with abstract conceptron data.

---

## Layout System

**Main Structure**: Split-panel laboratory layout
- Left panel (35% width): Control center with conceptron editors and parameter controls
- Right panel (65% width): Full-height canvas visualization area
- Bottom dock (collapsible): Saved experiments library and conceptron chain sequencer

**Spacing System**: Tailwind units of 2, 3, 4, 6, and 8
- Tight controls: p-2, gap-2
- Section separation: p-4, gap-4
- Major divisions: p-6 to p-8

**Responsive Strategy**: 
- Desktop: Side-by-side panels
- Tablet/Mobile: Stacked vertical layout with collapsible control drawer

---

## Typography

**Font Families**:
- Primary (UI/Controls): `'Inter', sans-serif` - Clean, technical precision
- Monospace (Data/Values): `'JetBrains Mono', monospace` - Frequency readings, hex codes

**Type Scale**:
- Section Headers: text-lg font-semibold
- Control Labels: text-sm font-medium
- Parameter Values: text-base font-mono
- Helper Text: text-xs
- Canvas Overlays: text-2xl font-bold (for large visualizations)

---

## Component Library

### Control Panel Components

**Conceptron Editor Card**:
- Compact card with matte finish containing C/F/T/N controls
- Header with conceptron ID and status indicator
- Three-row grid for parameter groups

**Parameter Controls**:
- Color Picker: Circular swatch with hex input field, clicking opens full spectrum selector
- Shape Selector: Icon grid (circle, triangle, square, hexagon, pentagon) with active state
- Tone Slider: Horizontal range input with frequency display (Hz), min/max markers
- Metadata Input: Expandable textarea for JSON-style additional data

**Action Buttons**:
- Primary: "Play Conceptron" - triggers tone and visual animation
- Secondary: "Add to Chain" - sequences multiple conceptrons
- Tertiary: "Save Experiment" - stores current configuration

### Canvas Visualization Area

**Background**: Deep gradient suggesting depth, subtle noise texture for scientific aesthetic

**Real-Time Visualizations**:
- Central animated shape matching selected Form (F), sized proportional to tone intensity
- Pulsing/breathing animation synchronized to tone frequency
- Color (C) applied with luminosity variations
- Particle system radiating from shape for active conceptrons
- Waveform overlay at bottom showing audio frequency

**Conceptron Chain Display**:
- Horizontal timeline showing sequence of conceptrons as connected nodes
- Each node displays mini-version of its C/F/T signature
- Active conceptron highlighted with glow effect

### Saved Experiments Library

**Layout**: Horizontal scrolling card carousel
- Each card shows thumbnail of visualization state
- Displays conceptron count, timestamp, quick-load button
- Hover reveals full metadata overlay

---

## Navigation & Information Architecture

**Top Bar**: 
- OpenSymbolic OS2 logo/title (left)
- Global actions: New Experiment, Load, Export Data (right)
- Status indicators: Audio engine status, save state

**Control Panel Sections** (vertical stack):
1. Active Conceptron Editor
2. Conceptron Chain Sequencer  
3. Audio Engine Controls (master volume, waveform type)
4. Experiment Metadata (name, tags, notes)

**No Traditional Navigation**: Single-page laboratory interface

---

## Interactive States

**Conceptron Active State**: 
- Glowing border on control card
- Canvas visualization animates intensely
- Tone plays from Web Audio API

**Chain Building**: 
- Drag-and-drop conceptrons to reorder
- Visual connection lines between chained conceptrons
- Preview plays entire sequence

**Hover States**:
- Control sliders show precise values in tooltips
- Saved experiments expand slightly with shadow
- Shape selector icons scale up 1.1x

---

## Accessibility

- All sliders have keyboard navigation (arrow keys for fine control)
- Color picker includes WCAG AA compliant text labels
- Canvas visualizations paired with text readouts of current values
- Screen reader announcements for conceptron state changes
- Focus indicators visible on all interactive elements

---

## Unique Design Elements

**Scientific Aesthetic**:
- Subtle grid overlay on canvas (like oscilloscope)
- Measurement scales along edges
- Frequency spectrum analyzer visual in corner
- Numerical readouts with units (Hz, RGB values)

**Synthesizer-Inspired Controls**:
- Knob-style rotary controls for fine-tuned parameters (optional alternative to sliders)
- LED-style indicators for active states
- Modular connection feel between components

**Data Visualization**:
- Mini spectrograms for tone history
- Color harmony wheel showing C relationships
- Form geometry properties displayed (angles, symmetry)

---

## Images

**No hero image required** - this is a functional tool interface. 

**Icons**: Use Heroicons via CDN for UI controls (play, save, trash, settings, arrows)

**Visualization Assets**: All graphics generated programmatically via canvas - no static images needed

---

## Animation Principles

**Canvas Animations** (primary focus):
- Smooth 60fps rendering for shape transformations
- Particle systems for conceptron activation
- Frequency-reactive pulsing and scaling
- Trail effects for tone visualization

**UI Micro-interactions** (minimal):
- Smooth slider dragging
- Gentle card hover lifts
- Fade transitions for panel changes
- No unnecessary flourishes in control UI

**Performance**: Use requestAnimationFrame for canvas, throttle control updates to 30fps