import { InternalAuthAndMrtdResponse } from "@pagopa/io-react-native-cie";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { MessageBodyMarkdown } from "../../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../../definitions/backend/MessageSubject";
import { MandateCreationResponse } from "../../../../../../definitions/pn/aar/MandateCreationResponse";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";
import { AARFlowState, AARFlowStateName } from "../../utils/stateUtils";

export type EphemeralAarMessageDataActionPayload = {
  fiscalCode: string;
  iun: NonEmptyString;
  mandateId?: string;
  markdown: MessageBodyMarkdown;
  pnServiceID: NonEmptyString;
  subject: MessageSubject;
  thirdPartyMessage: ThirdPartyMessage;
};
export type InitiateAarFlowPayload = {
  aarUrl: string;
};
export type TerminateAarFlowPayload = {
  currentFlowState?: AARFlowStateName;
  messageId?: string;
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
)<string, MandateCreationResponse, string>();
export const testAarAcceptMandate = createAsyncAction(
  "TEST_AAR_ACCEPT_MANDATE_REQUEST",
  "TEST_AAR_ACCEPT_MANDATE_SUCCESS",
  "TEST_AAR_ACCEPT_MANDATE_FAILURE"
)<InternalAuthAndMrtdResponse, void, string>();
export const testAarClearData = createStandardAction(
  "TEST_AAR_CLEAR_DATA"
)<void>();

export type AARFlowStateActions = ActionType<
  | typeof initiateAarFlow
  | typeof populateStoresWithEphemeralAarMessageData
  | typeof setAarFlowState
  | typeof terminateAarFlow
  | typeof testAarAcceptMandate
  | typeof testAarClearData
  | typeof testAarCreateMandate
>;
