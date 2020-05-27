import { formatDateAsLocal, getExpireStatus } from "../dates";

describe("getExpireStatus", () => {
  it("should be VALID", () => {
    const future = new Date(Date.now() + 1000 * 60 * 61 * 24 * 7); // 7 days and a minute in the future
    expect(getExpireStatus(future)).toBe("VALID");
  });

  it("should be EXPIRING", () => {
    const nearFuture = new Date(Date.now() + 1000 * 60 * 60); // 1 hour in the future
    expect(getExpireStatus(nearFuture)).toBe("EXPIRING");
  });

  it("should be EXPIRED", () => {
    const remote = new Date(Date.now() - 1000 * 60); // 1 sec ago
    expect(getExpireStatus(remote)).toBe("EXPIRED");
  });
});

describe("formatDateAsLocal", () => {
  it("should return the date wihtout the year if it is within the current year", () => {
    const now = new Date();
    const futureDate = new Date(new Date().setMonth(now.getMonth() + 3));

    // if now is before or within September, then the future date will be within the same year of now
    if (now.getMonth() + 1 <= 9) {
      // format DD/MM or MM/DD pdepending on locales
      expect(formatDateAsLocal(futureDate).length).toBe(5);
    } else {
      // format DD/MM/YY or MM/DD/YY pdepending on locales
      expect(formatDateAsLocal(futureDate).length).toBe(8);
    }
  });
});
