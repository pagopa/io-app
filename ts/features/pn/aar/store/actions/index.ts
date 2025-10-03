import { FiscalCode, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { ActionType, createStandardAction } from "typesafe-actions";
import { MessageBodyMarkdown } from "../../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../../definitions/backend/MessageSubject";
import { TaxId } from "../../../../../../definitions/pn/TaxId";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import { AARFlowState } from "../../utils/stateUtils";

export type EphemeralAarMessageDataActionPayload = {
  iun: NonEmptyString;
  thirdPartyMessage: ThirdPartyMessage;
  fiscalCode: TaxId | FiscalCode;
  pnServiceID: NonEmptyString;
  markDown: MessageBodyMarkdown;
  subject: MessageSubject;
  mandateId?: string;
};

export const setAarFlowState =
  createStandardAction("SET_AAR_FLOW_STATE")<AARFlowState>();

export const terminateAarFlow = createStandardAction("TERMINATE_AAR_FLOW")();

export const populateStoresWithEphemeralAarMessageData = createStandardAction(
  "POPULATE_STORES_WITH_EPHEMERAL_AAR_MESSAGE_DATA"
)<EphemeralAarMessageDataActionPayload>();

export type AARFlowStateActions = ActionType<
  | typeof setAarFlowState
  | typeof terminateAarFlow
  | typeof populateStoresWithEphemeralAarMessageData
>;
