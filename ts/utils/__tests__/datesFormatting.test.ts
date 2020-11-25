import { format, subDays } from "date-fns";
import { convertDateToWordDistance } from "../convertDateToWordDistance";

describe("convertDateToWordDistance", () => {
  it("should be in H:mm format", () => {
    const now = new Date();

    expect(convertDateToWordDistance(now, "")).toBe(format(now, "H:mm"));
  });

  it("should be 'Yesterday'", () => {
    const yesterday = subDays(Date.now(), 1);

    expect(convertDateToWordDistance(yesterday, "Yesterday")).toBe("Yesterday");
  });

  it("should be 'Invalid Date'", () => {
    const invalidDate = new Date("");

    expect(
      convertDateToWordDistance(invalidDate, "", undefined, "Invalid Date")
    ).toBe("Invalid Date");
  });
});
