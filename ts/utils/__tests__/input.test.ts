import {
  CreditCardPan,
  CreditCardCVC,
  CreditCardExpirationYear,
  CreditCardExpirationMonth
} from "../input";

describe("CreditCardPan", () => {
  it("should accept valid PANs", () => {
    const data = [
      "123412341234123",
      "1234123412341234",
      "12341234123412341",
      "123412341234123412",
      "1234123412341234123"
    ];
    data.forEach(d => expect(CreditCardPan.is(d)).toBeTruthy());
  });

  it("should reject invalid PANs", () => {
    const data = [
      "1234 1234 1234 1234",
      "123412341234123*123",
      "12341234123412",
      "12341234123412341234"
    ];
    data.forEach(d => expect(CreditCardPan.is(d)).toBeFalsy());
  });
});

describe("CreditCardExpirationMonth", () => {
  it("should accept valid months", () => {
    const data = [
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
    const data = ["0", "00", "13", "1", "123", "!1", "1!", "001", "010"];
    data.forEach(d => {
      console.log(d);
      expect(CreditCardExpirationMonth.is(d)).toBeFalsy();
    });
  });
});

describe("CreditCardExpirationYear", () => {
  it("should accept valid years", () => {
    const data = ["17", "18", "29", "52", "99"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeTruthy());
  });

  it("should reject invalid years", () => {
    const data = ["170", "1", "*9", "5*"];
    data.forEach(d => expect(CreditCardExpirationYear.is(d)).toBeFalsy());
  });
});

describe("CreditCardCVC", () => {
  it("should accept valid CVCs", () => {
    const data = ["000", "1234"];
    data.forEach(d => expect(CreditCardCVC.is(d)).toBeTruthy());
  });

  it("should reject invalid CVCs", () => {
    const data = ["00", "12345", "01*", "123*"];
    data.forEach(d => expect(CreditCardCVC.is(d)).toBeFalsy());
  });
});
