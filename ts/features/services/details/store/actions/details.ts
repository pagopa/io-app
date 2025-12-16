import { ActionType, createAsyncAction } from "typesafe-actions";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";

type ServiceLoadFailurePayload = {
  error: Error;
  service_id: string;
};

export const loadServiceDetail = createAsyncAction(
  "LOAD_SERVICE_DETAIL_REQUEST",
  "LOAD_SERVICE_DETAIL_SUCCESS",
  "LOAD_SERVICE_DETAIL_FAILURE"
)<string, ServiceDetails, ServiceLoadFailurePayload>();

export type ServiceDetailsActions = ActionType<typeof loadServiceDetail>;
