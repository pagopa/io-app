import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistConfig, persistReducer } from "redux-persist";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { walletSetBottomSheetSurveyVisible } from "../actions/bottomSheet";

export type WalletBottomSheetSurveyState = {
  bottomSheetSurveyVisible: boolean;
};

const INITIAL_STATE: WalletBottomSheetSurveyState = {
  bottomSheetSurveyVisible: true
};

const reducer = (
  state: WalletBottomSheetSurveyState = INITIAL_STATE,
  action: Action
): WalletBottomSheetSurveyState => {
  switch (action.type) {
    case getType(walletSetBottomSheetSurveyVisible):
      return {
        ...state,
        bottomSheetSurveyVisible: action.payload
      };
  }
  return state;
};

const CURRENT_REDUX_WALLET_BOTTOM_SHEET_STORE_VERSION = -1;

const persistConfig: PersistConfig = {
  key: "walletBottomSheet",
  storage: AsyncStorage,
  version: CURRENT_REDUX_WALLET_BOTTOM_SHEET_STORE_VERSION
};

export const bottomSheetSurveyReducer = persistReducer<
  WalletBottomSheetSurveyState,
  Action
>(persistConfig, reducer);

export default bottomSheetSurveyReducer;
