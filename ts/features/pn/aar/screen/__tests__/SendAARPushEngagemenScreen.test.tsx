import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import PN_ROUTES from "../../../navigation/routes";
import * as LOGIC_HOOK from "../../hooks/useAARpushEngagementScreenLogic";
import { SendQrScanPushEngagementScreen } from "../SendAARPushEngagementScreen";
import * as analytics from "../../../../pushNotifications/analytics";

const mockPopToTop = jest.fn();
jest.mock("@react-navigation/native", () => {
  const navigationModule = jest.requireActual("@react-navigation/native");
  return {
    ...navigationModule,
    useNavigation: () => ({
      ...navigationModule.useNavigation(),
      popToTop: mockPopToTop
    })
  };
});

describe("SendQrScanPushEngagementScreen", () => {
  const spiedOnMockedAnalyticsOutcomeEvent = jest
    .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
    .mockImplementation();
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should match snapshot and track analytics event", () => {
    const spiedOnMockedAnalyticsEvent = jest
      .spyOn(analytics, "trackSystemNotificationPermissionScreenShown")
      .mockImplementation();
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
    expect(spiedOnMockedAnalyticsEvent.mock.calls.length).toBe(1);
    expect(spiedOnMockedAnalyticsEvent.mock.calls[0].length).toBe(1);
    expect(spiedOnMockedAnalyticsEvent.mock.calls[0][0]).toBe(
      "send_notification_opening"
    );
  });

  it("should render a blank page when told to do so by the logic hook", () => {
    jest
      .spyOn(LOGIC_HOOK, "useAARPushEngagementScreenLogic")
      .mockImplementation(() => ({
        onButtonPress: () => null,
        shouldRenderBlankPage: true
      }));

    const component = renderScreen();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render a header with an X button which should behave as expected and track analytics event", () => {
    jest
      .spyOn(LOGIC_HOOK, "useAARPushEngagementScreenLogic")
      .mockImplementation(() => ({
        onButtonPress: () => null,
        shouldRenderBlankPage: false
      }));
    expect(mockPopToTop).toHaveBeenCalledTimes(0);
    const { getByTestId } = renderScreen();
    const button = getByTestId("header-close");
    fireEvent.press(button);
    expect(mockPopToTop).toHaveBeenCalledTimes(1);
    expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls.length).toBe(1);
    expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0].length).toBe(2);
    expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][0]).toBe("dismiss");
    expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][1]).toBe(
      "send_notification_opening"
    );
  });

  it("should call the button press callback on button press", () => {
    const mockButtonPress = jest.fn();

    jest
      .spyOn(LOGIC_HOOK, "useAARPushEngagementScreenLogic")
      .mockImplementation(() => ({
        onButtonPress: mockButtonPress,
        shouldRenderBlankPage: false
      }));

    const component = renderScreen();

    expect(mockButtonPress).toHaveBeenCalledTimes(0);

    const button = component.getByTestId("engagement-cta");
    fireEvent(button, "press");

    expect(mockButtonPress).toHaveBeenCalledTimes(1);
    expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls.length).toBe(0);
  });
});

const renderScreen = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <SendQrScanPushEngagementScreen />,
    PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT,
    {},
    createStore(appReducer, globalState as any)
  );
};
