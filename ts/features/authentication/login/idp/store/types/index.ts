import * as pot from "@pagopa/ts-commons/lib/pot";

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

export type RequestInfoPositiveStates = {
  requestState: "LOADING" | "AUTHORIZED" | "AUTHORIZING";
  nativeAttempts: number;
};

export type RequestInfoError = {
  requestState: "ERROR";
  errorType: ErrorType;
  errorCodeOrMessage?: string;
  nativeAttempts: number;
};

export type NativeLoginRequestInfo =
  | RequestInfoPositiveStates
  | RequestInfoError;

export type StandardLoginRequestInfo = {
  requestState: pot.Pot<true, ErrorType>;
};
