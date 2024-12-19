import {
  isItwDiscoveryBannerRenderableSelector,
  itwShouldRenderFeedbackBannerSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwIsWalletEmptySelector } from "../../../../credentials/store/selectors";
import { itwIsFeedbackBannerHiddenSelector } from "../preferences";
import {
  isItwEnabledSelector,
  isItwFeedbackBannerEnabledSelector
} from "../../../../../../store/reducers/backendStatus/remoteConfig";
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
    isItwEnabledSelector: jest.fn(),
    isItwFeedbackBannerEnabledSelector: jest.fn()
  })
);

describe("itwDiscoveryBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    itwEnabled | lifecycleValid | expected
    ${true}    | ${true}        | ${false}
    ${true}    | ${false}       | ${true}
    ${false}   | ${true}        | ${false}
    ${false}   | ${false}       | ${false}
  `(
    "should return $expected when isItwEnabled is $itwEnabled, and lifecycleValid is $lifecycleValid",
    ({ itwEnabled, lifecycleValid, expected }) => {
      (isItwEnabledSelector as unknown as JestMock).mockReturnValue(itwEnabled);
      (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
        lifecycleValid
      );
      expect(
        isItwDiscoveryBannerRenderableSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});

describe("itwShouldRenderFeedbackBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });
  it.each`
    remotelyEnabled | hasValidWallet | walletIsEmpty | bannerIsHidden | expected
    ${true}         | ${true}        | ${true}       | ${true}        | ${false}
    ${true}         | ${true}        | ${true}       | ${false}       | ${false}
    ${true}         | ${true}        | ${false}      | ${true}        | ${false}
    ${true}         | ${true}        | ${false}      | ${false}       | ${true}
    ${true}         | ${false}       | ${true}       | ${true}        | ${false}
    ${true}         | ${false}       | ${true}       | ${false}       | ${false}
    ${true}         | ${false}       | ${false}      | ${true}        | ${false}
    ${true}         | ${false}       | ${false}      | ${false}       | ${false}
    ${false}        | ${true}        | ${true}       | ${true}        | ${false}
    ${false}        | ${true}        | ${true}       | ${false}       | ${false}
    ${false}        | ${true}        | ${false}      | ${true}        | ${false}
    ${false}        | ${true}        | ${false}      | ${false}       | ${false}
    ${false}        | ${false}       | ${true}       | ${true}        | ${false}
    ${false}        | ${false}       | ${true}       | ${false}       | ${false}
    ${false}        | ${false}       | ${false}      | ${true}        | ${false}
    ${false}        | ${false}       | ${false}      | ${false}       | ${false}
  `(
    "should return $expected when remotelyEnabled is $remotelyEnabled, hasValidWallet is $hasValidWallet, walletIsEmpty is $walletIsEmpty, and bannerIsHidden is $bannerIsHidden",
    ({
      hasValidWallet,
      walletIsEmpty,
      bannerIsHidden,
      expected,
      remotelyEnabled
    }) => {
      (
        isItwFeedbackBannerEnabledSelector as unknown as JestMock
      ).mockReturnValue(remotelyEnabled);
      (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
        hasValidWallet
      );
      (itwIsWalletEmptySelector as unknown as JestMock).mockReturnValue(
        walletIsEmpty
      );
      (
        itwIsFeedbackBannerHiddenSelector as unknown as JestMock
      ).mockReturnValue(bannerIsHidden);

      expect(
        itwShouldRenderFeedbackBannerSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});
