import { isVersionAppSupported } from "../isVersionAppSupported";

describe("isVersionAppSupported", () => {
  it("è supportata", () => {
    expect(isVersionAppSupported("0.0.0", "1.2")).toEqual(true);
  });

  it("non è supportata", () => {
    expect(isVersionAppSupported("1.4.0", "1.2")).toEqual(false);
  });

  it("è supportata, perchè il valore è indefinito", () => {
    expect(isVersionAppSupported(undefined, "1.2")).toEqual(true);
  });
});
