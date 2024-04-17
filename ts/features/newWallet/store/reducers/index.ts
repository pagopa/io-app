import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";
import cardsReducer, { WalletCardsState } from "./cards";
import placeholdersPersistor, { WalletPlaceholdersState } from "./placeholders";

export type WalletState = {
  cards: WalletCardsState;
  preferences: WalletPreferencesState & PersistPartial;
  placeholders: WalletPlaceholdersState & PersistPartial;
};

const walletReducer = combineReducers({
  cards: cardsReducer,
  preferences: preferencesPersistor,
  placeholders: placeholdersPersistor
});

export default walletReducer;
