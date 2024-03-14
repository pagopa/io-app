import { combineReducers } from "redux";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";

export type WalletState = {
  preferences: WalletPreferencesState;
};

const walletReducer = combineReducers({
  preferences: preferencesPersistor
});

export default walletReducer;
