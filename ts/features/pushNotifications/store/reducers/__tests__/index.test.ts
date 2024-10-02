import AsyncStorage from "@react-native-async-storage/async-storage";
import { omit } from "lodash";
import {
  NOTIFICATIONS_STORE_VERSION,
  notificationsPersistConfig,
  notificationsReducer,
  persistedNotificationsReducer,
  shouldShowEngagementScreenSelector
} from "..";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";

describe("Main pushNotifications reducer", () => {
  it("persistor version should be -1", () => {
    expect(NOTIFICATIONS_STORE_VERSION).toBe(-1);
  });
  it("notificationsPersistConfig should match expected values", () => {
    expect(notificationsPersistConfig.key).toBe("notifications");
    expect(notificationsPersistConfig.storage).toBe(AsyncStorage);
    expect(notificationsPersistConfig.version).toBe(
      NOTIFICATIONS_STORE_VERSION
    );
    expect(notificationsPersistConfig.whitelist).toStrictEqual([
      "installation",
      "pendingMessage",
      "userBehaviour"
    ]);
  });
  it("notificationsReducer initial state should match snapshot", () => {
    const state = notificationsReducer(
      undefined,
      applicationChangeState("active")
    );
    const stateWithoutInstallationId = omit(state, "installation.id");
    expect(stateWithoutInstallationId).toMatchSnapshot();
  });
  it("persistedNotificationsReducer initial state should match snapshot", () => {
    const state = persistedNotificationsReducer(
      undefined,
      applicationChangeState("active")
    );
    const stateWithoutInstallationId = omit(state, "installation.id");
    expect(stateWithoutInstallationId).toMatchSnapshot();
  });
});

describe("shouldShowEngagementScreenSelector", () => {
  [false, true].forEach(applicationInitialized =>
    [false, true].forEach(onboardingInstructionsShown =>
      [false, true].forEach(systemNotificationsEnabled =>
        [false, true].forEach(engagementScreenShown => {
          const expectedOutput =
            applicationInitialized &&
            !onboardingInstructionsShown &&
            !systemNotificationsEnabled &&
            !engagementScreenShown;
          it(`Should output '${expectedOutput}' when 'applicationInitialized' is '${applicationInitialized}' , 'onboardingInstructionsShown' is '${onboardingInstructionsShown}' , 'systemNotificationsEnabled' is '${systemNotificationsEnabled} ' and 'engagementScreenShown' is '${engagementScreenShown}' `, () => {
            const state = {
              notifications: {
                environment: {
                  applicationInitialized,
                  onboardingInstructionsShown,
                  systemNotificationsEnabled
                },
                userBehaviour: {
                  engagementScreenShown
                }
              }
            } as GlobalState;
            const output = shouldShowEngagementScreenSelector(state);
            expect(output).toBe(expectedOutput);
          });
        })
      )
    )
  );
});
