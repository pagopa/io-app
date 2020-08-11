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
)<InstabugReport & InstabugDismiss>();

export type DebugActions =
  | ActionType<typeof setDebugModeEnabled>
  | ActionType<typeof instabugReportOpened>
  | ActionType<typeof instabugReportClosed>;
