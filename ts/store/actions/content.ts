import {
  CONTENT_SERVICE_LOAD,
  CONTENT_SERVICE_LOAD_FAILURE,
  CONTENT_SERVICE_LOAD_SUCCESS
} from "./constants";

import { Service as ServiceMetadata } from "../../../definitions/content/Service";

import { ServiceId } from "../../../definitions/backend/ServiceId";

export type ContentServiceLoad = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD;
  serviceId: ServiceId;
}>;

type ContentServiceLoadSuccess = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_SUCCESS;
  serviceId: ServiceId;
  data: ServiceMetadata;
}>;

type ContentServiceLoadFailure = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_FAILURE;
  serviceId: ServiceId;
}>;

export type ContentActions =
  | ContentServiceLoad
  | ContentServiceLoadSuccess
  | ContentServiceLoadFailure;

export const contentServiceLoad = (
  serviceId: ServiceId
): ContentServiceLoad => ({
  type: "CONTENT_SERVICE_LOAD",
  serviceId
});

export const contentServiceLoadSuccess = (
  serviceId: ServiceId,
  data: ServiceMetadata
): ContentServiceLoadSuccess => ({
  type: "CONTENT_SERVICE_LOAD_SUCCESS",
  serviceId,
  data
});

export const contentServiceLoadFailure = (
  serviceId: ServiceId
): ContentServiceLoadFailure => ({
  type: "CONTENT_SERVICE_LOAD_FAILURE",
  serviceId
});
