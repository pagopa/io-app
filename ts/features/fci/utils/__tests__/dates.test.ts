import { daysBetweenDate } from "../dates";

describe("Test dates utils", () => {
  describe("Test daysBetweenDays", () => {
    it("should return 0 if the two dates are the same", () => {
      const date = new Date();
      expect(daysBetweenDate(date, date)).toBe(0);
    });
    it("should return 1 if the two dates are consecutive", () => {
      const date = new Date();
      expect(
        daysBetweenDate(new Date(), new Date(date.setDate(date.getDate() + 1)))
      ).toBe(1);
    });
    it("should return 2 if the two dates are two days apart", () => {
      const date = new Date();
      expect(
        daysBetweenDate(new Date(), new Date(date.setDate(date.getDate() + 2)))
      ).toBe(2);
    });
  });
});
