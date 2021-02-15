import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../store/actions/types";
import { cgnDetails } from "../actions/details";
import { CgnStatus } from "../../../../../../definitions/cgn/CgnStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { CgnPendingStatus } from "../../../../../../definitions/cgn/CgnPendingStatus";

export type CgnDetailsState = {
  information: pot.Pot<CgnStatus, NetworkError>;
};

const INITIAL_STATE: CgnDetailsState = {
  information: pot.none
};

const reducer = (
  state: CgnDetailsState = INITIAL_STATE,
  action: Action
): CgnDetailsState => {
  switch (action.type) {
    // bonus activation
    case getType(cgnDetails.request):
      return {
        ...state,
        information: pot.toLoading(state.information)
      };
    case getType(cgnDetails.success):
      return {
        ...state,
        information: pot.some(action.payload)
      };
    case getType(cgnDetails.failure):
      return {
        ...state,
        information: pot.toError(state.information, action.payload)
      };
  }
  return state;
};

export default reducer;

export const cgnDetailSelector = (state: GlobalState) =>
  state.bonus.cgn.detail.information;

// Returns true only if card informations are available and not in PENDING status
export const isCgnInformationAvailableSelector = createSelector(
  cgnDetailSelector,
  (information: pot.Pot<CgnStatus, NetworkError>): boolean =>
    pot.isSome(information) && !CgnPendingStatus.is(information)
);

// Returns the CGN information only if they are in the available status else undefined
export const cgnDetailsInformationSelector = createSelector(
  [cgnDetailSelector, isCgnInformationAvailableSelector],
  (
    information: pot.Pot<CgnStatus, NetworkError>,
    isAvailable: boolean
  ): CgnStatus | undefined =>
    pot.isSome(information) && isAvailable ? information.value : undefined
);
