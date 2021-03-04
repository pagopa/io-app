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
  lastOpenReportType?: string;
}>;

const INITIAL_STATE: InstabugUnreadMessagesState = {
  unreadMessages: 0,
  lastOpenReportType: undefined
};

const reportTypeMapping: Map<BugReporting.reportType, string> = new Map<
  BugReporting.reportType,
  string
>([
  [BugReporting.reportType.question, "question"],
  [BugReporting.reportType.bug, "bug"],
  [BugReporting.reportType.feedback, "feedback"]
]);

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
        lastOpenReportType: reportTypeMapping.get(action.payload.type)
      };
  }
  return state;
};

export default reducer;

// Selector
export const instabugMessageStateSelector = (state: GlobalState) =>
  state.instabug.unreadMessages;

export const instabugLastOpenReportTypeSelector = (
  state: GlobalState
): string | undefined => state.instabug.lastOpenReportType;
