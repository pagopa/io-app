import { getType } from "typesafe-actions";
import { Action } from "../../../../../store/actions/types";
import { ErrorResponse } from "../../../../../../definitions/pn/lollipop-lambda/ErrorResponse";
import { SuccessResponse } from "../../../../../../definitions/pn/lollipop-lambda/SuccessResponse";
import { sendLollipopLambdaAction } from "../actions";

type SENDLollipopLambdaIdle = {
  type: "idle";
};
type SENDLollipopLambdaLoading = {
  type: "loading";
  body: string;
  httpVerb: "Get" | "Post";
};
type SENDLollipopLambdaFailure = {
  type: "invalidInput" | "failure";
  reason: string;
};
type SENDLollipopLambdaResponseReceived = {
  type: "responseReceived";
  statusCode: number;
  responseBody: SuccessResponse | ErrorResponse | undefined;
};
export type SENDLollipopLambdaState =
  | SENDLollipopLambdaIdle
  | SENDLollipopLambdaLoading
  | SENDLollipopLambdaFailure
  | SENDLollipopLambdaResponseReceived;

export const INITIAL_LOLLIPOP_LAMBDA_STATE: SENDLollipopLambdaState = {
  type: "idle"
};

export const lollipopLambdaReducer = (
  state: SENDLollipopLambdaState = INITIAL_LOLLIPOP_LAMBDA_STATE,
  action: Action
): SENDLollipopLambdaState => {
  switch (action.type) {
    case getType(sendLollipopLambdaAction.cancel):
      return {
        type: "idle"
      };
    case getType(sendLollipopLambdaAction.failure):
      return {
        type: action.payload.type,
        reason: action.payload.reason
      };
    case getType(sendLollipopLambdaAction.request):
      return {
        type: "loading",
        body: action.payload.body,
        httpVerb: action.payload.httpVerb
      };
    case getType(sendLollipopLambdaAction.success):
      return {
        type: "responseReceived",
        responseBody: action.payload.responseBody,
        statusCode: action.payload.statusCode
      };
  }
  return state;
};
