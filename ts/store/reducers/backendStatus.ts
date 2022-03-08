/**
 * Implements the reducers for BackendServicesState.
 */

import { none, Option, some } from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { BpdConfig } from "../../../definitions/content/BpdConfig";
import { backendStatusLoadSuccess } from "../actions/backendStatus";
import { Action } from "../actions/types";
import { BackendStatus } from "../../../definitions/content/BackendStatus";
import { Sections } from "../../../definitions/content/Sections";
import { SectionStatus } from "../../../definitions/content/SectionStatus";
import { ToolEnum } from "../../../definitions/content/AssistanceToolConfig";
import { cgnMerchantsV2Enabled } from "../../config";
import { UaDonationsBanner } from "../../../definitions/content/UaDonationsBanner";
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
    backendStatus.map(bs => bs.config.uaDonations.enabled).toUndefined() ??
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
