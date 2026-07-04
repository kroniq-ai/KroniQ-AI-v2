# Landing media

## Hero (optional screenshot)

| File | Use |
|------|-----|
| `app-home.png` | Hero dashboard below waitlist |

## Feature videos (light sections)

Drop MP4s here — all three use the **same clip component** (side bleed, scroll-to-play, no letterbox).

| File | Section |
|------|---------|
| `showcase/outreach-sequences.mp4` | Autonomous outreach |
| `showcase/lead-research.mp4` | Lead intelligence |
| `showcase/cmo-audit.mp4` | Daily CMO audit |

Optional posters: `*-poster.png` (first frame while loading).

### Spec (match `outreach-sequences.mp4` for every clip)

| Property | Value |
|----------|--------|
| Resolution | **1280×720** (16:9) |
| Crop | Tight — UI fills frame, **no white padding** above/below |
| Duration | ~7s seamless loop |
| Codec | H.264 MP4, no audio |

Coded mocks show until each file exists.

See `docs/VIDEO_PROMPTS.md` for shot lists.
