import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { isLeft } from "fp-ts/lib/Either";
import { GlobalState } from "../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../messages/store/reducers/thirdPartyById";
import { ThirdPartyMessage } from "../../../../../../definitions/pn/ThirdPartyMessage";
import {
  AARFlowState,
  maybeIunFromAarFlowState,
  sendAARFlowStates
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
  const sendThirdPartyMessageEither = ThirdPartyMessage.decode(
    thirdPartyMessage.third_party_message
  );
  if (isLeft(sendThirdPartyMessageEither)) {
    return undefined;
  }
  return sendThirdPartyMessageEither.right?.details?.senderDenomination;
};

export const aarAdresseeDenominationSelector = (
  state: GlobalState,
  iun: string
) => {
  const currentState = currentAARFlowData(state);

  switch (currentState.type) {
    case sendAARFlowStates.none:
    case sendAARFlowStates.ko:
    case sendAARFlowStates.displayingAARToS:
    case sendAARFlowStates.fetchingQRData:
      return undefined;
    default:
      if (iun === currentState.iun) {
        return currentState.recipientInfo.denomination;
      }
      return undefined;
  }
};
export const currentAarFlowIunSelector = (
  state: GlobalState
): string | undefined => {
  const currentState = currentAARFlowData(state);
  return maybeIunFromAarFlowState(currentState);
};

export const currentAARFlowData = (state: GlobalState) =>
  state.features.pn.aarFlow;
export const currentAARFlowStateType = (state: GlobalState) =>
  state.features.pn.aarFlow.type;

export const currentAARFlowStateAssistanceErrorCode = (
  state: GlobalState
): string | undefined => {
  const aarFlow = state.features.pn.aarFlow;

  if (aarFlow.type !== sendAARFlowStates.ko) {
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
export const currentAARFlowStateErrorDebugInfoSelector = createSelector(
  (state: GlobalState) => state.features.pn.aarFlow,
  (aarFlow: AARFlowState) => {
    if (aarFlow.type === sendAARFlowStates.ko) {
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
