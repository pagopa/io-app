import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";

import cardsReducer, { WalletCardsState } from "./cards";
import placeholdersPersistor, { WalletPlaceholdersState } from "./placeholders";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";

export type WalletState = {
  cards: WalletCardsState;
  placeholders: PersistPartial & WalletPlaceholdersState;
  preferences: PersistPartial & WalletPreferencesState;
};

const walletReducer = combineReducers({
  cards: cardsReducer,
  preferences: preferencesPersistor,
  placeholders: placeholdersPersistor
});

export default walletReducer;
