import { getCieIdEnvironment } from "..";

describe("getCieIdEnvironment", () => {
  it("should target the preprod CieID app when UAT is enabled", () => {
    expect(getCieIdEnvironment(true)).toEqual("preprod");
  });

  it("should target the production CieID app when UAT is disabled", () => {
    expect(getCieIdEnvironment(false)).toEqual("production");
  });
});
