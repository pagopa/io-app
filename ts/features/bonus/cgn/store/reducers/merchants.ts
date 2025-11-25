import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  cgnMerchantsCount,
  cgnOfflineMerchants,
  cgnOnlineMerchants,
  cgnSearchMerchants,
  cgnSelectedMerchant,
  resetMerchantDiscountCode,
  selectMerchantDiscount,
  setMerchantDiscountCode
} from "../actions/merchants";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined,
  RemoteValue
} from "../../../../../common/model/RemoteValue";
import { OnlineMerchants } from "../../../../../../definitions/cgn/merchants/OnlineMerchants";
import { OfflineMerchants } from "../../../../../../definitions/cgn/merchants/OfflineMerchants";
import { Merchant } from "../../../../../../definitions/cgn/merchants/Merchant";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import { SearchResult } from "../../../../../../definitions/cgn/merchants/SearchResult";

export type CgnMerchantsState = {
  merchantsCount: RemoteValue<number, NetworkError>;
  searchMerchants: RemoteValue<SearchResult["items"], NetworkError>;
  onlineMerchants: RemoteValue<OnlineMerchants["items"], NetworkError>;
  offlineMerchants: RemoteValue<OfflineMerchants["items"], NetworkError>;
  selectedMerchant: RemoteValue<Merchant, NetworkError>;
  selectedDiscount: RemoteValue<Discount, NetworkError>;
  selectedDiscountCode?: string;
};

const INITIAL_STATE: CgnMerchantsState = {
  merchantsCount: remoteUndefined,
  searchMerchants: remoteUndefined,
  onlineMerchants: remoteUndefined,
  offlineMerchants: remoteUndefined,
  selectedMerchant: remoteUndefined,
  selectedDiscount: remoteUndefined,
  selectedDiscountCode: undefined
};

const reducer = (
  state: CgnMerchantsState = INITIAL_STATE,
  action: Action
): CgnMerchantsState => {
  switch (action.type) {
    // Merchants count
    case getType(cgnMerchantsCount.request):
      return {
        ...state,
        merchantsCount: remoteLoading
      };
    case getType(cgnMerchantsCount.success):
      return {
        ...state,
        merchantsCount: remoteReady(action.payload.count)
      };
    case getType(cgnMerchantsCount.failure):
      return {
        ...state,
        merchantsCount: remoteError(action.payload)
      };

    // Search Merchants
    case getType(cgnSearchMerchants.request):
      return {
        ...state,
        searchMerchants: remoteLoading
      };
    case getType(cgnSearchMerchants.success):
      return {
        ...state,
        searchMerchants: remoteReady(action.payload)
      };
    case getType(cgnSearchMerchants.failure):
      return {
        ...state,
        searchMerchants: remoteError(action.payload)
      };

    // Offline Merchants
    case getType(cgnOfflineMerchants.request):
      return {
        ...state,
        offlineMerchants: remoteLoading
      };
    case getType(cgnOfflineMerchants.success):
      return {
        ...state,
        offlineMerchants: remoteReady(action.payload)
      };
    case getType(cgnOfflineMerchants.failure):
      return {
        ...state,
        offlineMerchants: remoteError(action.payload)
      };

    // Online Merchants
    case getType(cgnOnlineMerchants.request):
      return {
        ...state,
        onlineMerchants: remoteLoading
      };
    case getType(cgnOnlineMerchants.success):
      return {
        ...state,
        onlineMerchants: remoteReady(action.payload)
      };
    case getType(cgnOnlineMerchants.failure):
      return {
        ...state,
        onlineMerchants: remoteError(action.payload)
      };

    // Selected Merchant detail
    case getType(cgnSelectedMerchant.request):
      return {
        ...state,
        selectedMerchant: remoteLoading
      };
    case getType(cgnSelectedMerchant.success):
      return {
        ...state,
        selectedMerchant: remoteReady(action.payload)
      };
    case getType(cgnSelectedMerchant.failure):
      return {
        ...state,
        selectedMerchant: remoteError(action.payload)
      };
    // Selected Discount detail
    case getType(selectMerchantDiscount):
      return {
        ...state,
        selectedDiscount: remoteReady(action.payload)
      };
    // Set discount code
    case getType(setMerchantDiscountCode):
      return {
        ...state,
        selectedDiscountCode: action.payload
      };
    // Reset discount code
    case getType(resetMerchantDiscountCode):
      return {
        ...state,
        selectedDiscountCode: undefined
      };
  }
  return state;
};

export default reducer;

const cgnMerchantsSelector = (state: GlobalState) => state.bonus.cgn.merchants;

export const cgnMerchantsCountSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.merchantsCount
);

export const cgnSearchMerchantsSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.searchMerchants
);

export const cgnOnlineMerchantsSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.onlineMerchants
);

export const cgnOfflineMerchantsSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.offlineMerchants
);

export const cgnSelectedMerchantSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.selectedMerchant
);

export const cgnSelectedDiscountSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.selectedDiscount
);

export const cgnSelectedDiscountCodeSelector = createSelector(
  cgnMerchantsSelector,
  merchantsState => merchantsState.selectedDiscountCode
);
