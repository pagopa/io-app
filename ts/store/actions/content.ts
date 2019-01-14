import { ActionType, createAsyncAction } from "typesafe-actions";

import { ServiceId } from "../../../definitions/backend/ServiceId";
import { Service as ServiceMetadata } from "../../../definitions/content/Service";

export const contentServiceLoad = createAsyncAction(
  "CONTENT_SERVICE_LOAD_REQUEST",
  "CONTENT_SERVICE_LOAD_SUCCESS",
  "CONTENT_SERVICE_LOAD_FAILURE"
)<ServiceId, { serviceId: ServiceId; data: ServiceMetadata }, ServiceId>();

export type ContentActions = ActionType<typeof contentServiceLoad>;
