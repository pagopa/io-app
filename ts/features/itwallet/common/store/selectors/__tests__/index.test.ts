import { pipe } from "fp-ts/lib/function";
import {
  isItwDiscoveryBannerRenderableSelector,
  itwOfflineAccessAvailableSelector,
  itwShouldRenderFeedbackBannerSelector,
  itwShouldRenderOfflineBannerSelector
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { GlobalState } from "../../../../../../store/reducers/types";
import { itwStoreIntegrityKeyTag } from "../../../../issuance/store/actions";
import { itwCredentialsStore } from "../../../../credentials/store/actions";
import { CredentialType } from "../../../utils/itwMocksUtils";
import { StoredCredential } from "../../../utils/itwTypesUtils";
import { setItwOfflineAccessEnabled } from "../../../../../../store/actions/persistedPreferences";
import { appReducer } from "../../../../../../store/reducers";
import { Action } from "../../../../../../store/actions/types";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import * as credentialsSelectors from "../../../../credentials/store/selectors";
import * as preferencesSelectors from "../preferences";
import * as remoteConfigSelectors from "../remoteConfig";
import * as persistedSelectors from "../../../../../../store/reducers/persistedPreferences.ts";

const curriedAppReducer =
  (action: Action) => (state: GlobalState | undefined) =>
    appReducer(state, action);

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
      jest
        .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
        .mockReturnValue(itwEnabled);
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockReturnValue(lifecycleValid);

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
      ),
      curriedAppReducer(setItwOfflineAccessEnabled(true))
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
      ),
      curriedAppReducer(setItwOfflineAccessEnabled(true))
    );

    expect(itwOfflineAccessAvailableSelector(globalState)).toEqual(false);
  });

  it.each`
    isWalletValid | isOfflineEnabled | isBannerHidden | shouldRenderBanner
    ${true}       | ${true}          | ${false}       | ${true}
    ${true}       | ${true}          | ${true}        | ${false}
    ${false}      | ${true}          | ${false}       | ${false}
    ${false}      | ${true}          | ${true}        | ${false}
    ${true}       | ${false}         | ${false}       | ${false}
    ${true}       | ${false}         | ${true}        | ${false}
  `(
    "should render banner: $shouldRenderBanner when wallet valid: $isWalletValid, offline enabled: $isOfflineEnabled and banner hidden: $isBannerHidden",
    ({
      isWalletValid,
      isOfflineEnabled,
      isBannerHidden,
      shouldRenderBanner
    }) => {
      jest
        .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
        .mockImplementation(() => isWalletValid);

      jest
        .spyOn(persistedSelectors, "isItwOfflineAccessEnabledSelector")
        .mockImplementation(() => isOfflineEnabled);

      jest
        .spyOn(preferencesSelectors, "itwIsOfflineBannerHiddenSelector")
        .mockImplementation(() => isBannerHidden);

      expect(
        itwShouldRenderOfflineBannerSelector({} as unknown as GlobalState)
      ).toBe(shouldRenderBanner);
    }
  );
});
