jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    constants: { Model: "unknown", Brand: "unknown" }
  }
}));

jest.mock("expo-modules-core", () => {
  const nativeModule = {
    getNfcAntennaInfo: jest.fn()
  };
  return { requireNativeModule: jest.fn(() => nativeModule) };
});

import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import { getNfcAntennaPosition, type NfcAntennaInfoResult } from "../index";

const nativeModule = requireNativeModule<{
  getNfcAntennaInfo: () => Promise<NfcAntennaInfoResult>;
}>("NfcAntennaInfo");
const mockGetNfcAntennaInfo = jest.mocked(nativeModule.getNfcAntennaInfo);

const antennaInfo: NfcAntennaInfoResult = {
  deviceWidth: 75,
  deviceHeight: 150,
  isDeviceFoldable: false,
  availableNfcAntennas: [{ locationX: 35, locationY: 20 }]
};

const setModel = (model: string) => {
  if (Platform.OS === "android") {
    jest.replaceProperty(Platform.constants, "Model", model);
  }
};

const setBrand = (brand: string) => {
  if (Platform.OS === "android") {
    jest.replaceProperty(Platform.constants, "Brand", brand);
  }
};

describe("getNfcAntennaPosition", () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, "OS", "android");
    setModel("unknown");
    setBrand("unknown");
    mockGetNfcAntennaInfo.mockResolvedValue(antennaInfo);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it("returns undefined on iOS without accessing the native API or mapping", async () => {
    setModel("Pixel 8");
    jest.replaceProperty(Platform, "OS", "ios");

    await expect(getNfcAntennaPosition()).resolves.toBeUndefined();
    expect(mockGetNfcAntennaInfo).not.toHaveBeenCalled();
  });

  test.each([
    { name: "top edge", y: 0, position: "top" },
    { name: "end of top third", y: 49, position: "top" },
    { name: "start of center third", y: 50, position: "center" },
    { name: "end of center third", y: 99, position: "center" },
    { name: "start of bottom third", y: 100, position: "bottom" },
    { name: "bottom edge", y: 150, position: "bottom" }
  ])(
    "classifies the $name with high API confidence",
    async ({ y, position }) => {
      mockGetNfcAntennaInfo.mockResolvedValue({
        ...antennaInfo,
        availableNfcAntennas: [{ locationX: 35, locationY: y }]
      });

      await expect(getNfcAntennaPosition()).resolves.toEqual({
        position,
        source: "api",
        confidence: "high"
      });
    }
  );

  it("uses device millimeters, not display dimensions or fixed cutoffs", async () => {
    mockGetNfcAntennaInfo.mockResolvedValue({
      ...antennaInfo,
      deviceHeight: 300,
      availableNfcAntennas: [{ locationX: 35, locationY: 100 }]
    });

    await expect(getNfcAntennaPosition()).resolves.toEqual({
      position: "center",
      source: "api",
      confidence: "high"
    });
  });

  it("prefers API data over a conflicting model mapping", async () => {
    setModel("Pixel 7a");

    await expect(getNfcAntennaPosition()).resolves.toEqual({
      position: "top",
      source: "api",
      confidence: "high"
    });
  });

  it("classifies multiple antennas when all lie in the same third", async () => {
    mockGetNfcAntennaInfo.mockResolvedValue({
      ...antennaInfo,
      isDeviceFoldable: true,
      availableNfcAntennas: [
        { locationX: 0, locationY: 70 },
        { locationX: 75, locationY: 90 }
      ]
    });

    await expect(getNfcAntennaPosition()).resolves.toEqual({
      position: "center",
      source: "api",
      confidence: "high"
    });
  });

  test.each([
    { name: "zero height", info: { ...antennaInfo, deviceHeight: 0 } },
    { name: "negative height", info: { ...antennaInfo, deviceHeight: -1 } },
    {
      name: "infinite height",
      info: { ...antennaInfo, deviceHeight: Infinity }
    },
    { name: "NaN width", info: { ...antennaInfo, deviceWidth: NaN } },
    { name: "zero width", info: { ...antennaInfo, deviceWidth: 0 } },
    { name: "no antennas", info: { ...antennaInfo, availableNfcAntennas: [] } },
    ...[
      { name: "negative Y", locationX: 35, locationY: -1 },
      { name: "Y beyond the device", locationX: 35, locationY: 151 },
      { name: "NaN Y", locationX: 35, locationY: NaN },
      { name: "infinite Y", locationX: 35, locationY: Infinity },
      { name: "negative X", locationX: -1, locationY: 20 },
      { name: "X beyond the device", locationX: 76, locationY: 20 },
      { name: "NaN X", locationX: NaN, locationY: 20 }
    ].map(({ name, locationX, locationY }) => ({
      name,
      info: {
        ...antennaInfo,
        availableNfcAntennas: [{ locationX, locationY }]
      }
    })),
    {
      name: "antennas in different thirds",
      info: {
        ...antennaInfo,
        availableNfcAntennas: [
          { locationX: 35, locationY: 20 },
          { locationX: 35, locationY: 80 }
        ]
      }
    },
    {
      name: "one invalid antenna among valid antennas",
      info: {
        ...antennaInfo,
        availableNfcAntennas: [
          { locationX: 35, locationY: 20 },
          { locationX: 35, locationY: -1 }
        ]
      }
    }
  ])(
    "returns undefined for $name without using the mapping",
    async ({ info }) => {
      setModel("Pixel 8");
      setBrand("Google");
      mockGetNfcAntennaInfo.mockResolvedValue(info);

      await expect(getNfcAntennaPosition()).resolves.toBeUndefined();
    }
  );

  test.each([
    { name: "unsupported Android version", code: "ERR_NFC_UNSUPPORTED_DEVICE" },
    { name: "missing adapter", code: "ERR_NFC_ADAPTER_UNAVAILABLE" },
    { name: "unavailable API data", code: "ERR_NFC_ANTENNA_INFO_UNAVAILABLE" }
  ])("falls back to the mapping for $name", async ({ code }) => {
    setModel("Pixel 8");
    setBrand("Google");
    mockGetNfcAntennaInfo.mockRejectedValue(
      Object.assign(new Error("Unavailable"), { code })
    );

    await expect(getNfcAntennaPosition()).resolves.toEqual({
      position: "top",
      source: "mapping",
      confidence: "high"
    });
  });

  describe("model mapping", () => {
    beforeEach(() => {
      mockGetNfcAntennaInfo.mockRejectedValue({
        code: "ERR_NFC_ANTENNA_INFO_UNAVAILABLE"
      });
    });

    test.each([
      {
        name: "high confidence",
        brand: "Samsung",
        model: "SM-A546B",
        position: "top",
        confidence: "high"
      },
      {
        name: "medium confidence",
        brand: "Samsung",
        model: "SM-A125F",
        position: "center",
        confidence: "medium"
      },
      {
        name: "low confidence",
        brand: "Samsung",
        model: "SM-A405FN",
        position: "center",
        confidence: "low"
      },
      {
        name: "bottom position",
        brand: "Samsung",
        model: "SM-F731B",
        position: "bottom",
        confidence: "high"
      },
      {
        name: "native model code",
        brand: "Oppo",
        model: "CPH2207",
        position: "top",
        confidence: "high"
      },
      {
        name: "native model code explicitly listed in parentheses",
        brand: "Oppo",
        model: "CPH2021",
        position: "top",
        confidence: "medium"
      },
      {
        name: "individual model from a slash-separated CSV row",
        brand: "Oppo",
        model: "CPH2639",
        position: "top",
        confidence: "medium"
      },
      {
        name: "Redmi retail brand in the catalog",
        brand: "Redmi",
        model: "M2101K6G",
        position: "top",
        confidence: "high"
      },
      {
        name: "Huawei marketing name with a brand prefix",
        brand: "Huawei",
        model: "MAR-LX1A",
        position: "center",
        confidence: "medium"
      },
      {
        name: "different confidence for a model",
        brand: "Oppo",
        model: "CPH2273",
        position: "top",
        confidence: "high"
      },
      {
        name: "case and whitespace normalization",
        brand: "  GoOgLe  ",
        model: "  PiXeL 7a  ",
        position: "center",
        confidence: "high"
      }
    ])("preserves $name", async ({ brand, model, position, confidence }) => {
      setModel(model);
      setBrand(brand);

      await expect(getNfcAntennaPosition()).resolves.toEqual({
        position,
        source: "mapping",
        confidence
      });
    });

    test.each([
      { name: "unknown model", brand: "Google", model: "Unknown phone" },
      { name: "empty model", brand: "Google", model: "" },
      { name: "unknown brand", brand: "unknown", model: "Pixel 8" },
      { name: "empty brand", brand: "", model: "Pixel 8" },
      { name: "unclassified CSV model", brand: "Huawei", model: "P20 lite" },
      {
        name: "wrong brand for known model",
        brand: "Samsung",
        model: "Pixel 8"
      },
      { name: "model prefix", brand: "Google", model: "Pixel" },
      { name: "model suffix", brand: "Google", model: "Pixel 8 XL" },
      {
        name: "inherited brand property",
        brand: "constructor",
        model: "Pixel 8"
      },
      {
        name: "inherited model property",
        brand: "Google",
        model: "constructor"
      },
      { name: "another brand's A52", brand: "Blackview", model: "A52" },
      {
        name: "ambiguous catalog identity",
        brand: "Redmi",
        model: "Redmi Note 9 Pro"
      }
    ])("returns undefined for $name", async ({ brand, model }) => {
      setModel(model);
      setBrand(brand);

      await expect(getNfcAntennaPosition()).resolves.toBeUndefined();
    });

    it("identifies the Oppo A52 by brand and model", async () => {
      setBrand("Oppo");
      setModel("CPH2061");

      await expect(getNfcAntennaPosition()).resolves.toEqual({
        position: "top",
        source: "mapping",
        confidence: "high"
      });
    });
  });

  it("propagates unexpected native errors instead of hiding them with the mapping", async () => {
    setModel("Pixel 8");
    const error = new Error("Native module failure");
    mockGetNfcAntennaInfo.mockRejectedValue(error);

    await expect(getNfcAntennaPosition()).rejects.toBe(error);
  });
});
