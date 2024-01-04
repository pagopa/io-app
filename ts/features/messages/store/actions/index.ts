import { ActionType, createAction, createAsyncAction } from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { MessageGetStatusFailurePhaseType } from "../../../../store/reducers/entities/messages/messageGetStatus";

export type ThirdPartyMessageActions = ActionType<typeof loadThirdPartyMessage>;

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

/**
 * The user requests the message third party content.
 */
export const loadThirdPartyMessage = createAsyncAction(
  "THIRD_PARTY_MESSAGE_LOAD_REQUEST",
  "THIRD_PARTY_MESSAGE_LOAD_SUCCESS",
  "THIRD_PARTY_MESSAGE_LOAD_FAILURE"
)<
  { id: UIMessageId; serviceId: ServiceId; tag: string },
  { id: UIMessageId; content: ThirdPartyMessageWithContent },
  { id: UIMessageId; error: Error }
>();

export const resetGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_RESET_REQUEST"
);

export const cancelGetMessageDataAction = createAction(
  "GET_MESSAGE_DATA_CANCEL_REQUEST"
);
