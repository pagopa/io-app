import { createAction, createAsyncAction } from "typesafe-actions";
import { UIMessageId } from "../../../store/reducers/entities/messages/types";
import { MessageGetStatusFailurePhaseType } from "../../../store/reducers/entities/messages/messageGetStatus";
import { ServiceId } from "../../../../definitions/backend/ServiceId";

export type RequestGetMessageDataActionType = {
  messageId: UIMessageId;
  fromPushNotification: boolean;
};

export type SuccessGetMessageDataActionType = {
  euCovidCerficateAuthCode?: string;
  containsPayment?: boolean;
  firstTimeOpening: boolean;
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
  "GET_MESSAGE_DATA_FAILURE",
  "GET_MESSAGE_DATA_CANCEL"
)<
  RequestGetMessageDataActionType,
  SuccessGetMessageDataActionType,
  FailureGetMessageDataActionType
>();

export const cancelGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_CANCEL_REQUEST"
);
