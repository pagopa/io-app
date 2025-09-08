import { entries } from "lodash";
import { Locales } from "../../../locales/locales";
import {
  formatIntegerNumber,
  formatNumberAmount,
  formatNumberWithNoDigits
} from "../stringBuilder";
import { setLocale } from "../../i18n";

const valuesEN = {
  "10.00": 10,
  "0.30": 0.3,
  "0.12": 0.1 + 0.02,
  "100.99": 100.99,
  "102.00": 101.999999, // round to the appropriate 2-decimals number
  "10.50": 10.5001,
  "1,000.50": 1000.5
};

const valuesEN2 = {
  "10": 10,
  "0": 0.3,
  "101": 100.99,
  "102": 101.999999, // round to the appropriate 2-decimals number
  "11": 10.5001,
  "1,001": 1000.5
};

beforeAll(() => setLocale("en" as Locales));

describe("amountBuilder", () => {
  it("should render amounts correctly for EN language", async () => {
    entries(valuesEN).forEach(([k, v]) =>
      expect(formatNumberAmount(v)).toEqual(k)
    );
    entries(valuesEN2).forEach(([k, v]) =>
      expect(formatNumberWithNoDigits(v)).toEqual(k)
    );
  });
});

const valuesIT = {
  "10,00": 10,
  "0,30": 0.3,
  "0,12": 0.1 + 0.02,
  "100,99": 100.99,
  "102,00": 101.999999, // round to the appropriate 2-decimals number
  "10,50": 10.5001,
  "1.000,50": 1000.5
};

const valuesIT2 = {
  "10": 10,
  "0": 0.3,
  "101": 100.99,
  "102": 101.999999,
  "11": 10.5001,
  "1.001": 1000.5
};

describe("amountBuilder", () => {
  it("should render amounts correctly for IT language", async () => {
    setLocale("it" as Locales);
    entries(valuesIT).forEach(([k, v]) =>
      expect(formatNumberAmount(v)).toEqual(k)
    );
    entries(valuesIT2).forEach(([k, v]) =>
      expect(formatNumberWithNoDigits(v)).toEqual(k)
    );
  });
});

describe("formatIntegerNumber", () => {
  it("should render integer number correctly for IT language", async () => {
    setLocale("it" as Locales);
    expect(formatIntegerNumber(1000000)).toEqual("1.000.000");
    expect(formatIntegerNumber(100000)).toEqual("100.000");
    expect(formatIntegerNumber(10000)).toEqual("10.000");
    expect(formatIntegerNumber(1000)).toEqual("1.000");
    expect(formatIntegerNumber(100)).toEqual("100");
    expect(formatIntegerNumber(10)).toEqual("10");
    expect(formatIntegerNumber(1)).toEqual("1");
    expect(formatIntegerNumber(1000000.1)).toEqual("1.000.000");
  });
  it("should render integer number correctly for EN language", async () => {
    setLocale("en" as Locales);
    expect(formatIntegerNumber(1000000)).toEqual("1,000,000");
    expect(formatIntegerNumber(100000)).toEqual("100,000");
    expect(formatIntegerNumber(10000)).toEqual("10,000");
    expect(formatIntegerNumber(1000)).toEqual("1,000");
    expect(formatIntegerNumber(100)).toEqual("100");
    expect(formatIntegerNumber(10)).toEqual("10");
    expect(formatIntegerNumber(1)).toEqual("1");
    expect(formatIntegerNumber(1000000.1)).toEqual("1,000,000");
  });
});
