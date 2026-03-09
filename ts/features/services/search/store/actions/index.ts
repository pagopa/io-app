import { ActionType, createAsyncAction } from "typesafe-actions";
import { InstitutionsResource } from "../../../../../../definitions/services/InstitutionsResource";
import { ScopeTypeEnum } from "../../../../../../definitions/services/ScopeType";
import { NetworkError } from "../../../../../utils/errors";

export type SearchPaginatedInstitutionsGetPayload = {
  limit: number;
  offset: number;
  search?: string;
  scope?: ScopeTypeEnum;
  sessionId?: string;
};

export const searchPaginatedInstitutionsGet = createAsyncAction(
  "SEARCH_PAGINATED_INSTITUTIONS_GET_REQUEST",
  "SEARCH_PAGINATED_INSTITUTIONS_GET_SUCCESS",
  "SEARCH_PAGINATED_INSTITUTIONS_GET_FAILURE",
  "SEARCH_PAGINATED_INSTITUTIONS_GET_CANCEL"
)<
  SearchPaginatedInstitutionsGetPayload,
  InstitutionsResource,
  NetworkError,
  void
>();

export type SearchActions = ActionType<typeof searchPaginatedInstitutionsGet>;
