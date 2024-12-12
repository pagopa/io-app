import { fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { createStore } from "redux";
import I18n from "../../../../i18n";
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

const testPressHandler = jest.fn();
jest
  .spyOn(UTILS, "openSystemNotificationSettingsScreen")
  .mockImplementation(testPressHandler);
describe("PushNotificationsBanner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render correctly", () => {
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={() => null} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should call openSystemNotificationSettingsScreen on press", () => {
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={jest.fn()} />
    );
    fireEvent(component.getByTestId("pushNotificationsBanner"), "press");
    expect(testPressHandler).toHaveBeenCalledTimes(1);
  });
  it("should correctly dispatch the closeHandler", () => {
    const testClose = jest.fn();
    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={testClose} />
    );
    fireEvent(
      component.getByA11yLabel(I18n.t("global.buttons.close")),
      "press"
    );
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
      jest.spyOn(BS, "useIOBottomSheetModal").mockImplementation(_ => ({
        bottomSheet: <></>,
        dismiss: jest.fn(),
        present: testPresentBS
      }));
      const component = renderTestingComponent(
        <PushNotificationsBanner closeHandler={() => null} />
      );
      fireEvent(
        component.getByA11yLabel(I18n.t("global.buttons.close")),
        "press"
      );
      expect(testPresentBS).toHaveBeenCalledTimes(timeDismissed >= 2 ? 1 : 0);
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

    const component = renderTestingComponent(
      <PushNotificationsBanner closeHandler={() => null} />
    );

    expect(component).not.toBeNull();
    expect(ioDispatchMock).toHaveBeenCalledWith(
      ACTIONS.resetNotificationBannerDismissState()
    );
  });
});

const renderTestingComponent = (component: React.ReactElement) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);
  return renderScreenWithNavigationStoreContext(
    () => component,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};
