import { hexToRgb, getLuminance } from "../color";

describe("hexToRgb", () => {
  it("should convert hex color to RGB object", () => {
    expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(hexToRgb("#00ff00")).toEqual({ r: 0, g: 255, b: 0 });
    expect(hexToRgb("#0000ff")).toEqual({ r: 0, g: 0, b: 255 });
    expect(hexToRgb("ffffff")).toEqual({ r: 255, g: 255, b: 255 });
  });
});

describe("getLuminance", () => {
  it("should calculate luminance for white", () => {
    expect(getLuminance("#ffffff")).toBeCloseTo(1, 5);
  });
  it("should calculate luminance for black", () => {
    expect(getLuminance("#000000")).toBeCloseTo(0, 5);
  });
  it("should calculate luminance for red", () => {
    expect(getLuminance("#ff0000")).toBeCloseTo(0.2126, 4);
  });
  it("should calculate luminance for green", () => {
    expect(getLuminance("#00ff00")).toBeCloseTo(0.7152, 4);
  });
  it("should calculate luminance for blue", () => {
    expect(getLuminance("#0000ff")).toBeCloseTo(0.0722, 4);
  });
});
