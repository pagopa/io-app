import { IUnitTag } from "@pagopa/ts-commons/lib/units";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  PrivativeQuery,
  searchUserPrivative,
  walletAddPrivativeChooseIssuer,
  walletAddPrivativeInsertCardNumber,
  walletAddPrivativeStart
} from "../actions";

// TODO
export type PrivativeIssuerId = string & IUnitTag<"PrivativeIssuerId">;

export type SearchedPrivativeData = {
  id?: PrivativeIssuerId;
  cardNumber?: string;
};

const defaultState: SearchedPrivativeData = {
  id: undefined,
  cardNumber: undefined
};

const searchedPrivativeReducer = (
  state: SearchedPrivativeData = defaultState,
  action: Action
): SearchedPrivativeData => {
  switch (action.type) {
    case getType(searchUserPrivative.request):
      return action.payload;
    case getType(walletAddPrivativeChooseIssuer):
      return { ...state, id: action.payload };
    case getType(walletAddPrivativeInsertCardNumber):
      return { ...state, cardNumber: action.payload };
    case getType(walletAddPrivativeStart):
      return defaultState;
  }
  return state;
};

/**
 * Return the current searched parameters (BrandId and CardNumber) for the privative search
 * @param state
 */
export const onboardingSearchedPrivativePartialSelector = (
  state: GlobalState
): SearchedPrivativeData => state.wallet.onboarding.privative.searchedPrivative;

const toPrivativeQuery = (
  searched: SearchedPrivativeData
): PrivativeQuery | undefined => {
  const { id, cardNumber } = searched;

  return id !== undefined && cardNumber !== undefined
    ? { id, cardNumber }
    : undefined;
};

/**
 * Return the privative query only if all the fields are filled
 */
export const onboardingSearchedPrivativeQuerySelector = createSelector(
  [onboardingSearchedPrivativePartialSelector],
  (searchedPrivativeData): PrivativeQuery | undefined =>
    toPrivativeQuery(searchedPrivativeData)
);

export default searchedPrivativeReducer;
