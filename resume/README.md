# Résumé — build system & authoring guide

Single source of truth for Punit Mishra's résumé, in four framings, all built from
LaTeX via [Tectonic](https://tectonic-typesetting.github.io/) into `../public/`.

## Layout

| File | Role |
|------|------|
| `resume-content.tex` | **Single source of truth** for the primary résumé. Shared by both drivers below. |
| `resume.tex` | 1-page driver (layout knobs only) → `resume.pdf` |
| `resume-2page.tex` | 2-page driver (layout knobs only) → `resume-2page.pdf` |
| `resume-academic.tex` | **Standalone** academic / CV framing (content inline) → `resume-academic.pdf` |
| `resume-business.tex` | **Standalone** business-impact framing (content inline) → `resume-business.pdf` |
| `build.sh` | Builds every variant × location into `../public/`. |

### Why two patterns?
- The **primary** résumé keeps content in one file (`resume-content.tex`) and lets each
  driver decide what to show via `\longonly{…}` (2-page only) and `\shortonly{…}` (1-page
  only). Edit content once; both the 1- and 2-page PDFs update.
- The **academic** and **business** variants are self-contained (their own audience, order,
  and emphasis), so their content lives inline in their own `.tex` file.

## Build

```bash
./build.sh                      # all variants, all locations → ../public/
RESUME_EMAIL=you@x.com ./build.sh   # override the embedded contact email
```

Requires `tectonic` on PATH (`brew install tectonic`). No pdflatex/xelatex needed.

### Build-time tokens
`build.sh` substitutes these so they never live in committed source:

| Token | Source | Default |
|-------|--------|---------|
| `CONTACT_EMAIL` | `$RESUME_EMAIL` | `punit.mishra09@gmail.com` |
| `RESUMELOCATION` | per-location loop in `build.sh` | Bay Area, CA / New York, NY |

Primary résumé builds once **per location** (see the `LOCATIONS` array). The academic and
business variants build once, at Bay Area — add rows to `build_standalone` calls if you want
location-tailored copies.

### Outputs (in `../public/`)
`resume.pdf`, `resume-2page.pdf`, `resume-newyork.pdf`, `resume-2page-newyork.pdf`,
`resume-academic.pdf` (2 pp), `resume-business.pdf` (1 p).

The website's interactive résumé is driven separately by
`../public/data-sources/resume.json` — **keep it in sync** with the LaTeX when facts change.

## Confidentiality policy — NO customer names

The résumé is public. **Never name a customer or client.** Use anonymized, industry-appropriate
descriptors instead. Current conventions:

| Real | Use instead |
|------|-------------|
| H&M (SAP enterprise customer) | *a Fortune 500 retailer* |
| JPMorgan Chase (IBM client) | *a major US bank* |

Employers (SAP, CallidusCloud, IBM) and the public CallidusCloud→SAP acquisition are fine —
those are Punit's own history, not client confidences. When adding a new engagement, describe
the **industry + scale**, not the name. Before every push, grep for names (see below).

## Naming conventions (keep consistent across all variants + resume.json)

| Concept | Say | Not |
|---------|-----|-----|
| SAP's in-house model | **SAP's own LLM (Nova)** | "Nova, SAP's code LLM" |
| The agents platform (APEX) | **Domain Data Access Agents** platform | "Digital Service Agents" (internal-only name) |
| NL-to-SQL wins | frame as **accuracy** (decision-match 59.2%→64.8%, reranking 50%→53%) | generic "improvements" |

## Experience structure — one continuous SAP tenure

Punit has been at SAP since **Feb 2014** (joined via the **CallidusCloud** acquisition, $2.4B).
Present it that way: a single `\company{SAP}{Feb 2014 -- Present • 11+ yrs}` header with two
`\role{…}{…}` blocks nested under it (CX Data & AI, then Thunderbridge AI / SAP Sales Cloud with
a *"joined via CallidusCloud"* subline). The `\company`/`\role` macros are defined in each driver
(and inline in the standalone variants). Everything before SAP (IBM, UC Berkeley, LawPivot) is
collapsed into a compact **Earlier** section at the bottom. Preserve the depth of the SAP section
— that's the headline; compress everything else.

## Voice per variant (keep consistent)

| Variant | Voice |
|---------|-------|
| `resume.tex` / `resume-2page.tex` (primary) | Warm **first person** — "I brought / architected / turned / lead". |
| `resume-business.tex` | Confident **first person**, outcome-led — "I lead / I cut / I closed". |
| `resume-academic.tex` | Formal **third person / impersonal** — bio opens "Punit Mishra is…"; bullets lead with action verbs ("Architected", "Developed", "Built", "Cut"), no "I". |

## How to enhance each layer

Every framing has the same layers; enhance them in this order for best signal:

1. **Profile / Summary** — one warm first-person paragraph. Lead with what Punit *does end to
   end*, then the two or three freshest, highest-value initiatives. Keep the "so what".
2. **Experience bullets** — first person ("I brought / architected / turned / lead"). Each
   bullet = *what I built* → *how* → **business value** (cost, risk closed, onboarding
   automated, latency, scale). Only real numbers (e.g. decision-match 59.2%→64.8%,
   50%→53%; latency ~25s→~10s; team of 13). Never invent metrics.
3. **Projects / open source** — pair each with its **external front** where one exists
   (live demo, Homebrew tap, cross-compile CI, GitHub). These are verifiable and strengthen
   a public résumé.
4. **Skills** — only claim what's actually Punit's. (Ray = his, via `autosql-ray-engines`;
   Kubeflow was a *teammate's* area and was removed. Verify against the CoViber brain before
   adding a tool.)

### Fit / pagination
Tune layout in the **drivers**, never the content: `\linespread`, `\entrygap`, `\skillgap`,
`\titlespacing*{\section}`, and `\setlist[itemize]{itemsep, topsep}`. Verify page count after
any content change (any Python with PyMuPDF):

```bash
python3 -c "import fitz; d=fitz.open('../public/resume.pdf'); print(d.page_count,'pages')"
```

### Pre-push checklist
```bash
# 1. No customer names anywhere (note LaTeX escapes & as \&):
grep -rniE 'h\\?&m|jpmorgan|chase' resume/ ../public/data-sources/
# 2. resume.json still parses:
python3 -c "import json; json.load(open('../public/data-sources/resume.json'))"
# 3. Rebuild + eyeball every PDF:
./build.sh
```
