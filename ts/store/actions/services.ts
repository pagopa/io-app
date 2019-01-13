/**
 * Action types and action creator related to Services.
 */

import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceList } from "../../../definitions/backend/ServiceList";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";

//
// load visible services
//

export const loadVisibleServices = createAsyncAction(
  "SERVICES_VISIBLE_LOAD_REQUEST",
  "SERVICES_VISIBLE_LOAD_SUCCESS",
  "SERVICES_VISIBLE_LOAD_FAILURE"
)<void, ServiceList["items"], void>();

//
// load single service
//

export const loadService = createAsyncAction(
  "SERVICE_LOAD_REQUEST",
  "SERVICE_LOAD_SUCCESS",
  "SERVICE_LOAD_FAILURE"
)<string, ServicePublic, string>();

export type ServicesActions = ActionType<
  typeof loadVisibleServices | typeof loadService
>;
