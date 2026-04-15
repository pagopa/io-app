import { combineReducers } from "redux";
import cdcWalletReducer, {
  CdcWalletState
} from "../../../wallet/store/reducers";

export type CdcState = {
  wallet: CdcWalletState;
};

const cdcReducer = combineReducers({
  wallet: cdcWalletReducer
});

export default cdcReducer;
