import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import voucherGeneratedReducer, {
  VoucherGeneratedState
} from "./voucherGenerated";
import voucherRequestReducer, { VoucherRequestState } from "./voucherRequest";
import availableDestinationReducer, {
  AvailableDestinationsState
} from "./availableDestination";
import availableStatesReducer, { AvailableStatesState } from "./availableState";
import availableRegionsReducer, {
  AvailableRegionsState
} from "./availableRegion";
import availableProvincesReducer, {
  AvailableProvincesState
} from "./availableProvince";
import availableMunicipalitiesReducer, {
  AvailableMunicipalitiesState
} from "./availableMunicipality";

export type VoucherGenerationState = {
  voucherRequest: VoucherRequestState;
  voucherGenerated: VoucherGeneratedState;
  availableDestinations: AvailableDestinationsState;
  availableStates: AvailableStatesState;
  availableRegions: AvailableRegionsState;
  availableProvinces: AvailableProvincesState;
  availableMunicipalities: AvailableMunicipalitiesState;
};

const svVoucherGenerationReducer = combineReducers<
  VoucherGenerationState,
  Action
>({
  voucherRequest: voucherRequestReducer,
  availableDestinations: availableDestinationReducer,
  voucherGenerated: voucherGeneratedReducer,
  availableStates: availableStatesReducer,
  availableRegions: availableRegionsReducer,
  availableProvinces: availableProvincesReducer,
  availableMunicipalities: availableMunicipalitiesReducer
});

export default svVoucherGenerationReducer;
