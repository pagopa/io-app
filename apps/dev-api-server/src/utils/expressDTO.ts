import { ProblemJson } from "@pagopa/ts-commons/lib/responses";

export type ExpressFailure = {
  httpStatusCode: number;
  reason: object | ProblemJson;
};
