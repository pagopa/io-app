import { InitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import { OperationDTO } from "@io-app/api-types/generated/definitions/idpay/OperationDTO";
import { OperationListDTO } from "@io-app/api-types/generated/definitions/idpay/OperationListDTO";
import { ActionType, createAsyncAction } from "typesafe-actions";

import { NetworkError } from "../../../../../utils/errors";

type IdPayTimelineDetailsGetPayloadType = {
  initiativeId: InitiativeDTO["initiativeId"];
  operationId: OperationListDTO["operationId"];
};

export const idpayTimelineDetailsGet = createAsyncAction(
  "IDPAY_TIMELINE_DETAILS_REQUEST",
  "IDPAY_TIMELINE_DETAILS_SUCCESS",
  "IDPAY_TIMELINE_DETAILS_FAILURE"
)<IdPayTimelineDetailsGetPayloadType, OperationDTO, NetworkError>();

export type IdPayTimelineActions = ActionType<typeof idpayTimelineDetailsGet>;
