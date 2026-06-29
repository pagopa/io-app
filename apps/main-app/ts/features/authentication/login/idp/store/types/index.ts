import * as pot from "@pagopa/ts-commons/lib/pot";

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

export type StandardLoginRequestInfo = {
  requestState: pot.Pot<true, ErrorType>;
};
