/**
 * Implements the reducers for BackendServicesState.
 */

import * as O from "fp-ts/lib/Option";
import { constFalse, pipe } from "fp-ts/lib/function";
import { Platform } from "react-native";

import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { BancomatPayConfig } from "../../../definitions/content/BancomatPayConfig";
import { BarcodesScannerConfig } from "../../../definitions/content/BarcodesScannerConfig";
import { SectionStatus } from "../../../definitions/content/SectionStatus";
import { Sections } from "../../../definitions/content/Sections";
import { Banner } from "../../../definitions/content/Banner";
import {
  cdcEnabled,
  cgnMerchantsV2Enabled,
  fciEnabled,
  premiumMessagesOptInEnabled,
  scanAdditionalBarcodesEnabled
} from "../../config";
import { LocalizedMessageKeys } from "../../i18n";
import { getAppVersion, isVersionSupported } from "../../utils/appVersion";
import { backendStatusLoadSuccess } from "../actions/backendStatus";
import { Action } from "../actions/types";
import { StatusMessage } from "../../../definitions/content/StatusMessage";
import { isIdPayTestEnabledSelector } from "./persistedPreferences";
import { GlobalState } from "./types";
import { isPropertyWithMinAppVersionEnabled } from "./featureFlagWithMinAppVersionStatus";
import { currentRouteSelector } from "./navigation";

export type SectionStatusKey = keyof Sections;
/** note that this state is not persisted so Option type is accepted
 * if you want to persist an option take care of persinsting/rehydrating
 * see https://www.pivotaltracker.com/story/show/170998374
 */
export type BackendStatusState = {
  status: O.Option<BackendStatus>;
  areSystemsDead: boolean;
  deadsCounter: number;
};
const initialBackendInfoState: BackendStatusState = {
  status: O.none,
  areSystemsDead: false,
  deadsCounter: 0
};

export const backendServicesStatusSelector = (
  state: GlobalState
): BackendStatusState => state.backendStatus;

export const backendStatusSelector = (
  state: GlobalState
): O.Option<BackendStatus> => state.backendStatus.status;

export const isBackendStatusLoadedSelector = (state: GlobalState) =>
  O.isSome(backendStatusSelector(state));

// return the section status for the given key. if it is not present, returns undefined
export const sectionStatusSelector = (sectionStatusKey: SectionStatusKey) =>
  createSelector(
    backendStatusSelector,
    (backendStatus): SectionStatus | undefined =>
      pipe(
        backendStatus,
        O.map(bs => bs.sections?.[sectionStatusKey]),
        O.toUndefined
      )
  );

export const isSectionVisibleSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.map(section => section.is_visible),
    O.getOrElse(constFalse)
  );
export const webUrlForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey,
  locale: LocalizedMessageKeys
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.chainNullableK(section => section.web_url),
    O.chainNullableK(statusMessage => statusMessage[locale]),
    O.toUndefined
  );
export const messageForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey,
  locale: LocalizedMessageKeys
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.chainNullableK(section => section.message),
    O.chainNullableK(messageTranslations => messageTranslations[locale]),
    O.toUndefined
  );
export const levelForSectionSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    sectionStatusUncachedSelector(state, sectionStatusKey),
    O.map(section => section.level),
    O.toUndefined
  );

export const cgnMerchantVersionSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean | undefined =>
    cgnMerchantsV2Enabled &&
    pipe(
      backendStatus,
      O.chainNullableK(bs => bs.config),
      O.chainNullableK(config => config.cgn.merchants_v2),
      O.toUndefined
    )
);

export const assistanceToolConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): ToolEnum | undefined =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.assistanceTool.tool),
      O.toUndefined
    )
);

/**
 * return the remote config about paypal enabled/disabled
 * if there is no data, false is the default value -> (paypal disabled)
 */
export const isPaypalEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.paypal.enabled),
      O.toUndefined
    ) ?? false
);

/**
 * return the remote config about BancomatPay
 * if no data is available the default is considering all flags set to false
 */
export const bancomatPayConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): BancomatPayConfig =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.bancomatPay),
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
  backendStatusSelector,
  (backendStatus): boolean =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.cgn.enabled),
      O.toUndefined
    ) ?? false
);

export const fimsRequiresAppUpdateSelector = (state: GlobalState) =>
  pipe(
    state,
    backendStatusSelector,
    backendStatus =>
      !isPropertyWithMinAppVersionEnabled({
        backendStatus,
        mainLocalFlag: true,
        configPropertyName: "fims"
      })
  );

export const fimsDomainSelector = createSelector(
  backendStatusSelector,
  (backendStatus): string | undefined =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.fims.domain),
      O.toUndefined
    )
);

/**
 * Return the remote config about the Premium Messages opt-in/out
 * screens enabled/disable. If there is no data or the local Feature Flag is
 * disabled, false is the default value -> (Opt-in/out screen disabled)
 */
export const isPremiumMessagesOptInOutEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    (premiumMessagesOptInEnabled &&
      pipe(
        backendStatus,
        O.map(bs => bs.config.premiumMessages.opt_in_out_enabled),
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
  backendStatusSelector,
  (backendStatus): boolean =>
    cdcEnabled &&
    pipe(
      backendStatus,
      O.map(bs => bs.config.cdc.enabled),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote config about the barcodes scanner.
 * If no data is available or the local feature flag is falsy
 * the default is considering all flags set to false.
 */
export const barcodesScannerConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): BarcodesScannerConfig =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.barcodesScanner),
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
    state.backendStatus.status,
    O.map(s => s.config.pn.enabled),
    O.getOrElse(() => false)
  );

/**
 * Return false if the app needs to be updated in order to use PN.
 */
export const isPnAppVersionSupportedSelector = (state: GlobalState) =>
  pipe(
    state,
    backendStatusSelector,
    O.map(bs =>
      isVersionSupported(
        Platform.OS === "ios"
          ? bs.config.pn.min_app_version.ios
          : bs.config.pn.min_app_version.android,
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
    state.backendStatus.status,
    O.map(bs =>
      Platform.OS === "ios"
        ? bs.config.pn.min_app_version.ios
        : bs.config.pn.min_app_version.android
    ),
    O.getOrElse(() => "-")
  );

/**
 * Return the url of the PN frontend.
 */
export const pnFrontendUrlSelector = (state: GlobalState) =>
  pipe(
    state.backendStatus.status,
    O.map(bs => bs.config.pn.frontend_url),
    O.getOrElse(() => "")
  );

export const configSelector = createSelector(
  backendStatusSelector,
  backendStatus =>
    pipe(
      backendStatus,
      O.map(bs => bs.config)
    )
);

export const paymentsConfigSelector = createSelector(configSelector, config =>
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
  backendStatusSelector,
  (backendStatus): boolean =>
    fciEnabled &&
    pipe(
      backendStatus,
      O.map(bs =>
        isVersionSupported(
          Platform.OS === "ios"
            ? bs.config.fci.min_app_version.ios
            : bs.config.fci.min_app_version.android,
          getAppVersion()
        )
      ),
      O.getOrElse(() => false)
    )
);

export const isIdPayEnabledSelector = createSelector(
  backendStatusSelector,
  isIdPayTestEnabledSelector,
  (backendStatus, isIdPayTestEnabled): boolean =>
    isIdPayTestEnabled &&
    pipe(
      backendStatus,
      O.map(bs =>
        isVersionSupported(
          Platform.OS === "ios"
            ? bs.config.idPay.min_app_version.ios
            : bs.config.idPay.min_app_version.android,
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
  backendStatusSelector,
  (backendStatus): boolean =>
    pipe(
      backendStatus,
      O.map(bs =>
        isVersionSupported(
          Platform.OS === "ios"
            ? bs.config.newPaymentSection.min_app_version.ios
            : bs.config.newPaymentSection.min_app_version.android,
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

// systems could be consider dead when we have no updates for at least DEAD_COUNTER_THRESHOLD times
export const DEAD_COUNTER_THRESHOLD = 2;

// true if we have data and it says backend is off
export const isBackendServicesStatusOffSelector = createSelector(
  backendServicesStatusSelector,
  bss => bss.areSystemsDead
);

/**
 * Return the remote config about IT-WALLET enabled/disabled
 * if there is no data or the local Feature Flag is disabled,
 * false is the default value -> (IT-WALLET disabled)
 */
export const isItwEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    pipe(
      backendStatus,
      O.map(
        bs =>
          isVersionSupported(
            Platform.OS === "ios"
              ? bs.config.itw.min_app_version.ios
              : bs.config.itw.min_app_version.android,
            getAppVersion()
          ) && bs.config.itw.enabled
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote feature flag about the payment feedback banner enabled/disabled
 * that is shown after a successful payment.
 */
export const isPaymentsFeedbackBannerEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    pipe(
      backendStatus,
      O.map(bs =>
        isVersionSupported(
          Platform.OS === "ios"
            ? bs.config.newPaymentSection.feedbackBanner?.min_app_version.ios
            : bs.config.newPaymentSection.feedbackBanner?.min_app_version
                .android,
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
  backendStatusSelector,
  (backendStatus): Banner | undefined =>
    pipe(
      backendStatus,
      O.map(bs => bs.config.newPaymentSection.feedbackBanner),
      O.toUndefined
    )
);

export const areSystemsDeadReducer = (
  currentState: BackendStatusState,
  backendStatus: BackendStatus
): BackendStatusState => {
  const deadsCounter =
    backendStatus.is_alive === false
      ? Math.min(currentState.deadsCounter + 1, DEAD_COUNTER_THRESHOLD)
      : 0;
  return {
    ...currentState,
    status: O.some(backendStatus),
    areSystemsDead: deadsCounter >= DEAD_COUNTER_THRESHOLD,
    deadsCounter
  };
};

export default function backendServicesStatusReducer(
  state: BackendStatusState = initialBackendInfoState,
  action: Action
): BackendStatusState {
  if (action.type === getType(backendStatusLoadSuccess)) {
    return areSystemsDeadReducer(state, action.payload);
  }
  return state;
}

const sectionStatusUncachedSelector = (
  state: GlobalState,
  sectionStatusKey: SectionStatusKey
) =>
  pipe(
    state.backendStatus.status,
    O.chainNullableK(status => status.sections?.[sectionStatusKey])
  );

const statusMessagesSelector = (state: GlobalState) =>
  pipe(
    state,
    backendStatusSelector,
    O.map(bs => bs.statusMessages),
    O.toUndefined
  );

const EMPTY_ARRAY: ReadonlyArray<StatusMessage> = [];

// Since the return of the selector comes from an array.filter function it is important to cache the result
// to avoid unintended rerender on components.
export const statusMessageByRouteSelector = (routeName?: string) =>
  createSelector(
    [statusMessagesSelector, currentRouteSelector],
    (statusMessages, currentRoute): ReadonlyArray<StatusMessage> | undefined =>
      pipe(
        statusMessages,
        O.fromNullable,
        O.map(({ items }) => {
          const messages = items.filter(message =>
            message.routes.includes(routeName ?? currentRoute)
          );
          return messages.length > 0 ? messages : EMPTY_ARRAY;
        }),
        O.toUndefined
      )
  );
