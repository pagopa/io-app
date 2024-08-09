import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { ConsentsResponseDTO } from "../../../../../../definitions/fims/ConsentsResponseDTO";
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
  resetFimsHistoryExportState
} from "../actions";

export type FimsExportSuccessStates = "SUCCESS" | "ALREADY_EXPORTING";

export type FimsHistoryState = {
  historyExportState: RemoteValue<FimsExportSuccessStates, null>;
  consentsList: pot.Pot<ConsentsResponseDTO, string>;
};

const INITIAL_STATE: FimsHistoryState = {
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
        pot.toUndefined(state.consentsList)?.items ?? [];
      return {
        ...state,
        consentsList: pot.some({
          continuationToken: action.payload.continuationToken,
          items: [...currentHistoryItems, ...action.payload.items]
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
  }
  return state;
};

export default reducer;
