import {
  isItwDiscoveryBannerRenderableSelector,
  itwOfflineAccessAvailableSelector,
  itwShouldRenderFeedbackBannerSelector,
  itwShouldRenderL3UpgradeBannerSelector,
  itwShouldRenderWalletUpgradeMDLDetailsBannerSelector
} from "..";
import { GlobalState } from "../../../../../../store/reducers/types";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import * as credentialsSelectors from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as preferencesSelectors from "../preferences";
import * as remoteConfigSelectors from "../remoteConfig";

describe("isItwDiscoveryBannerRenderableSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    itwEnabled | lifecycleValid | offlineAccessReason                       | expected
    ${true}    | ${false}       | ${undefined}                              | ${true}
    ${true}    | ${false}       | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${false}
    ${true}    | ${true}        | ${undefined}                              | ${false}
    ${false}   | ${false}       | ${undefined}                              | ${false}
  `(
    "should return $expected when isItwEnabled is $itwEnabled, lifecycleValid is $lifecycleValid, and offlineAccessReason is $offlineAccessReason",
    ({ itwEnabled, lifecycleValid, offlineAccessReason, expected }) => {
      jest
        .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(itwEnabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(lifecycleValid);
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(false);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineAccessReason);

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
    remotelyEnabled | hasValidWallet | walletIsEmpty | bannerIsHidden | offlineAccessReason                       | expected
    ${true}         | ${true}        | ${false}      | ${false}       | ${undefined}                              | ${true}
    ${true}         | ${true}        | ${false}      | ${false}       | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${false}
    ${true}         | ${true}        | ${false}      | ${true}        | ${undefined}                              | ${false}
    ${true}         | ${true}        | ${true}       | ${false}       | ${undefined}                              | ${false}
    ${true}         | ${false}       | ${false}      | ${false}       | ${undefined}                              | ${false}
    ${false}        | ${true}        | ${false}      | ${false}       | ${undefined}                              | ${false}
  `(
    "should return $expected when remotelyEnabled is $remotelyEnabled, hasValidWallet is $hasValidWallet, walletIsEmpty is $walletIsEmpty, bannerIsHidden is $bannerIsHidden, and offlineAccessReason is $offlineAccessReason",
    ({
      hasValidWallet,
      walletIsEmpty,
      bannerIsHidden,
      expected,
      remotelyEnabled,
      offlineAccessReason
    }) => {
      jest
        .spyOn(remoteConfigSelectors, "isItwFeedbackBannerEnabledSelector")
        .mockReturnValue(remotelyEnabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(hasValidWallet);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(walletIsEmpty);
      jest
        .spyOn(preferencesSelectors, "itwIsFeedbackBannerHiddenSelector")
        .mockReturnValue(bannerIsHidden);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineAccessReason);

      expect(
        itwShouldRenderFeedbackBannerSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});

describe("itwOfflineAccessAvailableSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    isLifecycleIsOperationalOrValid | isWalletEmpty | isAvailable
    ${false}                        | ${false}      | ${false}
    ${false}                        | ${true}       | ${false}
    ${true}                         | ${false}      | ${true}
    ${true}                         | ${true}       | ${false}
  `(
    "should return $isAvailable when isLifecycleIsOperationalOrValid is $isLifecycleIsOperationalOrValid, isWalletEmpty is $isWalletEmpty",
    ({ isLifecycleIsOperationalOrValid, isWalletEmpty, isAvailable }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsOperationalOrValid")
        .mockImplementation(() => isLifecycleIsOperationalOrValid);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockImplementation(() => isWalletEmpty);

      expect(
        itwOfflineAccessAvailableSelector({} as unknown as GlobalState)
      ).toEqual(isAvailable);
    }
  );
});

describe("itwShouldRenderL3UpgradeBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    itwEnabled | offlineAccessReason                       | isL3Enabled | isEidL3  | expected
    ${true}    | ${undefined}                              | ${true}     | ${false} | ${true}
    ${true}    | ${undefined}                              | ${true}     | ${false} | ${true}
    ${true}    | ${undefined}                              | ${false}    | ${false} | ${false}
    ${true}    | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${true}     | ${false} | ${false}
    ${false}   | ${undefined}                              | ${true}     | ${false} | ${true}
  `(
    "should return $expected when offlineAccessReason is $offlineAccessReason, isL3Enabled is $isL3Enabled, isEidL3 is $isEidL3",
    ({ offlineAccessReason, isL3Enabled, isEidL3, expected }) => {
      jest
        .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(true);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineAccessReason);
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(isL3Enabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isEidL3);

      expect(
        itwShouldRenderL3UpgradeBannerSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});

describe("itwShouldRenderWalletUpgradeMDLDetailsBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    isWalletValid | offlineAccessReason                       | isL3Enabled | isEidL3  | isBannerHidden | expected
    ${true}       | ${undefined}                              | ${true}     | ${false} | ${false}       | ${true}
    ${true}       | ${undefined}                              | ${true}     | ${false} | ${true}        | ${false}
    ${true}       | ${undefined}                              | ${true}     | ${true}  | ${false}       | ${false}
    ${true}       | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${true}     | ${false} | ${false}       | ${false}
    ${false}      | ${undefined}                              | ${true}     | ${false} | ${false}       | ${false}
    ${true}       | ${undefined}                              | ${false}    | ${false} | ${false}       | ${false}
  `(
    "should return $expected when isWalletValid=$isWalletValid, offlineAccessReason=$offlineAccessReason, isL3Enabled=$isL3Enabled, isEidL3=$isEidL3, isBannerHidden=$isBannerHidden",
    ({
      isWalletValid,
      offlineAccessReason,
      isL3Enabled,
      isEidL3,
      isBannerHidden,
      expected
    }) => {
      jest
        .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(isWalletValid);
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineAccessReason);
      jest
        .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
        .mockReturnValue(isL3Enabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
        .mockReturnValue(isEidL3);
      jest
        .spyOn(
          preferencesSelectors,
          "itwIsWalletUpgradeMDLDetailsBannerHiddenSelector"
        )
        .mockReturnValue(isBannerHidden);

      expect(
        itwShouldRenderWalletUpgradeMDLDetailsBannerSelector(
          {} as unknown as GlobalState
        )
      ).toBe(expected);
    }
  );
});
