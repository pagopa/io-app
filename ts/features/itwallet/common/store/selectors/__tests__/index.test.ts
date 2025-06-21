import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import {
  isItwDiscoveryBannerRenderableSelector,
  itwOfflineAccessAvailableSelector,
  itwShouldRenderFeedbackBannerSelector,
  itwShouldRenderOfflineBannerSelector,
  itwShouldRenderL3UpgradeBannerSelector
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { StoredCredential } from "../../../utils/itwTypesUtils";
import { appReducer } from "../../../../../../store/reducers";
import { Action } from "../../../../../../store/actions/types";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as credentialsSelectors from "../../../../credentials/store/selectors";
import * as preferencesSelectors from "../preferences";
import * as remoteConfigSelectors from "../remoteConfig";
import * as ingressSelectors from "../../../../../ingress/store/selectors";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

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

  it("Returns true when the wallet is available for offline access", () => {
    const globalState = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
      ),
      curriedAppReducer(
        itwCredentialsStore([
          { credentialType: CredentialType.PID },
          { credentialType: CredentialType.DRIVING_LICENSE }
        ] as Array<StoredCredential>)
      )
    );

    expect(itwOfflineAccessAvailableSelector(globalState)).toEqual(true);
  });

  it("Returns false when the wallet does not have credentials", () => {
    const globalState = pipe(
      undefined,
      curriedAppReducer(applicationChangeState("active")),
      curriedAppReducer(
        itwStoreIntegrityKeyTag("9556271b-2e1c-414d-b9a5-50ed8c2743e3")
      ),
      curriedAppReducer(
        itwCredentialsStore([
          { credentialType: CredentialType.PID }
        ] as Array<StoredCredential>)
      )
    );

    expect(itwOfflineAccessAvailableSelector(globalState)).toEqual(false);
  });

  it.each`
    isWalletValid | isBannerHidden | offlineAccessReason                       | shouldRenderBanner
    ${true}       | ${false}       | ${undefined}                              | ${true}
    ${true}       | ${false}       | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${false}
    ${true}       | ${true}        | ${undefined}                              | ${false}
    ${false}      | ${false}       | ${undefined}                              | ${false}
  `(
    "should render banner: $shouldRenderBanner when wallet valid: $isWalletValid, banner hidden: $isBannerHidden and offlineAccessReason: $offlineAccessReason",
    ({
      isWalletValid,
      isBannerHidden,
      offlineAccessReason,
      shouldRenderBanner
    }) => {
      jest
        .spyOn(ingressSelectors, "offlineAccessReasonSelector")
        .mockReturnValue(offlineAccessReason);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockImplementation(() => isWalletValid);

      jest
        .spyOn(preferencesSelectors, "itwIsOfflineBannerHiddenSelector")
        .mockImplementation(() => isBannerHidden);

      expect(
        itwShouldRenderOfflineBannerSelector({} as unknown as GlobalState)
      ).toBe(shouldRenderBanner);
    }
  );
});

describe("itwShouldRenderL3UpgradeBannerSelector", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it.each`
    itwEnabled | offlineAccessReason                       | isL3Enabled | eid       | expected
    ${true}    | ${undefined}                              | ${true}     | ${O.none} | ${true}
    ${true}    | ${undefined}                              | ${true}     | ${O.none} | ${true}
    ${true}    | ${undefined}                              | ${false}    | ${O.none} | ${false}
    ${true}    | ${OfflineAccessReasonEnum.DEVICE_OFFLINE} | ${true}     | ${O.none} | ${false}
    ${false}   | ${undefined}                              | ${true}     | ${O.none} | ${true}
  `(
    "should return $expected when offlineAccessReason is $offlineAccessReason, isL3Enabled is $isL3Enabled, eid is $eid",
    ({ offlineAccessReason, isL3Enabled, eid, expected }) => {
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
        .spyOn(credentialsSelectors, "itwCredentialsEidSelector")
        .mockReturnValue(eid);

      expect(
        itwShouldRenderL3UpgradeBannerSelector({} as unknown as GlobalState)
      ).toBe(expected);
    }
  );
});
