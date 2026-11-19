import type { NfcAntennaInfoResult, NfcAntennaPosition } from "../../types";

import {
  getMappedNfcAntennaPosition,
  getNfcAntennaBands,
  getNfcAntennaPositionFromBands
} from "../index";

const antennaInfo: NfcAntennaInfoResult = {
  deviceWidth: 75,
  deviceHeight: 150,
  isDeviceFoldable: false,
  availableNfcAntennas: [
    { locationX: 35, locationY: 49 },
    { locationX: 35, locationY: 50 },
    { locationX: 35, locationY: 100 },
    { locationX: 75, locationY: 150 }
  ]
};

describe("getNfcAntennaBands", () => {
  it("classifies each antenna independently, including third boundaries and the bottom edge", () => {
    expect(getNfcAntennaBands(antennaInfo)).toEqual([
      "top",
      "center",
      "bottom",
      "bottom"
    ]);
  });

  test.each([
    { name: "invalid dimensions", info: { ...antennaInfo, deviceHeight: 0 } },
    { name: "no antennas", info: { ...antennaInfo, availableNfcAntennas: [] } },
    {
      name: "one invalid antenna among valid antennas",
      info: {
        ...antennaInfo,
        availableNfcAntennas: [
          ...antennaInfo.availableNfcAntennas,
          { locationX: 0, locationY: 20 }
        ]
      }
    }
  ])("returns undefined for $name", ({ info }) => {
    expect(getNfcAntennaBands(info)).toBeUndefined();
  });
});

describe("getNfcAntennaPositionFromBands", () => {
  test.each<{
    bands: ReadonlyArray<NfcAntennaPosition>;
    name: string;
    position: NfcAntennaPosition | undefined;
  }>([
    { name: "one antenna", bands: ["top"], position: "top" },
    {
      name: "antennas in the same third",
      bands: ["center", "center"],
      position: "center"
    },
    {
      name: "antennas spanning different thirds",
      bands: ["top", "bottom"],
      position: undefined
    },
    { name: "no antennas", bands: [], position: undefined }
  ])("resolves $name", ({ bands, position }) => {
    expect(getNfcAntennaPositionFromBands(bands)).toEqual(
      position ? { position, source: "api", confidence: "high" } : undefined
    );
  });
});

describe("getMappedNfcAntennaPosition", () => {
  it("normalizes the brand and model without native platform access", () => {
    expect(
      getMappedNfcAntennaPosition({ brand: " GoOgLe ", model: " PiXeL 7a " })
    ).toEqual({ position: "center", source: "mapping", confidence: "high" });
  });

  it("does not match the same model under a different brand", () => {
    expect(
      getMappedNfcAntennaPosition({ brand: "Samsung", model: "Pixel 7a" })
    ).toBeUndefined();
  });
});
