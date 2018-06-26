import { addHours, addYears, format } from "date-fns";
import I18n from "../../i18n";
import { convertDateToWordDistance } from "../convertDateToWordDistance";

describe("convertDateToWordDistance test plan", () => {
  it("should compare now date with 2 hours earlier, expected  hh:mm", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -2);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "H.mm")
    );
  });

  it("should compare now date with 24 hours earlier, expected yesterday", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -24);
    expect(
      convertDateToWordDistance(testDate, I18n.t("messages.yesterday"))
    ).toBe(I18n.t("messages.yesterday"));
  });
  // tslint:disable-next-line:no-identical-functions
  it("should compare now date with 48 hours earlier, expected DD/MM", () => {
    const nowDate = new Date();
    const testDate = addHours(nowDate, -48);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "DD/MM")
    );
  });

  it("should compare now date with last year date, expected DD/MM/YY", () => {
    const nowDate = new Date();
    const testDate = addYears(nowDate, -1);
    expect(convertDateToWordDistance(testDate, "yesterday")).toBe(
      format(testDate, "DD/MM/YY")
    );
  });
});
