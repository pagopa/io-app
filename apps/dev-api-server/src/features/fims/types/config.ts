import * as t from "io-ts";

import { FailureHttpResponseCode } from "../../../types/httpResponseCode";

const HistoryConfig = t.intersection([
  t.type({
    count: t.number,
    exportProcessingTimeMilliseconds: t.number,
    pageSize: t.number
  }),
  t.partial({
    consentsEndpointFailureStatusCode: FailureHttpResponseCode,
    exportEndpointFailureStatusCode: FailureHttpResponseCode
  })
]);

export const ProviderConfig = t.intersection([
  t.type({
    federationCookieName: t.string,
    idTokenRawPrivateKey: t.string,
    idTokenRawPublicKey: t.string,
    idTokenSigningAlgorithm: t.string,
    idTokenTTLMilliseconds: t.number,
    interactionCookieKey: t.string,
    interactionResumeCookieKey: t.string,
    interactionResumeSignatureCookieKey: t.string,
    interactionSignatureCookieKey: t.string,
    interactionTTLMilliseconds: t.number,
    implicitCodeFlow: t.boolean,
    sessionCookieKey: t.string,
    sessionLegacyCookieKey: t.string,
    sessionLegacySignatureCookieKey: t.string,
    sessionSignatureCookieKey: t.string,
    sessionTTLMilliseconds: t.number
  }),
  t.partial({
    ignoreFederationCookiePresence: t.boolean,
    ignoreFederationCookieValue: t.boolean,
    useLaxInsteadOfNoneForSameSiteOnSessionCookies: t.boolean
  })
]);

export const RelyingPartiesConfig = t.intersection([
  t.type({
    id: t.string,
    isInternal: t.boolean,
    registrationName: t.string,
    redirectUri: t.readonlyArray(t.string),
    scopes: t.readonlyArray(
      t.union([t.literal("openid"), t.literal("profile")])
    )
  }),
  t.partial({
    serviceId: t.string
  })
]);

export const FIMSConfig = t.intersection([
  t.type({
    history: HistoryConfig,
    provider: ProviderConfig,
    relyingParties: t.readonlyArray(RelyingPartiesConfig)
  }),
  t.partial({})
]);

export type FIMSConfig = t.TypeOf<typeof FIMSConfig>;
export type ProviderConfig = t.TypeOf<typeof ProviderConfig>;
export type RelyingPartiesConfig = t.TypeOf<typeof RelyingPartiesConfig>;
