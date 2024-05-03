import { ActionType, createAsyncAction } from "typesafe-actions";
import { FeaturedItems } from "../../../../../../definitions/services/FeaturedItems";
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

export const featuredItemsGet = createAsyncAction(
  "FEATURED_ITEMS_GET_REQUEST",
  "FEATURED_ITEMS_GET_SUCCESS",
  "FEATURED_ITEMS_GET_FAILURE"
)<void, FeaturedItems, NetworkError>();

export type ServicesHomeActions = ActionType<
  typeof paginatedInstitutionsGet | typeof featuredItemsGet
>;
