import { ActionType, createAction } from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";

export const contentServiceLoad = createAction(
  "CONTENT_SERVICE_LOAD",
  resolve => (serviceId: ServiceId) => resolve({ serviceId })
);

export const contentServiceLoadSuccess = createAction(
  "CONTENT_SERVICE_LOAD_SUCCESS",
  resolve => (serviceId: ServiceId, data: ServiceMetadata) =>
    resolve({ serviceId, data })
);

export const contentServiceLoadFailure = createAction(
  "CONTENT_SERVICE_LOAD_FAILURE",
  resolve => (serviceId: ServiceId) => resolve({ serviceId })
);

export type ContentActions = ActionType<
  | typeof contentServiceLoad
  | typeof contentServiceLoadSuccess
  | typeof contentServiceLoadFailure
>;
