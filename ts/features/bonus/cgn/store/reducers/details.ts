import * as pot from "@pagopa/ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { constUndefined } from "fp-ts/lib/function";
import { Action } from "../../../../../store/actions/types";
import { cgnDetails } from "../actions/details";
import { Card } from "../../../../../../definitions/cgn/Card";
import { GlobalState } from "../../../../../store/reducers/types";
import { NetworkError } from "../../../../../utils/errors";
import { CardPending } from "../../../../../../definitions/cgn/CardPending";
import { isStrictSome } from "../../../../../utils/pot";
import { cgnUnsubscribe } from "../actions/unsubscribe";

export type CgnDetailsState = {
  information: pot.Pot<Card, NetworkError>;
  fetched: boolean;
};

const INITIAL_STATE: CgnDetailsState = {
  information: pot.none,
  fetched: false
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
        information: pot.some(action.payload),
        fetched: true
      };
    case getType(cgnDetails.failure):
      return {
        ...state,
        information: pot.toError(state.information, action.payload),
        fetched: true
      };
    // This action is fired when the user is not elegible to have a CGN or it doesn't have it onboarded
    case getType(cgnDetails.cancel):
      return {
        ...state,
        information: pot.none,
        fetched: true
      };
    case getType(cgnUnsubscribe.success):
      return INITIAL_STATE;
  }
  return state;
};

export default reducer;

export const cgnDetailSelector = (state: GlobalState) =>
  state.bonus.cgn.detail.information;

// Returns true only if card information are available and not in PENDING status
export const isCgnInformationAvailableSelector = createSelector(
  cgnDetailSelector,
  (information: pot.Pot<Card, NetworkError>): boolean =>
    isStrictSome(information) && !CardPending.is(information.value)
);

const isNotPending = (cgn: Card) => !CardPending.is(cgn);

// Returns true only if card information are available and not in PENDING status
export const isCgnEnrolledSelector = createSelector(
  cgnDetailSelector,
  (information: pot.Pot<Card, NetworkError>): boolean | undefined =>
    pot.fold(
      information,
      constUndefined,
      constUndefined,
      constUndefined,
      // we have a network error or a 404 the user is not enrolled
      () => false,
      isNotPending,
      constUndefined,
      constUndefined,
      () => false
    )
);

// Returns the CGN information only if they are in the available status else undefined
export const cgnDetailsInformationSelector = createSelector(
  [cgnDetailSelector, isCgnInformationAvailableSelector],
  (
    information: pot.Pot<Card, NetworkError>,
    isAvailable: boolean
  ): Card | undefined =>
    isStrictSome(information) && isAvailable ? information.value : undefined
);

export const isCgnDetailsAlreadyFetchedSelector = (state: GlobalState) =>
  state.bonus.cgn.detail.fetched;

export const isCgnDetailsLoading = createSelector(
  cgnDetailSelector,
  (information: CgnDetailsState["information"]): boolean =>
    pot.isLoading(information)
);
