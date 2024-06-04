import { combineReducers } from "redux";
import identificationReducer, {
  ItwIdentificationState
} from "../../../identification/store/reducers";

export type ItWalletState = {
  identification: ItwIdentificationState;
};

const reducer = combineReducers({
  identification: identificationReducer
});

export default reducer;
