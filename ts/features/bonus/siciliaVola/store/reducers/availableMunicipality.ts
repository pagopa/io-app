import * as pot from "italia-ts-commons/lib/pot";
import { getType } from "typesafe-actions";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { Municipality } from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableProvince,
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";

export type AvailableMunicipalityState = pot.Pot<
  IndexedById<Municipality>,
  NetworkError
>;
const INITIAL_STATE: AvailableMunicipalityState = pot.none;

const reducer = (
  state: AvailableMunicipalityState = INITIAL_STATE,
  action: Action
): AvailableMunicipalityState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherAvailableState.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableRegion.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableProvince.request):
      return pot.none;
    case getType(svGenerateVoucherAvailableMunicipality.request):
      return pot.toLoading(state);
    case getType(svGenerateVoucherAvailableMunicipality.success):
      return pot.some(toIndexed(action.payload, m => m.id));
    case getType(svGenerateVoucherAvailableMunicipality.failure):
      return pot.toError(state, action.payload);
  }
  return state;
};

export default reducer;
