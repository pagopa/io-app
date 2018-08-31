import {
  CreditCardCVC,
  CreditCardExpirationMonth,
  CreditCardExpirationYear,
  CreditCardPan
} from "../input";

describe("CreditCardPan", () => {
  it("should accept valid PANs", () => {
    const data: ReadonlyArray<any> = [
      "123412341234123",
      "1234123412341234",
      "************1234",
      "12341234123412341",
      "123412341234123412",
      "1234123412341234123"
    ];
    data.forEach(d => expect(CreditCardPan.is(d)).toBeTruthy());
  });

  it("should reject invalid PANs", () => {
    const data: ReadonlyArray<any> = [
      "1234 1234 1234 1234",
      "123412341234123_123",
      "12341234123412",
      "12341234123412341234"
    ];
    data.forEach(d => expect(CreditCardPan.is(d)).toBeFalsy());
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

describe("CreditCardCVC", () => {
  it("should accept valid CVCs", () => {
    const data: ReadonlyArray<any> = ["000", "1234"];
    data.forEach(d => expect(CreditCardCVC.is(d)).toBeTruthy());
  });

  it("should reject invalid CVCs", () => {
    const data: ReadonlyArray<any> = ["00", "12345", "01*", "123*"];
    data.forEach(d => expect(CreditCardCVC.is(d)).toBeFalsy());
  });
});
