import MockDate from "mockdate";
import { checkFourMonthPeriod } from "../date";

describe("Date utils for app review checks", () => {
  it("should return true if the date is not provided", () => {
    const result = checkFourMonthPeriod();
    expect(result).toBe(true);
  });

  it("should return true if the date is older than four months", () => {
    const date = "2024-09-14T20:43:21.361Z";
    const result = checkFourMonthPeriod(date);
    expect(result).toBe(true);
  });

  it("should return false if the date is not older than four months", () => {
    const date = "2024-11-14T20:43:21.361Z";
    const now = "2025-03-14T20:43:21.361Z";
    MockDate.set(now);
    const result = checkFourMonthPeriod(date);
    expect(result).toBe(false);
    MockDate.reset();
  });
});
