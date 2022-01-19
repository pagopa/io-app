import { computedProp } from "../utils";

describe("computedProp", () => {
  it("should create an object correctly", () => {
    expect(computedProp("key", "value")).toMatchObject({ key: "value" });
  });
});
