import { fireEvent, render } from "@testing-library/react-native";
import { PropsWithChildren, ReactElement } from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { setShowProfileBanner } from "../../../features/profileSettings/store/actions";
import * as profileBannerImport from "../../../features/profileSettings/store/selectors";
import * as analytics from "../../../features/pushNotifications/analytics";
import * as settingsNavigate from "../../../features/pushNotifications/utils";
import TypedI18n from "../../../i18n";
import ROUTES from "../../../navigation/routes";
import { applicationChangeState } from "../../../store/actions/application";
import { appReducer } from "../../../store/reducers";
import { GlobalState } from "../../../store/reducers/types";
import { mockAccessibilityInfo } from "../../../utils/testAccessibility";
import { ProfileMainScreenTopBanner } from "../ProfileMainScreenTopBanner";

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
    const spyOnMockTrackPushNotificationsBannerVisualized = jest
      .spyOn(analytics, "trackPushNotificationsBannerVisualized")
      .mockImplementation(_ => undefined);

    const root = renderComponent(<ProfileMainScreenTopBanner />);
    const component = root.getByTestId("notifications-banner");

    expect(component).toBeDefined();

    fireEvent.press(component);

    expect(
      spyOnMockTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledTimes(1);
    expect(
      spyOnMockTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledWith(ROUTES.SETTINGS_MAIN);
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
  it(`should call 'trackPushNotificationsBannerVisualized' on first rendering if the push notification banner is the one to show`, () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "NOTIFICATIONS");
    const spyOnMockTrackPushNotificationsBannerVisualized = jest
      .spyOn(analytics, "trackPushNotificationsBannerVisualized")
      .mockImplementation(_ => undefined);
    renderComponent(<ProfileMainScreenTopBanner />);
    expect(
      spyOnMockTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledTimes(1);
    expect(
      spyOnMockTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledWith(ROUTES.SETTINGS_MAIN);
  });
  it(`should not have called 'trackPushNotificationsBannerVisualized' on first rendering if the push notification banner is not the shown one`, () => {
    jest
      .spyOn(profileBannerImport, "profileBannerToShowSelector")
      .mockImplementation((_: GlobalState) => "PROFILE_BANNER");
    const spyOnMockTrackPushNotificationsBannerVisualized = jest
      .spyOn(analytics, "trackPushNotificationsBannerVisualized")
      .mockImplementation(_ => undefined);
    renderComponent(<ProfileMainScreenTopBanner />);
    expect(
      spyOnMockTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledTimes(0);
  });
});

export const renderComponent = (component: ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  const Wrapper = ({ children }: PropsWithChildren<any>) => (
    <Provider store={store}>{children}</Provider>
  );

  return render(component, {
    wrapper: Wrapper
  });
};
