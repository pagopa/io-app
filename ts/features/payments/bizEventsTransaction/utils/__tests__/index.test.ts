import { calculateTotalAmount, formatAmountText, getPayerInfoLabel } from "..";

describe("formatAmountText", () => {
  it('should format "1.000,00" as "1.000,00 €"', () => {
    const result = formatAmountText("1.000,00");
    expect(result).toBe("1.000,00 €");
  });

  it('should fotmat "10,00" as "10,00 €"', () => {
    const result = formatAmountText("10,00");
    expect(result).toBe("10,00 €");
  });

  it('should format "40,25" as "40,25 €"', () => {
    const result = formatAmountText("40,25");
    expect(result).toBe("40,25 €");
  });

  it('should format "1.000,12" as "1.000,12 €"', () => {
    const result = formatAmountText("1.000,12");
    expect(result).toBe("1.000,12 €");
  });

  it('should format "1.000.10" as "1.000,10 €"', () => {
    const result = formatAmountText("1.000,10");
    expect(result).toBe("1.000,10 €");
  });

  it('should format "1.117,88" as "1.117,88 €"', () => {
    const result = formatAmountText("1.117,88");
    expect(result).toBe("1.117,88 €");
  });

  it('should format "-1.000.00" as "-1.000,00 €"', () => {
    const result = formatAmountText("-1.000,00");
    expect(result).toBe("-1.000,00 €");
  });

  it('should format "1.000,00" as "1.000,00 €"', () => {
    const result = formatAmountText("1.000,00");
    expect(result).toBe("1.000,00 €");
  });

  it('should return empty string for "abcd"', () => {
    const result = formatAmountText("abcd");
    expect(result).toBe("");
  });

  it("should return empty string for empty string", () => {
    const result = formatAmountText("");
    expect(result).toBe("");
  });
});

describe("getPayerInfoLabel", () => {
  it("should return an empty string if payer is undefined", () => {
    const result = getPayerInfoLabel(undefined);
    expect(result).toBe("");
  });

  it("should return only the name if taxCode is not provided", () => {
    const payer = { name: "John Doe" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe");
  });

  it("should return only the taxCode if name is not provided", () => {
    const payer = { taxCode: "123456789" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("(123456789)");
  });

  it("should return name and taxCode formatted correctly", () => {
    const payer = { name: "John Doe", taxCode: "123456789" };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe\n(123456789)");
  });

  it("should return an empty string if both name and taxCode are not provided", () => {
    const payer = {};
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("");
  });

  it("should trim extra spaces", () => {
    const payer = { name: "  John Doe  ", taxCode: "  123456789  " };
    const result = getPayerInfoLabel(payer);
    expect(result).toBe("John Doe\n(123456789)");
  });
});

describe("calculateTotalAmount", () => {
  it("should return undefined if transactionInfo is undefined", () => {
    const result = calculateTotalAmount(undefined);
    expect(result).toBeUndefined();
  });

  it("should return undefined if amount is not provided", () => {
    const transactionInfo = { fee: "2.50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return undefined if fee is not provided", () => {
    const transactionInfo = { amount: "10.00" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return the correct total amount for valid input with dot as decimal separator", () => {
    const transactionInfo = { amount: "10.00", fee: "2.50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should return the correct total amount for valid input with comma as decimal separator", () => {
    const transactionInfo = { amount: "10,00", fee: "2,50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should handle large numbers correctly", () => {
    const transactionInfo = { amount: "1000000.50", fee: "2000000.25" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("3000000.75");
  });

  it("should handle negative values correctly", () => {
    const transactionInfo = { amount: "-10.00", fee: "2.50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("-7.50");
  });

  it("should return undefined for non-numeric values", () => {
    const transactionInfo = { amount: "abc", fee: "2.50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return undefined for NaN results", () => {
    const transactionInfo = { amount: "NaN", fee: "2.50" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should return undefined if amount and fee are empty strings", () => {
    const transactionInfo = { amount: "", fee: "" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBeUndefined();
  });

  it("should handle trailing and leading spaces in input", () => {
    const transactionInfo = { amount: " 10.00 ", fee: " 2.50 " };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("12.50");
  });

  it("should handle very small numbers", () => {
    const transactionInfo = { amount: "0.0001", fee: "0.0002" };
    const result = calculateTotalAmount(transactionInfo);
    expect(result).toBe("0.00");
  });
});
