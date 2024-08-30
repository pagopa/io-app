import { combineReducers } from "redux";

import fimsSSOReducer, {
  FimsSSOState
} from "../../singleSignOn/store/reducers/index";
import fimsHistoryReducer, {
  FimsHistoryState
} from "../../history/store/reducer";

export type FimsState = {
  sso: FimsSSOState;
  history: FimsHistoryState;
};

const fimsReducer = combineReducers({
  sso: fimsSSOReducer,
  history: fimsHistoryReducer
});

export default fimsReducer;
