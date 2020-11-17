import { entries } from "lodash";
import { Locales } from "../../../locales/locales";
import { setLocale } from "../../i18n";
import { formatNumberAmount } from "../stringBuilder";

const valuesEN = {
  "10.00": 10,
  "0.30": 0.3,
  "0.12": 0.1 + 0.02,
  "100.99": 100.99,
  "102.00": 101.999999, // round to the appropriate 2-decimals number
  "10.50": 10.5001,
  "1,000.50": 1000.5
};

beforeAll(() => setLocale("en" as Locales));

describe("amountBuilder", () => {
  it("should render amounts correctly for EN language", async () => {
    entries(valuesEN).forEach(([k, v]) =>
      expect(formatNumberAmount(v)).toEqual(k)
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

describe("amountBuilder", () => {
  it("should render amounts correctly for IT language", async () => {
    setLocale("it" as Locales);
    entries(valuesIT).forEach(([k, v]) =>
      expect(formatNumberAmount(v)).toEqual(k)
    );
  });
});
