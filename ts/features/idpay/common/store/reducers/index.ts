import { combineReducers } from "redux";
import initiativeDetailsReducer, {
  IDPayInitiativeState
} from "../../../initiative/details/store/index";
import walletReducer, {
  IDPayWalletState
} from "../../../wallet/store/reducers/index";

export type IDPayState = {
  wallet: IDPayWalletState;
  initiative: IDPayInitiativeState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer
});

export default idPayReducer;
