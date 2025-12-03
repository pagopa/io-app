import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { MessageBodyMarkdown } from "../../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import { AARFlowState, AARFlowStateName } from "../../utils/stateUtils";
import { MandateCreationResponse } from "../../../../../../definitions/pn/aar/MandateCreationResponse";

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

export const initiateAarFlow =
  createStandardAction("INITIATE_AAR_FLOW")<InitiateAarFlowPayload>();

export const setAarFlowState =
  createStandardAction("SET_AAR_FLOW_STATE")<AARFlowState>();

export const terminateAarFlow =
  createStandardAction("TERMINATE_AAR_FLOW")<TerminateAarFlowPayload>();

export const populateStoresWithEphemeralAarMessageData = createStandardAction(
  "POPULATE_STORES_WITH_EPHEMERAL_AAR_MESSAGE_DATA"
)<EphemeralAarMessageDataActionPayload>();

export const testAarCreateMandate = createAsyncAction(
  "TEST_AAR_CREATE_MANDATE_REQUEST",
  "TEST_AAR_CREATE_MANDATE_SUCCESS",
  "TEST_AAR_CREATE_MANDATE_FAILURE"
)<void, MandateCreationResponse, string>();
export const testAarAcceptMandate = createAsyncAction(
  "TEST_AAR_ACCEPT_MANDATE_REQUEST",
  "TEST_AAR_ACCEPT_MANDATE_SUCCESS",
  "TEST_AAR_ACCEPT_MANDATE_FAILURE"
)<InternalAuthAndMrtdResponse, void, string>();

export type AARFlowStateActions = ActionType<
  | typeof setAarFlowState
  | typeof terminateAarFlow
  | typeof populateStoresWithEphemeralAarMessageData
  | typeof initiateAarFlow
  | typeof testAarCreateMandate
  | typeof testAarAcceptMandate
>;
