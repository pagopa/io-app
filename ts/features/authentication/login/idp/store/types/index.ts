import * as pot from "@pagopa/ts-commons/lib/pot";

export enum ErrorType {
  "LOADING_ERROR" = "LOADING_ERROR",
  "LOGIN_ERROR" = "LOGIN_ERROR"
}

export type NativeLoginRequestInfo =
  | RequestInfoError
  | RequestInfoPositiveStates;

export type RequestInfoError = {
  errorCodeOrMessage?: string;
  errorType: ErrorType;
  nativeAttempts: number;
  requestState: "ERROR";
};

export type RequestInfoPositiveStates = {
  nativeAttempts: number;
  requestState: "AUTHORIZED" | "AUTHORIZING" | "LOADING";
};

export type StandardLoginRequestInfo = {
  requestState: pot.Pot<true, ErrorType>;
};
