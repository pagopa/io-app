/**
 * Instabug message reducer
 */
import { BugReporting } from "instabug-reactnative";
import { getType } from "typesafe-actions";
import { instabugReportOpened } from "../../actions/debug";
import { instabugUnreadMessagesLoaded } from "../../actions/instabug";

import { Action } from "../../actions/types";
import { GlobalState } from "../types";

export type InstabugUnreadMessagesState = Readonly<{
  unreadMessages: number;
  bugReportingType: BugReporting.reportType;
}>;

const INITIAL_STATE: InstabugUnreadMessagesState = {
  unreadMessages: 0,
  bugReportingType: BugReporting.reportType.question
};

const reducer = (
  state: InstabugUnreadMessagesState = INITIAL_STATE,
  action: Action
): InstabugUnreadMessagesState => {
  switch (action.type) {
    case getType(instabugUnreadMessagesLoaded):
      return {
        ...state,
        unreadMessages: action.payload
      };
    case getType(instabugReportOpened):
      return {
        ...state,
        bugReportingType: action.payload.type
      };
  }
  return state;
};

export default reducer;

// Selector
export const instabugMessageStateSelector = (state: GlobalState) =>
  state.instabug.unreadMessages;

export const instabugReportingTypeSelector = (state: GlobalState) =>
  state.instabug.bugReportingType;
