import * as t from "io-ts";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { readablePrivacyReport } from "../reporters";

const Person = t.type({ name: t.string, age: t.number, secret: t.string });
type Person = t.TypeOf<typeof Person>;

const sensibleInvalidData = {
  name: "John",
  secret: 123456,
  age: "36"
};

describe("privacy Report", () => {
  it("should report a plain text error with sensible data", () => {
    const decodeValue = Person.decode(sensibleInvalidData);
    // decoding should fail because sensibleInvalidData has 2 wrong type fields
    expect(decodeValue.isRight()).toBeFalsy();
    if (decodeValue.isLeft()) {
      // check error report contains sensible data
      const errorReport = readableReport(decodeValue.value);
      expect(errorReport).toMatch("123456");
      expect(errorReport).toMatch("36");

      const errorPrivacyReport = readablePrivacyReport(decodeValue.value);
      expect(errorPrivacyReport).not.toMatch("123456");
      expect(errorPrivacyReport).not.toMatch("36");
    }
  });
});
