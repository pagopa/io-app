import { Credential } from "@pagopa/io-react-native-wallet";
import { fromPromise } from "xstate";
import * as O from "fp-ts/lib/Option";
import {
  ItwRemoteRequestPayload,
  EnrichedPresentationDetails,
  RelyingPartyConfiguration
} from "../utils/itwRemoteTypeUtils";
import { RequestObject } from "../../../common/utils/itwTypesUtils";
import { useIOStore } from "../../../../../store/hooks";
import { itwCredentialsSelector } from "../../../credentials/store/selectors";
import { enrichPresentationDetails } from "../utils/itwRemotePresentationUtils";
import { assert } from "../../../../../utils/assert";

export type EvaluateRelyingPartyTrustInput = Partial<{
  qrCodePayload: ItwRemoteRequestPayload;
}>;
export type EvaluateRelyingPartyTrustOutput = {
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
};

export type GetPresentationDetailsInput = Partial<{
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
  qrCodePayload: ItwRemoteRequestPayload;
}>;
export type GetPresentationDetailsOutput = {
  requestObject: RequestObject;
  presentationDetails: EnrichedPresentationDetails;
};

export type SendAuthorizationResponseInput = {
  optionalCredentials: Set<string>;
  requestObject?: RequestObject;
  presentationDetails?: EnrichedPresentationDetails;
  rpConf?: RelyingPartyConfiguration;
};
export type SendAuthorizationResponseOutput = {
  redirectUri?: string; // Optional in cross-device presentation
};

export const createRemoteActorsImplementation = (
  store: ReturnType<typeof useIOStore>
) => {
  const evaluateRelyingPartyTrust = fromPromise<
    EvaluateRelyingPartyTrustOutput,
    EvaluateRelyingPartyTrustInput
  >(async ({ input }) => {
    const { qrCodePayload } = input;
    assert(qrCodePayload?.client_id, "Missing required client ID");

    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(
        qrCodePayload.client_id
      );

    // TODO: add trust chain validation

    return { rpConf, rpSubject: subject };
  });

  const getPresentationDetails = fromPromise<
    GetPresentationDetailsOutput,
    GetPresentationDetailsInput
  >(async ({ input }) => {
    const { rpConf, rpSubject, qrCodePayload } = input;
    assert(
      rpConf && rpSubject && qrCodePayload,
      "Missing required getPresentationDetails actor params"
    );

    const { request_uri, client_id, state } = qrCodePayload;

    const { requestObjectEncodedJwt } =
      await Credential.Presentation.getRequestObject(request_uri);

    const { requestObject } = await Credential.Presentation.verifyRequestObject(
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId: client_id,
        rpSubject,
        state
      }
    );

    const { eid, credentials } = itwCredentialsSelector(store.getState());

    assert(requestObject.dcql_query, "Missing required DCQL query");
    assert(O.isSome(eid), "Missing PID");

    // Prepare credentials to evaluate the Relying Party request
    const credentialsSdJwt: Array<[string, string]> = [
      [eid.value.keyTag, eid.value.credential],
      ...credentials
        .filter(O.isSome)
        .map(c => [c.value.keyTag, c.value.credential] as [string, string])
    ];

    const result = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as any // TODO: fix type
    );

    const credentialsByType = Object.fromEntries(
      credentials
        .concat(eid)
        .filter(O.isSome)
        .map(c => [c.value.credentialType, c.value])
    );

    const presentationDetails = enrichPresentationDetails(
      result,
      credentialsByType
    );

    return { requestObject, presentationDetails };
  });

  const sendAuthorizationResponse = fromPromise<
    SendAuthorizationResponseOutput,
    SendAuthorizationResponseInput
  >(async ({ input }) => {
    const { rpConf, presentationDetails, requestObject, optionalCredentials } =
      input;

    assert(
      rpConf && presentationDetails && requestObject,
      "Missing required sendAuthorizationResponse actor params"
    );

    // Get required credentials and optional credentials that have been selected by the user
    const credentialsToPresent = presentationDetails
      .filter(
        c =>
          c.purposes.some(({ required }) => required) ||
          optionalCredentials.has(c.id)
      )
      .map(({ requiredDisclosures, ...rest }) => ({
        ...rest,
        requestedClaims: requiredDisclosures.map(([, claimName]) => claimName)
      }));

    const remotePresentations =
      await Credential.Presentation.prepareRemotePresentations(
        credentialsToPresent,
        requestObject.nonce,
        requestObject.client_id
      );

    const authResponse =
      await Credential.Presentation.sendAuthorizationResponse(
        requestObject,
        remotePresentations,
        rpConf
      );

    return {
      redirectUri: authResponse.redirect_uri
    };
  });

  return {
    evaluateRelyingPartyTrust,
    getPresentationDetails,
    sendAuthorizationResponse
  };
};
