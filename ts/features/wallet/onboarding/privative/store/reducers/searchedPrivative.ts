import { IUnitTag } from "italia-ts-commons/lib/units";
import { getType } from "typesafe-actions";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  searchUserPrivative,
  walletAddPrivativeChooseBrand,
  walletAddPrivativeStart
} from "../actions";

export type BrandId = string & IUnitTag<"PrivativeService">;

export type SearchedPrivativeData = {
  brandId?: BrandId;
  cardNumber?: string;
};

const defaultState: SearchedPrivativeData = {
  brandId: undefined,
  cardNumber: undefined
};

const searchedPrivativeReducer = (
  state: SearchedPrivativeData = defaultState,
  action: Action
): SearchedPrivativeData => {
  switch (action.type) {
    case getType(searchUserPrivative.request):
      return action.payload;
    case getType(walletAddPrivativeChooseBrand):
      return { ...state, brandId: action.payload };
    case getType(walletAddPrivativeStart):
      return defaultState;
  }
  return state;
};

/**
 * Return the current searched parameters (BrandId and CardNumber) for the privative search
 * @param state
 */
export const onboardingSearchedPrivativeSelector = (
  state: GlobalState
): SearchedPrivativeData => state.wallet.onboarding.privative.searchedPrivative;

export default searchedPrivativeReducer;
