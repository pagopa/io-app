import MockDate from "mockdate";

import { GlobalState } from "../../../../../../store/reducers/types";
import {
  itwIsActivationSuccessFeedbackBannerVisibleSelector,
  itwIsBannerHiddenSelector,
  itwIsBannerVisibleSelector
} from "../banners";

describe("itwIsBannerHiddenSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  const mockDate = "2025-01-14T20:43:21.361Z";

  it.each`
    dismissedOn                   | expected
    ${undefined}                  | ${false}
    ${"2025-01-5T20:43:21.361Z"}  | ${false}
    ${"2025-01-11T20:43:21.361Z"} | ${true}
  `(
    "should return $expected when dismissedOn is $dismissedOn, duration is $duration",
    ({ dismissedOn, expected }) => {
      MockDate.set(mockDate);
      const state = {
        features: {
          itWallet: {
            banners: {
              discovery: { dismissedOn, dismissCount: 1 }
            }
          }
        }
      } as unknown as GlobalState;

      expect(itwIsBannerHiddenSelector("discovery")(state)).toBe(expected);
      MockDate.reset();
    }
  );
});

describe("itwIsBannerVisibleSelector", () => {
  afterEach(() => {
    MockDate.reset();
  });

  const buildState = (shownOn: string | undefined) =>
    ({
      features: {
        itWallet: {
          banners: {
            activationSuccessFeedback: shownOn ? { shownOn } : {}
          }
        }
      }
    }) as unknown as GlobalState;

  it("returns false when the banner was never shown", () => {
    const state = buildState(undefined);
    expect(itwIsBannerVisibleSelector("activationSuccessFeedback")(state)).toBe(
      false
    );
  });

  it("returns true within the configured visible duration", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const state = buildState("2026-06-28T12:00:00.000Z"); // 3 days ago
    expect(itwIsBannerVisibleSelector("activationSuccessFeedback")(state)).toBe(
      true
    );
  });

  it("returns false once the configured visible duration has elapsed", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const state = buildState("2026-06-23T11:59:59.000Z"); // just over 7 days ago
    expect(itwIsBannerVisibleSelector("activationSuccessFeedback")(state)).toBe(
      false
    );
  });

  it("returns true forever for banners without a configured visible duration", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const state = {
      features: {
        itWallet: {
          banners: { discovery: { shownOn: "2020-01-01T00:00:00.000Z" } }
        }
      }
    } as unknown as GlobalState;
    expect(itwIsBannerVisibleSelector("discovery")(state)).toBe(true);
  });
});

describe("itwIsActivationSuccessFeedbackBannerVisibleSelector", () => {
  afterEach(() => {
    MockDate.reset();
  });

  it("returns false when dismissed even if still within the visible duration", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const state = {
      features: {
        itWallet: {
          banners: {
            activationSuccessFeedback: {
              shownOn: "2026-06-28T12:00:00.000Z",
              dismissedOn: "2026-06-29T12:00:00.000Z",
              dismissCount: 1
            }
          }
        }
      }
    } as unknown as GlobalState;
    expect(itwIsActivationSuccessFeedbackBannerVisibleSelector(state)).toBe(
      false
    );
  });

  it("returns true when shown, not dismissed, and within the visible duration", () => {
    MockDate.set("2026-07-01T12:00:00.000Z");
    const state = {
      features: {
        itWallet: {
          banners: {
            activationSuccessFeedback: { shownOn: "2026-06-28T12:00:00.000Z" }
          }
        }
      }
    } as unknown as GlobalState;
    expect(itwIsActivationSuccessFeedbackBannerVisibleSelector(state)).toBe(
      true
    );
  });
});
