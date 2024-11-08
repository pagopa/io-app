import { itwShouldRenderFeedbackBanner } from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwIsWalletEmptySelector } from "../../../../credentials/store/selectors";
import { itwLifecycleIsValidSelector } from "../../../../lifecycle/store/selectors";
import { itwIsFeedbackBannerHiddenSelector } from "../preferences";

jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsValidSelector: jest.fn()
}));
jest.mock("../../../../credentials/store/selectors", () => ({
  itwIsWalletEmptySelector: jest.fn()
}));

jest.mock("../preferences", () => ({
  itwIsFeedbackBannerHiddenSelector: jest.fn()
}));

type JestMock = ReturnType<typeof jest.fn>;

describe("itwShouldRenderFeedbackBanner", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it.each`
    hasValidWallet | walletIsEmpty | bannerIsHidden | expected
    ${true}        | ${true}       | ${true}        | ${false}
    ${true}        | ${true}       | ${false}       | ${false}
    ${true}        | ${false}      | ${true}        | ${false}
    ${true}        | ${false}      | ${false}       | ${true}
    ${false}       | ${true}       | ${true}        | ${false}
    ${false}       | ${true}       | ${false}       | ${false}
    ${false}       | ${false}      | ${true}        | ${false}
    ${false}       | ${false}      | ${false}       | ${false}
  `(
    "should return $expected when hasValidWallet is $hasValidWallet, walletIsEmpty is $walletIsEmpty, and bannerIsHidden is $bannerIsHidden",
    ({ hasValidWallet, walletIsEmpty, bannerIsHidden, expected }) => {
      (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
        hasValidWallet
      );
      (itwIsWalletEmptySelector as unknown as JestMock).mockReturnValue(
        walletIsEmpty
      );
      (
        itwIsFeedbackBannerHiddenSelector as unknown as JestMock
      ).mockReturnValue(bannerIsHidden);

      expect(itwShouldRenderFeedbackBanner({} as unknown as GlobalState)).toBe(
        expected
      );
    }
  );
});
