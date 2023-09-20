import { combineReducers } from "redux";
import initiativeDetailsReducer, {
  IDPayInitiativeState
} from "../../../details/store/index";
import walletReducer, {
  IDPayWalletState
} from "../../../wallet/store/reducers/index";
import timelineReducer, { IDPayTimelineState } from "../../../timeline/store";
import configurationReducer, {
  IDPayInitiativeConfigurationState
} from "../../../configuration/store";

export type IDPayState = {
  wallet: IDPayWalletState;
  initiative: IDPayInitiativeState;
  timeline: IDPayTimelineState;
  configuration: IDPayInitiativeConfigurationState;
};

const idPayReducer = combineReducers({
  wallet: walletReducer,
  initiative: initiativeDetailsReducer,
  configuration: configurationReducer,
  timeline: timelineReducer
});

export default idPayReducer;
