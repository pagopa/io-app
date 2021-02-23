import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import { cgnMerchants } from "../actions/merchants";

export type CgnMerchantsState = {
  list: pot.Pot<ReadonlyArray<any>, NetworkError>;
};

const INITIAL_STATE: CgnMerchantsState = {
  list: pot.none
};

const reducer = (
  state: CgnMerchantsState = INITIAL_STATE,
  action: Action
): CgnMerchantsState => {
  switch (action.type) {
    case getType(cgnMerchants.request):
      return {
        ...state,
        list: pot.toLoading(state.list)
      };
    case getType(cgnMerchants.success):
      return {
        ...state,
        list: pot.some(action.payload)
      };
    case getType(cgnMerchants.failure):
      return {
        ...state,
        list: pot.toError(state.list, action.payload)
      };
  }
  return state;
};

export default reducer;

export const cgnMerchantsSelector = (state: GlobalState) =>
  state.bonus.cgn.merchants.list;
