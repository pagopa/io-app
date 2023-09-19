import { combineReducers } from "redux";
import initiativeDetailsReducer, {
  IdPayInitiativeState
} from "../../../initiative/details/store/index";
import walletReducer, {
  IdPayWalletState
} from "../../../wallet/store/reducers/index";
import timelineReducer, {
  IdPayTimelineState
} from "../../../initiative/timeline/store";
import codeReducer, { IdPayCodeState } from "../../../code/store/reducers";

export type IDPayState = {
  wallet: IdPayWalletState;
  initiative: IdPayInitiativeState;
  timeline: IdPayTimelineState;
  code: IdPayCodeState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  timeline: timelineReducer,
  code: codeReducer
});

export default idPayReducer;
