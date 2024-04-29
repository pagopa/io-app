import { ActionType, createAsyncAction } from "typesafe-actions";
import { ScopeTypeEnum } from "../../../../../../definitions/services/ScopeType";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
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

export type ServicesHomeActions = ActionType<typeof paginatedInstitutionsGet>;
