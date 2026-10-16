import { Either, left, right } from "fp-ts/lib/Either";
import { IncomingHttpHeaders } from "node:http";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";

export type LollipopHeaders = {
  signature: string;
  "signature-input": string;
  "x-pagopa-lollipop-assertion-ref": string;
  "x-pagopa-lollipop-assertion-type": string;
  "x-pagopa-lollipop-auth-jwt": string;
  "x-pagopa-lollipop-original-method":
    | "DELETE"
    | "GET"
    | "PATCH"
    | "POST"
    | "PUT";
  "x-pagopa-lollipop-original-url": string;
  "x-pagopa-lollipop-public-key": string;
  "x-pagopa-lollipop-user-id": string;
};

export const checkAndValidateLollipopHeaders = (
  headers: IncomingHttpHeaders
): Either<ExpressFailure, LollipopHeaders> => {
  const method = headers["x-pagopa-lollipop-original-method"];
  if (!isStringHeaderValue(method)) {
    return left(
      lollipopFailureResponse(
        `Missing of invalid type for 'x-pagopa-lollipop-original-method' header (${method})`
      )
    );
  }
  const upperCaseMethod = method.toUpperCase();
  if (
    upperCaseMethod !== "GET" &&
    upperCaseMethod !== "POST" &&
    upperCaseMethod !== "PUT" &&
    upperCaseMethod !== "PATCH" &&
    upperCaseMethod !== "DELETE"
  ) {
    return left(
      lollipopFailureResponse(
        `Unknown value for 'x-pagopa-lollipop-original-method' header (${method})`
      )
    );
  }

  const url = headers["x-pagopa-lollipop-original-url"];
  if (!isStringHeaderValue(url)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-original-url' header (${url})`
      )
    );
  }

  const signatureInput = headers["signature-input"];
  if (!isStringHeaderValue(signatureInput)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'signature-input' header (${signatureInput})`
      )
    );
  }

  const signature = headers.signature;
  if (!isStringHeaderValue(signature)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'signature' header (${signature})`
      )
    );
  }

  const assertionRef = headers["x-pagopa-lollipop-assertion-ref"];
  if (!isStringHeaderValue(assertionRef)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-assertion-ref' header (${assertionRef})`
      )
    );
  }

  const assertionType = headers["x-pagopa-lollipop-assertion-type"];
  if (!isStringHeaderValue(assertionType)) {
    return left(
      lollipopFailureResponse(
        `Missing of invalid type for 'x-pagopa-lollipop-assertion-type' header (${assertionType})`
      )
    );
  }
  const upperCaseAssertionType = assertionType.toUpperCase();
  if (upperCaseAssertionType !== "OIDC" && upperCaseAssertionType !== "SAML") {
    return left(
      lollipopFailureResponse(
        `Unknown value for 'x-pagopa-lollipop-assertion-type' header (${assertionType})`
      )
    );
  }

  if (!isStringHeaderValue(assertionType)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-assertion-type' header (${assertionType})`
      )
    );
  }

  const authJwt = headers["x-pagopa-lollipop-auth-jwt"];
  if (!isStringHeaderValue(authJwt)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-auth-jwt' header (${authJwt})`
      )
    );
  }

  const publicKey = headers["x-pagopa-lollipop-public-key"];
  if (!isStringHeaderValue(publicKey)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-public-key' header (${publicKey})`
      )
    );
  }

  const userId = headers["x-pagopa-lollipop-user-id"];
  if (!isStringHeaderValue(userId)) {
    return left(
      lollipopFailureResponse(
        `Missing value for 'x-pagopa-lollipop-user-id' header (${userId})`
      )
    );
  }

  return right({
    signature,
    "signature-input": signatureInput,
    "x-pagopa-lollipop-assertion-ref": assertionRef,
    "x-pagopa-lollipop-assertion-type": assertionType,
    "x-pagopa-lollipop-auth-jwt": authJwt,
    "x-pagopa-lollipop-original-method": upperCaseMethod,
    "x-pagopa-lollipop-original-url": url,
    "x-pagopa-lollipop-public-key": publicKey,
    "x-pagopa-lollipop-user-id": userId
  });
};

const isStringHeaderValue = (input: Array<string> | string | undefined) =>
  typeof input === "string";

const lollipopFailureResponse = (reason: string): ExpressFailure => ({
  httpStatusCode: 400,
  reason: getProblemJson(400, `Lollipop header failure`, reason)
});
