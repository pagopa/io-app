import { normalizedDiscountPercentage, isValidDiscount } from "../index";

describe("normalizedDiscountPercentage", () => {
  it("should return the discount as a string if within range", () => {
    expect(normalizedDiscountPercentage(50)).toBe("50");
  });

  it("should return '-' if the discount is out of range", () => {
    expect(normalizedDiscountPercentage(150)).toBe("-");
    expect(isValidDiscount(0)).toBe(false);
  });

  it("should return '-' if the discount is undefined", () => {
    expect(normalizedDiscountPercentage()).toBe("-");
  });
});

describe("isValidDiscount", () => {
  it("should return true if the discount is within range", () => {
    expect(isValidDiscount(50)).toBe(true);
  });

  it("should return false if the discount is out of range", () => {
    expect(isValidDiscount(150)).toBe(false);
    expect(isValidDiscount(0)).toBe(false);
  });

  it("should return false if the discount is undefined", () => {
    expect(isValidDiscount()).toBe(false);
  });
});
