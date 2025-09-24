import { ActionType, createStandardAction } from "typesafe-actions";
import { AARFlowState } from "../../utils/stateUtils";
import { ServiceDetails } from "../../../../../../definitions/services/ServiceDetails";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/aar/ThirdPartyMessage";

type EphemeralAarMessageData = {
  serviceData: ServiceDetails;
  messageData: ThirdPartyMessage;
  mandateId: string | undefined;
};

export const setAarFlowState =
  createStandardAction("SET_AAR_FLOW_STATE")<AARFlowState>();

export const terminateAarFlow = createStandardAction("TERMINATE_AAR_FLOW")();

export const populateStoresWithEphemeralAarMessageData = createStandardAction(
  "POPULATE_STORES_WITH_EPHEMERAL_AAR_MESSAGE_DATA"
)<EphemeralAarMessageData>();

export type AARFlowStateActions = ActionType<
  | typeof setAarFlowState
  | typeof terminateAarFlow
  | typeof populateStoresWithEphemeralAarMessageData
>;
