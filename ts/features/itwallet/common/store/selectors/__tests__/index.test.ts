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

const mockValues = (
  itwEnabledMock: boolean,
  itwLifecycleValidMock: boolean,
  trialActiveMock: boolean
) => {
  (isItwEnabledSelector as unknown as JestMock).mockReturnValue(itwEnabledMock);
  (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
    itwLifecycleValidMock
  );
  (isItwTrialActiveSelector as unknown as JestMock).mockReturnValue(
    trialActiveMock
  );
};

describe("itwDiscoveryBannerSelector", () => {
  for (const itwEnabled of [true, false]) {
    for (const lifecycleValid of [true, false]) {
      for (const trialActive of [true, false]) {
        const expectedResult = !(!trialActive || lifecycleValid || !itwEnabled); // this mimicks the behaviour of the standalone banner's selector
        it(`should return ${expectedResult} if isItwEnabled is ${itwEnabled}, trialActive is ${trialActive} and lifecycleValid is ${lifecycleValid}`, () => {
          mockValues(itwEnabled, lifecycleValid, trialActive);
          expect(
            isItwDiscoveryBannerRenderableSelector({} as unknown as GlobalState)
          ).toBe(expectedResult);
        });
      }
    }
  }
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
