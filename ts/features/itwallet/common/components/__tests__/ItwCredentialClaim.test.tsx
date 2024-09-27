import React from "react";
import { render } from "@testing-library/react-native";
import { DateClaimItem } from "../ItwCredentialClaim";

describe("DateClaimItem", () => {
  const originalTimeZone = process.env.TZ;

  afterEach(() => {
    // eslint-disable-next-line functional/immutable-data
    process.env.TZ = originalTimeZone;
  });

  it("should render date correctly regardless of America/Los_Angeles timezone", () => {
    // eslint-disable-next-line functional/immutable-data
    process.env.TZ = "America/Los_Angeles";
    const date = new Date("2023-10-01");
    const { getByText } = render(
      <DateClaimItem label="Test Date" claim={date} />
    );
    const formattedDate = "01/10/2023";
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it("should render date correctly regardless of Asia/Tokyo timezone", () => {
    // eslint-disable-next-line functional/immutable-data
    process.env.TZ = "Asia/Tokyo";
    const date = new Date("2023-10-01");
    const { getByText } = render(
      <DateClaimItem label="Test Date" claim={date} />
    );
    const formattedDate = "01/10/2023";
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it("should render date correctly regardless of Asia/Jayapura timezone", () => {
    // eslint-disable-next-line functional/immutable-data
    process.env.TZ = "Asia/Jayapura";
    const date = new Date("2023-10-01");
    const { getByText } = render(
      <DateClaimItem label="Test Date" claim={date} />
    );
    const formattedDate = "01/10/2023";
    expect(getByText(formattedDate)).toBeTruthy();
  });

  it("should render date correctly regardless of Australia/Sydney timezone", () => {
    // eslint-disable-next-line functional/immutable-data
    process.env.TZ = "Australia/Sydney";
    const date = new Date("2023-10-01");
    const { getByText } = render(
      <DateClaimItem label="Test Date" claim={date} />
    );
    const formattedDate = "01/10/2023";
    expect(getByText(formattedDate)).toBeTruthy();
  });
});
