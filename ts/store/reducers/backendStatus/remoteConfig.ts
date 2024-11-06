import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import { Platform } from "react-native";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { Action } from "../../actions/types";
import { backendStatusLoadSuccess } from "../../actions/backendStatus";
import { GlobalState } from "../types";
import { getAppVersion, isVersionSupported } from "../../../utils/appVersion";
import {
  cdcEnabled,
  cgnMerchantsV2Enabled,
  fciEnabled,
  premiumMessagesOptInEnabled,
  scanAdditionalBarcodesEnabled
} from "../../../config";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { BancomatPayConfig } from "../../../../definitions/content/BancomatPayConfig";
import { isPropertyWithMinAppVersionEnabled } from "../featureFlagWithMinAppVersionStatus";
import { BarcodesScannerConfig } from "../../../../definitions/content/BarcodesScannerConfig";
import { isIdPayTestEnabledSelector } from "../persistedPreferences";
import { Banner } from "../../../../definitions/content/Banner";

export type RemoteConfigState = O.Option<BackendStatus["config"]>;

const initialRemoteConfigState: RemoteConfigState = O.none;

export default function remoteConfigReducer(
  state: RemoteConfigState = initialRemoteConfigState,
  action: Action
): RemoteConfigState {
  if (action.type === getType(backendStatusLoadSuccess)) {
    return O.some(action.payload.config);
  }
  return state;
}

export const remoteConfigSelector = (state: GlobalState) => state.remoteConfig;

export const isBackendStatusLoadedSelector = (state: GlobalState) =>
  O.isSome(remoteConfigSelector(state));

export const cgnMerchantVersionSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean | undefined =>
    cgnMerchantsV2Enabled &&
    pipe(
      remoteConfig,
      O.map(config => config.cgn.merchants_v2),
      O.toUndefined
    )
);

export const assistanceToolConfigSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): ToolEnum | undefined =>
    pipe(
      remoteConfig,
      O.map(c => c.assistanceTool.tool),
      O.toUndefined
    )
);

/**
 * return the remote config about paypal enabled/disabled
 * if there is no data, false is the default value -> (paypal disabled)
 */
export const isPaypalEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(c => c.paypal.enabled),
      O.toUndefined
    ) ?? false
);

/**
 * return the remote config about BancomatPay
 * if no data is available the default is considering all flags set to false
 */
export const bancomatPayConfigSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): BancomatPayConfig =>
    pipe(
      remoteConfig,
      O.map(c => c.bancomatPay),
      O.getOrElseW(() => ({
        display: false,
        onboarding: false,
        payment: false
      }))
    )
);

/**
 * return the remote config about CGN enabled/disabled
 * if there is no data, false is the default value -> (CGN disabled)
 */
export const isCGNEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(c => c.cgn.enabled),
      O.toUndefined
    ) ?? false
);

export const fimsRequiresAppUpdateSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    remoteConfig =>
      !isPropertyWithMinAppVersionEnabled({
        remoteConfig,
        mainLocalFlag: true,
        configPropertyName: "fims"
      })
  );

export const fimsDomainSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): string | undefined =>
    pipe(
      remoteConfig,
      O.map(c => c.fims.domain),
      O.toUndefined
    )
);

/**
 * Return the remote config about the Premium Messages opt-in/out
 * screens enabled/disable. If there is no data or the local Feature Flag is
 * disabled, false is the default value -> (Opt-in/out screen disabled)
 */
export const isPremiumMessagesOptInOutEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    (premiumMessagesOptInEnabled &&
      pipe(
        remoteConfig,
        O.map(c => c.premiumMessages.opt_in_out_enabled),
        O.toUndefined
      )) ??
    false
);

/**
 * return the remote config about CDC enabled/disabled
 * if there is no data or the local Feature Flag is disabled,
 * false is the default value -> (CDC disabled)
 */
export const isCdcEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    cdcEnabled &&
    pipe(
      remoteConfig,
      O.map(c => c.cdc.enabled),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote config about the barcodes scanner.
 * If no data is available or the local feature flag is falsy
 * the default is considering all flags set to false.
 */
export const barcodesScannerConfigSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): BarcodesScannerConfig =>
    pipe(
      remoteConfig,
      O.map(c => c.barcodesScanner),
      // If the local feature flag is disabled all the
      // configurations should be set as `false`.
      O.filter(() => scanAdditionalBarcodesEnabled),
      O.getOrElseW(() => ({
        dataMatrixPosteEnabled: false
      }))
    )
);

/**
 * Return the remote config about PN enabled/disabled
 * if there is no data, false is the default value -> (PN disabled)
 */
export const isPnEnabledSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(c => c.pn.enabled),
    O.getOrElse(() => false)
  );

/**
 * Return false if the app needs to be updated in order to use PN.
 */
export const isPnAppVersionSupportedSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(c =>
      isVersionSupported(
        Platform.OS === "ios"
          ? c.pn.min_app_version.ios
          : c.pn.min_app_version.android,
        getAppVersion()
      )
    ),
    O.getOrElse(() => false)
  );

/**
 * Return the minimum app version required to use PN.
 */
export const pnMinAppVersionSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(c =>
      Platform.OS === "ios"
        ? c.pn.min_app_version.ios
        : c.pn.min_app_version.android
    ),
    O.getOrElse(() => "-")
  );

/**
 * Return the url of the PN frontend.
 */
export const pnFrontendUrlSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(c => c.pn.frontend_url),
    O.getOrElse(() => "")
  );

export const paymentsConfigSelector = createSelector(
  remoteConfigSelector,
  config =>
    pipe(
      config,
      O.map(c => c.payments)
    )
);

export const preferredPspsByOriginSelector = createSelector(
  paymentsConfigSelector,
  config =>
    pipe(
      config,
      O.map(c => c.preferredPspsByOrigin),
      O.toUndefined
    )
);

/**
 * Return the remote config about FCI enabled/disabled
 * if there is no data or the local Feature Flag is disabled,
 * false is the default value -> (FCI disabled)
 */
export const isFciEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    fciEnabled &&
    pipe(
      remoteConfig,
      O.map(c =>
        isVersionSupported(
          Platform.OS === "ios"
            ? c.fci.min_app_version.ios
            : c.fci.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

export const isIdPayEnabledSelector = createSelector(
  remoteConfigSelector,
  isIdPayTestEnabledSelector,
  (remoteConfig, isIdPayTestEnabled): boolean =>
    isIdPayTestEnabled &&
    pipe(
      remoteConfig,
      O.map(c =>
        isVersionSupported(
          Platform.OS === "ios"
            ? c.idPay.min_app_version.ios
            : c.idPay.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote config about the new payment section enabled/disabled
 * If the local feature flag is enabled, the remote config is ignored
 */
export const isNewPaymentSectionEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(c =>
        isVersionSupported(
          Platform.OS === "ios"
            ? c.newPaymentSection.min_app_version.ios
            : c.newPaymentSection.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);
/*
This selector checks that both the new wallet section and the
new document scan section are included in the tab bar.
In this case, the navigation to the profile section in the tab bar
is replaced with the 'settings' section accessed by clicking
on the icon in the headers of the top-level screens.
It will be possible to delete this control and all the code it carries
it carries when isNewPaymentSectionEnabledSelector and
isNewScanSectionLocallyEnabled will be deleted.

NOTE: Since there is a lot of logic attached to this selector,
this reassignment of its value has been done for the moment,
but as soon as the FF can be eliminated, all the logic on which
it depends and both selectors will also be eliminated.
 */
export const isSettingsVisibleAndHideProfileSelector =
  isNewPaymentSectionEnabledSelector;

/**
 * Return the remote config about IT-WALLET enabled/disabled
 * if there is no data or the local Feature Flag is disabled,
 * false is the default value -> (IT-WALLET disabled)
 */
export const isItwEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(
        c =>
          isVersionSupported(
            Platform.OS === "ios"
              ? c.itw.min_app_version.ios
              : c.itw.min_app_version.android,
            getAppVersion()
          ) && c.itw.enabled
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote feature flag about the payment feedback banner enabled/disabled
 * that is shown after a successful payment.
 */
export const isPaymentsFeedbackBannerEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(c =>
        isVersionSupported(
          Platform.OS === "ios"
            ? c.newPaymentSection.feedbackBanner?.min_app_version.ios
            : c.newPaymentSection.feedbackBanner?.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote config about the payment feedback banner
 */
export const paymentsFeedbackBannerConfigSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): Banner | undefined =>
    pipe(
      remoteConfig,
      O.map(c => c.newPaymentSection.feedbackBanner),
      O.toUndefined
    )
);
