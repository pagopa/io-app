import {
  CardGradient,
  getCardBackgroundImage,
  getDecodedAndroidAssetScale,
  getPatternTileStyle,
  supportsMixBlendMode
} from "../backgroundUtils";

describe("getCardBackgroundImage", () => {
  test.each<{
    background: CardGradient;
    expected: ReturnType<typeof getCardBackgroundImage>;
    name: string;
  }>([
    {
      name: "linear gradient with evenly distributed stops",
      background: {
        type: "linear",
        colors: ["#EAF6FF", "#F6FBFF", "#F9F9F9"],
        angle: 0
      },
      expected: [
        {
          type: "linear-gradient",
          direction: "0deg",
          colorStops: [
            { color: "#EAF6FF", positions: ["0%"] },
            { color: "#F6FBFF", positions: ["50%"] },
            { color: "#F9F9F9", positions: ["100%"] }
          ]
        }
      ]
    },
    {
      name: "linear gradient with explicit stops",
      background: {
        type: "linear",
        colors: ["#EAF6FF", "#F6FBFF", "#EAF6FF"],
        positions: [0.0349, 0.4887, 0.9425],
        angle: 217
      },
      expected: [
        {
          type: "linear-gradient",
          direction: "217deg",
          colorStops: [
            { color: "#EAF6FF", positions: ["3.49%"] },
            { color: "#F6FBFF", positions: ["48.87%"] },
            { color: "#EAF6FF", positions: ["94.25%"] }
          ]
        }
      ]
    },
    {
      name: "linear gradient with stops out of range or out of order",
      background: {
        type: "linear",
        colors: ["#401B37", "#290744", "#2A0A2A", "#370945"],
        positions: [0.5, 0.3726, 0.6722, 1.026],
        angle: 249
      },
      expected: [
        {
          type: "linear-gradient",
          direction: "249deg",
          colorStops: [
            { color: "#401B37", positions: ["50%"] },
            { color: "#290744", positions: ["50%"] },
            { color: "#2A0A2A", positions: ["67.22%"] },
            { color: "#370945", positions: ["100%"] }
          ]
        }
      ]
    },
    {
      name: "radial gradient",
      background: {
        type: "radial",
        colors: ["#E5F0F7", "#D6DDE2", "#DFE9EF", "#C7D0DB"],
        positions: [0, 0.2223, 0.4999, 1],
        center: [1, 0.195],
        radius: 1.0564
      },
      expected:
        "radial-gradient(ellipse 105.64% 169.024% at 100% 19.5%, #E5F0F7 0%, #D6DDE2 22.23%, #DFE9EF 49.99%, #C7D0DB 100%)"
    }
  ])("should map a $name", ({ background, expected }) => {
    expect(getCardBackgroundImage(background)).toEqual(expected);
  });
});

describe("supportsMixBlendMode", () => {
  test.each([
    { name: "iOS", os: "ios" as const, version: "18.0", expected: true },
    { name: "Android 10", os: "android" as const, version: 29, expected: true },
    { name: "Android 9", os: "android" as const, version: 28, expected: false }
  ])("should be $expected on $name", ({ os, version, expected }) => {
    expect(supportsMixBlendMode(os, version)).toBe(expected);
  });
});

describe("getPatternTileStyle", () => {
  test.each([
    {
      name: "Android with a denser asset than the screen",
      os: "android" as const,
      pixelRatio: 2.625,
      assetScale: 3,
      scale: 0.875
    },
    {
      name: "Android with an asset matching the screen",
      os: "android" as const,
      pixelRatio: 3,
      assetScale: 3,
      scale: 1
    },
    {
      name: "Android with a screen denser than the asset",
      os: "android" as const,
      pixelRatio: 3.5,
      assetScale: 3,
      scale: 3.5 / 3
    },
    {
      name: "iOS",
      os: "ios" as const,
      pixelRatio: 3,
      assetScale: 2,
      scale: 1
    }
  ])(
    "should scale the tiles by $scale on $name",
    ({ os, pixelRatio, assetScale, scale }) => {
      expect(getPatternTileStyle(os, pixelRatio, assetScale)).toEqual({
        position: "absolute",
        top: 0,
        left: 0,
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transformOrigin: "top left",
        transform: [{ scale }]
      });
    }
  );
});

describe("getDecodedAndroidAssetScale", () => {
  const resource = { uri: "img_pattern_identity", scale: 3 };
  const devServerAsset = {
    uri: "http://localhost:8081/assets/identity.png",
    scale: 3
  };

  test.each([
    {
      name: "Android 12 on a 190 dpi screen",
      version: 32,
      pixelRatio: 1.1875,
      asset: resource,
      expected: 1
    },
    {
      name: "Android 12 on a 200 dpi screen",
      version: 32,
      pixelRatio: 1.25,
      asset: resource,
      expected: 2
    },
    {
      name: "Android 12 on a 340 dpi screen",
      version: 32,
      pixelRatio: 2.125,
      asset: resource,
      expected: 2
    },
    {
      name: "Android 12 on a 380 dpi screen",
      version: 32,
      pixelRatio: 2.375,
      asset: resource,
      expected: 3
    },
    {
      name: "Android 12 on a 640 dpi screen",
      version: 32,
      pixelRatio: 4,
      asset: resource,
      expected: 3
    },
    {
      name: "Android 13 on a 340 dpi screen",
      version: 33,
      pixelRatio: 2.125,
      asset: resource,
      expected: 3
    },
    {
      name: "the dev server on a 340 dpi screen",
      version: 32,
      pixelRatio: 2.125,
      asset: devServerAsset,
      expected: 3
    }
  ])(
    "should be $expected on $name",
    ({ version, pixelRatio, asset, expected }) => {
      expect(getDecodedAndroidAssetScale(version, pixelRatio, asset)).toBe(
        expected
      );
    }
  );
});
