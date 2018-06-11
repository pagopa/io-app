import { addHours, addYears, format } from "date-fns";
import { convertDateToWordDistance } from "../convertDateToWordDistance";

describe("convertDateToWordDistance", () => {
  describe("convertDateToWordDistance test plan", () => {
    it("Compare now date with 2 hours earlier, expected  hh:mm", () => {
      const nowDate = new Date();
      const testDate = addHours(nowDate, -2);
      expect(convertDateToWordDistance(testDate)).toBe(
        format(testDate, "H.mm")
      );
    });

    it("Compare now date with 24 hours earlier, expected  yesterday", () => {
      const nowDate = new Date();
      const testDate = addHours(nowDate, -24);
      expect(convertDateToWordDistance(testDate)).toBe("yesterday");
    });
    // tslint:disable-next-line:no-identical-functions
    it("Compare now date with 48 hours earlier, expected  DD/MM", () => {
      const nowDate = new Date();
      const testDate = addHours(nowDate, -48);
      expect(convertDateToWordDistance(testDate)).toBe(
        format(testDate, "DD/MM")
      );
    });

    test("Compare now date with last year date, expected  DD/MM/YY", () => {
      const nowDate = new Date();
      const testDate = addYears(nowDate, -1);
      expect(convertDateToWordDistance(testDate)).toBe(
        format(testDate, "DD/MM/YY")
      );
    });
  });
});
