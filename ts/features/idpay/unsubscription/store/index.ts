import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { idPayUnsubscribe } from "./actions";

export type IDPayUnsubscriptionState = {
  unsubscriptionRequest: pot.Pot<void, NetworkError>;
};

const INITIAL_STATE: IDPayUnsubscriptionState = {
  unsubscriptionRequest: pot.none
};

const reducer = (
  state: IDPayUnsubscriptionState = INITIAL_STATE,
  action: Action
): IDPayUnsubscriptionState => {
  switch (action.type) {
    case getType(idPayUnsubscribe.request):
      return {
        ...state,
        unsubscriptionRequest: pot.noneLoading
      };
    case getType(idPayUnsubscribe.success):
      return {
        ...state,
        unsubscriptionRequest: pot.some(undefined)
      };
    case getType(idPayUnsubscribe.failure):
      return {
        ...state,
        unsubscriptionRequest: pot.toError(
          state.unsubscriptionRequest,
          action.payload
        )
      };
  }
  return state;
};

const selectUnsubscriptionRequest = (state: GlobalState) =>
  state.features.idPay.unsubscription.unsubscriptionRequest;

export const isLoadingSelector = createSelector(
  selectUnsubscriptionRequest,
  pot.isLoading
);

export default reducer;
