import MockDate from "mockdate";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwIsDiscoveryBannerHiddenSelector } from "../banners";

describe("itwIsDiscoveryBannerHiddenSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  const mockDate = "2025-01-14T20:43:21.361Z";

  it.each`
    dismissedOn                   | duration     | expected
    ${undefined}                  | ${100}       | ${false}
    ${undefined}                  | ${undefined} | ${false}
    ${"2025-01-5T20:43:21.361Z"}  | ${7}         | ${false}
    ${"2025-01-11T20:43:21.361Z"} | ${7}         | ${true}
  `(
    "should return $expected when dismissedOn is $dismissedOn, duration is $duration",
    ({ dismissedOn, duration, expected }) => {
      MockDate.set(mockDate);
      const state = {
        features: {
          itWallet: {
            banners: {
              discovery: { dismissedOn, duration, dismissCount: 1 }
            }
          }
        }
      } as unknown as GlobalState;

      expect(itwIsDiscoveryBannerHiddenSelector(state)).toBe(expected);
      MockDate.reset();
    }
  );
});
