import { combineReducers } from "redux";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState;
};

const reducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer
});

export default reducer;
