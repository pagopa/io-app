import { z } from "zod";

import type {
  NfcAntennaInfoResult,
  NfcAntennaPosition,
  NfcAntennaPositionInfo
} from "../types";

import { antennaMapping } from "./mapping";

const antennaPositions = ["top", "center", "bottom"] as const;
const antennaBandCount = antennaPositions.length;

const nfcAntennaGeometrySchema = z
  .object({
    deviceHeight: z.number().positive(),
    deviceWidth: z.number().positive(),
    availableNfcAntennas: z
      .array(
        z.object({
          locationX: z.number().positive(),
          locationY: z.number().positive()
        })
      )
      .nonempty()
  })
  .refine(({ deviceHeight, deviceWidth, availableNfcAntennas }) =>
    availableNfcAntennas.every(
      ({ locationX, locationY }) =>
        locationX <= deviceWidth && locationY <= deviceHeight
    )
  );

/**
 * Maps each antenna to a vertical third; returns undefined for empty or invalid
 * geometry.
 */
export const getNfcAntennaBands = (
  info: NfcAntennaInfoResult
): ReadonlyArray<NfcAntennaPosition> | undefined => {
  const result = nfcAntennaGeometrySchema.safeParse(info);
  if (!result.success) {
    return undefined;
  }

  const { deviceHeight, availableNfcAntennas } = result.data;
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
