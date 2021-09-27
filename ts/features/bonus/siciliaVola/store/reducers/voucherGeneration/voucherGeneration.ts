import { combineReducers } from "redux";
import { Action } from "../../../../../../store/actions/types";
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

import availableMunicipalitiesReducer, {
  AvailableMunicipalitiesState
} from "./availableMunicipalities";

export type VoucherGenerationState = {
  voucherRequest: VoucherRequestState;
  voucherGenerated: VoucherGeneratedState;
  availableDestinations: AvailableDestinationsState;
  availableStates: AvailableStatesState;
  availableRegions: AvailableRegionsState;
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
  availableMunicipalities: availableMunicipalitiesReducer
});

export default svVoucherGenerationReducer;
