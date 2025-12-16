import {
  hasUserSeenSystemNotificationsPromptSelector,
  isPushNotificationsBannerRenderableSelector
} from "..";
import { GlobalState } from "../../../../../store/reducers/types";
import { userFromSuccessLoginSelector } from "../../../../authentication/loginInfo/store/selectors";
import { areNotificationPermissionsEnabledSelector } from "../../reducers/environment";
import * as DISMISSAL_SELECTORS from "../notificationsBannerDismissed";

type JestMock = ReturnType<typeof jest.fn>;
jest.mock("../../../../authentication/loginInfo/store/selectors", () => ({
  userFromSuccessLoginSelector: jest.fn()
}));

jest.mock("../../reducers/environment", () => ({
  areNotificationPermissionsEnabledSelector: jest.fn()
}));
jest.mock("../notificationsBannerDismissed", () => ({
  shouldResetNotificationBannerDismissStateSelector: jest.fn(),
  pushNotificationsBannerForceDismissionDateSelector: jest.fn()
}));

type TestStateProps = {
  hasSeen?: boolean;
};

const getTestState = ({ hasSeen }: TestStateProps): GlobalState => {
  const duration = hasSeen !== undefined ? (hasSeen ? 1000 : 1) : undefined;
  return {
    notifications: {
      environment: {
        pushNotificationPermissionsRequestDuration: duration
      }
    }
  } as unknown as GlobalState;
};

const falseTrueArr = [false, true];

// eslint-disable-next-line sonarjs/cognitive-complexity
describe("isPushNotificationsBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  for (const notificationsEnabled of falseTrueArr) {
    for (const isFullLogin of falseTrueArr) {
      for (const hasUserSeenSystemNotificationsPrompt of falseTrueArr) {
        for (const forceDismissionDate of [undefined, new Date().getTime()]) {
          for (const shouldResetNotificationBannerDismissState of falseTrueArr) {
            const isForceDismissed =
              forceDismissionDate !== undefined &&
              !shouldResetNotificationBannerDismissState;

            // 'expected' mirrors the selector's own logic
            const expected =
              !isForceDismissed &&
              !isFullLogin &&
              !notificationsEnabled &&
              !hasUserSeenSystemNotificationsPrompt;

            it(`should return ${expected} when 
            notificationsEnabled is ${notificationsEnabled},
            isFullLogin is ${isFullLogin},
            hasUserSeenSystemNotificationsPrompt is ${hasUserSeenSystemNotificationsPrompt},
            forceDismissionDate is ${forceDismissionDate}, and
            shouldResetNotificationBannerDismissState is ${shouldResetNotificationBannerDismissState}`, () => {
              (
                DISMISSAL_SELECTORS.shouldResetNotificationBannerDismissStateSelector as unknown as JestMock
              ).mockImplementation(
                () => shouldResetNotificationBannerDismissState
              );
              (
                DISMISSAL_SELECTORS.pushNotificationsBannerForceDismissionDateSelector as unknown as JestMock
              ).mockImplementation(() => forceDismissionDate);
              (
                areNotificationPermissionsEnabledSelector as unknown as JestMock
              ).mockImplementation(() => notificationsEnabled);
              (
                userFromSuccessLoginSelector as unknown as JestMock
              ).mockImplementation(() => isFullLogin);
              expect(
                isPushNotificationsBannerRenderableSelector(
                  getTestState({
                    hasSeen: hasUserSeenSystemNotificationsPrompt
                  })
                )
              ).toBe(expected);
            });
          }
        }
      }
    }
  }
});

describe("hasUserSeenSystemNotificationPromptSelector", () => {
  it("should return true when pushNotificationPermissionsRequestDuration is greater than 750", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState({ hasSeen: true }) as unknown as GlobalState
      )
    ).toBe(true);
  });
  it("should return false when pushNotificationPermissionsRequestDuration is less than 750", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState({ hasSeen: false }) as unknown as GlobalState
      )
    ).toBe(false);
  });
  it("should return false when pushNotificationPermissionsRequestDuration is undefined", () => {
    expect(
      hasUserSeenSystemNotificationsPromptSelector(
        getTestState({}) as unknown as GlobalState
      )
    ).toBe(false);
  });
});
