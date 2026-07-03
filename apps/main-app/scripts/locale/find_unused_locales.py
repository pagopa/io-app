"""
Detect (and optionally remove) unused i18n keys from the locale files.

The reference locale (locales/it/index.json) is flattened to its leaf key
paths, and each path is looked up across the app source (ts/). A key is
considered USED when either:
  - its full dotted path appears verbatim in the source, e.g. I18n.t("a.b.c");
  - it is reachable through a dynamic template literal, e.g. a key
    `wallet.payment.failure.PPT_AUTORIZZAZIONE.title` is kept alive by
    `I18n.t(`wallet.payment.failure.${faultCodeCategory}.title`)`.

Because many keys are built dynamically (variables, string concatenation),
deletion is deliberately conservative. Every non-referenced key is classified:
  - UNUSED   — no reference at all, not even an ancestor path; safe to remove.
  - UNCERTAIN — no direct reference, but an ancestor path IS referenced in the
    source (so the key is likely built dynamically / by concatenation). These
    are reported for manual review and are NEVER auto-removed.

i18next plural keys (`foo_one`, `foo_other`, `foo_zero`, ...) are collapsed to
their base key for the usage lookup, since the app references only `foo`.

The high-confidence UNUSED keys are removed from every locale in place; the
UNCERTAIN ones are only reported, never touched.

Usage:
    pnpm nx run main-app:unused-locales

Afterwards, format and type-check to confirm nothing broke:
    pnpm prettify && pnpm nx tsc-noemit main-app

No third-party dependencies — standard library only (Python 3.8+).
"""

import json
import re
import sys
from pathlib import Path

# scripts/locale/ -> apps/main-app
APP_ROOT = Path(__file__).resolve().parents[2]
LOCALES_DIR = APP_ROOT / "locales"
SOURCE_DIR = APP_ROOT / "ts"
REFERENCE_LOCALE = "it"
SOURCE_EXTS = (".ts", ".tsx")

# i18next plural suffixes: `foo_one`/`foo_other`/... are all reached via `foo`.
PLURAL_SUFFIXES = ("zero", "one", "two", "few", "many", "other")
_PLURAL_RE = re.compile(r"_(?:%s)$" % "|".join(PLURAL_SUFFIXES))

# One key segment. Locale segments may contain hyphens (`card0-content`) and be
# purely numeric (`details.1.title`), so the class is deliberately permissive.
# A template interpolation (`${...}`) is treated as exactly one such segment on
# purpose: every dynamic key in this codebase interpolates a single-segment
# value (an enum/variant name), so matching a single segment keeps the dynamic
# match precise. Allowing dots here would let a `fullmatch` span unlimited depth
# (e.g. `${a}.${b}` -> `[\w$-]+\.[\w$-]+`) and mark nearly every key as used.
_SEGMENT = r"[\w$-]+"
# A dotted key chain as it appears in source, e.g. `a.b.c` or `a.card0-content`.
_DOTTED_TOKEN_RE = re.compile(r"%s(?:\.%s)+" % (_SEGMENT, _SEGMENT))
# A template literal that contains an interpolation, e.g. `a.${x}.c`.
_DYNAMIC_TEMPLATE_RE = re.compile(r"`([^`]*\$\{[^`]*)`")


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def flatten(node, prefix=""):
    """Yield (dotted_path, leaf_value) for every leaf string in the tree."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from flatten(v, f"{prefix}.{k}" if prefix else k)
    else:
        yield prefix, node


def lookup_key(path):
    """Collapse an i18next plural leaf to the base key the app references."""
    head, _, last = path.rpartition(".")
    base = _PLURAL_RE.sub("", last)
    return f"{head}.{base}" if head else base


def read_source_blob():
    """Concatenate every source file into a single string for scanning."""
    parts = []
    for path in SOURCE_DIR.rglob("*"):
        if path.suffix in SOURCE_EXTS and path.is_file():
            parts.append(path.read_text(encoding="utf-8", errors="ignore"))
    return "\n".join(parts)


def build_source_index(blob):
    """
    Return (dotted_tokens, dynamic_regexes).

    dotted_tokens  — set of every literal dotted chain found in the source,
                     used for exact key matches and ancestor detection.
    dynamic_regexes — compiled full-match regexes derived from template
                      literals, where each `${...}` becomes a single-segment
                      wildcard (see `_SEGMENT`).
    """
    dotted_tokens = set(_DOTTED_TOKEN_RE.findall(blob))

    dynamic_regexes = []
    for tpl in set(_DYNAMIC_TEMPLATE_RE.findall(blob)):
        # Keep only templates that look like key paths (contain a dot).
        if "." not in tpl:
            continue
        # Split on interpolations, escape the literal parts, and replace each
        # `${...}` with a single-segment wildcard (see `_SEGMENT`).
        literals = re.split(r"\$\{[^}]*\}", tpl)
        pattern = _SEGMENT.join(re.escape(part) for part in literals)
        try:
            dynamic_regexes.append(re.compile(pattern))
        except re.error:
            continue
    return dotted_tokens, dynamic_regexes


def ancestor_paths(key):
    """Yield every ancestor dotted path of `key` (excluding the key itself)."""
    parts = key.split(".")
    for i in range(1, len(parts)):
        yield ".".join(parts[:i])


def classify(lookup_keys, dotted_tokens, dynamic_regexes):
    """Split lookup keys into (used, uncertain, unused)."""
    used, uncertain, unused = [], [], []
    for key in lookup_keys:
        if key in dotted_tokens or any(rx.fullmatch(key) for rx in dynamic_regexes):
            used.append(key)
        elif any(anc in dotted_tokens for anc in ancestor_paths(key)):
            uncertain.append(key)
        else:
            unused.append(key)
    return used, uncertain, unused


def delete_path(tree, path):
    """Delete a dotted leaf path from `tree`, pruning emptied parents. Return True if removed."""
    parts = path.split(".")
    stack = []
    node = tree
    for part in parts[:-1]:
        if not isinstance(node, dict) or part not in node:
            return False
        stack.append((node, part))
        node = node[part]
    if not isinstance(node, dict) or parts[-1] not in node:
        return False
    del node[parts[-1]]
    for parent, key in reversed(stack):
        if not parent[key]:
            del parent[key]
    return True


def write_locale(path, tree):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    reference = load_json(LOCALES_DIR / REFERENCE_LOCALE / "index.json")
    leaves = [path for path, _ in flatten(reference)]

    # Map each unique lookup key back to the concrete leaf paths it covers
    # (a single base key may cover several plural leaves).
    lookup_to_leaves = {}
    for leaf in leaves:
        lookup_to_leaves.setdefault(lookup_key(leaf), []).append(leaf)

    print(f"Scanning {SOURCE_DIR.relative_to(APP_ROOT)} ...")
    blob = read_source_blob()
    dotted_tokens, dynamic_regexes = build_source_index(blob)

    used, uncertain, unused = classify(
        sorted(lookup_to_leaves), dotted_tokens, dynamic_regexes
    )

    total = len(lookup_to_leaves)
    print()
    print(f"=== LOCALE USAGE REPORT (reference: {REFERENCE_LOCALE}) ===")
    print(f"total keys      : {total}")
    print(f"used            : {len(used)}")
    print(f"uncertain       : {len(uncertain)}  (referenced only via an ancestor path)")
    print(f"unused          : {len(unused)}  (removed)")
    print()

    if uncertain:
        print("--- UNCERTAIN (referenced only via an ancestor path, kept) ---")
        for key in uncertain:
            print(f"  ? {key}")
        print()

    if not unused:
        print("Nothing to remove.")
        return

    # Expand the unused lookup keys back to concrete leaf paths (plural-aware).
    unused_leaves = [leaf for key in unused for leaf in lookup_to_leaves[key]]
    print("--- removing UNUSED keys from every locale ---")
    for locale_dir in sorted(p for p in LOCALES_DIR.iterdir() if p.is_dir()):
        index = locale_dir / "index.json"
        if not index.exists():
            continue
        tree = load_json(index)
        removed = sum(delete_path(tree, leaf) for leaf in unused_leaves)
        write_locale(index, tree)
        print(f"  {locale_dir.name}: removed {removed} keys")

    print()
    print("Done. Now run: pnpm prettify && pnpm nx tsc-noemit main-app")


if __name__ == "__main__":
    sys.exit(main())
