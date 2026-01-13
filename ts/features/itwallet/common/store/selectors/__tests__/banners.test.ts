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

      expect(itwIsDiscoveryBannerHiddenSelector(state)).toBe(expected);
      MockDate.reset();
    }
  );
});
