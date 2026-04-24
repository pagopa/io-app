import {
  getLuminance,
  hexToHsb,
  hexToHsl,
  hexToRgb,
  hsbToHex,
  hsbToHsl,
  hsbToRgb,
  hslToHex,
  hslToHsb,
  hslToRgb,
  rgbToHex,
  rgbToHsb,
  rgbToHsl
} from "../color";

describe("HEX conversions", () => {
  describe("hexToRgb", () => {
    it.each([
      ["#ffffff", [255, 255, 255]],
      ["#000000", [0, 0, 0]],
      ["#ff0000", [255, 0, 0]],
      ["#00ff00", [0, 255, 0]],
      ["#0000ff", [0, 0, 255]],
      ["ffffff", [255, 255, 255]],
      ["#Aa00fF", [170, 0, 255]]
    ])("converts %s", (hex, expected) => {
      expect(hexToRgb(hex)).toEqual(expected);
    });

    it.each(["#fff", "#fffff", "#gg0000", "hello", ""])(
      "returns undefined for invalid input %s",
      value => {
        expect(hexToRgb(value)).toBeUndefined();
      }
    );
  });

  describe("hexToHsl", () => {
    it.each([
      ["#ff0000", [0, 100, 50]],
      ["#00ff00", [120, 100, 50]],
      ["#0000ff", [240, 100, 50]],
      ["#ffffff", [0, 0, 100]],
      ["#000000", [0, 0, 0]]
    ])("converts %s", (hex, expected) => {
      expect(hexToHsl(hex)).toEqual(expected);
    });

    it("returns undefined for invalid hex", () => {
      expect(hexToHsl("invalid")).toBeUndefined();
    });
  });

  describe("hexToHsb", () => {
    it.each([
      ["#ff0000", [0, 100, 100]],
      ["#00ff00", [120, 100, 100]],
      ["#0000ff", [240, 100, 100]],
      ["#ffffff", [0, 0, 100]],
      ["#000000", [0, 0, 0]]
    ])("converts %s", (hex, expected) => {
      expect(hexToHsb(hex)).toEqual(expected);
    });

    it("returns undefined for invalid hex", () => {
      expect(hexToHsb("invalid")).toBeUndefined();
    });
  });
});

describe("RGB conversions", () => {
  describe("rgbToHex", () => {
    it.each([
      [[255, 255, 255], "#ffffff"],
      [[0, 0, 0], "#000000"],
      [[255, 0, 0], "#ff0000"],
      [[1, 15, 16], "#010f10"]
    ])("converts %p", (rgb, expected) => {
      expect(rgbToHex(rgb[0], rgb[1], rgb[2])).toBe(expected);
    });
  });

  describe("rgbToHsl", () => {
    it.each([
      [
        [255, 0, 0],
        [0, 100, 50]
      ],
      [
        [0, 255, 0],
        [120, 100, 50]
      ],
      [
        [0, 0, 255],
        [240, 100, 50]
      ],
      [
        [255, 255, 255],
        [0, 0, 100]
      ],
      [
        [0, 0, 0],
        [0, 0, 0]
      ],
      [
        [128, 128, 128],
        [0, 0, 50]
      ]
    ])("converts %p", (rgb, expected) => {
      expect(rgbToHsl(rgb[0], rgb[1], rgb[2])).toEqual(expected);
    });
  });

  describe("rgbToHsb", () => {
    it.each([
      [
        [255, 0, 0],
        [0, 100, 100]
      ],
      [
        [0, 255, 0],
        [120, 100, 100]
      ],
      [
        [0, 0, 255],
        [240, 100, 100]
      ],
      [
        [255, 255, 255],
        [0, 0, 100]
      ],
      [
        [0, 0, 0],
        [0, 0, 0]
      ],
      [
        [128, 128, 128],
        [0, 0, 50]
      ]
    ])("converts %p", (rgb, expected) => {
      expect(rgbToHsb(rgb[0], rgb[1], rgb[2])).toEqual(expected);
    });
  });
});

describe("HSL conversions", () => {
  describe("hslToRgb", () => {
    it.each([
      [
        [0, 100, 50],
        [255, 0, 0]
      ],
      [
        [120, 100, 50],
        [0, 255, 0]
      ],
      [
        [240, 100, 50],
        [0, 0, 255]
      ],
      [
        [0, 0, 100],
        [255, 255, 255]
      ],
      [
        [0, 0, 0],
        [0, 0, 0]
      ],
      [
        [360, 100, 50],
        [255, 0, 0]
      ],
      [
        [-120, 100, 50],
        [0, 0, 255]
      ]
    ])("converts %p", (hsl, expected) => {
      expect(hslToRgb(hsl[0], hsl[1], hsl[2])).toEqual(expected);
    });
  });

  describe("hslToHex", () => {
    it("converts to hex", () => {
      expect(hslToHex(0, 100, 50)).toBe("#ff0000");
      expect(hslToHex(120, 100, 50)).toBe("#00ff00");
      expect(hslToHex(240, 100, 50)).toBe("#0000ff");
    });
  });

  describe("hslToHsb", () => {
    it.each([
      [
        [0, 100, 50],
        [0, 100, 100]
      ],
      [
        [120, 100, 50],
        [120, 100, 100]
      ],
      [
        [240, 100, 50],
        [240, 100, 100]
      ],
      [
        [42, 0, 100],
        [0, 0, 100]
      ]
    ])("converts %p", (hsl, expected) => {
      expect(hslToHsb(hsl[0], hsl[1], hsl[2])).toEqual(expected);
    });
  });
});

describe("HSB conversions", () => {
  describe("hsbToRgb", () => {
    it.each([
      [
        [0, 100, 100],
        [255, 0, 0]
      ],
      [
        [120, 100, 100],
        [0, 255, 0]
      ],
      [
        [240, 100, 100],
        [0, 0, 255]
      ],
      [
        [0, 0, 100],
        [255, 255, 255]
      ],
      [
        [0, 0, 0],
        [0, 0, 0]
      ],
      [
        [360, 100, 100],
        [255, 0, 0]
      ],
      [
        [-120, 100, 100],
        [0, 0, 255]
      ]
    ])("converts %p", (hsb, expected) => {
      expect(hsbToRgb(hsb[0], hsb[1], hsb[2])).toEqual(expected);
    });
  });

  describe("hsbToHex", () => {
    it("converts to hex", () => {
      expect(hsbToHex(0, 100, 100)).toBe("#ff0000");
      expect(hsbToHex(120, 100, 100)).toBe("#00ff00");
      expect(hsbToHex(240, 100, 100)).toBe("#0000ff");
    });
  });

  describe("hsbToHsl", () => {
    it.each([
      [
        [0, 100, 100],
        [0, 100, 50]
      ],
      [
        [120, 100, 100],
        [120, 100, 50]
      ],
      [
        [240, 100, 100],
        [240, 100, 50]
      ],
      [
        [99, 0, 100],
        [0, 0, 100]
      ]
    ])("converts %p", (hsb, expected) => {
      expect(hsbToHsl(hsb[0], hsb[1], hsb[2])).toEqual(expected);
    });
  });
});

describe("cross-space consistency", () => {
  const samples: ReadonlyArray<readonly [number, number, number]> = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [12, 34, 56],
    [123, 45, 67],
    [255, 255, 255],
    [0, 0, 0]
  ];

  const expectRgbClose = (
    actual: ReadonlyArray<number>,
    expected: ReadonlyArray<number>,
    tolerance = 1
  ) => {
    expect(actual[0]).toBeGreaterThanOrEqual(expected[0] - tolerance);
    expect(actual[0]).toBeLessThanOrEqual(expected[0] + tolerance);
    expect(actual[1]).toBeGreaterThanOrEqual(expected[1] - tolerance);
    expect(actual[1]).toBeLessThanOrEqual(expected[1] + tolerance);
    expect(actual[2]).toBeGreaterThanOrEqual(expected[2] - tolerance);
    expect(actual[2]).toBeLessThanOrEqual(expected[2] + tolerance);
  };

  it("round-trips RGB -> HSL -> RGB", () => {
    for (const [r, g, b] of samples) {
      const [h, s, l] = rgbToHsl(r, g, b);
      expectRgbClose(hslToRgb(h, s, l), [r, g, b]);
    }
  });

  it("round-trips RGB -> HSB -> RGB", () => {
    for (const [r, g, b] of samples) {
      const [h, s, value] = rgbToHsb(r, g, b);
      expectRgbClose(hsbToRgb(h, s, value), [r, g, b]);
    }
  });
});

describe("getLuminance", () => {
  it("calculates known luminance values", () => {
    expect(getLuminance("#ffffff")).toBeCloseTo(1, 5);
    expect(getLuminance("#000000")).toBeCloseTo(0, 5);
    expect(getLuminance("#ff0000")).toBeCloseTo(0.2126, 4);
    expect(getLuminance("#00ff00")).toBeCloseTo(0.7152, 4);
    expect(getLuminance("#0000ff")).toBeCloseTo(0.0722, 4);
  });

  it("falls back to black luminance for invalid hex", () => {
    expect(getLuminance("invalid")).toBe(0);
  });
});
