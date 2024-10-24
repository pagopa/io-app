import { combineReducers } from "redux";
import { createSelector } from "reselect";
import { Action } from "../actions/types";
import zendeskReducer, {
  ZendeskState
} from "../../features/zendesk/store/reducers";
import {
  assistanceToolRemoteConfig,
  canShowHelp
} from "../../utils/supportAssistance";
import { assistanceToolConfigSelector } from "./backendStatus/remoteConfig";

export type AssistanceToolsState = {
  zendesk: ZendeskState;
};

const assistanceToolsReducer = combineReducers<AssistanceToolsState, Action>({
  zendesk: zendeskReducer
});

// This selector contains the logic to show or not the help button:
// if remote FF is zendesk + ff local
export const canShowHelpSelector = createSelector(
  assistanceToolConfigSelector,
  (assistanceToolConfig): boolean => {
    const remoteTool = assistanceToolRemoteConfig(assistanceToolConfig);
    return canShowHelp(remoteTool);
  }
);

export default assistanceToolsReducer;
