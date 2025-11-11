import { combineReducers } from "redux";
import { PersistPartial } from "redux-persist";
import preferencesPersistor, { WalletPreferencesState } from "./preferences";
import cardsReducer, { WalletCardsState } from "./cards";
import placeholdersPersistor, { WalletPlaceholdersState } from "./placeholders";
import bottomSheetPersistor, {
  WalletBottomSheetSurveyState
} from "./bottomSheet";

export type WalletState = {
  cards: WalletCardsState;
  preferences: WalletPreferencesState & PersistPartial;
  placeholders: WalletPlaceholdersState & PersistPartial;
  bottomSheet: WalletBottomSheetSurveyState & PersistPartial;
};

const walletReducer = combineReducers({
  cards: cardsReducer,
  preferences: preferencesPersistor,
  placeholders: placeholdersPersistor,
  bottomSheet: bottomSheetPersistor
});

export default walletReducer;
