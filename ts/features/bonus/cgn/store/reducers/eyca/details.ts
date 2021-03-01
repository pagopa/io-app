import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";
import { cgnEycaDetails } from "../../actions/eyca/details";

export type EycaDetailsState = {
  status: "ELIGIBLE" | "INELIGIBLE";
  information: pot.Pot<EycaCard, NetworkError>;
};

const INITIAL_STATE: EycaDetailsState = {
  status: "ELIGIBLE",
  information: pot.none
};

const reducer = (
  state: EycaDetailsState = INITIAL_STATE,
  action: Action
): EycaDetailsState => {
  switch (action.type) {
    case getType(cgnEycaDetails.request):
      return {
        ...state,
        information: pot.toLoading(state.information)
      };
    case getType(cgnEycaDetails.success):
      return {
        ...state,
        status: action.payload.status,
        information: action.payload.information
          ? pot.some(action.payload.information)
          : pot.none
      };
    case getType(cgnEycaDetails.failure):
      return {
        ...state,
        status: "INELIGIBLE",
        information: pot.toError(state.information, action.payload)
      };
  }
  return state;
};

export default reducer;

export const eycaDetailSelector = (state: GlobalState) =>
  state.bonus.cgn.eyca.details;

export const isEycaEligible = createSelector(
  eycaDetailSelector,
  (eycaDetails: EycaDetailsState): boolean => eycaDetails.status === "ELIGIBLE"
);

export const eycaDetailsInformationSelector = createSelector(
  eycaDetailSelector,
  (eycaDetails: EycaDetailsState): EycaCard | undefined =>
    eycaDetails.status === "ELIGIBLE"
      ? pot.getOrElse(eycaDetails.information, undefined)
      : undefined
);
