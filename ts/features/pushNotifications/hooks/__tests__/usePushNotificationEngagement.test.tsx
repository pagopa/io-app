import { act, waitFor } from "@testing-library/react-native";
import * as RN from "react-native";
import { createStore } from "redux";
import * as USEIO from "../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as NOTIF_UTILS from "../../utils";
import { NOTIFICATIONS_ROUTES } from "../../navigation/routes";
import * as MAIN_FILE from "../usePushNotificationEngagement";
import * as analytics from "../../analytics";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../analytics";
import { setSecurityAdviceReadyToShow } from "../../../authentication/fastLogin/store/actions/securityAdviceActions";

const notificationModalFlowList: Array<NotificationModalFlow> = [
  "authentication",
  "send_notification_opening",
  "access"
];
const sendOpeningSourceList: Array<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];
const sendUserTypeList: Array<SendUserType> = [
  "recipient",
  "mandatory",
  "not_set"
];

const mockDispatch = jest.fn();

// eslint-disable-next-line functional/no-let
let testingHookOutput = {
  shouldRenderBlankPage: false,
  onButtonPress: () => {
    void null;
  }
};

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch
}));

type navType = ReturnType<typeof USEIO.useIONavigation>;
describe("UseEngamentScreenFocusLogic", () => {
  const testOpenNotifications = jest.fn();
  const testSetOptions = jest.fn();
  const mockPopToTop = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(USEIO, "useIONavigation").mockImplementation(
      () =>
        ({
          setOptions: testSetOptions,
          popToTop: mockPopToTop
        } as unknown as navType)
    );
    jest
      .spyOn(NOTIF_UTILS, "openSystemNotificationSettingsScreen")
      .mockImplementation(testOpenNotifications);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  notificationModalFlowList.forEach(flow =>
    sendOpeningSourceList.forEach(openingSource =>
      sendUserTypeList.forEach(userType =>
        it(`should set header and call openSystemNotificationSettingsScreen on button press, return {shouldRenderBlankPage:true} and track proper analytics event (flow ${flow} opening source ${openingSource} user type ${userType})`, async () => {
          const spiedOnMockedAnalyticsOutcomeEvent = jest
            .spyOn(analytics, "trackSystemNotificationPermissionScreenOutcome")
            .mockImplementation();

          renderHook(flow, openingSource, userType);

          expect(testOpenNotifications).toHaveBeenCalledTimes(0);
          expect(testSetOptions).toHaveBeenCalledTimes(0);
          expect(testingHookOutput.shouldRenderBlankPage).toBe(false);

          act(testingHookOutput.onButtonPress);

          expect(testOpenNotifications).toHaveBeenCalledTimes(1);
          expect(testingHookOutput.shouldRenderBlankPage).toBe(true);
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls.length).toBe(1);
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0].length).toBe(
            4
          );
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][0]).toBe(
            "activate"
          );
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][1]).toBe(
            flow
          );
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][2]).toBe(
            openingSource
          );
          expect(spiedOnMockedAnalyticsOutcomeEvent.mock.calls[0][3]).toBe(
            userType
          );
        })
      )
    )
  );
  notificationModalFlowList.forEach(flow =>
    sendOpeningSourceList.forEach(openingSource =>
      sendUserTypeList.forEach(userType =>
        it(`should execute navigation only when change event is called after the button is pressed. The dispatch ${
          getShouldSetSecurityAdviceUponLeaving(flow)
            ? "has to be"
            : "hasn't to be"
        } called when "flow" is "${flow}"`, async () => {
          const shouldSetSecurityAdviceUponLeaving =
            getShouldSetSecurityAdviceUponLeaving(flow);
          const removeMock = jest.fn();
          const appStateSpy = jest
            .spyOn(RN.AppState, "addEventListener")
            .mockReturnValue({ remove: removeMock });

          renderHook(
            flow,
            openingSource,
            userType,
            shouldSetSecurityAdviceUponLeaving
          );

          expect(testingHookOutput.shouldRenderBlankPage).toBe(false);

          expect(appStateSpy).toHaveBeenCalled();
          expect(appStateSpy.mock.calls[0][0]).toBe("change");

          const callback = appStateSpy.mock.calls[0][1];
          expect(appStateSpy.mock.calls.length).toBe(1);
          // simulate event
          act(() => {
            callback("active");
          });

          expect(mockDispatch).not.toHaveBeenCalled();

          act(testingHookOutput.onButtonPress);
          // After button press the `isButtonPressed` state must change,
          // so `useEffect` should execute again
          expect(testingHookOutput.shouldRenderBlankPage).toBe(true);
          expect(removeMock).toHaveBeenCalled();
          expect(appStateSpy.mock.calls.length).toBe(2);

          const updatedCallback = appStateSpy.mock.calls[1][1];
          // simulate updated event
          act(() => {
            updatedCallback("active");
          });

          if (shouldSetSecurityAdviceUponLeaving) {
            await waitFor(() => expect(mockDispatch).toHaveBeenCalledTimes(1));
            expect(mockDispatch).toHaveBeenCalledWith(
              setSecurityAdviceReadyToShow(true)
            );
            expect(mockPopToTop).toHaveBeenCalledTimes(1);
          } else {
            await waitFor(() => expect(mockDispatch).not.toHaveBeenCalled());
            expect(mockPopToTop).toHaveBeenCalledTimes(1);
          }
          expect(removeMock).toHaveBeenCalledTimes(1);
        })
      )
    )
  );

  it('should subscribe to a "change" appstate event, and unsubscribe on unmount', () => {
    const removeMock = jest.fn();
    const eventListenerMock = jest
      .spyOn(RN.AppState, "addEventListener")
      .mockImplementation(() => ({ remove: removeMock }));
    expect(eventListenerMock).toHaveBeenCalledTimes(0);
    const hook = renderHook();
    expect(eventListenerMock).toHaveBeenCalledTimes(1);
    expect(eventListenerMock.mock.calls[0][0]).toBe("change");
    expect(removeMock).toHaveBeenCalledTimes(0);
    act(hook.unmount);
    expect(removeMock).toHaveBeenCalledTimes(1);
  });
});

describe("appStateHandler", () => {
  const mockOnReturnToApp = jest.fn();
  const mockOnSuccess = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const cases = [true, false].flatMap(isActive =>
    [true, false].flatMap(isPressed =>
      [true, false].flatMap(isNotificationAuthorized => ({
        isActive,
        isPressed,
        isNotificationAuthorized
      }))
    )
  );

  cases.forEach(testCase => {
    const { isActive, isPressed, isNotificationAuthorized } = testCase;
    it(`should handle the case where isActive=${isActive} and isPressed=${isPressed} and notifications ${
      isNotificationAuthorized ? "are" : "are not"
    } authorized`, async () => {
      const mockCheckPermissions = jest
        .spyOn(NOTIF_UTILS, "checkNotificationPermissions")
        .mockImplementation(
          () => new Promise((res, _rej) => res(isNotificationAuthorized))
        );

      await MAIN_FILE.testable!.appStateHandler(
        mockOnReturnToApp,
        mockOnSuccess,
        isPressed
      )(isActive ? "active" : "background");

      if (!isActive || !isPressed) {
        expect(mockCheckPermissions).toHaveBeenCalledTimes(0);
        expect(mockOnSuccess).toHaveBeenCalledTimes(0);
        expect(mockOnReturnToApp).toHaveBeenCalledTimes(0);
      }

      if (isActive && isPressed) {
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        if (isNotificationAuthorized) {
          expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        } else {
          expect(mockOnSuccess).toHaveBeenCalledTimes(0);
        }
        expect(mockOnReturnToApp).toHaveBeenCalledTimes(1);
      }
    });
  });
});

function getShouldSetSecurityAdviceUponLeaving(
  flow: NotificationModalFlow
): flow is "access" {
  return flow === "access";
}

const renderHook = (
  flow: NotificationModalFlow = "send_notification_opening",
  sendOpeningSource: SendOpeningSource = "not_set",
  sendUserType: SendUserType = "not_set",
  shouldSetSecurityAdviceUponLeaving: boolean = false
) => {
  const Component = () => {
    const hookOutput = MAIN_FILE.usePushNotificationEngagement(
      flow,
      sendOpeningSource,
      sendUserType,
      shouldSetSecurityAdviceUponLeaving
    );
    testingHookOutput = hookOutput;
    return <></>;
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <Component />,
    NOTIFICATIONS_ROUTES.PUSH_NOTIFICATION_ENGAGEMENT,
    {},
    store
  );
};
