import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { backendStatusSelector } from "../../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";

export const fimsHistoryPotSelector = (state: GlobalState) =>
  state.features.fims.history.consentsList;

export const isFimsHistoryLoadingSelector = (state: GlobalState) =>
  pot.isLoading(state.features.fims.history.consentsList);

export const fimsHistoryToUndefinedSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.fims.history.consentsList);

// the flag should be treated as enabled when either true or undefined,
// and is defined as an optional bool
export const fimsIsHistoryEnabledSelector = (state: GlobalState) =>
  pipe(
    state,
    backendStatusSelector,
    O.map(backendStatus => backendStatus.config.fims.historyEnabled !== false),
    O.getOrElse(() => false)
  );

export const fimsHistoryExportStateSelector = (state: GlobalState) =>
  state.features.fims.history.historyExportState;
