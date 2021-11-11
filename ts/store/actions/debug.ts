import { BugReporting, dismissType } from "instabug-reactnative";
import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * instabug report type i.e bug, chat etc.
 */
export type InstabugReport = {
  type: BugReporting.reportType;
};

/**
 * instabug report dismission i.e. canceled, submit etc.
 */
export type InstabugDismiss = {
  how: dismissType;
};

/**
 * Enables or disables debug mode
 */
export const setDebugModeEnabled = createStandardAction(
  "DEBUG_MODE_SET_ENABLED"
)<boolean>();

/**
 * Used only for debug purpose until to react-navigation v6 the upgrade
 * TODO: Remove after the upgrade to react-navigation v6
 * @deprecated
 */
export const setDebugCurrentRouteName = createStandardAction(
  "DEBUG_SET_CURRENT_ROUTE"
)<string>();

/**
 * An Instabug report is open
 */
export const instabugReportOpened = createStandardAction(
  "INSTABUG_REPORT_OPENED"
)<InstabugReport>();

/**
 * An Instabug report is closed
 */
export const instabugReportClosed = createStandardAction(
  "INSTABUG_REPORT_CLOSED"
)<{ type: string } & InstabugDismiss>();

export type DebugActions =
  | ActionType<typeof setDebugModeEnabled>
  | ActionType<typeof instabugReportOpened>
  | ActionType<typeof setDebugCurrentRouteName>
  | ActionType<typeof instabugReportClosed>;
