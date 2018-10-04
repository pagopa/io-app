import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";

export const contentServiceLoad = createStandardAction("CONTENT_SERVICE_LOAD")<
  ServiceId
>();

export const contentServiceLoadSuccess = createAction(
  "CONTENT_SERVICE_LOAD_SUCCESS",
  resolve => (serviceId: ServiceId, data: ServiceMetadata) =>
    resolve({ serviceId, data })
);

export const contentServiceLoadFailure = createStandardAction(
  "CONTENT_SERVICE_LOAD_FAILURE"
)<ServiceId>();

export type ContentActions = ActionType<
  | typeof contentServiceLoad
  | typeof contentServiceLoadSuccess
  | typeof contentServiceLoadFailure
>;
