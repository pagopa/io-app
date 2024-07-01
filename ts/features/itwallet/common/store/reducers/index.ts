import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState & PersistPartial;
};

const reducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer
});

export default reducer;
