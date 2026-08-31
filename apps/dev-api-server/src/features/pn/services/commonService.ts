import { Request } from "express";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";
import { IncomingHttpHeaders } from "node:http";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { logWarning } from "../../../utils/logging";
import { SendConfig } from "../types/sendConfig";
import { checkAndValidateLollipopHeaders } from "./lollipopService";

export const checkAndValidateLollipopAndTaxId = (
  configuration: SendConfig,
  request: Request
): Either<ExpressFailure, string> => {
  const headers = request.headers;
  const taxIdEither = checkTaxIdHeader(headers);
  if (isLeft(taxIdEither)) {
    return taxIdEither;
  }

  const taxId = taxIdEither.right;
  if (configuration.skipLollipopVerification) {
    return right(taxId);
  }

  const lollipopHeadersEither = checkAndValidateLollipopHeaders(
    request.headers
  );
  if (isLeft(lollipopHeadersEither)) {
    return lollipopHeadersEither;
  }

  const lollipopUserId =
    lollipopHeadersEither.right["x-pagopa-lollipop-user-id"];
  const taxIdAndLollipopUserIdEither = compareTaxIdToLollipopUserId(
    lollipopUserId,
    taxId
  );
  if (isLeft(taxIdAndLollipopUserIdEither)) {
    return taxIdAndLollipopUserIdEither;
  }
  return right(taxId);
};

const checkTaxIdHeader = (
  headers: IncomingHttpHeaders
): Either<ExpressFailure, string> => {
  const taxIdHeader = headers["x-pagopa-cx-taxid"];
  if (
    taxIdHeader == null ||
    typeof taxIdHeader !== "string" ||
    taxIdHeader.trim().length === 0
  ) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Missing 'x-pagopa-cx-taxid' header",
        `Missing or bad value for header 'x-pagopa-cx-taxid' (${taxIdHeader})`
      )
    });
  }
  return right(taxIdHeader);
};

const compareTaxIdToLollipopUserId = (
  lollipopTaxId: string,
  taxId: string
): Either<ExpressFailure, true> => {
  if (taxId.toUpperCase() !== lollipopTaxId.toUpperCase()) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad value for 'x-pagopa-cx-taxid' header",
        `Value for header 'x-pagopa-cd-taxid' does not match value of header 'x-pagopa-lollipop-user-id' (${taxId} != ${lollipopTaxId})`
      )
    });
  }
  return right(true);
};

export const checkSourceHeaderNonBlocking = (
  headers: IncomingHttpHeaders
): void => {
  const sourceHeader = headers["x-pagopa-pn-io-src"];
  if (
    typeof sourceHeader !== "string" ||
    (sourceHeader.toUpperCase() !== "QR_CODE" &&
      sourceHeader.toUpperCase() !== "DEFAULT")
  ) {
    logWarning(
      `\n  Bad value for header 'x-pagopa-pn-io-src'. While this is just a warning and not a blocking error, make sure that your final API provide such header. Allowed values: DEFAULT | QR_CODE (${sourceHeader})\n`
    );
  }
};

export const mandateIdFromQuery = (req: Request): string | undefined => {
  const mandateId = req.query.mandateId;
  if (typeof mandateId === "string" && mandateId.trim().length > 0) {
    return mandateId;
  }
  return undefined;
};
