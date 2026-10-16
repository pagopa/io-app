import { ErrorResponse } from "@io-app/api-types/generated/definitions/pn/lollipop-lambda/ErrorResponse";
import { SuccessResponse } from "@io-app/api-types/generated/definitions/pn/lollipop-lambda/SuccessResponse";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Either, isLeft, left } from "fp-ts/lib/Either";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { SendConfig } from "../types/sendConfig";

export const lollipopLambdaResponseFromBodyAndConfig = (
  requestVerb: "GET" | "POST",
  requestBody: unknown,
  sendConfig: SendConfig
): Either<ExpressFailure, SuccessResponse> => {
  const timestamp = new Date();
  const statusCode = sendConfig.lollipopLambdaResponseCode ?? 200;
  if (statusCode === 401) {
    return left({
      httpStatusCode: 401,
      reason: {}
    });
  } else if (statusCode === 400 || statusCode === 403 || statusCode === 500) {
    const errorResponseEither = ErrorResponse.decode({
      success: false,
      timestamp,
      error: {
        message: `Server was configured to send a ${statusCode} status code`,
        statusCode
      }
    });
    if (isLeft(errorResponseEither)) {
      return left({
        httpStatusCode: 500,
        reason: getProblemJson(
          500,
          "Conversion to ErrorResponse failed",
          `Unable to convert input data to the ErrorResponse data structure (${readableReportSimplified(
            errorResponseEither.left
          )})`
        )
      });
    }
    return left({
      httpStatusCode: statusCode,
      reason: errorResponseEither.right
    });
  }
  const bodyStringOrUndefined = unknownBodyToStringOrUndefined(requestBody);
  const bodyLengthOrUndefined = stringOrUndefinedToByteLengthOrUndefined(
    bodyStringOrUndefined
  );
  const successResponseEither = SuccessResponse.decode({
    success: true,
    timestamp,
    data: {
      message: "Server was configured to send a 200 status code",
      timestamp,
      request: {
        method: requestVerb,
        path: "lollipop-test",
        hasBody: !!bodyLengthOrUndefined,
        bodyLength: bodyLengthOrUndefined ?? 0
      }
    }
  });
  if (isLeft(successResponseEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Conversion to SuccessResponse failed",
        `Unable to convert input data to the SuccessResponse data structure (${readableReportSimplified(
          successResponseEither.left
        )})`
      )
    });
  }
  return successResponseEither;
};

const stringOrUndefinedToByteLengthOrUndefined = (
  input: string | undefined
): number | undefined => (input ? Buffer.byteLength(input, "utf8") : undefined);

const unknownBodyToStringOrUndefined = (body: unknown): string | undefined => {
  if (typeof body === "string") {
    return body;
  } else if (typeof body === "object") {
    try {
      return JSON.stringify(body);
    } catch {
      return undefined;
    }
  } else if (
    typeof body === "number" ||
    (typeof BigInt !== "undefined" && typeof body === "bigint") ||
    typeof body === "boolean" ||
    typeof body === "symbol"
  ) {
    return String(body);
  }
  return undefined;
};
