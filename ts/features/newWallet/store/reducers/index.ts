import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";

export type WalletState = {
  preferences: WalletPreferencesState & PersistPartial;
};

const walletReducer = combineReducers({
  preferences: preferencesPersistor
});

export default walletReducer;
