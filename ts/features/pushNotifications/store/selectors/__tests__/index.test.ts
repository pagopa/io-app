import { isPushNotificationsBannerRenderableSelector } from "..";
import { GlobalState } from "../../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../../login/info/store/selectors";
import { areNotificationPermissionsEnabled } from "../../reducers/environment";

type JestMock = ReturnType<typeof jest.fn>;
jest.mock("../../../../login/info/store/selectors", () => ({
  userFromSuccessLoginSelector: jest.fn()
}));

jest.mock("../../reducers/environment", () => ({
  areNotificationPermissionsEnabled: jest.fn()
}));

const getTestState = (hasSeen: boolean): GlobalState =>
  ({
    notifications: {
      userBehaviour: {
        pushNotificationPermissionsRequestDuration: hasSeen ? 1000 : 1
      }
    }
  } as unknown as GlobalState);

describe("isPushNotificationsBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it.each`
    notificationsEnabled | isFullLogin | hasUserSeenSystemNotificationsPrompt | expected
    ${false}             | ${false}    | ${false}                             | ${true}
    ${false}             | ${false}    | ${true}                              | ${false}
    ${false}             | ${true}     | ${false}                             | ${false}
    ${false}             | ${true}     | ${true}                              | ${false}
    ${true}              | ${false}    | ${false}                             | ${false}
    ${true}              | ${false}    | ${true}                              | ${false}
    ${true}              | ${true}     | ${false}                             | ${false}
    ${true}              | ${true}     | ${true}                              | ${false}
  `(
    "should return $expected when notificationsEnabled is $notificationsEnabled, isFullLogin is $isFullLogin, and hasUserSeenSystemNotificationsPrompt is $hasUserSeenSystemNotificationsPrompt",

    ({
      notificationsEnabled,
      isFullLogin,
      hasUserSeenSystemNotificationsPrompt,
      expected
    }) => {
      (
        areNotificationPermissionsEnabled as unknown as JestMock
      ).mockReturnValue(notificationsEnabled);
      (userFromSuccessLoginSelector as unknown as JestMock).mockReturnValue(
        isFullLogin
      );
      expect(
        isPushNotificationsBannerRenderableSelector(
          getTestState(hasUserSeenSystemNotificationsPrompt)
        )
      ).toBe(expected);
    }
  );
});
