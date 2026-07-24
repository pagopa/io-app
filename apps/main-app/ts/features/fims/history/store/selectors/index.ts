import * as pot from "@pagopa/ts-commons/lib/pot";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";

import { isLoading } from "../../../../../common/model/RemoteValue";
import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";
import { potFoldWithDefault } from "../../../../../utils/pot";

export const fimsHistoryPotSelector = (state: GlobalState) =>
  state.features.fims.history.consentsList;

export const isFimsHistoryLoadingSelector = (state: GlobalState) =>
  pot.isLoading(state.features.fims.history.consentsList);

export const fimsHistoryToUndefinedSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.fims.history.consentsList);

export type FimsHistoryErrorState = "ALERT_ONLY" | "FULL_KO";
export const fimsHistoryErrorSelector = (
  state: GlobalState
): FimsHistoryErrorState | undefined =>
  potFoldWithDefault(state.features.fims.history.consentsList, {
    default: constUndefined,
    noneError: _ => "FULL_KO",
    someError: (_some, _error) => "ALERT_ONLY"
  });

// the flag should be treated as enabled when either true or undefined,
// and is defined as an optional bool
export const fimsIsHistoryEnabledSelector = (state: GlobalState) =>
  pipe(
    state,
    remoteConfigSelector,
    O.map(remoteConfig => remoteConfig.fims.historyEnabled !== false),
    O.getOrElse(() => false)
  );

export const fimsHistoryExportStateSelector = (state: GlobalState) =>
  state.features.fims.history.historyExportState;

export const isFimsHistoryExportingSelector = (state: GlobalState) =>
  isLoading(state.features.fims.history.historyExportState);
