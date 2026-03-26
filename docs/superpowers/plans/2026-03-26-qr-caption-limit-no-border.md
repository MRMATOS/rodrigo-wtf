# QR Code: Caption Limit + No-Border Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 30-character caption limit with counter and a "Sem borda" toggle that removes colored borders/backgrounds per template in the QR code generator.

**Architecture:** All changes are isolated to a single file — the QR code generator page. New `noBorder` boolean state controls rendering in each template component. Caption gets `maxLength={30}` and a counter mirroring the existing `info` field pattern.

**Tech Stack:** Next.js (App Router), React, TypeScript, inline styles (no Tailwind inside templates)

---

### Task 1: Caption character limit and counter

**Files:**
- Modify: `src/app/ferramentas/gerador-qr-code/page.tsx`

- [ ] **Step 1: Add `maxLength` and counter to the caption input**

Find the caption `<div className="flex flex-col gap-2">` block (around line 391) and replace it with:

```tsx
<div className="flex flex-col gap-2">
  <div className="flex items-center justify-between">
    <label className="font-body text-sm font-bold uppercase tracking-widest text-muted">{tr.labelCaption}</label>
    <span className={`font-body text-xs font-bold tabular-nums ${caption.length >= 20 ? "text-red-500" : "text-muted"}`}>
      {30 - caption.length}
    </span>
  </div>
  <input
    type="text" value={caption}
    onChange={(e) => setCaption(e.target.value)}
    placeholder="Use a câmera do celular."
    maxLength={30}
    className="font-body text-base border-3 border-border bg-background px-4 py-3 outline-none focus:border-foreground transition-colors placeholder:text-muted/50"
  />
</div>
```

- [ ] **Step 2: Verify visually**

Run `npm run dev` and open the QR generator. Type in the caption field — confirm the counter decrements, turns red at 20 chars remaining, and stops at 30.

- [ ] **Step 3: Commit**

```bash
git add src/app/ferramentas/gerador-qr-code/page.tsx
git commit -m "feat(qr): add 30-char caption limit with countdown counter"
```

---

### Task 2: Add `noBorder` state and toggle button

**Files:**
- Modify: `src/app/ferramentas/gerador-qr-code/page.tsx`

- [ ] **Step 1: Add `noBorder` to `TplProps` interface**

Find the `TplProps` interface (around line 37) and add `noBorder`:

```ts
interface TplProps {
  url:      string;
  info:     string;
  caption:  string;
  color:    string;
  noBorder?: boolean;
  s?:       number;
}
```

- [ ] **Step 2: Add `noBorder` state to the page component**

After the `downloading` state declaration (around line 212), add:

```ts
const [noBorder, setNoBorder] = useState(false);
```

- [ ] **Step 3: Pass `noBorder` through `tplProps`**

Find the `tplProps` line (around line 281):

```ts
const tplProps: TplProps = { url: previewUrl, info, caption, color };
```

Replace with:

```ts
const tplProps: TplProps = { url: previewUrl, info, caption, color, noBorder };
```

- [ ] **Step 4: Add toggle button after the color swatches**

Find the color picker `<div className="flex gap-2">` block (the one with `COLORS.map`). After its closing `</div>`, add the toggle button so the outer flex row becomes:

```tsx
<div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
  <div className="flex gap-2">
    {TEMPLATES.map((tpl) => (
      <button
        key={tpl.id}
        onClick={() => setTemplate(tpl.id)}
        className={`font-body text-xs font-bold uppercase tracking-widest px-3 py-2 border-3 border-border transition-colors ${
          template === tpl.id ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
        }`}
      >
        {tpl.label}
      </button>
    ))}
  </div>
  <div className="flex items-center gap-2">
    {COLORS.map((c) => (
      <button
        key={c.value}
        onClick={() => setColor(c.value)}
        title={c.label}
        style={{ backgroundColor: c.value }}
        className={`w-7 h-7 rounded-full border-3 transition-transform ${
          color === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"
        }`}
      />
    ))}
    <button
      onClick={() => setNoBorder((v) => !v)}
      className={`flex items-center gap-2 font-body text-xs font-bold uppercase tracking-widest px-3 py-2 border-3 border-border transition-colors ${
        noBorder ? "bg-foreground text-background" : "bg-background text-muted hover:text-foreground"
      }`}
    >
      <span className="w-3 h-3 border-2 border-current flex items-center justify-center flex-shrink-0">
        {noBorder && <span className="w-1.5 h-1.5 bg-current block" />}
      </span>
      Sem borda
    </button>
  </div>
</div>
```

- [ ] **Step 5: Verify toggle renders**

Run `npm run dev`, open the QR generator — confirm "Sem borda" button appears after the color swatches and toggles its active state when clicked.

- [ ] **Step 6: Commit**

```bash
git add src/app/ferramentas/gerador-qr-code/page.tsx
git commit -m "feat(qr): add noBorder state and Sem borda toggle button"
```

---

### Task 3: Apply `noBorder` to TplQrOnly

**Files:**
- Modify: `src/app/ferramentas/gerador-qr-code/page.tsx`

- [ ] **Step 1: Update `TplQrOnly` to accept and use `noBorder`**

Replace the entire `TplQrOnly` function with:

```tsx
function TplQrOnly({ url, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS["qr-only"];
  const qrSize   = Math.round((noBorder ? 400 : 320) * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      backgroundColor: noBorder ? "#ffffff" : color,
      borderRadius: 20 * s,
      gap: 14 * s,
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      {noBorder ? (
        <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
      ) : (
        <div style={{
          backgroundColor: "#ffffff",
          padding: 12 * s,
          borderRadius: 12 * s,
        }}>
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        </div>
      )}
      {caption && (
        <span style={{
          fontSize: 22 * s,
          color: noBorder ? "#111111" : "#ffffff",
          opacity: noBorder ? 1 : 0.85,
          textAlign: "center",
          paddingInline: 24 * s,
        }}>
          {caption}
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

In the browser, select template "Padrão", toggle "Sem borda" — confirm the colored background disappears, QR grows, and caption text turns dark.

- [ ] **Step 3: Commit**

```bash
git add src/app/ferramentas/gerador-qr-code/page.tsx
git commit -m "feat(qr): apply noBorder to Padrão template - grow QR, remove color bg"
```

---

### Task 4: Apply `noBorder` to TplCard (A4)

**Files:**
- Modify: `src/app/ferramentas/gerador-qr-code/page.tsx`

- [ ] **Step 1: Update `TplCard` to accept and use `noBorder`**

Replace the entire `TplCard` function with:

```tsx
function TplCard({ url, info, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS.card;
  const qrSize   = Math.round(200 * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#ffffff",
      borderRadius: 20 * s,
      border: noBorder ? "none" : `${4 * s}px solid ${color}`,
      overflow: "hidden",
      fontFamily: "Arial, Helvetica, sans-serif",
      boxSizing: "border-box",
    }}>
      {/* Text */}
      <div style={{ flex: 1, padding: `${48 * s}px ${52 * s}px` }}>
        <span style={{
          fontSize: (info.length > 40 ? 38 : info.length > 20 ? 46 : 56) * s,
          fontWeight: 900, color,
          lineHeight: 1.15, wordBreak: "break-word",
          display: "block",
        }}>
          {info || "Seu texto aqui."}
        </span>
      </div>

      {/* QR + caption */}
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 14 * s,
        padding: `${40 * s}px ${48 * s}px`,
        flexShrink: 0,
      }}>
        {noBorder ? (
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        ) : (
          <div style={{
            backgroundColor: color,
            padding: 16 * s,
            borderRadius: 16 * s,
          }}>
            <div style={{ backgroundColor: "#ffffff", padding: 8 * s, borderRadius: 8 * s }}>
              <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
            </div>
          </div>
        )}
        {caption && (
          <span style={{
            fontSize: 20 * s, color: "#555555",
            textAlign: "center", maxWidth: (qrSize + 48) * s,
          }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Select template "A4", toggle "Sem borda" — confirm the outer colored border disappears and the colored QR wrapper is removed (QR sits plain on the right side).

- [ ] **Step 3: Commit**

```bash
git add src/app/ferramentas/gerador-qr-code/page.tsx
git commit -m "feat(qr): apply noBorder to A4 template - remove border and colored QR wrapper"
```

---

### Task 5: Apply `noBorder` to TplTicket

**Files:**
- Modify: `src/app/ferramentas/gerador-qr-code/page.tsx`

- [ ] **Step 1: Update `TplTicket` to accept and use `noBorder`**

Replace the entire `TplTicket` function with:

```tsx
function TplTicket({ url, info, caption, color, noBorder, s = 1 }: TplProps) {
  const { w, h } = DIMS.ticket;
  const qrSize   = Math.round(160 * s);

  return (
    <div style={{
      width: w * s, height: h * s,
      display: "flex", flexDirection: "row",
      alignItems: "stretch",
      backgroundColor: "#ffffff",
      borderRadius: 24 * s,
      overflow: "hidden",
      fontFamily: "Arial, Helvetica, sans-serif",
    }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: `${40 * s}px ${48 * s}px` }}>
        <span style={{
          fontSize: (info.length > 30 ? 42 : 54) * s,
          fontWeight: 900, color,
          lineHeight: 1.1, wordBreak: "break-word",
        }}>
          {info || "Seu texto aqui."}
        </span>
      </div>

      <div style={{
        width: 256 * s,
        backgroundColor: noBorder ? "#ffffff" : color,
        borderRadius: `0 ${24 * s}px ${24 * s}px 0`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: `${24 * s}px ${24 * s}px ${16 * s}px`,
        gap: 10 * s, flexShrink: 0,
      }}>
        <div style={{ backgroundColor: "#ffffff", padding: 8 * s, borderRadius: 8 * s }}>
          <QRCodeCanvas value={url} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="M" />
        </div>
        {caption && (
          <span style={{
            fontSize: 13 * s,
            color: noBorder ? color : "#ffffff",
            opacity: 0.85,
            textAlign: "center",
          }}>
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Select template "Ticket", toggle "Sem borda" — confirm the right panel background turns white, the QR white padding box is still visible, and the caption text switches to the chosen color.

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/app/ferramentas/gerador-qr-code/page.tsx
git commit -m "feat(qr): apply noBorder to Ticket template - white panel, color caption"
```

---

## Self-Review

**Spec coverage:**
- ✅ Caption max 30 chars + counter → Task 1
- ✅ `noBorder` state + toggle UI → Task 2
- ✅ Padrão: white bg, QR grows 320→400 → Task 3
- ✅ A4: remove outer border + colored QR wrapper → Task 4
- ✅ Ticket: white panel, caption color switches to chosen color → Task 5

**Placeholder scan:** None found.

**Type consistency:** `noBorder?: boolean` defined in Task 2 Step 1, used consistently in Tasks 3–5.
