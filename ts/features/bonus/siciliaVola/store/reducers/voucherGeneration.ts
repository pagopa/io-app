import { getType } from "typesafe-actions";
import { none, Option } from "fp-ts/lib/Option";
import * as pot from "italia-ts-commons/lib/pot";
import { Action } from "../../../../../store/actions/types";
import {
  svGenerateVoucherAvailableDestination,
  svGenerateVoucherAvailableMunicipality,
  svGenerateVoucherAvailableProvince,
  svGenerateVoucherAvailableRegion,
  svGenerateVoucherAvailableState,
  svGenerateVoucherGeneratedVoucher,
  svGenerateVoucherStart
} from "../actions/voucherGeneration";
import {
  AvailableDestination,
  Municipality,
  Province,
  Region,
  State,
  VoucherRequest
} from "../../types/SvVoucherRequest";
import { IndexedById, toIndexed } from "../../../../../store/helpers/indexer";
import { SvVoucherGeneratedResponse } from "../../types/svVoucherResponse";
import { NetworkError } from "../../../../../utils/errors";

export type VoucherGenerationState = {
  voucherRequest: Option<VoucherRequest>;
  voucherGenerated: pot.Pot<SvVoucherGeneratedResponse, NetworkError>;
  availableDestination: pot.Pot<AvailableDestination, NetworkError>;
  availableState: pot.Pot<IndexedById<State>, NetworkError>;
  availableRegion: pot.Pot<IndexedById<Region>, NetworkError>;
  availableProvince: pot.Pot<IndexedById<Province>, NetworkError>;
  availableMunicipality: pot.Pot<IndexedById<Municipality>, NetworkError>;
};

const INITIAL_STATE: VoucherGenerationState = {
  voucherRequest: none,
  voucherGenerated: pot.none,
  availableDestination: pot.none,
  availableState: pot.none,
  availableRegion: pot.none,
  availableProvince: pot.none,
  availableMunicipality: pot.none
};

const reducer = (
  state: VoucherGenerationState = INITIAL_STATE,
  action: Action
): VoucherGenerationState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;

    case getType(svGenerateVoucherAvailableDestination.request):
      return {
        ...state,
        availableDestination: pot.toLoading(state.availableDestination)
      };
    case getType(svGenerateVoucherAvailableDestination.success):
      return {
        ...state,
        availableDestination: pot.some(action.payload)
      };
    case getType(svGenerateVoucherAvailableDestination.failure):
      return {
        ...state,
        availableDestination: pot.toError(
          state.availableDestination,
          action.payload
        )
      };
    case getType(svGenerateVoucherGeneratedVoucher.request):
      return {
        ...state,
        voucherGenerated: pot.toLoading(state.voucherGenerated)
      };
    case getType(svGenerateVoucherGeneratedVoucher.success):
      return {
        ...state,
        voucherGenerated: pot.some(action.payload)
      };
    case getType(svGenerateVoucherGeneratedVoucher.failure):
      return {
        ...state,
        voucherGenerated: pot.toError(state.voucherGenerated, action.payload)
      };
    case getType(svGenerateVoucherAvailableState.request):
      return {
        ...state,
        availableState: pot.toLoading(state.availableState),
        availableRegion: pot.none,
        availableProvince: pot.none,
        availableMunicipality: pot.none
      };
    case getType(svGenerateVoucherAvailableState.success):
      return {
        ...state,
        availableState: pot.some(toIndexed(action.payload, s => s.id))
      };
    case getType(svGenerateVoucherAvailableState.failure):
      return {
        ...state,
        availableState: pot.toError(state.availableState, action.payload)
      };
    case getType(svGenerateVoucherAvailableRegion.request):
      return {
        ...state,
        availableRegion: pot.toLoading(state.availableRegion),
        availableProvince: pot.none,
        availableMunicipality: pot.none
      };
    case getType(svGenerateVoucherAvailableRegion.success):
      return {
        ...state,
        availableRegion: pot.some(toIndexed(action.payload, r => r.id))
      };
    case getType(svGenerateVoucherAvailableRegion.failure):
      return {
        ...state,
        availableRegion: pot.toError(state.availableRegion, action.payload)
      };
    case getType(svGenerateVoucherAvailableProvince.request):
      return {
        ...state,
        availableProvince: pot.toLoading(state.availableProvince),
        availableMunicipality: pot.none
      };
    case getType(svGenerateVoucherAvailableProvince.success):
      return {
        ...state,
        availableProvince: pot.some(toIndexed(action.payload, p => p.id))
      };
    case getType(svGenerateVoucherAvailableProvince.failure):
      return {
        ...state,
        availableProvince: pot.toError(state.availableProvince, action.payload)
      };
    case getType(svGenerateVoucherAvailableMunicipality.request):
      return {
        ...state,
        availableMunicipality: pot.toLoading(state.availableMunicipality)
      };
    case getType(svGenerateVoucherAvailableMunicipality.success):
      return {
        ...state,
        availableMunicipality: pot.some(toIndexed(action.payload, m => m.id))
      };
    case getType(svGenerateVoucherAvailableMunicipality.failure):
      return {
        ...state,
        availableMunicipality: pot.toError(
          state.availableMunicipality,
          action.payload
        )
      };
  }

  return state;
};

export default reducer;
