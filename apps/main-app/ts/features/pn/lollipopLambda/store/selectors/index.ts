import { GlobalState } from "../../../../../store/reducers/types";
import { unknownToReason } from "../../../../messages/utils";

export const isSendLollipopLambdaLoading = (state: GlobalState): boolean =>
  state.features.pn.lollipopLambda.type === "loading";

export const sendLollipopLambdaErrorReason = (
  state: GlobalState
): string | undefined => {
  const lollipopLambdaState = state.features.pn.lollipopLambda;
  if (
    lollipopLambdaState.type === "failure" ||
    lollipopLambdaState.type === "invalidInput"
  ) {
    return lollipopLambdaState.reason;
  }
  return undefined;
};

export const sendLollipopLambdaResponseStatusCode = (
  state: GlobalState
): number | undefined =>
  state.features.pn.lollipopLambda.type === "responseReceived"
    ? state.features.pn.lollipopLambda.statusCode
    : undefined;

export const sendLollipopLambdaResponseBodyString = (
  state: GlobalState
): string | undefined => {
  if (state.features.pn.lollipopLambda.type === "responseReceived") {
    try {
      return JSON.stringify(state.features.pn.lollipopLambda.responseBody);
    } catch (e) {
      return unknownToReason(e);
    }
  }
  return undefined;
};
