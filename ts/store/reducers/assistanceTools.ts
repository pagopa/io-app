import { combineReducers } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { Action } from "../actions/types";
import zendeskReducer, {
  ZendeskState
} from "../../features/zendesk/store/reducers";
import {
  assistanceToolRemoteConfig,
  canShowHelp
} from "../../utils/supportAssistance";
import { assistanceToolConfigSelector } from "./backendStatus";
import { isProfileEmailValidatedSelector, profileSelector } from "./profile";

export type AssistanceToolsState = {
  zendesk: ZendeskState;
};

const assistanceToolsReducer = combineReducers<AssistanceToolsState, Action>({
  zendesk: zendeskReducer
});

// This selector contains the logic to show or not the help button:
// if remote FF is zendesk + ff local + the profile is not potSome or the email is validated
export const canShowHelpSelector = createSelector(
  assistanceToolConfigSelector,
  profileSelector,
  isProfileEmailValidatedSelector,
  (assistanceToolConfig, profile, isProfileEmailValidated): boolean => {
    const remoteTool = assistanceToolRemoteConfig(assistanceToolConfig);
    return canShowHelp(
      remoteTool,
      !pot.isSome(profile) || isProfileEmailValidated
    );
  }
);

export default assistanceToolsReducer;
