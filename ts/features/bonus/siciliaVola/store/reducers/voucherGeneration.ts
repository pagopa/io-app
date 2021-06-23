import { Action } from "../../../../../store/actions/types";
import voucherGeneratedReducer, {
  VoucherGeneratedState
} from "./voucherGenerated";
import voucherRequestReducer, { VoucherRequestState } from "./voucherRequest";
import availableDestinationReducer, {
  AvailableDestinationState
} from "./availableDestination";
import { combineReducers } from "redux";
import availableStateReducer, { AvailableStateState } from "./availableState";
import availableRegionReducer, {
  AvailableRegionState
} from "./availableRegion";
import availableProvinceReducer, {
  AvailableProvinceState
} from "./availableProvince";
import availableMunicipalityReducer, {
  AvailableMunicipalityState
} from "./availableMunicipality";

export type VoucherGenerationState = {
  voucherRequest: VoucherRequestState;
  voucherGenerated: VoucherGeneratedState;
  availableDestination: AvailableDestinationState;
  availableState: AvailableStateState;
  availableRegion: AvailableRegionState;
  availableProvince: AvailableProvinceState;
  availableMunicipality: AvailableMunicipalityState;
};

const svVoucherGenerationReducer = combineReducers<
  VoucherGenerationState,
  Action
>({
  voucherRequest: voucherRequestReducer,
  availableDestination: availableDestinationReducer,
  voucherGenerated: voucherGeneratedReducer,
  availableState: availableStateReducer,
  availableRegion: availableRegionReducer,
  availableProvince: availableProvinceReducer,
  availableMunicipality: availableMunicipalityReducer
});

export default svVoucherGenerationReducer;
