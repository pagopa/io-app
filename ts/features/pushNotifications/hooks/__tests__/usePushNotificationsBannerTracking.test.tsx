import { createStore } from "redux";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { usePushNotificationsBannerTracking } from "../usePushNotificationsBannerTracking";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { MESSAGES_ROUTES } from "../../../messages/navigation/routes";
import * as selectors from "../../store/selectors/notificationsBannerDismissed";
import * as analytics from "../../analytics";

describe("usePushNotificationsBannerTracking", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("should not call 'trackPushNotificationBannerStillHidden' if the banner has not been forced dismissed", () => {
    jest
      .spyOn(selectors, "isForceDismissAndNotUnreadMessagesHiddenSelector")
      .mockReturnValue(false);
    jest
      .spyOn(selectors, "unreadMessagesCountAfterForceDismissionSelector")
      .mockReturnValue(15);
    const mockTrackPushNotificationBannerStillHidden = jest
      .spyOn(analytics, "trackPushNotificationBannerStillHidden")
      .mockImplementation(_unreadMessageCount => undefined);

    renderScreen();

    expect(mockTrackPushNotificationBannerStillHidden.mock.calls.length).toBe(
      0
    );
  });
  it("should not call 'trackPushNotificationBannerStillHidden' if data about unread messages is not available yet", () => {
    jest
      .spyOn(selectors, "isForceDismissAndNotUnreadMessagesHiddenSelector")
      .mockReturnValue(true);
    jest
      .spyOn(selectors, "unreadMessagesCountAfterForceDismissionSelector")
      .mockReturnValue(undefined);
    const mockTrackPushNotificationBannerStillHidden = jest
      .spyOn(analytics, "trackPushNotificationBannerStillHidden")
      .mockImplementation(_unreadMessageCount => undefined);

    renderScreen();

    expect(mockTrackPushNotificationBannerStillHidden.mock.calls.length).toBe(
      0
    );
  });
  it("should call 'trackPushNotificationBannerStillHidden' with proper parameters", () => {
    jest
      .spyOn(selectors, "isForceDismissAndNotUnreadMessagesHiddenSelector")
      .mockReturnValue(true);
    jest
      .spyOn(selectors, "unreadMessagesCountAfterForceDismissionSelector")
      .mockReturnValue(15);
    const mockTrackPushNotificationBannerStillHidden = jest
      .spyOn(analytics, "trackPushNotificationBannerStillHidden")
      .mockImplementation(_unreadMessageCount => undefined);

    renderScreen();

    expect(mockTrackPushNotificationBannerStillHidden.mock.calls.length).toBe(
      1
    );
    expect(
      mockTrackPushNotificationBannerStillHidden.mock.calls[0].length
    ).toBe(1);
    expect(mockTrackPushNotificationBannerStillHidden.mock.calls[0][0]).toBe(
      15
    );
  });
});

const renderScreen = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    HookWrapper,
    MESSAGES_ROUTES.MESSAGES_HOME,
    {},
    store
  );
};

const HookWrapper = () => {
  usePushNotificationsBannerTracking();
  return undefined;
};
