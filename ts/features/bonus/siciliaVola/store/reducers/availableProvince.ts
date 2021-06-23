import * as pot from "italia-ts-commons/lib/pot";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { Province } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import { getType } from "typesafe-actions";
import {
  svGenerateVoucherAvailableProvince,
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableProvinceState = pot.Pot<
  IndexedById<Province>,
  NetworkError
>;
const INITIAL_STATE: AvailableProvinceState = pot.none;

const reducer = (
  state: AvailableProvinceState = INITIAL_STATE,
  action: Action
): AvailableProvinceState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableRegion.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableProvince.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableProvince.success):
      return pot.some(toIndexed(action.payload, p => p.id));
    case getType(svGenerateVoucherAvailableProvince.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
