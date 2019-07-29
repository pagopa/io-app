/**
 * Action types and action creator related to Organizations.
 */
import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

export const setSelectedOrganizations = createStandardAction(
  "SET_SELECTED_ORGANIZATIONS"
)<Option<Set<string>>>();

export type OrganizationsActions = ActionType<typeof setSelectedOrganizations>;
