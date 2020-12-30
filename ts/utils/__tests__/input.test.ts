import { fromNullable, none, some } from "fp-ts/lib/Option";
import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan,
  isValidExpirationDate,
  isValidPan,
  isValidSecurityCode
} from "../input";

describe("CreditCardPan", () => {
  const validPANs: ReadonlyArray<string> = [
    "123412341234123",
    "1234123412341234",
    "************1234",
    "12341234123412341",
    "123412341234123412",
    "1234123412341234123"
  ];

  it("should accept valid PANs", () => {
    validPANs.forEach(d => expect(CreditCardPan.is(d)).toBeTruthy());
  });

  it("should accept valid PANs, round 2", () => {
    validPANs.forEach(d => expect(isValidPan(some(d))).toBeTruthy());
  });

  const invalidPANs: ReadonlyArray<string> = [
    "1234 1234 1234 1234",
    "123412341234123_123",
    "12341234123412",
    "12341234123412341234"
  ];

  it("should reject invalid PANs", () => {
    invalidPANs.forEach(d => expect(CreditCardPan.is(d)).toBeFalsy());
  });

  it("should reject invalid PANs, round 2", () => {
    invalidPANs.forEach(d => expect(isValidPan(some(d))).toBeFalsy());
  });

  it("should be undefined", () => {
    expect(isValidPan(none)).not.toBeDefined();
  });
});

describe("CreditCardExpirationMonth", () => {
  it("should accept valid months", () => {
    const data: ReadonlyArray<any> = [
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
      "11",
      "12"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeTruthy());
  });

  it("should reject invalid months", () => {
    const data: ReadonlyArray<any> = [
      "0",
      "00",
      "13",
      "1",
      "123",
      "!1",
      "1!",
      "001",
      "010"
    ];
    data.forEach(d => expect(CreditCardExpirationMonth.is(d)).toBeFalsy());
  });
});

describe("CreditCardExpirationYear", () => {
  it("should accept valid years", () => {
    const data: ReadonlyArray<any> = ["17", "18", "29", "52", "99"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeTruthy());
  });

  it("should reject invalid years", () => {
    const data: ReadonlyArray<any> = ["170", "1", "*9", "5*"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeFalsy());
  });
});

describe("CreditCardExpirationDate", () => {
  it("should accept a valid expiration date", () => {
    expect(isValidExpirationDate(some("03/27"))).toBeTruthy();
  });

  it("should reject an invalid expiration date", () => {
    expect(isValidExpirationDate(some("3/27"))).toBeFalsy();
  });

  it("should be undefined", () => {
    expect(isValidExpirationDate(none)).not.toBeDefined();
  });
});

describe("CreditCardCVC", () => {
  const validCVCs: ReadonlyArray<string> = ["000", "1234"];

  it("should accept valid CVCs", () => {
    validCVCs.forEach(d => expect(CreditCardCVC.is(d)).toBeTruthy());
  });

  it("should accept valid CVCs, round 2", () => {
    validCVCs.forEach(d =>
      expect(isValidSecurityCode(fromNullable(d))).toBeTruthy()
    );
  });

  const invalidCVCs: ReadonlyArray<string> = ["00", "12345", "01*", "123*"];

  it("should reject invalid CVCs", () => {
    invalidCVCs.forEach(d => expect(CreditCardCVC.is(d)).toBeFalsy());
  });

  it("should reject invalid CVCs, round 2", () => {
    invalidCVCs.forEach(d => expect(isValidSecurityCode(some(d))).toBeFalsy());
  });
});
