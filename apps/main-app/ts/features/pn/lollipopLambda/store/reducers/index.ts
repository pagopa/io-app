import { getType } from "typesafe-actions";

import { ErrorResponse } from "../../../../../../definitions/pn/lollipop-lambda/ErrorResponse";
import { SuccessResponse } from "../../../../../../definitions/pn/lollipop-lambda/SuccessResponse";
import { Action } from "../../../../../store/actions/types";
import { sendLollipopLambdaAction } from "../actions";

export type SENDLollipopLambdaState =
  | SENDLollipopLambdaFailure
  | SENDLollipopLambdaIdle
  | SENDLollipopLambdaLoading
  | SENDLollipopLambdaResponseReceived;
type SENDLollipopLambdaFailure = {
  reason: string;
  type: "failure" | "invalidInput";
};
type SENDLollipopLambdaIdle = {
  type: "idle";
};
type SENDLollipopLambdaLoading = {
  body: string;
  httpVerb: "Get" | "Post";
  type: "loading";
};
type SENDLollipopLambdaResponseReceived = {
  responseBody: ErrorResponse | SuccessResponse | undefined;
  statusCode: number;
  type: "responseReceived";
};

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
