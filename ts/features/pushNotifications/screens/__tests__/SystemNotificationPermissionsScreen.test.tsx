import { fireEvent } from "@testing-library/react-native";
import { constUndefined } from "fp-ts/lib/function";
import { createStore } from "redux";

import I18n from "i18next";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { mockAccessibilityInfo } from "../../../../utils/testAccessibility";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as analytics from "../../analytics";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";
import * as utils from "../../utils";
import { SystemNotificationPermissionsScreen } from "../SystemNotificationPermissionsScreen";
import { setEngagementScreenShown } from "../../store/actions/environment";

const mockGoBack = jest.fn();
const mockSetNavigationOptions = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({
    goBack: mockGoBack,
    setOptions: mockSetNavigationOptions
  })
}));

const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual<typeof import("react-redux")>("react-redux"),
  useDispatch: () => mockDispatch
}));

describe("SystemNotificationPermissionsScreen", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    mockAccessibilityInfo(false);
  });
  it("Should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  it("Should call 'trackSystemNotificationPermissionScreenShown' and dispatch 'setEngagementScreenShown' upon rendering", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenShown")
      .mockImplementation(constUndefined);

    renderScreen();

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(3);
    expect(analyticsMock.mock.calls[0][0]).toBe("authentication");
    expect(analyticsMock.mock.calls[0][1]).toBe("not_set");
    expect(analyticsMock.mock.calls[0][2]).toBe("not_set");

    expect(mockDispatch.mock.calls.length).toBe(1);
    expect(mockDispatch.mock.calls[0].length).toBe(1);
    expect(mockDispatch.mock.calls[0][0]).toEqual(setEngagementScreenShown());
  });
  it("Should use 'navigation.setOptions({header: })' and place an 'HeaderSecondLevel' component with an 'X' close button, which 'onPress' action should call the analytics tracking and dispatch navigation.back", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    renderScreen();

    expect(mockSetNavigationOptions.mock.calls.length).toBe(1);
    expect(mockSetNavigationOptions.mock.calls[0].length).toBe(1);
    const navigationOptions = mockSetNavigationOptions.mock.calls[0][0];
    expect(navigationOptions.header).toBeDefined();
    expect(typeof navigationOptions.header).toBe("function");

    const headerComponent = navigationOptions.header();
    expect(headerComponent).toBeDefined();

    expect(headerComponent.props.ignoreSafeAreaMargin).toBe(true);
    expect(headerComponent.props.title).toBe("");
    expect(headerComponent.props.type).toBe("singleAction");
    expect(headerComponent.props.firstAction).toBeDefined();
    expect(headerComponent.props.firstAction.icon).toBe("closeMedium");
    expect(headerComponent.props.firstAction.accessibilityLabel).toBe(
      I18n.t("global.buttons.close")
    );
    expect(headerComponent.props.firstAction.onPress).toBeDefined();
    expect(typeof headerComponent.props.firstAction.onPress).toBe("function");

    const onPressFunction = headerComponent.props.firstAction.onPress;
    onPressFunction();

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(4);
    expect(analyticsMock.mock.calls[0][0]).toBe("dismiss");
    expect(analyticsMock.mock.calls[0][1]).toBe("authentication");
    expect(analyticsMock.mock.calls[0][2]).toBe("not_set");
    expect(analyticsMock.mock.calls[0][3]).toBe("not_set");

    expect(settingsSpy.mock.calls.length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have an open-system-notification-settings button that should call the analytics tracking, the utility function and dispatch navigation.back upon pressing", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-open-system-settings-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(4);
    expect(analyticsMock.mock.calls[0][0]).toBe("activate");
    expect(analyticsMock.mock.calls[0][1]).toBe("authentication");
    expect(analyticsMock.mock.calls[0][2]).toBe("not_set");
    expect(analyticsMock.mock.calls[0][3]).toBe("not_set");

    expect(settingsSpy.mock.calls.length).toBe(1);
    expect(settingsSpy.mock.calls[0].length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
  it("Should have a bottom close button that should the analytics tracking and dispatch navigation.back upon pressing", () => {
    const analyticsMock = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
      .mockImplementation(constUndefined);
    const settingsSpy = spyOnOpenSystemNotificationSettings();

    const screen = renderScreen();
    const xCloseButton = screen.getByTestId(
      "notifications-modal-not-now-button"
    );
    expect(xCloseButton).toBeDefined();

    fireEvent.press(xCloseButton);

    expect(analyticsMock.mock.calls.length).toBe(1);
    expect(analyticsMock.mock.calls[0].length).toBe(4);
    expect(analyticsMock.mock.calls[0][0]).toBe("dismiss");
    expect(analyticsMock.mock.calls[0][1]).toBe("authentication");
    expect(analyticsMock.mock.calls[0][2]).toBe("not_set");
    expect(analyticsMock.mock.calls[0][3]).toBe("not_set");

    expect(settingsSpy.mock.calls.length).toBe(0);
    expect(mockGoBack.mock.calls.length).toBe(1);
    expect(mockGoBack.mock.calls[0].length).toBe(0);
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    () => <SystemNotificationPermissionsScreen />,
    NOTIFICATIONS_ROUTES.SYSTEM_NOTIFICATION_PERMISSIONS,
    {},
    store
  );
};

const spyOnOpenSystemNotificationSettings = () =>
  jest
    .spyOn(utils, "openSystemNotificationSettingsScreen")
    .mockImplementation(constUndefined);
