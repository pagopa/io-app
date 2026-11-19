import type {
  NfcAntennaInfoResult,
  NfcAntennaPosition,
  NfcAntennaPositionInfo
} from "../types";

import { antennaMapping } from "./mapping";

const antennaPositions = ["top", "center", "bottom"] as const;
const antennaBandCount = antennaPositions.length;

/**
 * Maps each antenna to a vertical third; returns undefined for empty or invalid
 * geometry.
 */
export const getNfcAntennaBands = ({
  deviceHeight,
  deviceWidth,
  availableNfcAntennas
}: NfcAntennaInfoResult): ReadonlyArray<NfcAntennaPosition> | undefined => {
  if (
    !Number.isFinite(deviceHeight) ||
    !Number.isFinite(deviceWidth) ||
    deviceHeight <= 0 ||
    deviceWidth <= 0 ||
    availableNfcAntennas.length === 0 ||
    availableNfcAntennas.some(
      ({ locationX, locationY }) =>
        !Number.isFinite(locationX) ||
        !Number.isFinite(locationY) ||
        locationX <= 0 ||
        locationX > deviceWidth ||
        locationY <= 0 ||
        locationY > deviceHeight
    )
  ) {
    return undefined;
  }

  return availableNfcAntennas.map(({ locationY }) => {
    // Include the device's bottom edge in the last third.
    const band = Math.min(
      Math.floor((locationY / deviceHeight) * antennaBandCount),
      antennaBandCount - 1
    );
    return antennaPositions[band];
  });
};

/** Returns a high-confidence API position only when all antennas share a third. */
export const getNfcAntennaPositionFromBands = (
  bands: ReadonlyArray<NfcAntennaPosition>
): NfcAntennaPositionInfo | undefined => {
  const [position] = bands;
  return position && bands.every(band => band === position)
    ? { position, source: "api", confidence: "high" }
    : undefined;
};

/** Looks up a normalized brand/model pair, preserving the study's confidence. */
export const getMappedNfcAntennaPosition = ({
  brand,
  model
}: {
  brand: string;
  model: string;
}): NfcAntennaPositionInfo | undefined => {
  const key = `${brand.trim().toLowerCase()}|${model.trim().toLowerCase()}`;
  const entry = Object.hasOwn(antennaMapping, key)
    ? antennaMapping[key]
    : undefined;
  if (!entry) {
    return undefined;
  }
  const [position, confidence] = entry;
  return { position, source: "mapping", confidence };
};
