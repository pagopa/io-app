import * as E from "fp-ts/lib/Either";
import { CodiceCatastale } from "../MunicipalityCodiceCatastale";

const validCodiceCatastale = "L719";
const invalidCodiceCatastale1 = "719L";
const invalidCodiceCatastale2 = "L71R";
const invalidCodiceCatastale3 = "";
const invalidCodiceCatastale4 = "L71RX";

describe("CodiceCatastale", () => {
  it("should recognize a valid CodiceCatastale", () => {
    expect(
      E.isRight(CodiceCatastale.decode(validCodiceCatastale))
    ).toBeTruthy();
  });
  it("should NOT recognize a malformed CodiceCatastale (1)", () => {
    expect(
      E.isRight(CodiceCatastale.decode(invalidCodiceCatastale1))
    ).toBeFalsy();
  });
  it("should NOT recognize a malformed CodiceCatastale (2)", () => {
    expect(
      E.isRight(CodiceCatastale.decode(invalidCodiceCatastale2))
    ).toBeFalsy();
  });
  it("should NOT recognize a malformed CodiceCatastale (3)", () => {
    expect(
      E.isRight(CodiceCatastale.decode(invalidCodiceCatastale4))
    ).toBeFalsy();
  });
  it("should NOT recognize an empty CodiceCatastale", () => {
    expect(
      E.isRight(CodiceCatastale.decode(invalidCodiceCatastale3))
    ).toBeFalsy();
  });
});
