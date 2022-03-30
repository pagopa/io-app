/**
 * Implements the reducers for BackendServicesState.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { BpdConfig } from "../../../definitions/content/BpdConfig";
import { Sections } from "../../../definitions/content/Sections";
import { SectionStatus } from "../../../definitions/content/SectionStatus";
import { UaDonationsBanner } from "../../../definitions/content/UaDonationsBanner";
import { UaDonationsConfig } from "../../../definitions/content/UaDonationsConfig";
import {
  cgnMerchantsV2Enabled,
  premiumMessagesOptInEnabled,
  uaDonationsEnabled
} from "../../config";
import { LocalizedMessageKeys } from "../../i18n";
import { isStringNullyOrEmpty } from "../../utils/strings";
import { backendStatusLoadSuccess } from "../actions/backendStatus";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type SectionStatusKey = keyof Sections;
/** note that this state is not persisted so Option type is accepted
 * if you want to persist an option take care of persinsting/rehydrating
 * see https://www.pivotaltracker.com/story/show/170998374
 */
export type BackendStatusState = {
  status: Option<BackendStatus>;
  areSystemsDead: boolean;
  deadsCounter: number;
};
const initialBackendInfoState: BackendStatusState = {
  status: none,
  areSystemsDead: false,
  deadsCounter: 0
};

export const backendServicesStatusSelector = (
  state: GlobalState
): BackendStatusState => state.backendStatus;

export const backendStatusSelector = (
  state: GlobalState
): Option<BackendStatus> => state.backendStatus.status;

// return the section status for the given key. if it is not present, returns undefined
export const sectionStatusSelector = (sectionStatusKey: SectionStatusKey) =>
  createSelector(
    backendStatusSelector,
    (backendStatus): SectionStatus | undefined =>
      backendStatus.map(bs => bs.sections[sectionStatusKey]).toUndefined()
  );

export const bpdRankingEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean | undefined =>
    backendStatus.map(bs => bs.config.bpd_ranking_v2).toUndefined()
);

export const bpdRemoteConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): BpdConfig | undefined =>
    backendStatus.map(bs => bs.config.bpd).toUndefined()
);

export const cgnMerchantVersionSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean | undefined =>
    cgnMerchantsV2Enabled &&
    backendStatus
      .mapNullable(bs => bs.config)
      .mapNullable(config => config.cgn.merchants_v2)
      .toUndefined()
);

export const assistanceToolConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): ToolEnum | undefined =>
    backendStatus.map(bs => bs.config.assistanceTool.tool).toUndefined()
);

/**
 * return the remote config about Ukrainian donations enabled/disabled
 * if there is no data, false is the default value -> (donation disabled)
 */
export const isUaDonationsEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    (uaDonationsEnabled &&
      backendStatus.map(bs => bs.config.uaDonations.enabled).toUndefined()) ??
    false
);

/**
 * return the remote config about Ukrainian donations banner if available
 */
export const uaDonationsBannerConfigSelector = createSelector(
  backendStatusSelector,
  (backendStatus): UaDonationsBanner | undefined =>
    backendStatus.map(bs => bs.config.uaDonations.banner).toUndefined()
);

/**
 * Transform a UaDonationsConfig to `some(UaDonationsBanner)` if all the required conditions are met:
 * - local feature flag === true
 * - remote feature flag === true
 * - banner visible === true
 * - The description in the current locale is not an empty string
 *
 * Return `none` otherwise.
 * @param uaConfig
 * @param locale
 */
const filterBannerVisible = (
  uaConfig: UaDonationsConfig,
  locale: LocalizedMessageKeys
): Option<UaDonationsBanner> =>
  uaDonationsEnabled &&
  uaConfig.enabled &&
  uaConfig.banner.visible &&
  !isStringNullyOrEmpty(uaConfig.banner.description[locale])
    ? some(uaConfig.banner)
    : none;

/**
 * The donation data is an information that we can or we cannot render, based on some conditions.
 * We represent this information using an {@link Option} in order to avoid chaining multiple boolean condition at component level
 * Return `some(UaDonationsBanner)` if all the enabled / visible conditions are met.
 * Return `none` otherwise
 */
export const uaDonationsBannerSelector = createSelector(
  [
    backendStatusSelector,
    (_: GlobalState, locale: LocalizedMessageKeys) => locale
  ],
  (backendStatus, locale): Option<UaDonationsBanner> =>
    backendStatus.chain(bs =>
      filterBannerVisible(bs.config.uaDonations, locale)
    )
);

/**
 * return the remote config about paypal enabled/disabled
 * if there is no data, false is the default value -> (paypal disabled)
 */
export const isPaypalEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    backendStatus.map(bs => bs.config.paypal.enabled).toUndefined() ?? false
);

/**
 * return the remote config about CGN enabled/disabled
 * if there is no data, false is the default value -> (CGN disabled)
 */
export const isCGNEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    backendStatus.map(bs => bs.config.cgn.enabled).toUndefined() ?? false
);

/**
 * return the remote config about CGN enabled/disabled
 * if there is no data, false is the default value -> (CGN disabled)
 */
export const isFIMSEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    backendStatus.map(bs => bs.config.fims.enabled).toUndefined() ?? false
);

/**
 * Return the remote config about the Premium Messages' opt-in/out
 * screens enabled/disable. If there is no data or the local Feature Flag is
 * disabled, false is the default value -> (Opt-in/out screen disabled)
 */
export const isPremiumMessagesOptInOutEnabledSelector = createSelector(
  backendStatusSelector,
  (backendStatus): boolean =>
    (premiumMessagesOptInEnabled &&
      backendStatus
        .map(bs => bs.config.premiumMessages.opt_in_out_enabled)
        .toUndefined()) ??
    false
);

// systems could be consider dead when we have no updates for at least DEAD_COUNTER_THRESHOLD times
export const DEAD_COUNTER_THRESHOLD = 2;

// true if we have data and it says backend is off
export const isBackendServicesStatusOffSelector = createSelector(
  backendServicesStatusSelector,
  bss => bss.areSystemsDead
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
    status: some(backendStatus),
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
