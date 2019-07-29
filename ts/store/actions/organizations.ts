/**
 * Action types and action creator related to Organizations.
 */
import { ActionType, createStandardAction } from "typesafe-actions";

export const setSelectedOrganizations = createStandardAction(
  "SET_SELECTED_ORGANIZATIONS"
)<ReadonlyArray<string>>();

export type OrganizationsActions = ActionType<typeof setSelectedOrganizations>;
