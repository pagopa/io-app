import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { idPayUnsubscribeAction } from "../actions";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";

export type IdPayUnsubscriptionState = pot.Pot<undefined, NetworkError>;

const INITIAL_STATE: IdPayUnsubscriptionState = pot.none;

const reducer = (
  state: IdPayUnsubscriptionState = INITIAL_STATE,
  action: Action
): IdPayUnsubscriptionState => {
  switch (action.type) {
    case getType(idPayUnsubscribeAction.request):
      return pot.toLoading(pot.none);
    case getType(idPayUnsubscribeAction.success):
      return pot.some(undefined);
    case getType(idPayUnsubscribeAction.failure):
      return pot.toError(state, action.payload);
    case getType(idPayUnsubscribeAction.cancel):
      return pot.none;
  }
  return state;
};

export default reducer;
