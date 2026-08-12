import { Router } from "express";
import { v4 } from "uuid";

import { addHandler } from "../../../payloads/response";
import { serverUrl } from "../../../utils/server";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { baseProviderPath } from "../services/providerService";
import {
  baseRelyingPartyPath,
  commonRedirectionValidation,
  generateUserProfileHTML,
  relyingPartiesConfig
} from "../services/relyingPartyService";
import { RelyingParty, RelyingPartyRequest } from "../types/relyingParty";

export const fimsRelyingPartyRouter = Router();

const relyingParties = new Map<string, RelyingParty>();
const relyingPartyRequests = new Map<
  string,
  Map<string, RelyingPartyRequest>
>();

export const getRelyingParty = (id: string) => relyingParties.get(id);

addHandler(
  fimsRelyingPartyRouter,
  "get",
  `${baseRelyingPartyPath()}/:id/landingPage`,
  (req, res) => {
    const relyingPartyId = req.params.id;
    const relyingParty = findOrLazyLoadRelyingParty(relyingPartyId);
    if (!relyingParty) {
      res.status(404).send({
        message: `Relying Party with id (${relyingPartyId}) not found`
      });
      return;
    }

    const scopes = relyingParty.scopes.join(" ");
    const state = v4();
    const relyingPartyRequest: RelyingPartyRequest = {
      relyingPartyId,
      nonce: v4(),
      state
    };
    if (!relyingPartyRequests.has(relyingPartyId)) {
      relyingPartyRequests.set(
        relyingPartyId,
        new Map<string, RelyingPartyRequest>()
      );
    }
    const relyingPartyRequestMap = relyingPartyRequests.get(relyingPartyId);
    relyingPartyRequestMap?.set(relyingPartyRequest.state, relyingPartyRequest);
    const fimsProviderRedirectUri = `${serverUrl}${baseProviderPath()}/oauth/authorize?client_id=${
      relyingParty.id
    }&scope=${scopes}&response_type=${relyingParty.responseType}&redirect_uri=${
      relyingParty.redirectUris[0]
    }&response_mode=${relyingParty.responseMode}&nonce=${
      relyingPartyRequest.nonce
    }&state=${relyingPartyRequest.state}`;
    const encodedFimsProviderRedirectUri = encodeURI(fimsProviderRedirectUri);
    res.redirect(303, encodedFimsProviderRedirectUri);
  },
  () => Math.random() * 2500
);

addHandler(
  fimsRelyingPartyRouter,
  "get",
  `${baseRelyingPartyPath()}/:id/redirectUri`,
  (req, res) => {
    const relyingPartyId = req.params.id;

    const requestHeaders = req.headers;
    const lollipopMethod = requestHeaders[
      "x-pagopa-lollipop-original-method"
    ] as string;
    if (!lollipopMethod || lollipopMethod.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-method'`
      });
      return;
    }
    const lollipopOriginalUrl = requestHeaders[
      "x-pagopa-lollipop-original-url"
    ] as string;
    if (!lollipopOriginalUrl || lollipopOriginalUrl.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-url'`
      });
      return;
    }
    const lollipopAuthorizationCode = requestHeaders[
      "x-pagopa-lollipop-custom-authorization_code"
    ] as string;
    if (
      !lollipopAuthorizationCode ||
      lollipopAuthorizationCode.trim().length === 0
    ) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-custom-authorization_code'`
      });
      return;
    }

    const state = req.query.state as string;
    if (!state) {
      res.status(400).send({ message: `Missing parameter 'state' in request` });
      return;
    }

    const nonce = req.query.nonce as string;
    if (!nonce) {
      res.status(400).send({ message: `Missing parameter 'nonce' in request` });
      return;
    }

    const fakeIdToken = req.query.authorization_code as string;
    if (!fakeIdToken) {
      res
        .status(400)
        .send({ message: `Missing parameter 'authorization_code' in request` });
      return;
    }

    commonRedirectionValidation(
      fakeIdToken,
      relyingPartyId,
      state,
      relyingPartyRequests,
      req,
      res
    );
  },
  () => Math.random() * 2500
);

addHandler(
  fimsRelyingPartyRouter,
  "post",
  `${baseRelyingPartyPath()}/:id/redirectUri`,
  (req, res) => {
    const contentType = req.headers["content-type"];
    if (
      !contentType ||
      !contentType.toLowerCase().includes("application/x-www-form-urlencoded")
    ) {
      res.status(400).send({
        message: `Content-type (${contentType}) is not supported`
      });
      return;
    }

    const relyingPartyId = req.params.id;

    const requestHeaders = req.headers;
    const lollipopMethod = requestHeaders[
      "x-pagopa-lollipop-original-method"
    ] as string;
    if (!lollipopMethod || lollipopMethod.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-method'`
      });
      return;
    }
    const lollipopOriginalUrl = requestHeaders[
      "x-pagopa-lollipop-original-url"
    ] as string;
    if (!lollipopOriginalUrl || lollipopOriginalUrl.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-original-url'`
      });
      return;
    }
    const lollipopIdToken = requestHeaders[
      "x-pagopa-lollipop-custom-id_token"
    ] as string;
    if (!lollipopIdToken || lollipopIdToken.trim().length === 0) {
      res.status(400).send({
        message: `Missing or empty lollipop header 'x-pagopa-lollipop-custom-id_token'`
      });
      return;
    }

    const state = req.body.state as string;
    if (!state) {
      res
        .status(400)
        .send({ message: `Missing parameter 'state' in request body` });
      return;
    }

    const fakeIdToken = req.body.id_token as string;
    if (!fakeIdToken) {
      res.status(400).send({
        message: `Missing parameter 'authorization_code' in request body`
      });
      return;
    }

    commonRedirectionValidation(
      fakeIdToken,
      relyingPartyId,
      state,
      relyingPartyRequests,
      req,
      res
    );
  },
  () => Math.random() * 2500
);

addHandler(
  fimsRelyingPartyRouter,
  "get",
  `${baseRelyingPartyPath()}/authenticatedPage`,
  (req, res) => {
    const query = req.query;
    const userProfileHTML = generateUserProfileHTML(query);
    res.status(200).send(userProfileHTML);
  }
);

const findOrLazyLoadRelyingParty = (id: string) => {
  const inMemoryRelyingParty = relyingParties.get(id);
  if (inMemoryRelyingParty) {
    return inMemoryRelyingParty;
  }

  const config = relyingPartiesConfig();
  config.forEach(relyingPartyConfig => {
    const serviceId = relyingPartyConfig.serviceId ?? randomServiceId();
    relyingParties.set(relyingPartyConfig.id, {
      displayName: relyingPartyConfig.registrationName,
      id: relyingPartyConfig.id,
      isInternal: relyingPartyConfig.isInternal,
      redirectUris: relyingPartyConfig.redirectUri,
      responseMode: "form_post",
      responseType: "id_token",
      scopes: relyingPartyConfig.scopes,
      serviceId
    });
  });

  return relyingParties.get(id);
};

const randomServiceId = () => {
  const allServices = ServicesDB.getAllServices();
  if (allServices.length > 0) {
    const firstNationalService = allServices[0];
    return firstNationalService.id;
  }
  throw new Error(
    "RelyingPartyRouter.randomServiceId: empty service collection. It must have some values at this point"
  );
};
