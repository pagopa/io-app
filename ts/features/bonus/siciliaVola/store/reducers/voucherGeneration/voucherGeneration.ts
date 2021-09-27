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

import availableMunicipalitiesReducer, {
  AvailableMunicipalitiesState
} from "./availableMunicipalities";

export type VoucherGenerationState = {
  voucherRequest: VoucherRequestState;
  voucherGenerated: VoucherGeneratedState;
  availableDestinations: AvailableDestinationsState;
  availableStates: AvailableStatesState;
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
  availableMunicipalities: availableMunicipalitiesReducer
});

export default svVoucherGenerationReducer;
