import { ProblemJson } from "@pagopa/ts-commons/lib/responses";

import { unknownToString } from "./error";

export const logExpressResponseWarning = (
  statusCode: number,
  problemJson: object | ProblemJson
) => {
  if (
    "status" in problemJson ||
    "title" in problemJson ||
    "detail" in problemJson
  ) {
    logWarning(
      `\n  Http Status Code: ${statusCode}\n  Http Body:\n    Status: ${problemJson.status}\n    Title: ${problemJson.title}\n    Details: ${problemJson.detail}\n`
    );
  } else {
    logWarning(
      `\n  Http Status Code: ${statusCode}\n  Http Body:\n    ${unknownToString(
        problemJson
      )}\n`
    );
  }
};

export const logWarning = (
  message: string // eslint-disable-next-line no-console
) => console.warn(`\x1b[1;38;5;202m${message}\x1b[0m`);
