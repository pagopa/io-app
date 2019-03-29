/**
 * Action type related to the installation of the app.
 */

import { ActionType, createStandardAction } from "typesafe-actions";

export const previousInstallationDataDeleteSuccess = createStandardAction(
  "PREV_INSTALLATION_DATA_DELETE_SUCCESS"
)();

export type InstallationActions = ActionType<
  typeof previousInstallationDataDeleteSuccess
>;
