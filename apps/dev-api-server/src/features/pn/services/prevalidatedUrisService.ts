import { Request } from "express";
import { Either, left, right } from "fp-ts/lib/Either";
import { ulid } from "ulid";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { PrevalidatedUrisRepository } from "../repositories/prevalidatedUrisRepository";

const separator = "/relativePath/";

export const generateUriForRelativePath = (relativePath: string) =>
  `${ulid()}${separator}${relativePath}`;

export const checkValidateAndGetRelativePath = (
  request: Request
): Either<ExpressFailure, string> => {
  const uri = request.params[0];
  if (uri == null || uri === "" || uri === "/") {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Invalid URI provided",
        `Provided URI is not valid (${uri})`
      )
    });
  }
  const prevalidatedUri = decodeURIComponent(uri);
  const expirationDateMaybe =
    PrevalidatedUrisRepository.getPrevalidatedUriExpirationDate(
      prevalidatedUri
    );
  if (expirationDateMaybe == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "URI not found",
        `The input URI does not exists (${prevalidatedUri})`
      )
    });
  }

  // Do this after having search for the url, in order to
  // return a different error if the url has expired
  PrevalidatedUrisRepository.deleteExpiredPrevalidatedUris();

  if (expirationDateMaybe <= new Date()) {
    return left({
      httpStatusCode: 401,
      reason: getProblemJson(
        401,
        "URI expired",
        `The input URI has expired (${prevalidatedUri}) ${expirationDateMaybe}`
      )
    });
  }

  const separatorIndex = prevalidatedUri.indexOf(separator);
  const relativePath = prevalidatedUri.slice(separatorIndex + separator.length);
  return right(relativePath);
};
