import { GlobalState } from "../../../../../../store/reducers/types";
import { itwIsDiscoveryBannerHiddenSelector } from "../banners";

describe("itwIsDiscoveryBannerHiddenSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    hiddenUntil                   | expected
    ${undefined}                  | ${false}
    ${new Date(Date.now() + 100)} | ${true}
    ${new Date(Date.now() - 100)} | ${false}
    ${"invalid-date"}             | ${false}
  `(
    "should return $expected when hiddenUntil is $hiddenUntil",
    ({ hiddenUntil, expected }) => {
      const state = {
        features: {
          itWallet: {
            banners: {
              discovery: { hiddenUntil }
            }
          }
        }
      } as unknown as GlobalState;

      expect(itwIsDiscoveryBannerHiddenSelector(state)).toBe(expected);
    }
  );
});
