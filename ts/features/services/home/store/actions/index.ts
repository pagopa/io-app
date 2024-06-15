import { ActionType, createAsyncAction } from "typesafe-actions";
import { FeaturedServices } from "../../../../../../definitions/services/FeaturedServices";
import { Institutions } from "../../../../../../definitions/services/Institutions";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { ScopeTypeEnum } from "../../../../../../definitions/services/ScopeType";
import { NetworkError } from "../../../../../utils/errors";

export type PaginatedInstitutionsGetPayload = {
  limit: number;
  offset: number;
  search?: string;
  scope?: ScopeTypeEnum;
};

export const paginatedInstitutionsGet = createAsyncAction(
  "PAGINATED_INSTITUTIONS_GET_REQUEST",
  "PAGINATED_INSTITUTIONS_GET_SUCCESS",
  "PAGINATED_INSTITUTIONS_GET_FAILURE"
)<PaginatedInstitutionsGetPayload, InstitutionsResource, NetworkError>();

export const featuredInstitutionsGet = createAsyncAction(
  "FEATURED_INSTITUTIONS_GET_REQUEST",
  "FEATURED_INSTITUTIONS_GET_SUCCESS",
  "FEATURED_INSTITUTIONS_GET_FAILURE"
)<void, Institutions, NetworkError>();

export const featuredServicesGet = createAsyncAction(
  "FEATURED_SERVICES_GET_REQUEST",
  "FEATURED_SERVICES_GET_SUCCESS",
  "FEATURED_SERVICES_GET_FAILURE"
)<void, FeaturedServices, NetworkError>();

export type ServicesHomeActions = ActionType<
  | typeof paginatedInstitutionsGet
  | typeof featuredInstitutionsGet
  | typeof featuredServicesGet
>;
