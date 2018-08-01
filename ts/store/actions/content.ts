import { OrganizationFiscalCode } from "italia-ts-commons/lib/strings";

import {
  CONTENT_ORGANIZATION_LOAD,
  CONTENT_ORGANIZATION_LOAD_FAILURE,
  CONTENT_ORGANIZATION_LOAD_SUCCESS,
  CONTENT_SERVICE_LOAD,
  CONTENT_SERVICE_LOAD_FAILURE,
  CONTENT_SERVICE_LOAD_SUCCESS
} from "./constants";

import { OrganizationMetadata, ServiceMetadata } from "../../api/content";

import { ServiceId } from "../../../definitions/backend/ServiceId";

export type ContentServiceLoad = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD;
  serviceId: ServiceId;
}>;

export type ContentServiceLoadSuccess = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_SUCCESS;
  serviceId: ServiceId;
  data: ServiceMetadata;
}>;

export type ContentServiceLoadFailure = Readonly<{
  type: typeof CONTENT_SERVICE_LOAD_FAILURE;
  serviceId: ServiceId;
}>;

export type ContentOrganizationLoad = Readonly<{
  type: typeof CONTENT_ORGANIZATION_LOAD;
  organizationFiscalCode: OrganizationFiscalCode;
}>;

export type ContentOrganizationLoadSuccess = Readonly<{
  type: typeof CONTENT_ORGANIZATION_LOAD_SUCCESS;
  organizationFiscalCode: OrganizationFiscalCode;
  data: OrganizationMetadata;
}>;

export type ContentOrganizationLoadFailure = Readonly<{
  type: typeof CONTENT_ORGANIZATION_LOAD_FAILURE;
  organizationFiscalCode: OrganizationFiscalCode;
}>;

export type ContentActions =
  | ContentServiceLoad
  | ContentServiceLoadSuccess
  | ContentServiceLoadFailure
  | ContentOrganizationLoad
  | ContentOrganizationLoadSuccess
  | ContentOrganizationLoadFailure;

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

export const contentOrganizationLoad = (
  organizationFiscalCode: OrganizationFiscalCode
): ContentOrganizationLoad => ({
  type: "CONTENT_ORGANIZATION_LOAD",
  organizationFiscalCode
});

export const contentOrganizationLoadSuccess = (
  organizationFiscalCode: OrganizationFiscalCode,
  data: OrganizationMetadata
): ContentOrganizationLoadSuccess => ({
  type: "CONTENT_ORGANIZATION_LOAD_SUCCESS",
  organizationFiscalCode,
  data
});

export const contentOrganizationLoadFailure = (
  organizationFiscalCode: OrganizationFiscalCode
): ContentOrganizationLoadFailure => ({
  type: "CONTENT_ORGANIZATION_LOAD_FAILURE",
  organizationFiscalCode
});
