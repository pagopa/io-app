import { combineReducers } from "redux";
import { Action } from "../../../../../store/actions/types";
import voucherGeneratedReducer, {
  VoucherGeneratedState
} from "./voucherGenerated";
import voucherRequestReducer, { VoucherRequestState } from "./voucherRequest";
import availableDestinationReducer, {
  AvailableDestinationsState
} from "./availableDestinations";
import availableStatesReducer, {
  AvailableStatesState
} from "./availableStates";
import availableRegionsReducer, {
  AvailableRegionsState
} from "./availableRegions";
import availableProvincesReducer, {
  AvailableProvincesState
} from "./availableProvinces";
import availableMunicipalitiesReducer, {
  AvailableMunicipalitiesState
} from "./availableMunicipalities";

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
