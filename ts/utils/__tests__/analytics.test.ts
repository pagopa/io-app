import { buildEventProperties, dateToUTCISOString } from "../analytics";

describe("buildEventProperties", () => {
  it("should output base object with event_category and event_type when no additional properties are provided", () => {
    const expectedEventProperties = {
      event_category: "UX",
      event_type: "action"
    };
    const eventProperties = buildEventProperties("UX", "action");
    expect(eventProperties).toEqual(expectedEventProperties);
  });
  it("should output object with event_category, event_type and provided additional properties", () => {
    const expectedEventProperties = {
      event_category: "UX",
      event_type: "action",
      count: 1,
      address: "National Street 1",
      enabled: true
    };
    const eventProperties = buildEventProperties("UX", "action", {
      count: 1,
      address: "National Street 1",
      enabled: true
    });
    expect(eventProperties).toEqual(expectedEventProperties);
  });
});

describe("dateToUTCISOString", () => {
  it("should convert a date to UTC ISO string format", () => {
    const testDate = new Date(2023, 5, 15, 10, 30, 45);
    const isoString = dateToUTCISOString(testDate);
    expect(isoString).toBe("2023-06-15T10:30:45.000Z");
  });
  it("should handle dates with timezone offsets correctly", () => {
    // Create a specific date in local time
    const testDate = new Date(2023, 0, 1, 12, 0, 0);
    const isoString = dateToUTCISOString(testDate);
    // The ISO string should be in UTC, which may differ from local time
    expect(isoString).toBe("2023-01-01T12:00:00.000Z");
    // Verify the format follows ISO 8601
    expect(isoString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
  it("should handle the current date", () => {
    const now = new Date();
    const isoString = dateToUTCISOString(now);
    expect(isoString).toBe(now.toISOString());
  });
  it("should handle dates at midnight", () => {
    const midnight = new Date(2023, 5, 15, 0, 0, 0, 0);
    const isoString = dateToUTCISOString(midnight);
    expect(isoString).toBe("2023-06-15T00:00:00.000Z");
  });
  it("should handle dates with milliseconds", () => {
    const dateWithMs = new Date(2023, 5, 15, 10, 30, 45, 123);
    const isoString = dateToUTCISOString(dateWithMs);
    expect(isoString).toBe("2023-06-15T10:30:45.123Z");
  });
});
