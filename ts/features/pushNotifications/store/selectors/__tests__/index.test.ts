import {
  hasUserSeenSystemNotificationsPromptSelector,
  isPushNotificationsBannerRenderableSelector
} from "..";
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

const getTestState = (hasSeen?: boolean): GlobalState => {
  const duration = hasSeen !== undefined ? (hasSeen ? 1000 : 1) : undefined;
  return {
    notifications: {
      environment: {
        pushNotificationPermissionsRequestDuration: duration
      }
    }
  } as unknown as GlobalState;
};

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

describe("hasUserSeenSystemNotificationPromptSelector", () => {
  it("should return true when pushNotificationPermissionsRequestDuration is greater than 750", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState(true) as unknown as GlobalState
      )
    ).toBe(true);
  });
  it("should return false when pushNotificationPermissionsRequestDuration is less than 750", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState(false) as unknown as GlobalState
      )
    ).toBe(false);
  });
  it("should return false when pushNotificationPermissionsRequestDuration is undefined", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState() as unknown as GlobalState
      )
    ).toBe(false);
  });
});
