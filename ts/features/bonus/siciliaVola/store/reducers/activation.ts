import { Action } from "../../../../../store/actions/types";
import * as pot from "italia-ts-commons/lib/pot";
import { NetworkError } from "../../../../../utils/errors";
import { getType } from "typesafe-actions";
import { svServiceAlive, svTosAccepted } from "../actions/activation";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";

export type ActivationState = {
  isAlive: pot.Pot<boolean, NetworkError>;
  tosAccepted: pot.Pot<boolean, NetworkError>;
};

const INITIAL_STATE: ActivationState = {
  isAlive: pot.none,
  tosAccepted: pot.none
};

const reducer = (
  state: ActivationState = INITIAL_STATE,
  action: Action
): ActivationState => {
  switch (action.type) {
    case getType(svServiceAlive.request):
      return {
        ...state,
        isAlive: pot.toLoading(state.isAlive)
      };
    case getType(svServiceAlive.success):
      return {
        ...state,
        isAlive: pot.some(action.payload)
      };
    case getType(svServiceAlive.failure):
      return {
        ...state,
        isAlive: pot.toError(state.isAlive, action.payload)
      };
    case getType(svTosAccepted.request):
      return {
        ...state,
        tosAccepted: pot.toLoading(state.tosAccepted)
      };
    case getType(svTosAccepted.success):
      return {
        ...state,
        tosAccepted: pot.some(action.payload)
      };
    case getType(svTosAccepted.failure):
      return {
        ...state,
        tosAccepted: pot.toError(state.tosAccepted, action.payload)
      };
  }
  return state;
};

export default reducer;

export const tosAcceptedSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.activation.tosAccepted],
  (
    tosAccepted: pot.Pot<boolean, NetworkError>
  ): pot.Pot<boolean, NetworkError> => tosAccepted
);
