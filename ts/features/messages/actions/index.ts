import { createAction, createAsyncAction } from "typesafe-actions";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { MessageGetStatusFailurePhaseType } from "../../../store/reducers/entities/messages/messageGetStatus";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

export type RequestGetMessageDataActionType = {
  messageId: UIMessageId;
  fromPushNotification: boolean;
};

export type SuccessGetMessageDataActionType = {
  containsAttachments: boolean;
  containsPayment?: boolean;
  euCovidCerficateAuthCode?: string;
  firstTimeOpening: boolean;
  hasRemoteContent: boolean;
  isPNMessage: boolean;
  messageId: UIMessageId;
  organizationName: string;
  serviceId: ServiceId;
  serviceName: string;
};

type FailureGetMessageDataActionType = {
  blockedFromPushNotificationOpt?: boolean;
  phase: MessageGetStatusFailurePhaseType;
};

export const getMessageDataAction = createAsyncAction(
  "GET_MESSAGE_DATA_REQUEST",
  "GET_MESSAGE_DATA_SUCCESS",
  "GET_MESSAGE_DATA_FAILURE"
)<
  RequestGetMessageDataActionType,
  SuccessGetMessageDataActionType,
  FailureGetMessageDataActionType
>();

export const resetGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_RESET_REQUEST"
);

export const cancelGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_CANCEL_REQUEST"
);
