import { combineReducers } from "redux";
import codeReducer, { IdPayCodeState } from "../../../code/store/reducers";
import initiativeDetailsReducer, {
  IdPayInitiativeState
} from "../../../details/store/index";
import timelineReducer, { IdPayTimelineState } from "../../../timeline/store";
import walletReducer, {
  IdPayWalletState
} from "../../../wallet/store/reducers/index";
import configurationReducer, {
  IDPayInitiativeConfigurationState
} from "../../../configuration/store";

export type IDPayState = {
  wallet: IdPayWalletState;
  initiative: IdPayInitiativeState;
  timeline: IdPayTimelineState;
  configuration: IDPayInitiativeConfigurationState;
  code: IdPayCodeState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  timeline: timelineReducer,
  code: codeReducer,
  configuration: configurationReducer
});

export default idPayReducer;
