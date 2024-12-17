import { fireEvent } from "@testing-library/react-native";
import { renderComponent } from "../../../components/__tests__/ForceScrollDownView.test";
import * as profileBannerImport from "../../../features/profileSettings/store/selectors";
import { GlobalState } from "../../../store/reducers/types";
import { ProfileMainScreenTopBanner } from "../ProfileMainScreenTopBanner";
import * as settingsNavigate from "../../../features/pushNotifications/utils";
import ROUTES from "../../../navigation/routes";
import TypedI18n from "../../../i18n";
import { setShowProfileBanner } from "../../../features/profileSettings/store/actions";
import { mockAccessibilityInfo } from "../../../utils/testAccessibility";

jest.spyOn(settingsNavigate, "openSystemNotificationSettingsScreen");
const mockNavigate = jest.fn();
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));
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
    jest.resetAllMocks();
    mockAccessibilityInfo(false);
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

      expect(component.toJSON()).toMatchSnapshot(description);
    });
  });

  it("should call openNotificationSettingsScreen on notification banner tap", () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "NOTIFICATIONS");

    const root = renderComponent(<ProfileMainScreenTopBanner />);
    const component = root.getByTestId("notifications-banner");

    expect(component).toBeDefined();

    fireEvent.press(component);

    expect(
      settingsNavigate.openSystemNotificationSettingsScreen
    ).toHaveBeenCalled();
  });
  it("should call navigate on fiscalCode banner tap", () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "PROFILE_BANNER");

    const root = renderComponent(<ProfileMainScreenTopBanner />);
    const component = root.getByTestId("fiscal-code-banner");

    expect(component).toBeDefined();

    fireEvent.press(component);

    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PROFILE_DATA
    });
  });
  it("should dispatch close action on fiscalCode banner close", () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "PROFILE_BANNER");

    const root = renderComponent(<ProfileMainScreenTopBanner />);
    const component = root.getByA11yLabel(
      TypedI18n.t("profile.main.banner.close")
    );

    expect(component).toBeDefined();

    fireEvent.press(component);

    expect(mockDispatch).toHaveBeenCalledWith(setShowProfileBanner(false));
  });
});
