import { ErrorResponse } from "@io-app/api-types/generated/definitions/pn/lollipop-lambda/ErrorResponse";
import { SuccessResponse } from "@io-app/api-types/generated/definitions/pn/lollipop-lambda/SuccessResponse";
import { ActionType, createAsyncAction } from "typesafe-actions";

type SENDLollipopLambdaActionFailure = {
  reason: string;
  type: "failure" | "invalidInput";
};
type SENDLollipopLambdaActionRequest = {
  body: string;
  httpVerb: "Get" | "Post";
};
type SENDLollipopLambdaActionSuccess = {
  responseBody: ErrorResponse | SuccessResponse | undefined;
  statusCode: number;
};

export const sendLollipopLambdaAction = createAsyncAction(
  "SEND_LOLLIPOP_LAMBDA_REQUEST",
  "SEND_LOLLIPOP_LAMBDA_SUCCESS",
  "SEND_LOLLIPOP_LAMBDA_FAILURE",
  "SEND_LOLLIPOP_LAMBDA_CANCEL"
)<
  SENDLollipopLambdaActionRequest,
  SENDLollipopLambdaActionSuccess,
  SENDLollipopLambdaActionFailure,
  void
>();

export type SENDLollipopLambdaActions = ActionType<
  typeof sendLollipopLambdaAction
>;
