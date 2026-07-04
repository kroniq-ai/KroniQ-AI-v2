# KroniQ landing — showcase video guide

All three light-section clips use the same `ShowcaseVideo` component: **side bleed, scroll-to-play, no letterbox**.  
Ideal export: **800×800**, tight crop (UI fills frame), ~7–10s loop, H.264 MP4, no audio.

| # | Kinso source (your Downloads) | KroniQ section | Save as |
|---|-------------------------------|----------------|---------|
| 1 | `TCOWAjjDT5lIYzs1sRFDyCNd6jI.webm` → v2v MP4 | Autonomous outreach | `showcase/outreach-sequences.mp4` ✅ installed |
| 2 | `xVtscLRfdDlF2pt63BXsHY1Y4y8.webm` | Lead intelligence | `showcase/lead-research.mp4` |
| 3 | `njwC72lt4NOXO4ik7nJcbBPadY.webm` | Daily CMO audit | `showcase/cmo-audit.mp4` |

Copies of Kinso sources (reference): `showcase/source-lead-research.webm`, `showcase/source-cmo-audit.webm`

---

## Clip 1 — Outreach (`outreach-sequences.mp4`) — DONE

**Kinso feature:** “Draft Response” — Gmail auto-draft  
**Your v2v output:** Ryan Withers, “Auto drafting outreach…”, KroniQ copy — **good, keep it.**

**Optional improvement:** Re-export at **800×800** with tighter crop (current file is 1280×720 with padding → white bars on site). Same motion, just crop — no need to regenerate from scratch unless you want different copy.

---

## Clip 2 — Lead research (`lead-research.mp4`)

**Source:** `xVtscLRfdDlF2pt63BXsHY1Y4y8.webm`  
**Kinso feature:** “Universal search” — ask → insight card  
**Specs:** 800×800 · 7.16s · 25fps

### Motion (preserve exactly)
1. Empty search pill on peach/cyan grid  
2. User types query (character-by-character)  
3. Brief pause / scan  
4. White **insight card** fades/slides in  
5. Header: “Found info about …”  
6. **Summary** block + source row (avatar, name, snippet, Gmail icon)  
7. Loop

### Kinso → KroniQ swap table

| Element | Kinso (source) | KroniQ (target) |
|---------|----------------|-----------------|
| Search placeholder | “Ask or search Kinso” | “Research Ryan Withers · VP Growth” |
| Typed query | (Susan / contract related) | `Ryan Withers outbound automation` |
| Card header | “Found info about Susan’s contract” | **“Found angle for Ryan Withers”** |
| Summary label | Summary | Summary |
| Summary body | Discount / contract terms | “Posted about scaling outbound yesterday. Hiring first marketing lead — **lead with ops angle, not generic pitch**.” |
| Source name | Susan Meadows | Ryan Withers (or keep male avatar) |
| Source snippet | Contract / discount follow-up | “Looking for help finding…” (LinkedIn DM tone) |
| Source icon | Gmail | **LinkedIn** (blue) or Gmail if outreach-first |
| Badge (add if room) | — | **94 fit** pill (teal) |
| Branding | Kinso | KroniQ — emerald/teal accent orb, not Kinso pink |

### Paste-ready v2v prompt (clip 2)

```
Video-to-video: Keep identical motion, timing, layout, grid background, and card animation.

Replace Kinso universal search UI with KroniQ lead intelligence:
- Search bar text: "Research Ryan Withers · VP Growth"
- Typed query: Ryan Withers outbound automation
- Result card header: "Found angle for Ryan Withers"
- Summary: Posted about scaling outbound yesterday. Hiring first marketing lead — lead with ops angle, not generic pitch.
- Source row: Ryan Withers, LinkedIn activity · 2d ago, snippet "Looking for help finding…", fit score badge "94 fit"
- Remove all Kinso branding. Subtle KroniQ colors: emerald + orange accent on AI orb.
- 800x800 square, tight crop, no white letterbox padding, seamless loop ~7s, no audio.
```

---

## Clip 3 — CMO audit (`cmo-audit.mp4`) — STRICT v2v

**Source clip (attach this):** `njwC72lt4NOXO4ik7nJcbBPadY.webm`  
**Output:** 16:9 **1280×720** · `public/images/showcase/cmo-audit.mp4`

### Why the last render failed

The tool **redesigned** the UI: sharp **left app sidebar** (Gmail/LinkedIn/Slack dock), flat “AI” badge, female face with male name.  
Your old prompt even said “preserve sidebar” — **delete that**. The hero frames are **two blurred cards over a fuzzy inbox** — no sharp icon column.

### Reference look (match peak frames exactly)

- **Outer:** peach/cyan **grid** background
- **Middle:** one **heavily blurred** white inbox window (search bar + fuzzy contact rows)
- **Foreground:** exactly **two** white pill cards, stacked, soft shadow, slight float
- **No** integration dock · **no** Slack/LinkedIn column · **no** “AI” text logo

### Motion (preserve exactly)

1. Blurred inbox behind (stays out of focus entire clip)
2. Top pill card fades/slides in
3. Bottom pill card fades/slides in with warm glow
4. Subtle parallax float on both cards
5. ~10s seamless loop

### Swap list — Kinso → KroniQ

**Keep as-is**
- Composition, camera, card size/shape/radius, shadows, spacing, timing
- Peach/cyan grid background
- Blurred inbox window (macOS dots, search bar, fuzzy names like Luke/Ben in back)
- Two-card stack layout
- Top card structure: **circle avatar · name · Gmail icon · 2 lines**
- Bottom card structure: **soft blurry gradient orb** (not a logo) · 2 lines · orange highlight on last word
- Background stays **blurred** — never sharpen

**Change these elements only**

| # | Kinso (source) | KroniQ (target) |
|---|----------------|-----------------|
| 1 | Avatar: woman (Natasha) | **Male professional headshot** (Marcus Webb) — must match male name |
| 2 | Name: Natasha Corwin | **Marcus Webb** |
| 3 | Gmail icon | **Keep Gmail** (same spot) |
| 4 | “I'm interested in your service” | **“Reply rate dipped 12% on Sequence B”** |
| 5 | “Do you have a **price guide** you can share?” | **“Should we refresh hooks before tomorrow's send?”** |
| 6 | “It looks like **Natasha** is looking for pricing.” | **“Cross-domain: yesterday's outreach win → proof content draft.”** |
| 7 | “I located a **price guide**… **here**.” | **“Queued for 9am — **publish**.”** (orange on **publish**) |
| 8 | Kinso rainbow blur orb | Same **blurry orb** — recolor emerald → teal → orange only |

**Remove / do not add**
- **Left sidebar / app icon dock** ← main failure mode
- Flat “AI” circle logo with text
- Female avatar if name is Marcus
- Price guide / pricing storyline
- Sharp readable inbox redesign, charts, audit UI, third card

### Full positive prompt (paste entire block)

```
STRICT VIDEO-TO-VIDEO EDIT ONLY. Use the uploaded Kinso source clip as the exact visual template. Preserve pixel-level layout, motion, timing, blur amount, card shapes, shadows, parallax, and background composition. DO NOT redesign. DO NOT add new UI panels. DO NOT add a left sidebar or app icon dock.

SCENE (unchanged from source): Soft peach-and-cyan grid background. Center: heavily blurred white inbox app window (frosted glass, unreadable text). Foreground: two stacked white pill-shaped floating cards with soft drop shadows.

TOP CARD (same design, swap content only):
- Replace avatar with a professional male headshot (Marcus Webb), NOT the original woman.
- Name: Marcus Webb
- Keep small Gmail M icon beside name
- Line 1 (gray): Reply rate dipped 12% on Sequence B
- Line 2 (bold): Should we refresh hooks before tomorrow's send?

BOTTOM CARD (same design, swap content only):
- Keep soft blurry gradient orb on the left (NOT a flat "AI" logo circle) — recolor to emerald, teal, orange
- Line 1: Cross-domain: yesterday's outreach win → proof content draft.
- Line 2: Queued for 9am — publish (word "publish" in orange/peach, same as original "here")
- Keep subtle warm glow behind this card

BACKGROUND: Heavily blurred like source — search bar and contact rows only. NO sharp left sidebar. NO integration icons column. NO Slack LinkedIn Teams dock.

16:9 landscape 1280x720, tight crop, no white letterbox, seamless 10 second loop, no audio, no Kinso branding.
```

### Negative prompt

```
left sidebar, app dock, integration icons, Slack, LinkedIn, Teams, icon column, sharp inbox, redesigned layout, dashboard, AI badge, text AI in circle, female avatar, Natasha Corwin, price guide, pricing, sales inquiry, third card, charts, dark mode, Kinso logo, KroniQ logo, white letterbox, 9:16 portrait, warped text, different card shapes, new windows
```

### Tool settings

- Mode: **Video-to-video** / **Edit** — NOT text-to-video
- Strength: **low** (0.2–0.35)
- Source: attach `njwC72lt4NOXO4ik7nJcbBPadY.webm`
- Aspect: **16:9** 1280×720

---

## After v2v export

1. Save as:
   - `public/images/showcase/lead-research.mp4` ✅ installed
   - `public/images/showcase/cmo-audit.mp4`
2. Optional first-frame posters: `lead-research-poster.png`, `cmo-audit-poster.png`
3. Hard refresh `localhost:3001` — site auto-swaps from coded mocks

---

## Should you regenerate clip 1?

| Option | When |
|--------|------|
| **Keep clip 1** | Copy and motion are correct; only fix **800×800 tight crop** in your editor |
| **Regenerate clip 1** | Only if you want different lead name, LinkedIn-only (no email chrome), or cleaner UI match to clips 2–3 |

Clips 2 & 3 are the right Kinso sources — use v2v, don’t generate from scratch unless v2v quality is bad.

---

## Alternative: record from real app

See original shot lists below if you prefer screen capture over v2v.

### `lead-research.mp4` — Lead intelligence

1. Search **“Ryan Withers”** → 1s scanning  
2. Summary card: “Found angle for [Name]”  
3. LinkedIn snippet + fit score  
4. Loop  

### `cmo-audit.mp4` — Daily CMO audit

1. Home audit view: “Good morning — 12 actions queued”  
2. Card: “Reply rate dipped 12%”  
3. Card: “Turn yesterday’s win into proof content — draft queued 9am”  
4. Tags: Self-critique · Cross-domain  
5. Loop  

---

## Export settings (all clips)

- **800×800** preferred (matches Kinso sources 2 & 3)  
- 30fps or 25fps  
- **MP4 H.264**, under ~8MB  
- **Loop:** hold opening frame ~1s at end  
- **No white padding** — UI should edge-to-edge in the square frame
