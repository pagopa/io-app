import { buildEventProperties } from "../analytics";

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
