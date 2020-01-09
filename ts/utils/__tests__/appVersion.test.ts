import { isVersionAppSupported } from "../appVersion";

describe("appVersion", () => {
  it("is supported", () => {
    expect(isVersionAppSupported("0.0.0", "1.2")).toEqual(true);
  });

  it("is not supported", () => {
    expect(isVersionAppSupported("1.4.5", "1.4.1")).toEqual(false);
  });

  it("is not supported", () => {
    expect(isVersionAppSupported("5", "1.4.1")).toEqual(false);
  });

  it("is not supported", () => {
    expect(isVersionAppSupported("3.0", "1.4.1")).toEqual(false);
  });

  it("If the backend-info is not available (es. request http error) continue to use app", () => {
    expect(isVersionAppSupported(undefined, "1.2")).toEqual(true);
  });
});
