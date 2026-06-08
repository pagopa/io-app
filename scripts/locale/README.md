# locale analysis

Analyses a locale file (default: `locales/it/index.json`) for **word/phrase
frequency** and **spelling inconsistencies**.

Only the string *values* are analysed — JSON keys are ignored.
Interpolation placeholders (`{{...}}`), HTML-ish tags and URLs are stripped,
Italian stopwords and lorem-ipsum filler are excluded, and selected multi-word
concepts are counted as single units (so `carta di identità` is distinct from a
generic `carta`).

## Usage

```sh
# analyses locales/it/index.json
python3 scripts/locale/locale_analysis.py
```

No third-party dependencies — standard library only (Python 3.8+).

## Output

A formatted report is printed to stdout, and four CSVs are written **into this
script's folder** (`;`-separated, UTF-8 BOM, ready for Excel). They are
gitignored, so they are never committed:

| File | Contents |
| --- | --- |
| `word_frequency.csv` | single-word / glued-concept frequency ranking |
| `phrase_frequency.csv` | meaningful 2-3 word compound phrases (count ≥ 5) |
| `inconsistencies.csv` | auto-discovered spelling inconsistencies |
| `compound_candidates.csv` | frequent phrases not yet grouped in `COMPOUND_DEFS` |

## Inconsistency detection (discovery-driven)

The inconsistency report scans the whole file with **no predefined lists of
answers**, so it surfaces new issues as the locale evolves. It checks:

1. **Elision** — discovered automatically (no predefined pairs): every elided
   form actually used (`d'identità`, `un'email`, `quest'opzione`, …) is matched
   against its reconstructed un-elided form (`di identità`, `una email`,
   `questa opzione`) when that also appears. Only the singular elidable vowels
   `a`/`o`/`i` are reconstructed, so singular-vs-plural pairs (`l'identità` vs
   `le identità`) are **not** mistaken for inconsistencies.
2. **Hyphenation** — discovered automatically (no predefined word list): a word
   written both hyphenated and joined (`e-mail` vs `email`) is flagged by
   collapsing the hyphen and comparing.
3. **Brand / acronym casing** — `SPID` vs `spid`, `pagoPA` vs `pagopa`, etc.
   Discovered automatically (no predefined brand list): a token is treated as a
   brand/acronym when its most frequent spelling is ALLCAPS (≥3 letters) or any
   spelling uses internal CamelCase. Ordinary words capitalised only at sentence
   start (`della`/`DELLA`) are therefore not flagged.

Homographs whose unaccented form is a distinct valid word (`e`/`è`, `la`/`là`,
`ne`/`né`, `si`/`sì`, `da`/`dà`) are intentionally **not** flagged.

## Spotting new compound concepts

`COMPOUND_DEFS` is a hand-curated list, so on its own it can't notice a *new*
multi-word concept appearing in the locale. `compound_candidates.csv` closes
that gap: it lists frequent phrases (count ≥ 10) whose content words are **not**
yet covered by `COMPOUND_DEFS`. The workflow is:

1. Run the script → review `compound_candidates.csv`.
2. When a candidate is a real concept (e.g. `documenti digitali`, `valore
   legale`), add it to `COMPOUND_DEFS`.
3. It becomes a counted group and drops off the candidate list.

Verb/filler phrases (e.g. `attendi qualche secondo`) will also appear — these
are expected noise and should just be ignored.

Nested n-grams are de-duplicated: a shorter phrase is dropped when it is mostly
just a fragment of a longer one (so `attendi qualche` and `qualche secondo` are
removed in favour of `attendi qualche secondo`). The aggressiveness is tuned by
`SUBSUME_RATIO`.

## Tuning

- `COMPOUND_DEFS` — multi-word concepts counted as a single token. Spelling
  variants are kept as **separate** entries on purpose, to expose
  inconsistencies (`carta di identità` vs `carta d'identità`).
- `STOPWORDS` / `LATIN` — words excluded from the frequency ranking.
- The inconsistency detectors (elision, hyphenation, brand casing) need **no
  curated lists** — they discover issues directly from the text. Only
  `ELIDABLE_VOWELS` encodes the grammatical rule of which vowels elide.
- `CAND_MIN` — minimum count for a phrase to appear in `compound_candidates.csv`.
- `SUBSUME_RATIO` — how aggressively nested n-gram fragments are de-duplicated
  in the candidates list (higher = drops fewer fragments).
