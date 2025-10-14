import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { isAARRemoteEnabled } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { isAARLocalEnabled } from "../../../../../store/reducers/persistedPreferences";
import { GlobalState } from "../../../../../store/reducers/types";
import { thirdPartyFromIdSelector } from "../../../../messages/store/reducers/thirdPartyById";
import { toPNMessage } from "../../../store/types/transformers";
import { sendAARFlowStates } from "../../utils/stateUtils";

const emptyArray: ReadonlyArray<string> = []; // used as a stable reference to avoid useless re-renders
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
  ioMessageId: string
): boolean => {
  const currentState = currentAARFlowData(state);

  const isCorrectMessage =
    "iun" in currentState && currentState.iun === ioMessageId;
  const stateHasMandateId = "mandateId" in currentState;

  if (isCorrectMessage && stateHasMandateId) {
    return currentState.mandateId !== undefined;
  }
  return false;
};

export const currentAARFlowData = (state: GlobalState) =>
  state.features.pn.aarFlow;
export const currentAARFlowStateType = (state: GlobalState) =>
  state.features.pn.aarFlow.type;
export const currentAARFlowStateErrorCodes = (state: GlobalState) => {
  const aarFlow = state.features.pn.aarFlow;
  if (aarFlow.type === sendAARFlowStates.ko) {
    return aarFlow.error?.errors?.map(x => x.code) ?? emptyArray;
  } else {
    return emptyArray;
  }
};
