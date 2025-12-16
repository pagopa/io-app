import { fireEvent } from "@testing-library/react-native";

import { ComponentProps, ReactElement } from "react";
import { createStore } from "redux";
import { constUndefined } from "fp-ts/lib/function";
import { FooterActions } from "@pagopa/io-app-design-system";
import { GestureResponderEvent } from "react-native";
import I18n from "i18next";
import { applicationChangeState } from "../../../../store/actions/application";
import * as IOHOOKS from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import * as BS from "../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import * as ACTIONS from "../../store/actions/userBehaviour";
import * as SELECTORS from "../../store/selectors";
import * as NOTIFICATION_DISMISS_SELECTORS from "../../store/selectors/notificationsBannerDismissed";
import * as UTILS from "../../utils";
import { PushNotificationsBanner } from "../PushNotificationsBanner";
import * as analytics from "../../analytics";
import { setPushNotificationBannerForceDismissed } from "../../store/actions/userBehaviour";

describe("PushNotificationsBanner", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should render correctly and call 'trackPushNotificationsBannerVisualized'", () => {
    const spyOnMockedTrackPushNotificationsBannerVisualized = jest
      .spyOn(analytics, "trackPushNotificationsBannerVisualized")
      .mockImplementation(_ => undefined);
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot();
    expect(
      spyOnMockedTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledTimes(1);
    expect(
      spyOnMockedTrackPushNotificationsBannerVisualized
    ).toHaveBeenCalledWith(MESSAGES_ROUTES.MESSAGES_HOME);
  });
  it("should call openSystemNotificationSettingsScreen on press", () => {
    const spyOnMockedOpenSystemNotificationSettingsScreen = jest
      .spyOn(UTILS, "openSystemNotificationSettingsScreen")
      .mockImplementation(constUndefined);
    const spyOnMockedTrackPushNotificationsBannerTap = jest
      .spyOn(analytics, "trackPushNotificationsBannerTap")
      .mockImplementation(_ => undefined);
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={jest.fn()} />
    );
    fireEvent(component.getByTestId("pushNotificationsBanner"), "onPress");

    expect(spyOnMockedTrackPushNotificationsBannerTap).toHaveBeenCalledTimes(1);
    expect(spyOnMockedTrackPushNotificationsBannerTap).toHaveBeenCalledWith(
      MESSAGES_ROUTES.MESSAGES_HOME
    );
    expect(
      spyOnMockedOpenSystemNotificationSettingsScreen
    ).toHaveBeenCalledTimes(1);
  });
  it("should correctly dispatch the closeHandler and call 'trackPushNotificationsBannerClosure' when the dismission count is less than two", () => {
    const spyOnMockedTrackPushNotificationsBannerClosure = jest
      .spyOn(analytics, "trackPushNotificationsBannerClosure")
      .mockImplementation(constUndefined);
    const spyOnMockedTrackPushNotificationBannerDismissAlert = jest
      .spyOn(analytics, "trackPushNotificationBannerDismissAlert")
      .mockImplementation(constUndefined);
    const testClose = jest.fn();
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={testClose} />
    );
    fireEvent(
      component.getByLabelText(I18n.t("global.buttons.close")),
      "onPress"
    );
    expect(
      spyOnMockedTrackPushNotificationsBannerClosure
    ).toHaveBeenCalledTimes(1);
    expect(
      spyOnMockedTrackPushNotificationBannerDismissAlert
    ).toHaveBeenCalledTimes(0);
    expect(testClose).toHaveBeenCalledTimes(1);
  });
  it.each([0, 1, 2, 3, 4, 5, 6, 7, 8])(
    // dismissed should never be more than 2, but just in case
    "should only open BS after third banner dismissal (current: %p )",
    timeDismissed => {
      const testPresentBS = jest.fn();
      jest
        .spyOn(SELECTORS, "isPushNotificationsBannerRenderableSelector")
        .mockImplementation(() => true);
      jest
        .spyOn(
          NOTIFICATION_DISMISS_SELECTORS,
          "timesPushNotificationBannerDismissedSelector"
        )
        .mockImplementation(() => timeDismissed);
      const spyOnMockedTrackPushNotificationBannerDismissAlert = jest
        .spyOn(analytics, "trackPushNotificationBannerDismissAlert")
        .mockImplementation(constUndefined);
      jest.spyOn(BS, "useIOBottomSheetModal").mockImplementation(_ => ({
        bottomSheet: <></>,
        dismiss: jest.fn(),
        present: testPresentBS
      }));
      const component = renderTestingComponent(
        <PushNotificationsBanner closeHandler={() => null} />
      );
      fireEvent(
        component.getByLabelText(I18n.t("global.buttons.close")),
        "onPress"
      );
      const dismissionThresholdReached = timeDismissed >= 2;
      expect(
        spyOnMockedTrackPushNotificationBannerDismissAlert
      ).toHaveBeenCalledTimes(dismissionThresholdReached ? 1 : 0);
      expect(testPresentBS).toHaveBeenCalledTimes(
        dismissionThresholdReached ? 1 : 0
      );
    }
  );
  it('should reset the dismiss state if "shouldResetNotificationBannerDismissStateSelector" evaluates to "true" ', () => {
    const ioDispatchMock = jest.fn();
    jest
      .spyOn(
        NOTIFICATION_DISMISS_SELECTORS,
        "shouldResetNotificationBannerDismissStateSelector"
      )
      .mockImplementation(_ => true);
    jest
      .spyOn(IOHOOKS, "useIODispatch")
      .mockImplementation(() => ioDispatchMock);
    const spyOnMockedTrackPushNotificationBannerForceShow = jest
      .spyOn(analytics, "trackPushNotificationBannerForceShow")
      .mockImplementation(constUndefined);

    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={() => null} />
    );

    expect(component).not.toBeNull();

    expect(
      spyOnMockedTrackPushNotificationBannerForceShow
    ).toHaveBeenCalledTimes(1);
    expect(ioDispatchMock).toHaveBeenCalledWith(
      ACTIONS.resetNotificationBannerDismissState()
    );
  });
  it("bottom sheet primary action should call 'trackPushNotificationBannerDismissOutcome' and the close handler", () => {
    const spyOnBS = jest.spyOn(BS, "useIOBottomSheetModal");
    const spyOnMockedTrackPushNotificationBannerDismissOutcome = jest
      .spyOn(analytics, "trackPushNotificationBannerDismissOutcome")
      .mockImplementation(_ => undefined);
    const mockCloseHandler = jest.fn();
    renderTestingComponent(
      <PushNotificationsBanner closeHandler={mockCloseHandler} />
    );

    expect(spyOnBS.mock.calls.length).toBe(1);
    expect(spyOnBS.mock.calls[0].length).toBe(1);
    expect(spyOnBS.mock.calls[0][0]).toBeDefined();

    const primaryActionCallback = (
      spyOnBS.mock.calls[0][0].footer?.props as ComponentProps<
        typeof FooterActions
      >
    ).actions?.primary.onPress;
    expect(primaryActionCallback).toBeDefined();
    expect(typeof primaryActionCallback).toBe("function");

    if (primaryActionCallback) {
      primaryActionCallback({} as GestureResponderEvent);

      expect(
        spyOnMockedTrackPushNotificationBannerDismissOutcome
      ).toHaveBeenCalledTimes(1);
      expect(
        spyOnMockedTrackPushNotificationBannerDismissOutcome
      ).toHaveBeenCalledWith("remind_later");

      expect(mockCloseHandler).toHaveBeenCalledTimes(1);
    }
  });
  it("bottom sheet secondary action should call 'trackPushNotificationBannerDismissOutcome' and dispatch 'setPushNotificationBannerForceDismissed'", () => {
    const mockedDispatch = jest.fn();
    jest
      .spyOn(IOHOOKS, "useIODispatch")
      .mockImplementation(() => mockedDispatch);
    const spyOnBS = jest.spyOn(BS, "useIOBottomSheetModal");
    const spyOnMockedTrackPushNotificationBannerDismissOutcome = jest
      .spyOn(analytics, "trackPushNotificationBannerDismissOutcome")
      .mockImplementation(_ => undefined);
    const mockCloseHandler = jest.fn();

    renderTestingComponent(
      <PushNotificationsBanner closeHandler={mockCloseHandler} />
    );

    expect(spyOnBS.mock.calls.length).toBe(1);
    expect(spyOnBS.mock.calls[0].length).toBe(1);
    expect(spyOnBS.mock.calls[0][0]).toBeDefined();

    const secondaryActionCallback = (
      spyOnBS.mock.calls[0][0].footer?.props as ComponentProps<
        typeof FooterActions
      >
    ).actions?.secondary?.onPress;

    expect(secondaryActionCallback).toBeDefined();
    expect(typeof secondaryActionCallback).toBe("function");

    if (secondaryActionCallback) {
      secondaryActionCallback({} as GestureResponderEvent);

      expect(
        spyOnMockedTrackPushNotificationBannerDismissOutcome
      ).toHaveBeenCalledTimes(1);
      expect(
        spyOnMockedTrackPushNotificationBannerDismissOutcome
      ).toHaveBeenCalledWith("deactivate");

      expect(mockedDispatch).toHaveBeenCalledTimes(1);
      expect(mockedDispatch).toHaveBeenCalledWith(
        setPushNotificationBannerForceDismissed()
      );
    }
  });
});

const renderTestingComponent = (component: ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => component,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
