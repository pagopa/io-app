import { combineReducers } from "redux";

import fimsHistoryReducer, {
  FimsHistoryState
} from "../../history/store/reducer";
import fimsSSOReducer, {
  FimsSSOState
} from "../../singleSignOn/store/reducers/index";

export type FimsState = {
  history: FimsHistoryState;
  sso: FimsSSOState;
};

const fimsReducer = combineReducers({
  sso: fimsSSOReducer,
  history: fimsHistoryReducer
});

export default fimsReducer;
