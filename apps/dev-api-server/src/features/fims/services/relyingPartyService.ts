import { Request, Response } from "express";
import { decodeToken, TokenVerifier } from "jsontokens";
import { ParsedQs } from "qs";

import { ioDevServerConfig } from "../../../config";
import { IoDevServerConfig } from "../../../types/config";
import { RelyingPartiesConfig } from "../types/config";
import { RelyingPartyRequest } from "../types/relyingParty";
import { providerConfig } from "./providerService";

export const relyingPartiesConfig = (
  config: IoDevServerConfig = ioDevServerConfig
): ReadonlyArray<RelyingPartiesConfig> => config.features.fims.relyingParties;

export const baseRelyingPartyPath = () => "/fims/relyingParty";

const tokenPayloadToUrl = (
  tokenPayload: Record<string, unknown>,
  baseUrl: string
) => {
  const fullName = tokenPayload.name as string;
  const name = tokenPayload.given_name as string;
  const surname = tokenPayload.family_name as string;
  const fiscalCode = tokenPayload.sub as string;
  const signatureHash = tokenPayload.s_hash as string;
  const audienceId = tokenPayload.aud as string;
  const issuer = tokenPayload.iss as string;
  const issuedOn = tokenPayload.iat as number;
  const expiresOn = tokenPayload.exp as number;

  const url = new URL(baseUrl);
  url.searchParams.set("fullname", fullName);
  url.searchParams.set("name", name);
  url.searchParams.set("surname", surname);
  url.searchParams.set("fiscalCode", fiscalCode);
  url.searchParams.set("signatureHash", signatureHash);
  url.searchParams.set("audienceId", audienceId);
  url.searchParams.set("issuer", issuer);
  url.searchParams.set("issuedOn", `${issuedOn}`);
  url.searchParams.set("expiresOn", `${expiresOn}`);

  return url.href;
};

export const generateUserProfileHTML = (query: ParsedQs) => {
  const fullName = query.fullname;
  const name = query.name;
  const surname = query.surname;
  const fiscalCode = query.fiscalCode;
  const signatureHash = query.signatureHash;
  const audienceId = query.audienceId;
  const issuer = query.issuer;
  const issuedOn = query.issuedOn;
  const expiresOn = query.expiresOn;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relying Party: authenticated</title>
</head>
<body>
  <div>
    <h1>Your data</h1>
    <ul>
      <li>Full name: ${fullName}</li>
      <li>Name: ${name}</li>
      <li>Surname: ${surname}</li>
      <li>Fiscal Code: ${fiscalCode}</li>
      <li>Signature Hash: ${signatureHash}</li>
      <li>Audience Id: ${audienceId}</li>
      <li>Issuer: ${issuer}</li>
      <li>Issued on: ${new Date(Number(issuedOn))}</li>
      <li>Expires on: ${new Date(Number(expiresOn))}</li>
    </ul>
  </div>
  <div>
    <a href="iossoapi://cancel">
      <button>Cancel</button>
    </a>
  </div>
</body>
</html>
`;
};

export const commonRedirectionValidation = (
  idToken: string,
  relyingPartyId: string,
  state: string,
  relyingPartyRequests: Map<string, Map<string, RelyingPartyRequest>>,
  req: Request,
  res: Response
) => {
  const relyingPartyCurrentRequests = relyingPartyRequests.get(relyingPartyId);
  if (!relyingPartyCurrentRequests) {
    res.status(400).send({
      message: `Relying Party with id (${relyingPartyId}) not found`
    });
    return;
  }

  const relyingPartyRequest = relyingPartyCurrentRequests.get(state);
  if (!relyingPartyRequest) {
    res.status(400).send({
      message: `No active request for state (${state}) on Relying Party with id (${relyingPartyId})`
    });
    return;
  }

  const config = providerConfig();
  const verified = new TokenVerifier(
    config.idTokenSigningAlgorithm,
    config.idTokenRawPublicKey
  ).verify(idToken);
  if (!verified) {
    res.status(400).send({ message: `Received ID token cannot be verified` });
    return;
  }

  try {
    const tokenData = decodeToken(idToken);
    const tokenPayload = tokenData.payload as Record<string, unknown>;
    const payloadNonce = tokenPayload.nonce as string;
    if (payloadNonce !== relyingPartyRequest.nonce) {
      res.status(400).send({
        message: `Bad nonce value (${payloadNonce}) for Relying Party with id (${relyingPartyId}) with state (${state})`
      });
      return;
    }

    relyingPartyCurrentRequests.delete(state);

    const authenticatedUrl = tokenPayloadToUrl(
      tokenPayload,
      `${req.protocol}://${
        req.headers.host
      }${baseRelyingPartyPath()}/authenticatedPage`
    );
    res.redirect(302, authenticatedUrl);
  } catch (e) {
    res.status(400).send({
      message: `Unable to decode token. Error is (${
        e instanceof Error ? e.message : "unknown error"
      })`
    });
  }
};
