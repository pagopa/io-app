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
    it("should return 3 if the two dates are three days apart", () => {
      const date = new Date();
      expect(
        daysBetweenDate(new Date(), new Date(date.setDate(date.getDate() + 3)))
      ).toBe(3);
    });
    it("should return 30 if the two dates are 30 days apart", () => {
      const date = new Date();
      expect(
        daysBetweenDate(new Date(), new Date(date.setDate(date.getDate() + 30)))
      ).toBe(30);
    });
    it("should return 1 with 28th February and 29th February ", () => {
      const secondDay = new Date("2020-02-29");
      const firstDay = new Date("2020-02-28");
      expect(daysBetweenDate(firstDay, secondDay)).toBe(1);
      expect(daysBetweenDate(secondDay, firstDay)).toBe(1);
    });
    it("should return 14 days with two dates in a leap year between 20 February and 5 March", () => {
      const secondDay = new Date("2020-02-20");
      const firstDay = new Date("2020-03-5");
      expect(daysBetweenDate(firstDay, secondDay)).toBe(14);
      expect(daysBetweenDate(secondDay, firstDay)).toBe(14);
    });
  });
});
