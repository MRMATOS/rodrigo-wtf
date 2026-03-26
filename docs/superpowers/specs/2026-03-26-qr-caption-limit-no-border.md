# QR Code: Caption Limit + No-Border Toggle

**Date:** 2026-03-26

## Overview

Two improvements to the QR code generator (`src/app/ferramentas/gerador-qr-code/page.tsx`):

1. Caption field: enforce 30-character max with a live countdown counter
2. New "Sem borda" toggle that removes colored borders/backgrounds per template

---

## 1. Caption Character Limit

- Add `maxLength={30}` to the caption `<input>`
- Add a character counter to the right of the caption label (same pattern as the `info` field)
  - Displays `30 - caption.length` remaining characters
  - Turns red (`text-red-500`) when `caption.length >= 20`

---

## 2. No-Border Toggle

### State

Add `noBorder: boolean` state (default `false`) to the page component.

### UI placement

Render a toggle button after the black color swatch in the color picker row:

```
[Azul] [Verde] [Roxo] [Laranja] [Preto]  [ ] Sem borda
```

Style: same border/font style as other toggle controls in the page. Shows filled square when active.

### Prop

Add `noBorder?: boolean` to `TplProps` interface and pass it through `RenderTemplate`.

### Behavior per template

#### Padrão (`qr-only`)
- **With border (default):** outer div has `backgroundColor: color`; QR wrapper has white padding; `qrSize = 320 * s`
- **Without border:** outer div uses `backgroundColor: "#ffffff"`; remove colored QR wrapper (or make it white); `qrSize = 400 * s` (QR grows into the freed space)

#### A4 (`card`)
- **With border (default):** outer container has `border: 4px solid color`; QR wrapper has `backgroundColor: color` with nested white padding
- **Without border:** remove `border` from outer container (`border: none`); QR wrapper background becomes white (inner white padding kept); QR sits on white background

#### Ticket
- **With border (default):** right panel has `backgroundColor: color`; caption text is white
- **Without border:** right panel `backgroundColor` becomes `"#ffffff"`; caption text color switches from `"#ffffff"` to the chosen `color` (to remain legible on white)

The main text on the left side is unaffected — it always uses the chosen color.

---

## Files Changed

- `src/app/ferramentas/gerador-qr-code/page.tsx` — only file touched
