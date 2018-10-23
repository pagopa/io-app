import { entries } from "lodash";
import { formatNumberAmount } from "../stringBuilder";

describe("amountBuilder", () => {
  it("should render amounts correctly", async () => {
    const values = {
      "10.00 €": 10,
      "0.30 €": 0.3,
      "0.12 €": 0.1 + 0.02,
      "100.99 €": 100.99,
      "102.00 €": 101.999999, // round to the appropriate 2-decimals number
      "10.50 €": 10.5001
    };
    entries(values).forEach(([k, v]: [string, number]) =>
      expect(formatNumberAmount(v)).toEqual(k)
    );
  });
});
