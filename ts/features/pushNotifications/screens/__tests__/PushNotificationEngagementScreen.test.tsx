import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as LOGIC_HOOK from "../../hooks/usePushNotificationEngagement";
import * as analytics from "../../analytics";
import { PushNotificationEngagementScreen } from "../PushNotificationEngagementScreen";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../analytics";

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

describe("PushNotificationEngagementScreen", () => {
  const spiedOnMockedAnalyticsOutcomeEvent = jest
    .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
    .mockImplementation();
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("should match snapshot", () => {
    const screen = renderScreen();
    expect(screen.toJSON()).toMatchSnapshot();
  });
  (["authentication", "send_notification_opening", "access"] as const).forEach(
    flow =>
      (["aar", "message", "not_set"] as const).forEach(sendUserType =>
        (["recipient", "mandatory", "not_set"] as const).forEach(
          sendOpeningSource =>
            it(`should track the analytics event with proper parameters ()`, () => {
              const spiedOnMockedAnalyticsEvent = jest
                .spyOn(
                  analytics,
                  "trackSystemNotificationPermissionScreenShown"
                )
                .mockImplementation();
              renderScreen(flow, sendUserType, sendOpeningSource);
              expect(spiedOnMockedAnalyticsEvent.mock.calls.length).toBe(1);
              expect(spiedOnMockedAnalyticsEvent.mock.calls[0].length).toBe(3);
              expect(spiedOnMockedAnalyticsEvent.mock.calls[0][0]).toBe(flow);
              expect(spiedOnMockedAnalyticsEvent.mock.calls[0][1]).toBe(
                sendUserType
              );
              expect(spiedOnMockedAnalyticsEvent.mock.calls[0][2]).toBe(
                sendOpeningSource
              );
            })
        )
      )
  );

  it("should render a blank page when told to do so by the logic hook", () => {
    jest
      .spyOn(LOGIC_HOOK, "usePushNotificationEngagement")
      .mockImplementation(() => ({
        onButtonPress: () => null,
        shouldRenderBlankPage: true
      }));

    const component = renderScreen();

    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render a header with an X button which should behave as expected and track analytics event", () => {
    jest
      .spyOn(LOGIC_HOOK, "usePushNotificationEngagement")
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
      .spyOn(LOGIC_HOOK, "usePushNotificationEngagement")
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

const renderScreen = (
  flow: NotificationModalFlow = "send_notification_opening",
  sendOpeningSource: SendOpeningSource = "not_set",
  sendUserType: SendUserType = "not_set"
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext<GlobalState>(
    PushNotificationEngagementScreen,
    NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT,
    { flow, sendOpeningSource, sendUserType },
    createStore(appReducer, globalState as any)
  );
};
