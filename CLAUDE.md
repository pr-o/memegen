# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A meme generator web app — a clone of [9GAG Meme Generator](https://meme.9gag.com/meme-generator). Users pick a template or upload an image, add/edit text layers, and download the result as a PNG.

Node.js v22.16.0 (see `.nvmrc`). Remote: `git@github.com:pr-o/memegen.git`

## Tech Stack

- **Next.js** (App Router) + **React** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** for styling and UI components
- **Konva.js** + **react-konva** for canvas rendering (object selection, `Transformer` for bounding boxes/resize handles, drag/resize, `toDataURL`)
- **react-color** for color picker (Text Color, Stroke, Shadow swatches)
- **@dnd-kit/core** + **@dnd-kit/sortable** for layer drag-to-reorder in the Layers panel
- **Zustand** for global state via `hooks/useEditorStore.ts`
- No video mode

## Commands

```bash
nvm use                  # activate Node v22.16.0
pnpm install
pnpm dev                 # start dev server
pnpm build
pnpm lint
```

## File Structure

```
app/
  page.tsx                          # main editor page
components/
  LeftPane.tsx
  CenterPane.tsx
  RightPane/
    index.tsx
    LayersCard.tsx
    PropertiesCard.tsx
hooks/
  useEditorStore.ts                 # Zustand store
data/
  templates.ts                      # static meme template data
```

## Architecture

### Layout

Three-column, full-viewport-height, dark theme (`#111` bg, `#1a1a1a` panels, `#2a2a2a` borders):

```
[ LeftPane ~280px ] [ CenterPane flex-1 ] [ RightPane ~280px ]
```

### State (`useEditorStore`)

```ts
layers[]           // ordered array, bottom = index 0
selectedLayerId    // string | null
history[]          // snapshots via canvas.toJSON()
historyIndex       // pointer into history[]
canvasPaddingTop   // px added above canvas
canvasPaddingBottom
selectedTemplate   // currently loaded template metadata
```

Each layer object: `{ id, type: 'text'|'image', name, visible, locked, x, y, width, height, ...styleProps }`

### Canvas (Konva + react-konva)

- Canvas objects are written as JSX (`<Stage>`, `<Layer>`, `<Image>`, `<Text>`, `<Transformer>`) and driven directly by Zustand state
- `<Transformer>` handles bounding boxes and 8 resize handles natively; attach to selected node ref
- Inline text editing: position a `<textarea>` DOM overlay on top of the Konva stage when a text node is double-clicked; hide the Konva `<Text>` node during editing
- Undo/redo: serialize `stage.toJSON()` on every meaningful mutation → push to history array; restore with `Konva.Node.create(json)`
- Image layer starts locked (draggable/resizable disabled, no delete)
- `+` buttons above/below canvas expand `<Stage>` height and reposition image node, adding white fill to the new area
- Shift+corner drag on `<Transformer>` maintains aspect ratio

### Template Data (`data/templates.ts`)

Static typed array:
```ts
{ id, name, description, src, textLayers: [{ label, x, y, w, h, defaultText, style }] }
```
Text layer positions are **percentages of image dimensions** so they scale correctly.

On template click: load image as locked Image layer + create text layers from `textLayers` definition.

### Left Pane

- Sticky top bar: search input (real-time name filter) + Upload button (jpg/png/gif → Image layer, unlocked)
- 2-column masonry/grid of thumbnails (scrollable)
- Template info (title + description) appears below grid after selection

### Center Pane

Toolbar icons (lucide-react): Add Text, Add Media, Undo, Redo, Crop Canvas

Canvas area:
- White background, max ~600px wide, overflow hidden
- `+` button docked above and below canvas → adds 80px white padding block, expands canvas vertically
- Layers render bottom-to-top (image first, text on top)

### Right Pane

**Finish button** (full width, blue `#3b82f6`): flattens canvas → downloads PNG via `toDataURL()`

**Layers card**: drag-to-reorder (dnd-kit), each row has eye/lock/trash icon buttons. On reorder → update Konva z-index via `node.zIndex()`. Image layer drag handle at 30% opacity (locked cue).

**Properties card**:
- No selection: "Select a layer to edit its properties."
- Text layer selected → **Text Properties**:
  - Quick Styles grid (2×3): Classic Meme, Bold Shadow, Neon Glow, Comic Style, Minimal, Retro
  - Horizontal alignment (left/center/right), Vertical alignment (top/middle/bottom)
  - Font Size slider + "Auto-size text to fit" toggle
  - Force Capitalize toggle
  - Font dropdown: Arial, Impact, Comic Sans MS, Georgia, Courier New, Verdana
  - Text Color swatch → `react-color` picker (e.g. `<SketchPicker>` or `<ChromePicker>`)
  - Stroke: color swatch (`react-color`) + width slider (0–20px)
  - Shadow: color swatch (`react-color`) only
  - Opacity slider (0–100%)
- Image layer selected → **Image Properties**: opacity slider only

### Quick Style Presets

- **Classic Meme**: Impact font, white fill, thick black stroke, no shadow
- Others define their own font/color/stroke/shadow combinations
