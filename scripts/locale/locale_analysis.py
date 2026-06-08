"""
Locale word/phrase frequency & spelling-inconsistency analysis.

Analyses the Italian locale (locales/it/index.json) and produces, next to it:
  - word_frequency.csv     single-word / glued-concept frequency ranking
  - phrase_frequency.csv   meaningful 2-3 word compound phrases
  - inconsistencies.csv    auto-discovered spelling inconsistencies

It also prints a formatted report to stdout. Only the translated string
*values* are counted (JSON keys are ignored); interpolation placeholders,
HTML-ish tags and URLs are stripped, Italian stopwords and lorem-ipsum filler
are excluded, and selected multi-word concepts (see COMPOUND_DEFS) are counted
as single units so e.g. "carta di identità" is distinct from generic "carta".

The inconsistency report is discovery-driven: it scans the whole file for
elision (di/d', una/un', ...), email spelling and brand-casing issues — it does
NOT rely on COMPOUND_DEFS, so it catches new issues as the locale evolves.

Usage:
    python3 scripts/locale/locale_analysis.py
"""

import csv
import json
import re
from collections import Counter
from pathlib import Path

# Analyses the Italian locale, resolved relative to the repo root (two levels up
# from this script: scripts/locale/ -> repo root).
REPO_ROOT = Path(__file__).resolve().parents[2]
PATH = REPO_ROOT / "locales" / "it" / "index.json"
# Generated CSVs are written next to this script (gitignored), not into locales/.
OUT_DIR = Path(__file__).resolve().parent

with open(PATH, encoding="utf-8") as f:
    data = json.load(f)

# Collect only the string VALUES (leaf strings), ignore keys
values = []
def walk(node):
    if isinstance(node, dict):
        for v in node.values():
            walk(v)
    elif isinstance(node, list):
        for v in node:
            walk(v)
    elif isinstance(node, str):
        values.append(node)
walk(data)

text = " ".join(values)

# Remove interpolation placeholders {{...}} and markdown/format artifacts
text = re.sub(r"\{\{.*?\}\}", " ", text)
text = re.sub(r"%\{.*?\}", " ", text)   # sprintf-style
text = re.sub(r"<[^>]+>", " ", text)    # html-ish tags
text = re.sub(r"https?://\S+", " ", text)  # urls

# Keep "IT-Wallet" as a single brand token so it doesn't pollute "it"/"wallet"
text = re.sub(r"\bIT[-\s]?Wallet\b", " itwallet ", text, flags=re.IGNORECASE)

# ---------------------------------------------------------------------------
# Multi-word CONCEPTS glued into a single token before counting, so that e.g.
# "carta di identità" and "carta di credito" are counted as distinct concepts
# instead of all collapsing into a generic "carta". Display labels restore the
# readable form. Order matters: longest / most specific patterns come first so
# they win over shorter overlapping ones (e.g. "carta di identità" is glued
# before the standalone "identità elettronica" rule can fire).
# Each entry: (regex over raw text, readable label). Spelling variants are kept
# as SEPARATE entries (not normalized) so that orthographic inconsistencies in
# the locale surface as distinct rows — e.g. "carta di identità" vs the elided
# "carta d'identità", or "informativa privacy" vs "informativa sulla privacy".
COMPOUND_DEFS = [
    # --- carta di identità: keep "di" and elided "d'" forms apart ---
    (r"carta\s+di\s+identità",                  "carta di identità"),
    (r"carta\s+d['’]\s*identità",               "carta d'identità"),
    (r"carta\s+giovani\s+nazional[ei]",         "carta giovani nazionale"),
    (r"carta\s+giovani",                        "carta giovani"),
    (r"carta\s+europea\s+della\s+disabilità",   "carta europea della disabilità"),
    (r"carta\s+della\s+cultura",                "carta della cultura"),
    (r"carta\s+nazionale\s+dei\s+servizi",      "carta nazionale dei servizi"),
    (r"carta\s+di\s+credito",                   "carta di credito"),
    (r"carta\s+di\s+debito",                    "carta di debito"),
    (r"identità\s+elettronica",                 "identità elettronica"),
    (r"identità\s+digitale",                    "identità digitale"),
    # --- informativa privacy: keep each spelling apart (longest first) ---
    (r"informativa\s+sulla\s+privacy",          "informativa sulla privacy"),
    (r"informativa\s+sul\s+privacy",            "informativa sul privacy"),
    (r"informativa\s+di\s+privacy",             "informativa di privacy"),
    (r"informativa\s+privacy",                  "informativa privacy"),
    (r"codice\s+fiscale",                       "codice fiscale"),
    # --- codice di sblocco vs elided/short form ---
    (r"codice\s+di\s+sblocco",                  "codice di sblocco"),
    (r"codice\s+sblocco",                       "codice sblocco"),
    # --- metodo di pagamento vs short form ---
    (r"metodo\s+di\s+pagamento",                "metodo di pagamento"),
    (r"metodo\s+pagamento",                     "metodo pagamento"),
    (r"sistema\s+operativo",                    "sistema operativo"),
    (r"identity\s+provider",                    "identity provider"),
]

def _token_of(label):
    # collapse a label to a single letter-only token (matches the tokenizer)
    return re.sub(r"[^a-zà-ÿ]", "", label.lower())

LABELS = {"itwallet": "IT-Wallet"}
for _pat, _label in COMPOUND_DEFS:
    _tok = _token_of(_label)
    LABELS[_tok] = _label
    # \b boundaries stop a later pattern from matching INSIDE an already-glued
    # token (e.g. "identità elettronica" matching within "cartadiidentità ...").
    text = re.sub(rf"\b{_pat}\b", f" {_tok} ", text, flags=re.IGNORECASE)

# Tokenize: words = letters (incl. accented), allow internal apostrophe stripped
tokens = re.findall(r"[A-Za-zÀ-ÿ]+", text.lower())

# Italian stopwords: conjunctions, prepositions, articles, pronouns, common aux
STOPWORDS = {
    # articoli
    "il","lo","la","i","gli","le","l","un","uno","una","un'","del","dello","della",
    "dei","degli","delle","dal","dallo","dalla","dai","dagli","dalle","al","allo",
    "alla","ai","agli","alle","nel","nello","nella","nei","negli","nelle","sul",
    "sullo","sulla","sui","sugli","sulle","col","coi",
    # preposizioni
    "di","a","da","in","con","su","per","tra","fra","d",
    # congiunzioni
    "e","ed","o","od","ma","se","che","come","anche","perché","perche","quando",
    "mentre","oppure","ovvero","cioè","cioe","quindi","dunque","però","pero",
    "inoltre","poi","ne","né","ne",
    # pronomi / particelle
    "ti","ci","vi","si","mi","li","lo","la","le","ne","ce","ti","tu","io","noi",
    "voi","loro","lui","lei","tuo","tua","tuoi","tue","mio","mia","miei","mie",
    "nostro","nostra","suo","sua","suoi","sue","questo","questa","questi","queste",
    "quello","quella","quelli","quelle","ogni","tutti","tutte","tutto","tutta",
    # verbi ausiliari / molto comuni
    "è","e","sono","sei","siamo","siete","essere","stato","stata","ha","hai","ho",
    "hanno","abbiamo","avete","avere","sarà","sara","puoi","può","puo","possono",
    "deve","devi","fare","fai","viene","vengono","verrà","verra",
    # avverbi comuni / negazioni
    "non","più","piu","meno","molto","così","cosi","già","gia","ancora","sempre",
    "solo","dove","cui","qui","qua","là","la","ecco","sì","si","no",
    "al","alla","della","di",
    # frammenti di articoli elisi (dall', dell', all', nell', sull', quell', quest')
    "dell","all","dall","nell","sull","coll","quell","quest",
}

# Latin / lorem-ipsum placeholder words to exclude entirely
LATIN = {
    "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed",
    "eiusmod","tempor","incididunt","ut","labore","dolore","magna","aliqua","enim",
    "minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
    "aliquip","ex","ea","commodo","consequat","duis","aute","irure","reprehenderit",
    "voluptate","velit","esse","cillum","eu","fugiat","nulla","pariatur","excepteur",
    "sint","occaecat","cupidatat","proident","sunt","culpa","qui","officia",
    "deserunt","mollit","anim","id","est","laborum","mauris","vitae","etiam","quam",
    "donec","nec","vel","felis","nunc","sapien","tortor","vestibulum","sodales",
    "egestas","fringilla","tincidunt","facilisis","ornare","posuere","blandit",
}

filtered = [
    t for t in tokens
    if t not in STOPWORDS and t not in LATIN and len(t) > 1
]

counter = Counter(filtered)

# Display label restores readable form for glued brand/compound tokens
def label(w):
    return LABELS.get(w, w)

print(f"Total string values: {len(values)}")
print(f"Total word tokens (raw): {len(tokens)}")
print(f"Total word tokens (after filtering): {len(filtered)}")
print(f"Unique words (after filtering): {len(counter)}")
print()
print(f"{'RANK':>4}  {'WORD / CONCEPT':<32} {'COUNT':>6}")
print("-" * 46)
for i, (w, c) in enumerate(counter.most_common(50), 1):
    print(f"{i:>4}  {label(w):<32} {c:>6}")

# Write CSV (full list)
csv_path = str(OUT_DIR / "word_frequency.csv")
with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f, delimiter=";")  # ; for Excel IT locale
    writer.writerow(["rank", "word", "count"])
    for i, (w, c) in enumerate(counter.most_common(), 1):
        writer.writerow([i, label(w), c])

print()
print(f"CSV written to: {csv_path}  ({len(counter)} rows)")


# ---------------------------------------------------------------------------
# SPELLING-INCONSISTENCY REPORT (discovery-driven)
# These detectors scan the whole locale and surface inconsistencies on their
# own, almost entirely WITHOUT predefined lists, so they catch new issues as the
# locale evolves. Four classes are checked:
#   1. ELISION      — elided form vs the un-elided full form before the same word
#                     (e.g. "d'identità" vs "di identità", "un'email" vs "una email")
#   2. SYNONYM      — known abbreviation variants ("email"/"e-mail"/"mail"); the
#                     only curated list, for variants normalization cannot collapse
#   3. HYPHENATION  — a word written both hyphenated and joined ("e-mail" / "email")
#   4. BRAND        — acronym/brand written with inconsistent casing (SPID vs spid)
# Homographs whose unaccented form is a real distinct word (e / è, la / là,
# ne / né, si / sì, da / dà) are intentionally NOT treated as inconsistencies.
# ---------------------------------------------------------------------------

# Lowercased text WITHOUT the compound gluing applied above, so the detectors
# see the original wording.
clean = " ".join(values)
clean = re.sub(r"\{\{.*?\}\}", " ", clean)
clean = re.sub(r"<[^>]+>", " ", clean)
clean = clean.lower().replace("’", "'")

raw = " ".join(values)
raw = re.sub(r"\{\{.*?\}\}", " ", raw)
raw = re.sub(r"<[^>]+>", " ", raw)

VOWEL = "aeiouàèéìòù"  # Italian vowels (a language fact, not a curated answer)
# Vowels that an elision actually drops: singular articles end in -a/-o (la, lo,
# una, della, alla, questa ...) and "di" ends in -i. Plural articles end in -e
# (le, delle, alle) and never elide — excluding -e avoids flagging singular vs
# plural as if it were an elision inconsistency (l'identità vs le identità).
ELIDABLE_VOWELS = "aoi"

# rows: (concept_label, [(spelling, count), ...]) with majority spelling first
inconsistencies = []

# --- 1. ELISION (discovery-driven, no predefined pairs) ---------------------
# Find every elided form actually used in the text: a letter-run + apostrophe
# before a vowel-initial word (d'identità, un'email, dell'app, ...). For each,
# reconstruct candidate un-elided forms by re-adding a dropped vowel
# (d' -> da/de/di/..., un' -> una/uno/...) and check whether any of them also
# occurs before the SAME word. If both spellings are in use, it's flagged.
# This needs no list of elision pairs — the prefixes are read from the text.
elided_hits = Counter(re.findall(rf"\b([a-zà-ÿ]+)'\s*([{VOWEL}][a-zà-ÿ]+)", clean))
for (prefix, word), ec in elided_hits.items():
    spellings = [(f"{prefix}'{word}", ec)]
    for v in ELIDABLE_VOWELS:
        full = f"{prefix}{v}"
        fc = len(re.findall(rf"\b{full}\s+{re.escape(word)}\b", clean))
        if fc:
            spellings.append((f"{full} {word}", fc))
    if len(spellings) >= 2:
        spellings.sort(key=lambda x: -x[1])
        inconsistencies.append((spellings[0][0], spellings))

# --- 2. KNOWN SYNONYM / ABBREVIATION VARIANTS (curated safety-net) -----------
# The ONLY hand-maintained inconsistency list. It exists for variants that no
# normalization rule can collapse — e.g. the abbreviation "mail" for "email",
# which shares no normalized key with "email"/"e-mail". Keep it minimal; only
# add variants that would otherwise be missed entirely.
SYNONYM_GROUPS = [
    ["email", "e-mail", "mail"],
]
_synonym_members = {m.lower() for g in SYNONYM_GROUPS for m in g}

# Hyphen-aware token counts so "e-mail" is one token and the "mail" inside it is
# never miscounted as the standalone abbreviation.
_tok_counts = Counter(re.findall(r"[a-zà-ÿ]+(?:-[a-zà-ÿ]+)*", clean))
for group in SYNONYM_GROUPS:
    present = sorted(((v, _tok_counts.get(v, 0)) for v in group), key=lambda x: -x[1])
    present = [(v, c) for v, c in present if c]
    if len(present) >= 2:
        inconsistencies.append((present[0][0], present))

# --- 3. HYPHENATION (discovery-driven, no predefined word list) -------------
# A word written both hyphenated and joined ("e-commerce" vs "ecommerce") is an
# inconsistency. Collapse the hyphen to get a key and compare against the joined
# spelling. Variants already handled by SYNONYM_GROUPS are skipped to avoid a
# duplicate row.
for hyph, hc in Counter(re.findall(r"[a-zà-ÿ]+(?:-[a-zà-ÿ]+)+", clean)).items():
    joined = hyph.replace("-", "")
    if hyph in _synonym_members or joined in _synonym_members:
        continue
    jc = len(re.findall(rf"\b{re.escape(joined)}\b", clean))
    if jc:
        variants = sorted([(hyph, hc), (joined, jc)], key=lambda x: -x[1])
        inconsistencies.append((variants[0][0], variants))

# Brand / acronym casing — AUTO-DISCOVERED, no predefined list.
# Group every token by its lowercased form, then flag a group as a brand/acronym
# casing issue when it has >=2 distinct spellings AND looks like a brand:
#   - its canonical (most frequent) spelling is ALLCAPS with >=3 letters
#     (SPID, PIN, CAN, PEC ...), or
#   - any spelling uses internal CamelCase (CieID, pagoPA, PosteID, TeamSystem).
# Ordinary words capitalised only at sentence start (della/DELLA, stato/Stato)
# are NOT flagged because their canonical form is plain lowercase — which also
# auto-skips the "io" (pronoun) vs "IO" (app) collision.

def _is_allcaps(t):
    return len(t) >= 3 and t.isupper()

def _is_camel(t):
    return re.search(r"[a-zà-ÿ][A-ZÀ-Ý]", t) is not None

_groups = {}
for t in re.findall(r"[A-Za-zÀ-ÿ]+", raw):
    _groups.setdefault(t.lower(), Counter())[t] += 1

for forms in _groups.values():
    if len(forms) < 2:
        continue
    ranked = forms.most_common()  # (spelling, count), majority first
    is_brand = _is_allcaps(ranked[0][0]) or any(_is_camel(f) for f, _ in ranked)
    if is_brand:
        inconsistencies.append((ranked[0][0], ranked))

inconsistencies.sort(key=lambda g: -sum(c for _, c in g[1]))

print()
print("=== SPELLING INCONSISTENCIES (auto-discovered) ===")
if not inconsistencies:
    print("None found.")
for concept, variants in inconsistencies:
    total = sum(c for _, c in variants)
    print(f"\n• {concept!r} — {total} total, {len(variants)} spellings:")
    for i, (spelling, c) in enumerate(variants):
        tag = "  <- minority" if i > 0 else ""
        print(f"    {c:>4}  ({c/total:5.1%})  {spelling}{tag}")

# CSV for Excel: one row per spelling variant, grouped by concept
inc_path = str(OUT_DIR / "inconsistencies.csv")
with open(inc_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["concept", "spelling", "count", "share", "is_minority", "concept_total"])
    for concept, variants in inconsistencies:
        total = sum(c for _, c in variants)
        for i, (spelling, c) in enumerate(variants):
            writer.writerow([concept, spelling, c, f"{c/total:.1%}",
                             "yes" if i > 0 else "no", total])

print()
print(f"Inconsistencies CSV written to: {inc_path}  ({len(inconsistencies)} concepts)")


# ---------------------------------------------------------------------------
# PHRASE (collocation) analysis: meaningful 2-3 word compounds
# ---------------------------------------------------------------------------

# Connective tokens allowed INSIDE a phrase but never at its start/end.
# Includes plain prepositions/articles plus Italian elided forms (d', dell', ...).
CONNECTIVES = set(STOPWORDS) | {
    "d'", "l'", "dell'", "all'", "dall'", "nell'", "sull'", "un'", "quest'",
    "quell'", "di", "del", "della", "dello", "dei", "degli", "delle",
    "a", "al", "alla", "allo", "ai", "agli", "alle",
    "da", "in", "con", "su", "per", "il", "lo", "la", "le", "gli", "i", "e",
}

def phrase_tokens(s):
    # Split elisions so "carta d'identità" -> ["carta", "d'", "identità"];
    # the apostrophe stays attached to the left fragment.
    s = re.sub(r"\{\{.*?\}\}", " ", s)
    s = re.sub(r"<[^>]+>", " ", s)
    s = re.sub(r"https?://\S+", " ", s)
    s = re.sub(r"\bIT[-\s]?Wallet\b", " itwallet ", s, flags=re.IGNORECASE)
    s = s.lower().replace("’", "'")
    s = s.replace("'", "' ")  # detach elided fragment, keep the apostrophe
    return re.findall(r"[a-zà-ÿ]+'?", s)

def join_phrase(toks):
    out = ""
    for t in toks:
        disp = LABELS.get(t, t)
        if not out:
            out = disp
        elif out.endswith("'"):   # elided fragment glues to next word
            out += disp
        else:
            out += " " + disp
    return out

phrase_counter = Counter()
for v in values:
    toks = phrase_tokens(v)
    for n in (2, 3):
        for j in range(len(toks) - n + 1):
            gram = toks[j:j + n]
            if gram[0] in CONNECTIVES or gram[-1] in CONNECTIVES:
                continue
            # drop any phrase containing Latin/lorem-ipsum filler
            if any(g.rstrip("'") in LATIN for g in gram):
                continue
            # need at least one "real" content word beyond brand/short noise
            phrase_counter[join_phrase(gram)] += 1

MIN_COUNT = 5
phrases = [(p, c) for p, c in phrase_counter.most_common() if c >= MIN_COUNT]

print()
print(f"=== TOP COMPOUND PHRASES (count >= {MIN_COUNT}) ===")
print(f"{'RANK':>4}  {'PHRASE':<34} {'COUNT':>6}")
print("-" * 48)
for i, (p, c) in enumerate(phrases[:40], 1):
    print(f"{i:>4}  {p:<34} {c:>6}")

phr_path = str(OUT_DIR / "phrase_frequency.csv")
with open(phr_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["rank", "phrase", "count"])
    for i, (p, c) in enumerate(phrases, 1):
        writer.writerow([i, p, c])

print()
print(f"Phrase CSV written to: {phr_path}  ({len(phrases)} rows)")


# ---------------------------------------------------------------------------
# COMPOUND CANDIDATES
# Cross-references the auto-discovered phrases against COMPOUND_DEFS and surfaces
# frequent phrases that are NOT yet grouped. This is how new compound concepts
# get spotted in the future: review this list and, when a phrase is a real
# concept, add it to COMPOUND_DEFS so it's counted as a single unit.
# A phrase counts as "already covered" when an existing compound's content words
# appear as a contiguous run inside it (so refinements like "carta di identità
# elettronica" don't get re-suggested).
# ---------------------------------------------------------------------------

# words stripped to reduce a label/phrase to its content-word signature
_STRIP = CONNECTIVES | {"d", "l", "un", "dell", "all", "nell", "sull", "dall"}

def content_key(s):
    return tuple(w for w in re.findall(r"[a-zà-ÿ]+", s.lower()) if w not in _STRIP)

existing_keys = [content_key(lbl) for _pat, lbl in COMPOUND_DEFS]
existing_keys = [k for k in existing_keys if k]

def is_covered(key):
    if not key:
        return True
    for ek in existing_keys:
        if len(ek) <= len(key) and any(
            key[i:i + len(ek)] == ek for i in range(len(key) - len(ek) + 1)
        ):
            return True
    return False

CAND_MIN = 10  # only surface phrases frequent enough to be worth grouping
candidates = [(p, c) for p, c in phrases
              if c >= CAND_MIN and not is_covered(content_key(p))]

# Deduplicate nested n-grams: drop a shorter phrase when it is mostly just a
# fragment of a longer one. "qualche secondo" (26) and "attendi qualche" (29)
# are dropped in favour of "attendi qualche secondo" (22). A shorter phrase is
# redundant when its words form a contiguous run inside a longer phrase whose
# count is at least SUBSUME_RATIO of the shorter phrase's count (i.e. the
# shorter almost always appears as part of the longer).
SUBSUME_RATIO = 0.7

def _words(p):
    return tuple(re.findall(r"[a-zà-ÿ']+", p.lower()))

def _contiguous_in(short, long):
    return len(short) < len(long) and any(
        long[i:i + len(short)] == short for i in range(len(long) - len(short) + 1)
    )

def _is_fragment(phrase, count):
    pw = _words(phrase)
    for other, oc in phrases:  # compare against ALL phrases, not just candidates
        if _contiguous_in(pw, _words(other)) and oc / count >= SUBSUME_RATIO:
            return True
    return False

candidates = [(p, c) for p, c in candidates if not _is_fragment(p, c)]

print()
print(f"=== COMPOUND CANDIDATES (frequent phrases not yet in COMPOUND_DEFS, count >= {CAND_MIN}) ===")
if not candidates:
    print("None — every frequent phrase is already grouped.")
else:
    print("Review these; add real concepts to COMPOUND_DEFS to group them.")
    print(f"{'PHRASE':<34} {'COUNT':>6}")
    print("-" * 42)
    for p, c in candidates:
        print(f"{p:<34} {c:>6}")

cand_path = str(OUT_DIR / "compound_candidates.csv")
with open(cand_path, "w", newline="", encoding="utf-8-sig") as f:
    writer = csv.writer(f, delimiter=";")
    writer.writerow(["phrase", "count"])
    for p, c in candidates:
        writer.writerow([p, c])

print()
print(f"Candidates CSV written to: {cand_path}  ({len(candidates)} rows)")
