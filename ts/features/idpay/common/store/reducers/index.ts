import { combineReducers } from "redux";
import initiativeDetailsReducer, {
  IDPayInitiativeState
} from "../../../details/store/index";
import walletReducer, {
  IDPayWalletState
} from "../../../wallet/store/reducers/index";
import timelineReducer, { IDPayTimelineState } from "../../../timeline/store";

export type IDPayState = {
  wallet: IDPayWalletState;
  initiative: IDPayInitiativeState;
  timeline: IDPayTimelineState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  timeline: timelineReducer
});

export default idPayReducer;
