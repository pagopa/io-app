import { ActionType, createAsyncAction } from "typesafe-actions";
import { InitiativeDTO1 } from "../../../../../../definitions/idpay/InitiativeDTO1";
import { OperationDTO } from "../../../../../../definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../../../../../definitions/idpay/OperationListDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayTimelineDetailsGetPayloadType = {
  initiativeId: InitiativeDTO1["initiativeId"];
  operationId: OperationListDTO["operationId"];
};

export const idpayTimelineDetailsGet = createAsyncAction(
  "IDPAY_TIMELINE_DETAILS_REQUEST",
  "IDPAY_TIMELINE_DETAILS_SUCCESS",
  "IDPAY_TIMELINE_DETAILS_FAILURE"
)<IdPayTimelineDetailsGetPayloadType, OperationDTO, NetworkError>();

export type IdPayTimelineActions = ActionType<typeof idpayTimelineDetailsGet>;
