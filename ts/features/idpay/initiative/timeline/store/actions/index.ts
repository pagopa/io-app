import { ActionType, createAsyncAction } from "typesafe-actions";
import { InitiativeDTO } from "../../../../../../../definitions/idpay/InitiativeDTO";
import { OperationDTO } from "../../../../../../../definitions/idpay/OperationDTO";
import { OperationListDTO } from "../../../../../../../definitions/idpay/OperationListDTO";
import { NetworkError } from "../../../../../../utils/errors";

export type IdPayTimelineDetailsGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
  operationId: OperationListDTO["operationId"];
};

export const idpayTimelineDetailsGet = createAsyncAction(
  "IDPAY_TIMELINE_DETAILS_REQUEST",
  "IDPAY_TIMELINE_DETAILS_SUCCESS",
  "IDPAY_TIMELINE_DETAILS_FAILURE"
)<IdPayTimelineDetailsGetPayloadType, OperationDTO, NetworkError>();

export type IDPayTimelineActions = ActionType<typeof idpayTimelineDetailsGet>;
