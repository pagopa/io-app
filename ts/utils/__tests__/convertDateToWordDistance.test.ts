import { format, subDays, subYears } from "date-fns";
import { convertDateToWordDistance } from "../convertDateToWordDistance";
import { formatDateAsLocal } from "../dates";

describe("convertDateToWordDistance", () => {
  it("should be in H:mm format", () => {
    const now = new Date();

    expect(convertDateToWordDistance(now, "")).toBe(format(now, "H:mm"));
  });

  it("should be 'Yesterday'", () => {
    const yesterday = subDays(Date.now(), 1);

    expect(convertDateToWordDistance(yesterday, "Yesterday")).toBe("Yesterday");
  });

  it("should be the localized date with the year", () => {
    const twoYearsAgo = subYears(Date.now(), 2);

    expect(convertDateToWordDistance(twoYearsAgo, "")).toBe(
      formatDateAsLocal(twoYearsAgo, true)
    );
  });
});
