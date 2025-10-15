import * as B from "fp-ts/lib/boolean";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { Platform } from "react-native";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import { AppFeedbackConfig } from "../../../../definitions/content/AppFeedbackConfig";
import { ToolEnum } from "../../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../../definitions/content/BackendStatus";
import { BancomatPayConfig } from "../../../../definitions/content/BancomatPayConfig";
import { Banner } from "../../../../definitions/content/Banner";
import { BarcodesScannerConfig } from "../../../../definitions/content/BarcodesScannerConfig";
import { FimsServiceConfiguration } from "../../../../definitions/content/FimsServiceConfiguration";
import {
  cdcEnabled,
  cgnMerchantsV2Enabled,
  fciEnabled,
  premiumMessagesOptInEnabled,
  scanAdditionalBarcodesEnabled
} from "../../../config";
import { TopicKeys } from "../../../features/appReviews/store/actions";
import { getAppVersion, isVersionSupported } from "../../../utils/appVersion";
import { backendStatusLoadSuccess } from "../../actions/backendStatus";
import { Action } from "../../actions/types";
import {
  isMinAppVersionSupported,
  isPropertyWithMinAppVersionEnabled
} from "../featureFlagWithMinAppVersionStatus";
import { isIdPayLocallyEnabledSelector } from "../persistedPreferences";
import { GlobalState } from "../types";

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

export const cgnMerchantsModalSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean | undefined =>
    pipe(
      remoteConfig,
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.cgn.show_cgn_categories_modal?.ios
            : config.cgn.show_cgn_categories_modal?.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
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
export const isCGNEnabledSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config => config.cgn.enabled),
    O.getOrElse(() => false)
  );

/**
 * Return true if CGN is enabled, but only after backend status is loaded.
 * This prevents CGN from being disabled by default when backend status is not yet loaded.
 */
export const isCGNEnabledAfterLoadSelector = createSelector(
  [isBackendStatusLoadedSelector, isCGNEnabledSelector],
  (isLoaded, isEnabled) => (isLoaded ? isEnabled : true)
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

export const fimsServiceConfiguration = createSelector(
  [
    remoteConfigSelector,
    (_state: GlobalState, configurationId: string) => configurationId
  ],
  (
    remoteConfig,
    configurationId: string
  ): FimsServiceConfiguration | undefined =>
    pipe(
      remoteConfig,
      O.chainNullableK(config => config.fims.services),
      O.map(
        RA.findFirst(service => service.configuration_id === configurationId)
      ),
      O.flatten,
      O.toUndefined
    )
);

/**
 * Checks if a service should share iOS cookies in the FIMS flow.
 * Returns true if the serviceId is in the iOSCookieDisabledServiceIds list,
 * false if it's not in the list.
 * If no configuration is available, returns false by default (cookies are shared).
 */
export const fimsServiceIdInCookieDisabledListSelector = (
  state: GlobalState,
  serviceId: ServiceId
): boolean =>
  pipe(
    state,
    remoteConfigSelector,
    O.chainNullableK(config => config.fims.iOSCookieDisabledServiceIds),
    O.map(serviceIds => serviceIds.includes(serviceId)),
    O.getOrElse(() => false)
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
export const isCdcAppVersionSupportedSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    cdcEnabled &&
    pipe(
      remoteConfig,
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.cdcV2.min_app_version.ios
            : config.cdcV2.min_app_version.android,
          getAppVersion()
        )
      ),
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
export const isPnRemoteEnabledSelector = (state: GlobalState) =>
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

export const pnAARQRCodeRegexSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.chainNullableK(config => config.pn.aarQRCodeRegex),
    O.toUndefined
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
  isIdPayLocallyEnabledSelector,
  (remoteConfig, isIdPayTestEnabled): boolean =>
    isIdPayTestEnabled ||
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

export const isIdPayEnabledInScanScreenSelector = (state: GlobalState) =>
  pipe(state, remoteConfigSelector, remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: true,
      configPropertyName: "idPay",
      optionalLocalFlag: true,
      optionalConfig: "scan_screen"
    })
  );

export const isIdPayCiePaymentCodeEnabledSelector = (state: GlobalState) =>
  pipe(state, remoteConfigSelector, remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: true,
      configPropertyName: "idPay",
      optionalLocalFlag: true,
      optionalConfig: "cie_payments"
    })
  );

export const idPayOnboardingRequiresAppUpdateSelector = (state: GlobalState) =>
  isIdPayLocallyEnabledSelector(state)
    ? false
    : pipe(
        state,
        remoteConfigSelector,
        remoteConfig =>
          !isPropertyWithMinAppVersionEnabled({
            remoteConfig,
            mainLocalFlag: true,
            configPropertyName: "idPay",
            optionalLocalFlag: true,
            optionalConfig: "onboarding"
          })
      );

export const idPayDetailsRequiresAppUpdateSelector = (state: GlobalState) =>
  isIdPayLocallyEnabledSelector(state)
    ? false
    : pipe(
        state,
        remoteConfigSelector,
        remoteConfig =>
          !isPropertyWithMinAppVersionEnabled({
            remoteConfig,
            mainLocalFlag: true,
            configPropertyName: "idPay",
            optionalLocalFlag: true,
            optionalConfig: "initiative_details"
          })
      );

export const idPayInitiativeConfigSelector = (initiativeId?: string) =>
  createSelector(remoteConfigSelector, remoteConfig =>
    pipe(
      remoteConfig,
      O.chainNullableK(config =>
        initiativeId
          ? config.idPay.initiative_config_map?.[initiativeId]
          : undefined
      ),
      O.filter(initiativeConfig =>
        isVersionSupported(
          Platform.OS === "ios"
            ? initiativeConfig.min_app_version?.ios
            : initiativeConfig.min_app_version?.android,
          getAppVersion()
        )
      ),
      O.toUndefined
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
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => config.absolutePortalLinks),
      O.getOrElse(() => absolutePortalLinksFallback)
    )
);

type hostType = keyof ReturnType<typeof absolutePortalLinksSelector>;

/**
 * Selector to dynamically generate a complete URL by combining a base URL and a path.
 * This selector is useful when constructing URLs based on configuration or application state.
 */
export const generateDynamicUrlSelector = createSelector(
  // Step 1: Input selector that retrieves the absolutePortalLinks object from the state.
  absolutePortalLinksSelector,

  // Step 2: Input parameter to specify the key for the desired base URL.
  (_: GlobalState, baseUrlKey: hostType) => baseUrlKey,

  // Step 3: Input parameter to specify the path to append to the base URL.
  (_: GlobalState, __: hostType, path: string) => path,

  // Step 4: Combine the absolutePortalLinks object, the base URL key, and the path to create the full URL.
  (absolutePortalLinks, baseUrlKey, path) => {
    try {
      // Retrieve the base URL using the specified key.
      // eslint-disable-next-line functional/no-let
      let baseUrl = absolutePortalLinks[baseUrlKey];

      // Ensure the base URL ends with a slash.
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }

      // Append the provided path to the base URL.
      return `${baseUrl}${path}`;
    } catch (error) {
      // In case of an error (e.g., missing key or invalid path), return the base URL key as a fallback.
      return baseUrlKey;
    }
  }
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

export const isPaymentsWebViewFlowEnabledSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.newPaymentSection.webViewPaymentFlow?.min_app_version.ios
            : config.newPaymentSection.webViewPaymentFlow?.min_app_version
                .android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote feature flag about the payment-method-specific psp banner enabled/disabled
 * that is shown after a successful payment.
 */
export const isPaymentsPspBannerEnabledSelector = (paymentMethodName: string) =>
  createSelector(remoteConfigSelector, (remoteConfig): boolean =>
    pipe(
      remoteConfig,
      O.map(config =>
        isVersionSupported(
          Platform.OS === "ios"
            ? config.newPaymentSection.pspBanner?.[paymentMethodName]
                ?.min_app_version.ios
            : config.newPaymentSection.pspBanner?.[paymentMethodName]
                ?.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
  );

/**
 * Return the remote config about the payment-method-specific psp banner
 */
export const paymentsPspBannerConfigSelector = (paymentMethodName: string) =>
  createSelector(remoteConfigSelector, (remoteConfig): Banner | undefined =>
    pipe(
      remoteConfig,
      O.map(config => config.newPaymentSection.pspBanner?.[paymentMethodName]),
      O.toUndefined
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

export const appFeedbackConfigSelector = createSelector(
  remoteConfigSelector,
  (remoteConfig): AppFeedbackConfig | undefined =>
    pipe(
      remoteConfig,
      O.map(config => config.app_feedback),
      O.toUndefined
    )
);

export const appFeedbackUriConfigSelector = (topic: TopicKeys = "general") =>
  createSelector(
    appFeedbackConfigSelector,
    (feedbackConfig): string | undefined =>
      pipe(
        feedbackConfig,
        O.fromNullable,
        O.map(config =>
          config.feedback_uri[topic]
            ? config.feedback_uri[topic]
            : config.feedback_uri.general
        ),
        O.toUndefined
      )
  );

export const appFeedbackEnabledSelector = (state: GlobalState) =>
  pipe(state, remoteConfigSelector, remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: true,
      configPropertyName: "app_feedback"
    })
  );

/**
 * This selector is used to know if IOMarkdown is enabled on Messages and Services
 *
 * @returns true (enabled) if:
 * - the IOMarkdown configuration is missing
 * - the min_app_version parameter is missing
 * - current app version is greater than or equal to the min app version
 * false (disabled) if:
 * - CDN data is not available
 * - current app version is lower than the min app version
 * - min app version is set to 0
 */
export const isIOMarkdownEnabledForMessagesAndServicesSelector = (
  state: GlobalState
) =>
  pipe(
    state,
    remoteConfigSelector,
    O.fold(
      () => false, // CDN data not available, IOMarkdown is disabled
      remoteConfig =>
        pipe(
          remoteConfig.ioMarkdown?.min_app_version != null,
          B.fold(
            () => true, // Either IOMarkdown configuration missing or min_app_version missing on IOMarkdown configuration. IOMarkdown is enabled
            () =>
              isPropertyWithMinAppVersionEnabled({
                remoteConfig: O.some(remoteConfig),
                mainLocalFlag: true,
                configPropertyName: "ioMarkdown"
              })
          )
        )
    )
  );

export const pnMessagingServiceIdSelector = (
  state: GlobalState
): ServiceId | undefined =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config => config.pn.notificationServiceId as ServiceId),
    O.toUndefined
  );

const fallbackSendPrivacyUrls = {
  tos: "https://cittadini.notifichedigitali.it/termini-di-servizio",
  privacy: "https://cittadini.notifichedigitali.it/informativa-privacy"
};
export const pnPrivacyUrlsSelector = createSelector(
  remoteConfigSelector,
  remoteConfig =>
    pipe(
      remoteConfig,
      O.map(config => ({
        privacy: config.pn.privacy_url ?? fallbackSendPrivacyUrls.privacy,
        tos: config.pn.tos_url ?? fallbackSendPrivacyUrls.tos
      })),
      O.getOrElse(() => fallbackSendPrivacyUrls)
    )
);

/**
 * Return true if the app supports the AAR feature (based on remote config).
 * If the remote value is missing, consider the feature as enabled.
 */
export const isAARRemoteEnabled = (state: GlobalState) => {
  const remoteConfigOption = remoteConfigSelector(state);
  if (O.isNone(remoteConfigOption)) {
    // CDN data not available, AAR is disabled
    return false;
  }

  const aarMinAppVersion = remoteConfigOption.value.pn?.aar?.min_app_version;
  if (aarMinAppVersion == null) {
    // Either AAR configuration missing or min_app_version missing in AAR configuration. AAR is enabled
    return true;
  }

  return isMinAppVersionSupported(
    O.some({ min_app_version: aarMinAppVersion })
  );
};

export const isCaCBannerEnabledSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config =>
      isVersionSupported(
        Platform.OS === "ios"
          ? config.zendeskCacBanner?.min_app_version?.ios
          : config.zendeskCacBanner?.min_app_version?.android,
        getAppVersion()
      )
    ),
    O.getOrElse(() => false)
  );

export const caCBannerConfigSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(config => config.zendeskCacBanner),
    O.toUndefined
  );

const fallbackSendAARDelegateUrl =
  "https://assistenza.notifichedigitali.it/hc/it/articles/32453819931537-Delegare-qualcuno-a-visualizzare-le-tue-notifiche";
export const sendAARDelegateUrlSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.chainNullableK(config => config.pn.aar?.delegate_url),
    O.getOrElse(() => fallbackSendAARDelegateUrl)
  );

export const sendShowAbstractSelector = (state: GlobalState) => {
  const remoteConfigOption = remoteConfigSelector(state);
  if (O.isSome(remoteConfigOption)) {
    const abstractShownOrUndefined = remoteConfigOption.value.pn?.abstractShown;
    if (abstractShownOrUndefined == null) {
      // Data has been removed from CDN, there is no
      // need to keep the abstract hidden anymore
      return true;
    }
    // Data is set in the CDN, return its value
    return abstractShownOrUndefined;
  }
  // No data from CDN, abstract must be hidden
  return false;
};

export const sendCustomServiceCenterUrlSelector = (state: GlobalState) => {
  const remoteConfigOption = remoteConfigSelector(state);
  if (O.isSome(remoteConfigOption)) {
    const customerServiceCenterUrlOrUndefined =
      remoteConfigOption.value.pn?.customerServiceCenterUrl?.trim();
    if (
      customerServiceCenterUrlOrUndefined != null &&
      customerServiceCenterUrlOrUndefined.length > 0
    ) {
      return customerServiceCenterUrlOrUndefined;
    }
  }
  return "https://assistenza.notifichedigitali.it/hc";
};

export const sendEstimateTimelinesUrlSelector = (state: GlobalState) => {
  const remoteConfigOption = remoteConfigSelector(state);
  if (O.isSome(remoteConfigOption)) {
    const estimateTimelinesUrlOrUndefined =
      remoteConfigOption.value.pn?.estimateTimelinesUrl?.trim();
    if (
      estimateTimelinesUrlOrUndefined != null &&
      estimateTimelinesUrlOrUndefined.length > 0
    ) {
      return estimateTimelinesUrlOrUndefined;
    }
  }
  return "https://notifichedigitali.it/perfezionamento";
};

export const sendVisitTheWebsiteUrlSelector = (state: GlobalState) => {
  const remoteConfigOption = remoteConfigSelector(state);
  if (O.isSome(remoteConfigOption)) {
    const visitTheWebsiteUrlOrUndefined =
      remoteConfigOption.value.pn?.visitTheSENDWebsiteUrl?.trim();
    if (
      visitTheWebsiteUrlOrUndefined != null &&
      visitTheWebsiteUrlOrUndefined.length > 0
    ) {
      return visitTheWebsiteUrlOrUndefined;
    }
  }
  return "https://cittadini.notifichedigitali.it/auth/login";
};
