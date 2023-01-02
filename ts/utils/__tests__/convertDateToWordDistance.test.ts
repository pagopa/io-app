import { format, subDays, subYears } from "date-fns";
import MockDate from "mockdate";
import {
  convertDateTimeToWordDistance,
  convertDateToWordDistance
} from "../convertDateToWordDistance";
import { formatDateAsLocal } from "../dates";

import I18n from "../../i18n";
import { localeDateFormat } from "../locale";
import { capitalize } from "../strings";

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

  it("should be the localized date with day and month", () => {
    MockDate.set("2022-10-10");
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    expect(convertDateToWordDistance(twoDaysAgo, "")).toBe(
      localeDateFormat(
        twoDaysAgo,
        I18n.t("global.dateFormats.dayMonthWithoutTime")
      )
    );
  });

  it("should be the localized date with the year", () => {
    const twoYearsAgo = subYears(Date.now(), 2);

    expect(convertDateToWordDistance(twoYearsAgo, "")).toBe(
      formatDateAsLocal(twoYearsAgo, true)
    );
  });
});

describe("convertDateTimeToWordDistance", () => {
  it("should be in 'Today, H.mm' format", () => {
    const now = new Date();

    expect(convertDateTimeToWordDistance(now)).toBe(
      `${capitalize(I18n.t("global.date.today"))}, ${localeDateFormat(
        now,
        I18n.t("global.dateFormats.timeFormat")
      )}`
    );
  });

  it("should be 'Yesterday, H.mm'", () => {
    const yesterday = subDays(Date.now(), 1);

    expect(convertDateTimeToWordDistance(yesterday)).toBe(
      `${capitalize(I18n.t("datetimes.yesterday"))}, ${localeDateFormat(
        yesterday,
        I18n.t("global.dateFormats.timeFormat")
      )}`
    );
  });

  it("should be the invalid date message defined in locales.'", () => {
    expect(convertDateTimeToWordDistance(new Date(NaN))).toBe(
      I18n.t("datetimes.notValid")
    );
  });

  it("should be 'DD/MM/YYYY, H.mm'", () => {
    const twoDaysAgo = subDays(Date.now(), 2);

    expect(convertDateTimeToWordDistance(twoDaysAgo)).toBe(
      localeDateFormat(
        twoDaysAgo,
        I18n.t("global.dateFormats.shortFormatWithTime")
      )
    );
  });

  it("should be 'DD/MM/YYYY, H.mm' even for past year", () => {
    const twoYearsAgo = subYears(Date.now(), 2);

    expect(convertDateTimeToWordDistance(twoYearsAgo)).toBe(
      localeDateFormat(
        twoYearsAgo,
        I18n.t("global.dateFormats.shortFormatWithTime")
      )
    );
  });
});
