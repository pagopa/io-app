import {
  CONTENT_SERVICE_LOAD,
  CONTENT_SERVICE_LOAD_FAILURE,
  CONTENT_SERVICE_LOAD_SUCCESS
} from "./constants";

import { ServiceMetadata } from "../../api/content";

export type ContentServiceLoad = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD;
  serviceId: string;
}>;

export type ContentServiceLoadSuccess = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_SUCCESS;
  serviceId: string;
  data: ServiceMetadata;
}>;

export type ContentServiceLoadFailure = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_FAILURE;
  serviceId: string;
}>;

export type ContentActions =
  | ContentServiceLoad
  | ContentServiceLoadSuccess
  | ContentServiceLoadFailure;

export const contentServiceLoad = (serviceId: string): ContentServiceLoad => ({
  type: "CONTENT_SERVICE_LOAD",
  serviceId
});

export const contentServiceLoadSuccess = (
  serviceId: string,
  data: ServiceMetadata
): ContentServiceLoadSuccess => ({
  type: "CONTENT_SERVICE_LOAD_SUCCESS",
  serviceId,
  data
});

export const contentServiceLoadFailure = (
  serviceId: string
): ContentServiceLoadFailure => ({
  type: "CONTENT_SERVICE_LOAD_FAILURE",
  serviceId
});
