import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";
import issuanceReducer, {
  ItwIssuanceState
} from "../../../issuance/store/reducers";
import lifecycleReducer, {
  ItwLifecycleState
} from "../../../lifecycle/store/reducers";

export type ItWalletState = {
  identification: ItwIdentificationState;
  issuance: ItwIssuanceState & PersistPartial;
  lifecycle: ItwLifecycleState;
};

const reducer = combineReducers({
  identification: identificationReducer,
  issuance: issuanceReducer,
  lifecycle: lifecycleReducer
});

export default reducer;
