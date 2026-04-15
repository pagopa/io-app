import { ActionType, createAsyncAction } from "typesafe-actions";
import { SuccessResponse } from "../../../../../../definitions/pn/lollipop-lambda/SuccessResponse";
import { ErrorResponse } from "../../../../../../definitions/pn/lollipop-lambda/ErrorResponse";

type SENDLollipopLambdaActionRequest = {
  httpVerb: "Get" | "Post";
  body: string;
};
type SENDLollipopLambdaActionSuccess = {
  statusCode: number;
  responseBody: SuccessResponse | ErrorResponse | undefined;
};
type SENDLollipopLambdaActionFailure = {
  reason: string;
  type: "invalidInput" | "failure";
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
