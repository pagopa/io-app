import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ActionType, createStandardAction } from "typesafe-actions";
import { MessageBodyMarkdown } from "../../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import { AARFlowState, AARFlowStateName } from "../../utils/stateUtils";

export type EphemeralAarMessageDataActionPayload = {
  iun: NonEmptyString;
  thirdPartyMessage: ThirdPartyMessage;
  fiscalCode: string;
  pnServiceID: NonEmptyString;
  markdown: MessageBodyMarkdown;
  subject: MessageSubject;
  mandateId?: string;
};
export type TerminateAarFlowPayload = {
  messageId?: string;
  currentFlowState?: AARFlowStateName;
};
export type InitiateAarFlowPayload = {
  aarUrl: string;
};

export const tryInitiateAarFlow = createStandardAction(
  "TRY_INITIATE_AAR_FLOW"
)<InitiateAarFlowPayload>();

export const setAarFlowState =
  createStandardAction("SET_AAR_FLOW_STATE")<AARFlowState>();

export const terminateAarFlow =
  createStandardAction("TERMINATE_AAR_FLOW")<TerminateAarFlowPayload>();

export const populateStoresWithEphemeralAarMessageData = createStandardAction(
  "POPULATE_STORES_WITH_EPHEMERAL_AAR_MESSAGE_DATA"
)<EphemeralAarMessageDataActionPayload>();

export type AARFlowStateActions = ActionType<
  | typeof setAarFlowState
  | typeof terminateAarFlow
  | typeof populateStoresWithEphemeralAarMessageData
  | typeof tryInitiateAarFlow
>;
