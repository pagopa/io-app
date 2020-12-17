import { format, subDays, subYears } from "date-fns";
import { convertDateToWordDistance } from "../convertDateToWordDistance";
import { formatDateAsLocal } from "../dates";

import I18n from "../../i18n";

describe("convertDateToWordDistance", () => {
  it("should be in H:mm format", () => {
    const now = new Date();

    expect(convertDateToWordDistance(now, "")).toBe(format(now, "H:mm"));
  });

  it("should be 'Yesterday'", () => {
    const yesterday = subDays(Date.now(), 1);

    expect(convertDateToWordDistance(yesterday, "Yesterday")).toBe("Yesterday");
  });

  it("should contain 'Custom todayAtLabel'", () => {
    const now = new Date();

    expect(convertDateToWordDistance(now, "", "", "Custom todayAtLabel")).toBe(
      "Custom todayAtLabel" + " " + format(now, "H:mm")
    );
  });

  it("should be 'Custom invalid label'", () => {
    expect(
      convertDateToWordDistance(new Date(NaN), "", "Custom invalid label")
    ).toBe("Custom invalid label");
  });

  it("should be the invalid date message defined in locales.'", () => {
    expect(convertDateToWordDistance(new Date(NaN), "")).toBe(
      I18n.t("datetimes.notValid")
    );
  });

  it("should be the localized date with the year", () => {
    const twoYearsAgo = subYears(Date.now(), 2);

    expect(convertDateToWordDistance(twoYearsAgo, "")).toBe(
      formatDateAsLocal(twoYearsAgo, true)
    );
  });
});
