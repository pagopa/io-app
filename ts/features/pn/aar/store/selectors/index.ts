import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { isAARRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isAARLocalEnabled } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../../../store/types/transformers";
import { sendAARFlowStates } from "../../utils/stateUtils";

export const thirdPartySenderDenominationSelector = (
  state: GlobalState,
  ioMessageId: string
) =>
  pipe(
    thirdPartyFromIdSelector(state, ioMessageId),
    pot.toOption,
    O.flatMap(toPNMessage),
    O.map(data => data.senderDenomination),
    O.toUndefined
  );
export const isAAREnabled = (state: GlobalState): boolean =>
  isAARLocalEnabled(state) && isAARRemoteEnabled(state);

export const isAarMessageDelegatedSelector = (
  state: GlobalState,
  iun: string
): boolean => {
  const currentState = currentAARFlowData(state);
  const isCorrectState =
    currentState.type === sendAARFlowStates.fetchingNotificationData ||
    currentState.type === sendAARFlowStates.displayingNotificationData;
  return (
    isCorrectState &&
    currentState.iun === iun &&
    currentState.mandateId !== undefined
  );
};
export const aarAdresseeDenominationSelector = (
  state: GlobalState,
  iun: string
) => {
  const currentState = currentAARFlowData(state);

  switch (currentState.type) {
    case sendAARFlowStates.fetchingNotificationData:
    case sendAARFlowStates.displayingNotificationData:
    case sendAARFlowStates.notAddresseeFinal:
      if (iun === currentState.iun) {
        return currentState.fullNameDestinatario;
      }
      return undefined;
    default:
      return undefined;
  }
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
