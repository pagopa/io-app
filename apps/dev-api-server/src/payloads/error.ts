import { ProblemJson } from "@pagopa/ts-commons/lib/responses";

export const getProblemJson = (
  status: number,
  title?: string,
  detail?: string,
  type?: string,
  instance?: string
): ProblemJson => ({
  type,
  title,
  instance,
  detail,
  status: status as ProblemJson["status"]
});
