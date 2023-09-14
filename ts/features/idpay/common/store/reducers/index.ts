import { combineReducers } from "redux";
import initiativeDetailsReducer, {
  IDPayInitiativeState
} from "../../../initiative/details/store/index";
import walletReducer, {
  IDPayWalletState
} from "../../../wallet/store/reducers/index";
import timelineReducer, {
  IDPayTimelineState
} from "../../../initiative/timeline/store";
import configurationReducer, {
  IDPayInitiativeConfigurationState
} from "../../../initiative/configuration/store";

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
