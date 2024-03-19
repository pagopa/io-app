import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";
import cardsReducer, { WalletCardsState } from "./cards";

export type WalletState = {
  cards: WalletCardsState;
  preferences: WalletPreferencesState & PersistPartial;
};

const walletReducer = combineReducers({
  cards: cardsReducer,
  preferences: preferencesPersistor
});

export default walletReducer;
