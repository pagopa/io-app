import { testSaga } from "redux-saga-test-plan";
import { CommonActions } from "@react-navigation/native";
import { checkNotificationsPermissionsSaga } from "../checkNotificationsPermissionsSaga";
import InitializedProfile from "../../../__mocks__/initializedProfile";
import {
  AuthorizationStatus,
  checkNotificationPermissions,
  requestNotificationPermissions
} from "../../../utils/notification";
import NavigationService from "../../../navigation/NavigationService";
import ROUTES from "../../../navigation/routes";

describe("checkNotificationsPermissionsSaga", () => {
  it("upon saga startup, it should ask for push notifications permission", () => {
    const mockedProfile = { ...InitializedProfile, version: 0 };

    testSaga(checkNotificationsPermissionsSaga, mockedProfile)
      .next()
      .call(checkNotificationPermissions);
  });

  it("if the push notifications permission was given, the saga will terminate ", () => {
    const mockedProfile = { ...InitializedProfile, version: 0 };

    testSaga(checkNotificationsPermissionsSaga, mockedProfile)
      .next()
      .call(checkNotificationPermissions)
      .next(true)
      .isDone();
  });

  it("if the push notifications permission was not given and is first onboarding, the saga will request push notification permissions", () => {
    const mockedProfile = { ...InitializedProfile, version: 0 };

    testSaga(checkNotificationsPermissionsSaga, mockedProfile)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions);
  });

  it("if the saga asks for push permissions and the user give them, the saga will terminate", () => {
    const mockedProfile = { ...InitializedProfile, version: 0 };

    testSaga(checkNotificationsPermissionsSaga, mockedProfile)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next({ authorizationStatus: AuthorizationStatus.Authorized })
      .isDone();
  });

  /* it("if the saga asks for push permissions and the user does not give them, the saga navigates to the Info Screen", () => {
    const mockedProfile = { ...InitializedProfile, version: 0 };
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");

    testSaga(checkNotificationsPermissionsSaga, mockedProfile)
      .next()
      .call(checkNotificationPermissions)
      .next(false)
      .call(requestNotificationPermissions)
      .next({ authorizationStatus: AuthorizationStatus.StatusDenied })
      .next();

    expect(spy).toHaveBeenCalledWith(
      CommonActions.navigate(ROUTES.ONBOARDING, {
        screen: ROUTES.ONBOARDING_NOTIFICATIONS_INFO_SCREEN_CONSENT
      })
    );
  }); */
});
