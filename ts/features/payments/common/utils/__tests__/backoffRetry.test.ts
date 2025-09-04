import {
  isBackoffRetryTimeElapsed,
  getTimeRemainingText
} from "../backoffRetry";

describe("getTimeRemainingText", () => {
  it("should return an empty string if the target date is in the past", () => {
    const pastDate = new Date(Date.now() - 10000); // 10 seconds ago
    expect(getTimeRemainingText(pastDate)).toBe("");
  });

  it('should return "1 secondo" if 1 second is remaining', () => {
    const futureDate = new Date(Date.now() + 1000); // 1 second in the future
    expect(getTimeRemainingText(futureDate)).toBe("1 secondo");
  });

  it("should return correct string for seconds remaining", () => {
    const futureDate = new Date(Date.now() + 5000); // 5 seconds in the future
    expect(getTimeRemainingText(futureDate)).toBe("5 secondi");
  });

  it('should return "1 minuto" if 1 minute is remaining', () => {
    const futureDate = new Date(Date.now() + 60000); // 1 minute in the future
    expect(getTimeRemainingText(futureDate)).toBe("1 minuto");
  });

  it("should return correct string for minutes remaining", () => {
    const futureDate = new Date(Date.now() + 120000); // 2 minutes in the future
    expect(getTimeRemainingText(futureDate)).toBe("2 minuti");
  });
});

describe("isBackoffRetryTimeElapsed", () => {
  it("should return true if allowRetryTimestamp is undefined", () => {
    expect(isBackoffRetryTimeElapsed()).toBe(true);
  });

  it("should return true if allowRetryTimestamp is in the past", () => {
    const pastTimestamp = Date.now() - 10000; // 10 seconds ago
    expect(isBackoffRetryTimeElapsed(pastTimestamp)).toBe(true);
  });

  it("should return false if allowRetryTimestamp is in the future", () => {
    const futureTimestamp = Date.now() + 10000; // 10 seconds in the future
    expect(isBackoffRetryTimeElapsed(futureTimestamp)).toBe(false);
  });
});
