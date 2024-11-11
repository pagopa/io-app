import {
  isItwDiscoveryBannerRenderableSelector,
  itwShouldRenderFeedbackBanner
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwIsWalletEmptySelector } from "../../../../credentials/store/selectors";
import { itwIsFeedbackBannerHiddenSelector } from "../preferences";
import { isItwEnabledSelector } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { isItwTrialActiveSelector } from "../../../../../trialSystem/store/reducers";
import { itwLifecycleIsValidSelector } from "../../../../lifecycle/store/selectors";

type JestMock = ReturnType<typeof jest.fn>;

jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsValidSelector: jest.fn()
}));
jest.mock("../../../../credentials/store/selectors", () => ({
  itwIsWalletEmptySelector: jest.fn()
}));

jest.mock("../preferences", () => ({
  itwIsFeedbackBannerHiddenSelector: jest.fn()
}));

jest.mock(
  "../../../../../../store/reducers/backendStatus/remoteConfig",
  () => ({
    isItwEnabledSelector: jest.fn()
  })
);
jest.mock("../../../../lifecycle/store/selectors", () => ({
  itwLifecycleIsValidSelector: jest.fn()
}));
jest.mock("../../../../../trialSystem/store/reducers", () => ({
  isItwTrialActiveSelector: jest.fn()
}));

describe("itwDiscoveryBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    itwEnabled | lifecycleValid | trialActive | expected
    ${true}    | ${true}        | ${true}     | ${false}
    ${true}    | ${true}        | ${false}    | ${false}
    ${true}    | ${false}       | ${true}     | ${true}
    ${true}    | ${false}       | ${false}    | ${false}
    ${false}   | ${true}        | ${true}     | ${false}
    ${false}   | ${true}        | ${false}    | ${false}
    ${false}   | ${false}       | ${true}     | ${false}
    ${false}   | ${false}       | ${false}    | ${false}
  `(
    "should return $expected when isItwEnabled is $itwEnabled, trialActive is $trialActive, and lifecycleValid is $lifecycleValid",
    ({ itwEnabled, trialActive, lifecycleValid, expected }) => {
      (isItwEnabledSelector as unknown as JestMock).mockReturnValue(itwEnabled);
      (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
        lifecycleValid
      );
      (isItwTrialActiveSelector as unknown as JestMock).mockReturnValue(
        trialActive
      );
      expect(
        isItwDiscoveryBannerRenderableSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});

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
