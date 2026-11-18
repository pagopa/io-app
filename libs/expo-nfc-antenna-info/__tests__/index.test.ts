jest.mock("react-native", () => ({
  Platform: {
    OS: "android",
    constants: { Model: "unknown" }
  }
}));

jest.mock("expo-modules-core", () => {
  const nativeModule = {
    getDevice: jest.fn(),
    getNfcAntennaInfo: jest.fn()
  };
  return { requireNativeModule: jest.fn(() => nativeModule) };
});

import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

import { getNfcAntennaPosition, type NfcAntennaInfoResult } from "../index";

const nativeModule = requireNativeModule<{
  getDevice: () => string;
  getNfcAntennaInfo: () => Promise<NfcAntennaInfoResult>;
}>("NfcAntennaInfo");
const mockGetDevice = jest.mocked(nativeModule.getDevice);
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

describe("getNfcAntennaPosition", () => {
  beforeEach(() => {
    jest.replaceProperty(Platform, "OS", "android");
    setModel("unknown");
    mockGetDevice.mockReturnValue("unknown");
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
    expect(mockGetDevice).not.toHaveBeenCalled();
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
      mockGetDevice.mockReturnValue("shiba");
      mockGetNfcAntennaInfo.mockResolvedValue(info);

      await expect(getNfcAntennaPosition()).resolves.toBeUndefined();
      expect(mockGetDevice).not.toHaveBeenCalled();
    }
  );

  test.each([
    { name: "unsupported Android version", code: "ERR_NFC_UNSUPPORTED_DEVICE" },
    { name: "missing adapter", code: "ERR_NFC_ADAPTER_UNAVAILABLE" },
    { name: "unavailable API data", code: "ERR_NFC_ANTENNA_INFO_UNAVAILABLE" }
  ])("falls back to the mapping for $name", async ({ code }) => {
    setModel("Pixel 8");
    mockGetDevice.mockReturnValue("shiba");
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
        device: "a54x",
        model: "SM-A546B",
        position: "top",
        confidence: "high"
      },
      {
        name: "medium confidence",
        device: "a12",
        model: "SM-A125F",
        position: "center",
        confidence: "medium"
      },
      {
        name: "low confidence",
        device: "a40",
        model: "SM-A405FN",
        position: "center",
        confidence: "low"
      },
      {
        name: "bottom position",
        device: "b5q",
        model: "SM-F731B",
        position: "bottom",
        confidence: "high"
      },
      {
        name: "native model code",
        device: "OP4F0BL1",
        model: "CPH2207",
        position: "top",
        confidence: "high"
      },
      {
        name: "native model code explicitly listed in parentheses",
        device: "OP4B9B",
        model: "CPH2021",
        position: "top",
        confidence: "medium"
      },
      {
        name: "individual model from a slash-separated CSV row",
        device: "OP5B05L1",
        model: "CPH2639",
        position: "top",
        confidence: "medium"
      },
      {
        name: "Redmi retail brand in the catalog",
        device: "sweet",
        model: "M2101K6G",
        position: "top",
        confidence: "high"
      },
      {
        name: "Huawei marketing name with a brand prefix",
        device: "HWMAR",
        model: "MAR-LX1A",
        position: "center",
        confidence: "medium"
      },
      {
        name: "different confidence on the same device",
        device: "OP4F97",
        model: "CPH2273",
        position: "top",
        confidence: "high"
      },
      {
        name: "case and whitespace normalization",
        device: "  LyNx  ",
        model: "  PiXeL 7a  ",
        position: "center",
        confidence: "high"
      }
    ])("preserves $name", async ({ device, model, position, confidence }) => {
      setModel(model);
      mockGetDevice.mockReturnValue(device);

      await expect(getNfcAntennaPosition()).resolves.toEqual({
        position,
        source: "mapping",
        confidence
      });
    });

    test.each([
      { name: "unknown model", device: "shiba", model: "Unknown phone" },
      { name: "empty model", device: "shiba", model: "" },
      { name: "unknown device", device: "unknown", model: "Pixel 8" },
      { name: "empty device", device: "", model: "Pixel 8" },
      { name: "unclassified CSV model", device: "hwane", model: "P20 lite" },
      {
        name: "wrong device for known model",
        device: "lynx",
        model: "Pixel 8"
      },
      { name: "model prefix", device: "shiba", model: "Pixel" },
      { name: "model suffix", device: "shiba", model: "Pixel 8 XL" },
      {
        name: "inherited device property",
        device: "constructor",
        model: "Pixel 8"
      },
      {
        name: "inherited model property",
        device: "shiba",
        model: "constructor"
      },
      { name: "another brand's A52", device: "A52", model: "A52" },
      {
        name: "ambiguous catalog identity",
        device: "curtana",
        model: "Redmi Note 9 Pro"
      }
    ])("returns undefined for $name", async ({ device, model }) => {
      setModel(model);
      mockGetDevice.mockReturnValue(device);

      await expect(getNfcAntennaPosition()).resolves.toBeUndefined();
    });

    it("identifies the Oppo A52 by both device and model", async () => {
      mockGetDevice.mockReturnValue("OP4C77L1");
      setModel("CPH2061");

      await expect(getNfcAntennaPosition()).resolves.toEqual({
        position: "top",
        source: "mapping",
        confidence: "high"
      });
    });

    it("propagates errors retrieving the device identifier", async () => {
      const error = new Error("Cannot read device identifier");
      mockGetDevice.mockImplementation(() => {
        throw error;
      });

      await expect(getNfcAntennaPosition()).rejects.toBe(error);
    });
  });

  it("propagates unexpected native errors instead of hiding them with the mapping", async () => {
    setModel("Pixel 8");
    const error = new Error("Native module failure");
    mockGetNfcAntennaInfo.mockRejectedValue(error);

    await expect(getNfcAntennaPosition()).rejects.toBe(error);
  });
});
