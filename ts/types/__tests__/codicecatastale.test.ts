import { CodiceCatastale } from "../MunicipalityCodiceCatastale";

const validCodiceCatastale = "L719";
const invalidCodiceCatastale1 = "719L";
const invalidCodiceCatastale2 = "L71R";
const invalidCodiceCatastale3 = "";
const invalidCodiceCatastale4 = "L71RX";

describe("CodiceCatastale", () => {
  it("should recognize a valid CodiceCatastale", () => {
    expect(CodiceCatastale.decode(validCodiceCatastale).isRight()).toBeTruthy();
  });
  it("should NOT recognize a malformed CodiceCatastale (1)", () => {
    expect(
      CodiceCatastale.decode(invalidCodiceCatastale1).isRight()
    ).toBeFalsy();
  });
  it("should NOT recognize a malformed CodiceCatastale (2)", () => {
    expect(
      CodiceCatastale.decode(invalidCodiceCatastale2).isRight()
    ).toBeFalsy();
  });
  it("should NOT recognize a malformed CodiceCatastale (3)", () => {
    expect(
      CodiceCatastale.decode(invalidCodiceCatastale4).isRight()
    ).toBeFalsy();
  });
  it("should NOT recognize an empty CodiceCatastale", () => {
    expect(
      CodiceCatastale.decode(invalidCodiceCatastale3).isRight()
    ).toBeFalsy();
  });
});
