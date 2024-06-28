import { combineReducers } from "redux";

import fimsSSOReducer, {
  FimsSSOState
} from "../../singleSignOn/store/reducers/index";

export type FimsState = {
  SSO: FimsSSOState;
};

const fimsReducer = combineReducers({
  SSO: fimsSSOReducer
});

export default fimsReducer;
