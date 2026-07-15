import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../messages/store/reducers/thirdPartyById";
import { toSENDMessage } from "../../../store/types/transformers";
import {
  AarFlowState,
  maybeIunFromAarFlowState,
  sendAarFlowStates
} from "../../utils/stateUtils";

export const thirdPartySenderDenominationSelector = (
  state: GlobalState,
  ioMessageId: string
) => {
  const thirdPartyMessagePot = thirdPartyFromIdSelector(state, ioMessageId);
  const thirdPartyMessage = pot.getOrElse(thirdPartyMessagePot, undefined);
  if (thirdPartyMessage == null) {
    return undefined;
  }
  const sendMessage = toSENDMessage(thirdPartyMessage);
  return sendMessage?.senderDenomination;
};

export const aarAdresseeDenominationSelector = (state: GlobalState) => {
  const currentState = currentAarFlowData(state);

  switch (currentState.type) {
    case sendAarFlowStates.displayingAarToS:
    case sendAarFlowStates.fetchingQRData:
    case sendAarFlowStates.ko:
    case sendAarFlowStates.none:
      return undefined;
    default:
      return currentState.recipientInfo.denomination;
  }
};
export const currentAarFlowIunSelector = (
  state: GlobalState
): string | undefined => {
  const currentState = currentAarFlowData(state);
  return maybeIunFromAarFlowState(currentState);
};

export const currentAarFlowData = (state: GlobalState) =>
  state.features.pn.aarFlow;
export const currentAarFlowStateType = (state: GlobalState) =>
  state.features.pn.aarFlow.type;

export const currentAarFlowStateAssistanceErrorCode = (
  state: GlobalState
): string | undefined => {
  const aarFlow = state.features.pn.aarFlow;

  if (aarFlow.type !== sendAarFlowStates.ko) {
    return undefined;
  }

  const error = aarFlow.error;

  if (error?.traceId && error.traceId.trim().length > 0) {
    return error.traceId;
  }

  const assistanceErrorCode = error?.errors
    ?.filter(({ code }) => code.trim().length > 0)
    ?.map(e => e.code);

  if (assistanceErrorCode && assistanceErrorCode.length > 0) {
    return assistanceErrorCode.join(", ");
  }

  return undefined;
};

const emptyInstance = {};
export const currentAarFlowStateErrorDebugInfoSelector = createSelector(
  (state: GlobalState) => state.features.pn.aarFlow,
  (aarFlow: AarFlowState) => {
    if (aarFlow.type === sendAarFlowStates.ko) {
      const errorCodes = aarFlow.error?.errors
        ?.map(error => `${error.code} ${error.detail ?? ""}`)
        .join(", ");
      return {
        errorCodes,
        phase: aarFlow.debugData.phase,
        reason: aarFlow.debugData.reason,
        traceId: aarFlow.error?.traceId
      };
    }
    return emptyInstance;
  }
);
