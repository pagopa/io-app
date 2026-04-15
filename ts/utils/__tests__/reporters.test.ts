import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
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
    expect(E.isRight(decodeValue)).toBeFalsy();
    if (E.isLeft(decodeValue)) {
      // expect error report does not contains sensible data
      const errorReport = readableReport(decodeValue.left);
      expect(errorReport).toMatch("123456");
      expect(errorReport).toMatch("36");
    }
  });
  it("should report a plain text error without any sensible data", () => {
    const decodeValue = Person.decode(sensibleInvalidData);
    // decoding should fail because sensibleInvalidData has 2 wrong type fields
    expect(E.isRight(decodeValue)).toBeFalsy();
    if (E.isLeft(decodeValue)) {
      // expect error report does not contains sensible data
      const errorPrivacyReport = readablePrivacyReport(decodeValue.left);
      expect(errorPrivacyReport).not.toMatch("123456");
      expect(errorPrivacyReport).not.toMatch("36");
    }
  });
});
