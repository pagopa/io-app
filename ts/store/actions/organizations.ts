/**
 * Action types and action creator related to Organizations.
 */
import { ActionType, createStandardAction } from "typesafe-actions";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

export const refreshOrganizations = createStandardAction(
  "REFRESH_ORGANIZATIONS"
)<ReadonlyArray<string>>();

export const updateOrganizations = createStandardAction("UPDATE_ORGANIZATIONS")<
  ServicePublic
>();

export type OrganizationsActions =
  | ActionType<typeof refreshOrganizations>
  | ActionType<typeof updateOrganizations>;
