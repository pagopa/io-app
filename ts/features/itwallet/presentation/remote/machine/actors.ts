import { Credential } from "@pagopa/io-react-native-wallet";
import { fromPromise } from "xstate";
import * as O from "fp-ts/lib/Option";
import { Trust } from "@pagopa/io-react-native-wallet-v2";
import {
  DcqlQuery,
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  RelyingPartyConfiguration
} from "../utils/itwRemoteTypeUtils";
import { RequestObject } from "../../../common/utils/itwTypesUtils";
import { useIOStore } from "../../../../../store/hooks";
import {
  itwCredentialsSelector,
  itwCredentialsEidSelector
} from "../../../credentials/store/selectors";
import {
  enrichPresentationDetails,
  getInvalidCredentials
} from "../utils/itwRemotePresentationUtils";
import { assert } from "../../../../../utils/assert";
import { Env } from "../../../common/utils/environment.ts";
import { InvalidCredentialsStatusError } from "./failure";

export type EvaluateRelyingPartyTrustInput = Partial<{
  qrCodePayload: ItwRemoteRequestPayload;
}>;
export type EvaluateRelyingPartyTrustOutput = {
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
};
export type GetRequestObjectInput = Partial<{
  qrCodePayload: ItwRemoteRequestPayload;
}>;
export type GetRequestObjectOutput = string;
export type GetPresentationDetailsInput = Partial<{
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
  qrCodePayload: ItwRemoteRequestPayload;
  requestObjectEncodedJwt: string;
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
  env: Env,
  store: ReturnType<typeof useIOStore>
) => {
  const evaluateRelyingPartyTrust = fromPromise<
    EvaluateRelyingPartyTrustOutput,
    EvaluateRelyingPartyTrustInput
  >(async ({ input }) => {
    const { qrCodePayload } = input;
    assert(qrCodePayload?.client_id, "Missing required client ID");

    const trustAnchorEntityConfig =
      await Trust.Build.getTrustAnchorEntityConfiguration(
        env.WALLET_TA_BASE_URL
      );

    const trustAnchorKey = trustAnchorEntityConfig.payload.jwks.keys[0];

    // Ensure that the trust anchor key is suitable for building the trust chain
    assert(trustAnchorKey, "No suitable key found in Trust Anchor JWKS.");

    // Create the trust chain for the Relying Party
    const builtChainJwts = await Trust.Build.buildTrustChain(
      qrCodePayload.client_id,
      trustAnchorKey
    );

    // Perform full validation on the built chainW
    await Trust.Verify.verifyTrustChain(
      trustAnchorEntityConfig,
      builtChainJwts,
      {
        connectTimeout: 10000,
        readTimeout: 10000,
        requireCrl: true
      }
    );

    // Determine the Relying Party configuration and subject
    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(
        qrCodePayload.client_id
      );

    return { rpConf, rpSubject: subject };
  });

  // The retrieval of the Request Object is managed by a dedicated actor to enable access
  // to the `response_uri` parameter in the event of a validation failure during its processing.
  const getRequestObject = fromPromise<
    GetRequestObjectOutput,
    GetRequestObjectInput
  >(async ({ input }) => {
    const { qrCodePayload } = input;
    assert(qrCodePayload, "Missing required qrCodePayload");
    const { request_uri } = qrCodePayload;

    const { requestObjectEncodedJwt } =
      await Credential.Presentation.getRequestObject(request_uri);

    return requestObjectEncodedJwt;
  });

  const getPresentationDetails = fromPromise<
    GetPresentationDetailsOutput,
    GetPresentationDetailsInput
  >(async ({ input }) => {
    const { rpConf, rpSubject, qrCodePayload, requestObjectEncodedJwt } = input;
    assert(
      rpConf && rpSubject && qrCodePayload && requestObjectEncodedJwt,
      "Missing required getPresentationDetails actor params"
    );

    const { client_id, state } = qrCodePayload;

    const { requestObject } = await Credential.Presentation.verifyRequestObject(
      requestObjectEncodedJwt,
      {
        rpConf,
        clientId: client_id,
        rpSubject,
        state
      }
    );

    assert(requestObject.dcql_query, "Missing required DCQL query");

    const eid = itwCredentialsEidSelector(store.getState());
    const credentials = itwCredentialsSelector(store.getState());

    assert(O.isSome(eid), "Missing PID");

    // Prepare credentials to evaluate the Relying Party request
    // TODO: add the Wallet Attestation in SD-JWT format
    const credentialsSdJwt: Array<[string, string]> = [
      [eid.value.keyTag, eid.value.credential],
      ...Object.values(credentials).map(
        c => [c.keyTag, c.credential] as [string, string]
      )
    ];

    // Evaluate the DCQL query against the credentials contained in the Wallet
    const result = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    const credentialsByType = Object.fromEntries(
      Object.values(credentials)
        .concat(eid.value)
        .map(c => [c.credentialType, c])
    );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(
      result.map(c => credentialsByType[c.vct])
    );

    if (invalidCredentials.length > 0) {
      throw new InvalidCredentialsStatusError(invalidCredentials);
    }

    // Add localization to the requested claims
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
    getRequestObject,
    getPresentationDetails,
    sendAuthorizationResponse
  };
};
