import { verifySignatureHeader } from "@mattrglobal/http-signatures";
import { Request, Response } from "express-serve-static-core";
import * as E from "fp-ts/lib/Either";
import * as jose from "jose";

import { ioDevServerConfig } from "../config";
import { getProblemJson } from "../payloads/error";
import {
  getPublicKey,
  isAssertionRefStillValid
} from "../persistence/lollipop";
import { unknownToString } from "../utils/error";
import { signAlgorithmToVerifierMap } from "../utils/httpSignature";
import { serverUrl } from "../utils/server";

type LollipopHTTPStatusError = {
  code: number;
  problemJson: string;
};

const isLollipopConfigEnabled = () =>
  ioDevServerConfig.features.lollipop.enabled;

export const lollipopMiddleware =
  (nextMiddleware: (embeddedRequest: Request, _: Response) => void) =>
  async (request: Request, response: Response) => {
    const isLollipopEnabled = isLollipopConfigEnabled();
    if (isLollipopEnabled) {
      const verificationEither = await verifyLollipopSignatureHeader(
        request,
        response
      );
      if (E.isLeft(verificationEither)) {
        response
          .status(verificationEither.left.code)
          .send(verificationEither.left.problemJson);
        return;
      }
    }
    nextMiddleware(request, response);
  };

const verifyLollipopSignatureHeader = async (
  req: Request,
  _: Response
): Promise<E.Either<LollipopHTTPStatusError, true>> => {
  const isAssertionRefValid = isAssertionRefStillValid();
  if (!isAssertionRefValid) {
    return toFailureEither(403, "AssertionRef Invalid or Expired");
  }

  const signatureInput = req.headers["signature-input"];
  if (typeof signatureInput !== "string" || signatureInput.length <= 0) {
    return toFailureEither(400, "signature-input header is empty");
  }

  const publicKey = getPublicKey();
  if (!publicKey) {
    return toFailureEither(403, "Public key not found");
  }

  try {
    const verificationResult = await verifySignatureHeader(
      toVerifySignatureHeaderOptions(req, publicKey)
    ).unwrapOr({ verified: false });
    if (!verificationResult.verified) {
      return toFailureEither(
        400,
        "Invalid signature",
        JSON.stringify(verificationResult)
      );
    }

    return toSuccessEither();
  } catch (e) {
    const title =
      e instanceof Error ? e.message : "lollipop signature verification failed";
    const details =
      e instanceof Error ? JSON.stringify(e.stack) : unknownToString(e);
    return toFailureEither(500, title, details);
  }
};

const toVerifySignatureHeaderOptions = (req: Request, publicKey: jose.JWK) => {
  const headers = req.headers;
  return {
    verifier: {
      verify:
        req.body.message === "BROKEN"
          ? brokenVerifier(publicKey)
          : publicKey.kty === "EC"
            ? signAlgorithmToVerifierMap["ecdsa-p256-sha256"].verify(publicKey)
            : signAlgorithmToVerifierMap["rsa-pss-sha256"].verify(publicKey)
    },
    url: serverUrl,
    method: req.method,
    httpHeaders:
      req.body.message === "INVALID"
        ? { ...headers, "x-pagopa-lollipop-original-method": "xxx" }
        : headers,
    body: req.body,
    verifyExpiry: false
  };
};

const brokenVerifier = (_: jose.JWK) => {
  throw new Error("broken verifier");
};

const toSuccessEither = (): E.Either<LollipopHTTPStatusError, true> =>
  E.right(true);

const toFailureEither = (
  code: number,
  title?: string,
  detail?: string
): E.Either<LollipopHTTPStatusError, true> =>
  E.left({
    code,
    problemJson: getProblemJson(code, title, detail)
  } as LollipopHTTPStatusError);
