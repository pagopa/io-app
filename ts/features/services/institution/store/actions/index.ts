import { ActionType, createAsyncAction } from "typesafe-actions";
import { InstitutionServicesResource } from "../../../../../../definitions/services/InstitutionServicesResource";
import { NetworkError } from "../../../../../utils/errors";

export type PaginatedServicesGetPayload = {
  institutionId: string;
  limit: number;
  offset: number;
};

export type WithInstitutionID<T> = T & {
  id: string;
};

export const paginatedServicesGet = createAsyncAction(
  "PAGINATED_SERVICES_GET_REQUEST",
  "PAGINATED_SERVICES_GET_SUCCESS",
  "PAGINATED_SERVICES_GET_FAILURE",
  "PAGINATED_SERVICES_GET_CANCEL"
)<
  PaginatedServicesGetPayload,
  InstitutionServicesResource,
  WithInstitutionID<NetworkError>,
  void
>();

export type InstitutionServicesActions = ActionType<
  typeof paginatedServicesGet
>;
