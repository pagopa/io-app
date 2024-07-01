import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { ConsentsResponseDTO } from "../../../../../../definitions/fims/ConsentsResponseDTO";
import { FimsHistoryActions, fimsHistoryGet } from "../actions";

export type FimsHistoryState = {
  consentsList: pot.Pot<ConsentsResponseDTO, string>;
};

const INITIAL_STATE: FimsHistoryState = {
  consentsList: pot.none
};

const reducer = (
  state: FimsHistoryState = INITIAL_STATE,
  action: FimsHistoryActions
): FimsHistoryState => {
  switch (action.type) {
    case getType(fimsHistoryGet.request):
      // first request for the history will reload the page
      return action.payload.continuationToken
        ? {
            consentsList: pot.toLoading(state.consentsList)
          }
        : {
            consentsList: pot.noneLoading
          };

    case getType(fimsHistoryGet.success):
      const currentHistoryItems =
        pot.toUndefined(state.consentsList)?.items ?? [];
      return {
        consentsList: pot.some({
          ...action.payload,
          items: [...currentHistoryItems, ...action.payload.items]
        })
      };
    case getType(fimsHistoryGet.failure):
      return {
        consentsList: pot.toError(state.consentsList, action.payload)
      };
  }
  return state;
};

export default reducer;
