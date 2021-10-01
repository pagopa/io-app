/**
 * Action types and action creator related to Organizations.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

export const setSelectedOrganizations = createStandardAction(
  "SET_SELECTED_ORGANIZATIONS"
)<ReadonlyArray<string>>();

export const updateOrganizations = createStandardAction(
  "UPDATE_ORGANIZATIONS"
)<ServicePublic>();

export type OrganizationsActions =
  | ActionType<typeof setSelectedOrganizations>
  | ActionType<typeof updateOrganizations>;
