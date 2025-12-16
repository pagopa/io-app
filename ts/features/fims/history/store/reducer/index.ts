import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { AccessHistoryPage } from "../../../../../../definitions/fims_history/AccessHistoryPage";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { Action } from "../../../../../store/actions/types";
import {
  fimsHistoryExport,
  fimsHistoryGet,
  resetFimsHistoryExportState,
  resetFimsHistoryState
} from "../actions";

export type FimsExportSuccessStates = "SUCCESS" | "ALREADY_EXPORTING";
export type FimsHistoryExportState = RemoteValue<FimsExportSuccessStates, null>;

export type FimsHistoryState = {
  historyExportState: FimsHistoryExportState;
  consentsList: pot.Pot<AccessHistoryPage, string>;
};

export const INITIAL_STATE: FimsHistoryState = {
  historyExportState: remoteUndefined,
  consentsList: pot.none
};

const reducer = (
  state: FimsHistoryState = INITIAL_STATE,
  action: Action
): FimsHistoryState => {
  switch (action.type) {
    case getType(fimsHistoryGet.request):
      return action.payload.shouldReloadFromScratch
        ? {
            ...state,
            consentsList: pot.noneLoading
          }
        : {
            ...state,
            consentsList: pot.toLoading(state.consentsList)
          };
    case getType(fimsHistoryGet.success):
      const currentHistoryItems =
        pot.toUndefined(state.consentsList)?.data ?? [];
      return {
        ...state,
        consentsList: pot.some({
          next: action.payload.next,
          data: [...currentHistoryItems, ...action.payload.data]
        })
      };
    case getType(fimsHistoryGet.failure):
      return {
        ...state,
        consentsList: pot.toError(state.consentsList, action.payload)
      };
    case getType(fimsHistoryExport.request):
      return {
        ...state,
        historyExportState: remoteLoading
      };
    case getType(fimsHistoryExport.success):
      return {
        ...state,
        historyExportState: remoteReady(action.payload)
      };
    case getType(fimsHistoryExport.failure):
      return {
        ...state,
        historyExportState: remoteError(null)
      };
    case getType(resetFimsHistoryExportState):
      return {
        ...state,
        historyExportState: remoteUndefined
      };
    case getType(resetFimsHistoryState):
      return {
        // export state shouldn't be reset in order to avoid possible concurrency
        ...state,
        consentsList: pot.none
      };
  }
  return state;
};

export default reducer;
