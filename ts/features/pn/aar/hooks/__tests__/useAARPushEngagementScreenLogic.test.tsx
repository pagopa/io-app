import * as DESIGN_SYSTEM from "@pagopa/io-app-design-system";
import { act } from "@testing-library/react-native";
import * as RN from "react-native";
import { createStore } from "redux";
import * as USEIO from "../../../../../navigation/params/AppParamsList";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as NOTIF_UTILS from "../../../../pushNotifications/utils";
import PN_ROUTES from "../../../navigation/routes";
import * as MAIN_FILE from "../useAARpushEngagementScreenLogic";

// eslint-disable-next-line functional/no-let
let testingHookOutput = {
  shouldRenderBlankPage: false,
  onButtonPress: () => {
    void null;
  }
};

type navType = ReturnType<typeof USEIO.useIONavigation>;
describe("UseEngamentScreenFocusLogic", () => {
  const testOpenNotifications = jest.fn();
  const testSetOptions = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(USEIO, "useIONavigation").mockImplementation(
      () =>
        ({
          setOptions: testSetOptions,
          popToTop: jest.fn()
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

  it(" should set header and call openSystemNotificationSettingsScreen on button press, and also return {shouldRenderBlankPage:true}", async () => {
    renderHook();
    expect(testOpenNotifications).toHaveBeenCalledTimes(0);
    expect(testSetOptions).toHaveBeenCalledTimes(0);
    expect(testingHookOutput.shouldRenderBlankPage).toBe(false);

    act(testingHookOutput.onButtonPress);

    expect(testOpenNotifications).toHaveBeenCalledTimes(1);
    expect(testSetOptions).toHaveBeenCalledTimes(1);
    expect(testSetOptions).toHaveBeenCalledWith({ headerShown: false });
    expect(testingHookOutput.shouldRenderBlankPage).toBe(true);
  });

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
      const mockNavigate = jest.fn();

      const mockToastSuccess = jest
        .spyOn(DESIGN_SYSTEM.IOToast, "success")
        .mockImplementation(jest.fn());

      const mockCheckPermissions = jest
        .spyOn(NOTIF_UTILS, "checkNotificationPermissions")
        .mockImplementation(
          () => new Promise((res, _rej) => res(isNotificationAuthorized))
        );

      await MAIN_FILE.testable!.appStateHandler(
        mockNavigate,
        isPressed
      )(isActive ? "active" : "background");

      if (!isActive || !isPressed) {
        expect(mockCheckPermissions).toHaveBeenCalledTimes(0);
        expect(mockToastSuccess).toHaveBeenCalledTimes(0);
        expect(mockNavigate).toHaveBeenCalledTimes(0);
      }

      if (isActive && isPressed) {
        expect(mockCheckPermissions).toHaveBeenCalledTimes(1);
        if (isNotificationAuthorized) {
          expect(mockToastSuccess).toHaveBeenCalledTimes(1);
        } else {
          expect(mockToastSuccess).toHaveBeenCalledTimes(0);
        }
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      }
    });
  });
});

const renderHook = () => {
  const Component = () => {
    const hookOutput = MAIN_FILE.useAARPushEngagementScreenLogic();
    testingHookOutput = hookOutput;
    return <></>;
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <Component />,
    PN_ROUTES.QR_SCAN_PUSH_ENGAGEMENT,
    {},
    store
  );
};
