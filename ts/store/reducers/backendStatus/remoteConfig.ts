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
const emptyArray: ReadonlyArray<string> = []; // to avoid unnecessary rerenders

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
      O.map(config => config.assistanceTool.tool),
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
      O.map(config => config.paypal.enabled),
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
      O.map(config => config.bancomatPay),
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
      O.map(config => config.cgn.enabled),
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

export const oidcProviderDomainSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config => config.fims.domain),
    O.toUndefined
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
        O.map(config => config.premiumMessages.opt_in_out_enabled),
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
      O.map(config => config.cdc.enabled),
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
      O.map(config => config.barcodesScanner),
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
    O.map(config => config.pn.enabled),
    O.getOrElse(() => false)
  );

/**
 * Return false if the app needs to be updated in order to use PN.
 */
export const isPnAppVersionSupportedSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config =>
      isVersionSupported(
        Platform.OS === "ios"
          ? config.pn.min_app_version.ios
          : config.pn.min_app_version.android,
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
    O.map(config =>
      Platform.OS === "ios"
        ? config.pn.min_app_version.ios
        : config.pn.min_app_version.android
    ),
    O.getOrElse(() => "-")
  );

/**
 * Return the url of the PN frontend.
 */
export const pnFrontendUrlSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(config => config.pn.frontend_url),
    O.getOrElse(() => "")
  );

export const paymentsConfigSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => config.payments)
    )
);

export const preferredPspsByOriginSelector = createSelector(
  paymentsConfigSelector,
  paymentRemoteConfig =>
    pipe(
      paymentRemoteConfig,
      O.map(config => config.preferredPspsByOrigin),
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
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.fci.min_app_version.ios
            : config.fci.min_app_version.android,
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
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.idPay.min_app_version.ios
            : config.idPay.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

export const absolutePortalLinksFallback = {
  io_web: "https://ioapp.it/",
  io_showcase: "https://io.italia.it/"
};

/**
 * returns the absolute URLs for showcase and logout (io-web) sites
 */
export const absolutePortalLinksSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): { io_web: string; io_showcase: string } =>
    pipe(
      remoteConfig,
      O.map(
        config => config.absolutePortalLinks ?? absolutePortalLinksFallback
      ),
      O.getOrElse(() => absolutePortalLinksFallback)
    )
);

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
        config =>
          isVersionSupported(
            Platform.OS === "ios"
              ? config.itw.min_app_version.ios
              : config.itw.min_app_version.android,
            getAppVersion()
          ) && config.itw.enabled
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Returns the authentication methods that are disabled.
 * If there is no data, an empty array is returned as the default value.
 */
export const itwDisabledIdentificationMethodsSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): ReadonlyArray<string> =>
    pipe(
      remoteConfig,
      O.chainNullableK(config => config.itw.disabled_identification_methods),
      O.getOrElse(() => emptyArray)
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
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.newPaymentSection.feedbackBanner?.min_app_version.ios
            : config.newPaymentSection.feedbackBanner?.min_app_version.android,
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
      O.map(config => config.newPaymentSection.feedbackBanner),
      O.toUndefined
    )
);

export const landingScreenBannerOrderSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.chainNullableK(config => config.landing_banners),
    O.chainNullableK(banners => banners.priority_order),
    O.getOrElse(() => emptyArray)
  );

/**
 * Return whether the IT Wallet feedback banner is remotely enabled.
 */
export const isItwFeedbackBannerEnabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => config.itw.feedback_banner_visible),
      O.getOrElse(() => false)
    )
);

/**
 * Return whether the Wallet activation is disabled.
 * This is purely a "cosmetic" configuration to disable UI elements,
 * it does not disable the entire IT Wallet feature.
 */
export const isItwActivationDisabledSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chainNullableK(config => config.itw.wallet_activation_disabled),
      O.getOrElse(() => false)
    )
);

/**
 * Return IT Wallet credentials that have been disabled remotely.
 */
export const itwDisabledCredentialsSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.chainNullableK(config => config.itw.disabled_credentials),
      O.getOrElse(() => emptyArray)
    )
);

/**
 * Return the remote config content for the deferred issuance screen content.
 */
export const itwDeferredIssuanceScreenContentSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => config.itw.deferred_issuance_screen_content),
      O.toUndefined
    )
);
