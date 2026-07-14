"""
Detect and remove unused i18n keys from the locale files.

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

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path
from typing import Dict, Iterator, List, Optional, Pattern, Set, Tuple

# scripts/locale/ -> apps/main-app
APP_ROOT = Path(__file__).resolve().parents[2]
LOCALES_DIR = APP_ROOT / "locales"
SOURCE_DIR = APP_ROOT / "ts"
REFERENCE_LOCALE = "it"
SOURCE_EXTS = (".ts", ".tsx")

# i18next plural suffixes: `foo_one`/`foo_other`/... are all reached via `foo`.
PLURAL_SUFFIXES = ("zero", "one", "two", "few", "many", "other")
_PLURAL_RE = re.compile(rf"_(?:{'|'.join(PLURAL_SUFFIXES)})$")

# One key segment. Locale segments may contain hyphens (`card0-content`) and be
# purely numeric (`details.1.title`), so the class is deliberately permissive.
# A template interpolation (`${...}`) is treated as exactly one such segment on
# purpose: every dynamic key in this codebase interpolates a single-segment
# value (an enum/variant name), so matching a single segment keeps the dynamic
# match precise. Allowing dots here would let a `fullmatch` span unlimited depth
# (e.g. `${a}.${b}` -> `[\w$-]+\.[\w$-]+`) and mark nearly every key as used.
_SEGMENT = r"[\w$-]+"
# A dotted key chain as it appears in source, e.g. `a.b.c` or `a.card0-content`.
_DOTTED_TOKEN_RE = re.compile(rf"{_SEGMENT}(?:\.{_SEGMENT})+")
# A template literal that contains an interpolation, e.g. `a.${x}.c`.
_DYNAMIC_TEMPLATE_RE = re.compile(r"`([^`]*\$\{[^`]*)`")
# The interpolation placeholder itself, e.g. `${faultCodeCategory}`.
_INTERPOLATION_RE = re.compile(r"\$\{[^}]*\}")

JsonTree = Dict[str, object]


def load_json(path: Path) -> JsonTree:
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def flatten(node: object, prefix: str = "") -> Iterator[Tuple[str, object]]:
    """Yield (dotted_path, leaf_value) for every leaf string in the tree."""
    if isinstance(node, dict):
        for k, v in node.items():
            yield from flatten(v, f"{prefix}.{k}" if prefix else k)
    else:
        yield prefix, node


def lookup_key(path: str) -> str:
    """Collapse an i18next plural leaf to the base key the app references."""
    head, _, last = path.rpartition(".")
    base = _PLURAL_RE.sub("", last)
    return f"{head}.{base}" if head else base


def iter_source_texts() -> Iterator[str]:
    """Yield the text of every app source file under `SOURCE_DIR`."""
    for path in sorted(SOURCE_DIR.rglob("*")):
        if path.suffix in SOURCE_EXTS and path.is_file():
            yield path.read_text(encoding="utf-8", errors="ignore")


def template_to_pattern(tpl: str) -> Optional[str]:
    """
    Turn a dynamic template literal into a key-matching regex pattern, or None
    when the template cannot be a key path or yields an invalid pattern.
    """
    # Keep only templates that look like key paths (contain a dot).
    if "." not in tpl:
        return None
    # Split on interpolations, escape the literal parts, and replace each
    # `${...}` with a single-segment wildcard (see `_SEGMENT`).
    literals = _INTERPOLATION_RE.split(tpl)
    pattern = _SEGMENT.join(re.escape(part) for part in literals)
    try:
        re.compile(pattern)
    except re.error:
        return None
    return pattern


def build_source_index() -> Tuple[Set[str], Optional[Pattern[str]]]:
    """
    Scan the source tree and return (dotted_tokens, dynamic_matcher).

    dotted_tokens   — set of every literal dotted chain found in the source,
                      used for exact key matches and ancestor detection.
    dynamic_matcher — a single compiled regex (an alternation of the patterns
                      derived from template literals, where each `${...}`
                      becomes a single-segment wildcard — see `_SEGMENT`), or
                      None when the source contains no dynamic key templates.
    """
    dotted_tokens: Set[str] = set()
    templates: Set[str] = set()
    for text in iter_source_texts():
        dotted_tokens.update(_DOTTED_TOKEN_RE.findall(text))
        templates.update(_DYNAMIC_TEMPLATE_RE.findall(text))

    patterns = sorted(
        p for p in (template_to_pattern(tpl) for tpl in templates) if p
    )
    matcher = re.compile("|".join(f"(?:{p})" for p in patterns)) if patterns else None
    return dotted_tokens, matcher


def ancestor_paths(key: str) -> Iterator[str]:
    """Yield every ancestor dotted path of `key` (excluding the key itself)."""
    parts = key.split(".")
    for i in range(1, len(parts)):
        yield ".".join(parts[:i])


def classify(
    lookup_keys: List[str],
    dotted_tokens: Set[str],
    dynamic_matcher: Optional[Pattern[str]],
) -> Tuple[List[str], List[str], List[str]]:
    """Split lookup keys into (used, uncertain, unused)."""
    used: List[str] = []
    uncertain: List[str] = []
    unused: List[str] = []
    for key in lookup_keys:
        if key in dotted_tokens or (dynamic_matcher and dynamic_matcher.fullmatch(key)):
            used.append(key)
        elif any(anc in dotted_tokens for anc in ancestor_paths(key)):
            uncertain.append(key)
        else:
            unused.append(key)
    return used, uncertain, unused


def delete_path(tree: JsonTree, path: str) -> bool:
    """Delete a dotted leaf path from `tree`, pruning emptied parents. Return True if removed."""
    parts = path.split(".")
    stack: List[Tuple[JsonTree, str]] = []
    node: object = tree
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


def write_locale(path: Path, tree: JsonTree) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(tree, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main() -> None:
    reference = load_json(LOCALES_DIR / REFERENCE_LOCALE / "index.json")

    # Map each unique lookup key back to the concrete leaf paths it covers
    # (a single base key may cover several plural leaves).
    lookup_to_leaves: Dict[str, List[str]] = defaultdict(list)
    for leaf, _ in flatten(reference):
        lookup_to_leaves[lookup_key(leaf)].append(leaf)

    print(f"Scanning {SOURCE_DIR.relative_to(APP_ROOT)} ...")
    dotted_tokens, dynamic_matcher = build_source_index()

    used, uncertain, unused = classify(
        sorted(lookup_to_leaves), dotted_tokens, dynamic_matcher
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
