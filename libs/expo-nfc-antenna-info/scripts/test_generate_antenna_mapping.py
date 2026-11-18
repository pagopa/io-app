import csv
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("generate-antenna-mapping.py")


class GenerateAntennaMappingTest(unittest.TestCase):
    def test_only_unambiguous_brand_and_device_model_matches_are_included(self):
        antenna_rows = [
            ("Samsung", "Galaxy A54 5G", "Top", "Alta"),
            ("Oppo", "A52", "Top", "Alta"),
            ("Oppo", "A53s", "Center", "Media"),
            ("Xiaomi", "Redmi Note 10 Pro", "Top", "Alta"),
            ("Honor", "90 Lite", "Top", "Media"),
        ]
        device_rows = [
            ("Samsung", "Galaxy A54 5G", "a54x", "SM-A546B"),
            ("Blackview", "A52", "A52", "A52"),
            ("Oppo", "A52", "OP4C77L1", "CPH2061"),
            ("Oppo", "A52", "conflict", "same"),
            ("Oppo", "A53s", "conflict", "same"),
            ("Oppo", "A52", "unknown-alias", "same"),
            ("Oppo", "Unclassified", "unknown-alias", "same"),
            ("Redmi", "Redmi Note 10 Pro", "sweet", "M2101K6G"),
            ("Honor", "HONOR 90 Lite", "hn", "LLY-NX1"),
        ]
        with tempfile.TemporaryDirectory() as directory:
            antenna_path = Path(directory) / "antenna.csv"
            devices_path = Path(directory) / "devices.csv"
            with antenna_path.open("w", encoding="utf-8", newline="") as file:
                writer = csv.writer(file)
                writer.writerow(("Brand", "Model", "Cluster_Label", "Confidence"))
                writer.writerows(antenna_rows)
            with devices_path.open("w", encoding="utf-16", newline="") as file:
                writer = csv.writer(file)
                writer.writerow(("Retail Branding", "Marketing Name", "Device", "Model"))
                writer.writerows(device_rows)
            result = subprocess.run(
                [sys.executable, str(SCRIPT), str(antenna_path), str(devices_path)],
                capture_output=True,
                text=True,
                check=True,
            )

        self.assertIn('"sm-a546b": ["top", "high"]', result.stdout)
        self.assertIn('"cph2061": ["top", "high"]', result.stdout)
        self.assertIn('"m2101k6g": ["top", "high"]', result.stdout)
        self.assertIn('"lly-nx1": ["top", "medium"]', result.stdout)
        self.assertNotIn('"a52": {', result.stdout)
        self.assertNotIn('"conflict": {', result.stdout)
        self.assertNotIn('"unknown-alias": {', result.stdout)
        self.assertIn("excluding 2 ambiguous pairs", result.stderr)


if __name__ == "__main__":
    unittest.main()
