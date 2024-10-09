import React from "react";
import { renderComponent } from "../../../components/__tests__/ForceScrollDownView.test";
import * as profileBannerImport from "../../../features/profileSettings/store/selectors";
import { GlobalState } from "../../../store/reducers/types";
import { ProfileMainScreenTopBanner } from "../ProfileMainScreenTopBanner";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    navigate: mockNavigate
  })
}));

describe("ProfileMainScreenTopBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should match snapshot for all possible results of profileBannerToShowSelector", () => {
    const testCases = [
      {
        selectorValue: "NOTIFICATIONS",
        description: "notifications banner"
      },
      {
        selectorValue: "PROFILE_BANNER",
        description: "profile banner"
      },
      {
        selectorValue: undefined,
        description: "no banner"
      }
    ] as const;
    testCases.forEach(({ selectorValue, description }) => {
      jest
        .spyOn(profileBannerImport, "profileBannerToShowSelector")
        .mockImplementation((_: GlobalState) => selectorValue);

      const component = renderComponent(<ProfileMainScreenTopBanner />);

      expect(component).toMatchSnapshot(description);
    });
  });
  it("should only render the notificationr banner", () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "NOTIFICATIONS");

    const component = renderComponent(<ProfileMainScreenTopBanner />);
    expect(component.findByTestId("notifications-banner")).toBeTruthy();
    expect(component.queryByTestId("fiscal-code-banner")).toBeNull();
  });
  it("should only render the fiscalCode banner", () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "PROFILE_BANNER");

    const component = renderComponent(<ProfileMainScreenTopBanner />);
    expect(component.findByTestId("fiscal-code-banner")).toBeTruthy();
    expect(component.queryByTestId("notifications-banner")).toBeNull();
  });
});
