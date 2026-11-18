#!/usr/bin/env python3
"""Generate antennaMapping.ts from the SIW-5555 and Google Play CSV files."""

import argparse
import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path


def normalize(value):
    return value.strip().lower()


def read_csv(path, encoding):
    with path.open(encoding=encoding, newline="") as file:
        return list(csv.DictReader(file))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("antenna_csv", type=Path)
    parser.add_argument("devices_csv", type=Path)
    args = parser.parse_args()

    positions = {"top": "top", "center": "center", "bottom": "bottom"}
    confidences = {"alta": "high", "media": "medium", "bassa": "low"}
    names = defaultdict(set)
    codes = defaultdict(set)
    classified = {}
    for row_number, row in enumerate(read_csv(args.antenna_csv, "utf-8-sig"), 2):
        position = normalize(row["Cluster_Label"])
        confidence = normalize(row["Confidence"])
        if not position and not confidence:
            continue
        if position not in positions or confidence not in confidences:
            raise ValueError(f"Unrecognized classification on row {row_number}")

        brand = normalize(row["Brand"])
        model = normalize(row["Model"])
        values = (positions[position], confidences[confidence])
        classified[row_number] = f"{row['Brand']} {row['Model']}"
        model_name = re.sub(r"\s*\([^)]*\)", "", model)
        model_names = {model_name} | {
            normalize(name)
            for name in model_name.split("/")
        }
        brands = {brand}
        if brand == "xiaomi" and all(name.startswith("redmi ") for name in model_names):
            brands.add("redmi")
        if brand == "honor" and model == "9x":
            brands.add("huawei")

        model_codes = set(re.findall(r"\b(?:cph|rmx)\d+\b", model))
        for retail_brand in brands:
            for name in model_names:
                names[(retail_brand, name)].add((row_number, values))
                names[(retail_brand, f"{brand} {name}")].add((row_number, values))
            for code in model_codes:
                codes[(retail_brand, code)].add((row_number, values))

    pairs = defaultdict(list)
    matched_rows = set()
    for row in read_csv(args.devices_csv, "utf-16"):
        brand = normalize(row["Retail Branding"])
        model = normalize(row["Model"])
        if not brand or not model:
            continue
        name = normalize(row["Marketing Name"])
        matches = names[(brand, name)] | codes[(brand, model)]
        for alias in name.split("/"):
            matches |= names[(brand, normalize(alias))]
        matched_rows.update(row_number for row_number, _ in matches)
        pairs[(brand, model)].append(matches)

    mapping = {}
    ambiguous = 0
    covered_rows = set()
    for (brand, model), candidates in sorted(pairs.items()):
        matches = set().union(*candidates)
        if not matches:
            continue
        values = {value for _, value in matches}
        if any(not candidate for candidate in candidates) or len(values) != 1:
            ambiguous += 1
            continue
        if "|" in brand or "|" in model:
            raise ValueError(f"Invalid separator in brand/model: {brand}, {model}")
        mapping[f"{brand}|{model}"] = values.pop()
        covered_rows.update(row_number for row_number, _ in matches)

    print('import type { NfcAntennaConfidence, NfcAntennaPosition } from "./types";')
    print()
    print("// Generated from SIW-5555 and Google Play supported devices; see README.md.")
    print("export const antennaMapping: Readonly<")
    print("  Record<string, readonly [NfcAntennaPosition, NfcAntennaConfidence] | undefined>")
    print("> = {")
    for key, (position, confidence) in sorted(mapping.items()):
        print(f"  {json.dumps(key)}: [{json.dumps(position)}, {json.dumps(confidence)}],")
    print("};")

    print(
        f"Matched {len(matched_rows)}/{len(classified)} classified rows; "
        f"covered {len(covered_rows)} after excluding {ambiguous} ambiguous pairs.",
        file=sys.stderr,
    )
    for row_number in sorted(classified.keys() - covered_rows):
        reason = "Ambiguous" if row_number in matched_rows else "Unmatched"
        print(f"{reason}: {classified[row_number]}", file=sys.stderr)


if __name__ == "__main__":
    main()
