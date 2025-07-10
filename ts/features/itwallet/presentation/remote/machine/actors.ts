import { Credential } from "@pagopa/io-react-native-wallet";
import { fromPromise } from "xstate";
import * as O from "fp-ts/lib/Option";
import {
  ItwRemoteRequestPayload,
  EnrichedPresentationDetails,
  RelyingPartyConfiguration,
  DcqlQuery
} from "../utils/itwRemoteTypeUtils";
import {
  RequestObject,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";
import { Env } from "../../../common/utils/environment";
import { getAttestation } from "../../../common/utils/itwAttestationUtils";
import { useIOStore } from "../../../../../store/hooks";
import {
  enrichPresentationDetails,
  getInvalidCredentials
} from "../utils/itwRemotePresentationUtils";
import { assert } from "../../../../../utils/assert";
import { itwIntegrityKeyTagSelector } from "../../../issuance/store/selectors";
import { sessionTokenSelector } from "../../../../authentication/common/store/selectors";
import { itwRemotePresentationCredentialsSelector } from "../store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../walletInstance/store/selectors";
import { WIA_KEYTAG } from "../../../common/utils/itwCryptoContextUtils";
import { InvalidCredentialsStatusError } from "./failure";

const NEW_API_ENABLED = true; // TODO: [SIW-2530] Remove after transitioning to API 1.0

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

    const { rpConf, subject } =
      await Credential.Presentation.evaluateRelyingPartyTrust(
        qrCodePayload.client_id
      );

    // TODO: add trust chain validation

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

    const globalState = store.getState();
    const credentialsByVct =
      itwRemotePresentationCredentialsSelector(globalState);
    const walletAttestationSdJwt =
      itwWalletInstanceAttestationSelector(globalState)?.["dc+sd-jwt"];

    const credentialsSdJwt = [
      walletAttestationSdJwt && [WIA_KEYTAG, walletAttestationSdJwt],
      Object.values(credentialsByVct).map(c => [c.keyTag, c.credential])
    ].filter(Boolean) as Array<[string, string]>;

    // Evaluate the DCQL query against the credentials contained in the Wallet
    const result = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(
      result.map(c => credentialsByVct[c.vct])
    );

    if (invalidCredentials.length > 0) {
      throw new InvalidCredentialsStatusError(invalidCredentials);
    }

    // Add localization to the requested claims
    const presentationDetails = enrichPresentationDetails(
      result,
      credentialsByVct
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

  const getWalletAttestation = fromPromise<WalletInstanceAttestations>(() => {
    const sessionToken = sessionTokenSelector(store.getState());
    const integrityKeyTag = O.toUndefined(
      itwIntegrityKeyTagSelector(store.getState())
    );

    assert(sessionToken, "sessionToken is undefined");
    assert(integrityKeyTag, "integrityKeyTag is undefined");

    return getAttestation(env, integrityKeyTag, sessionToken, NEW_API_ENABLED);
  });

  return {
    evaluateRelyingPartyTrust,
    getRequestObject,
    getPresentationDetails,
    sendAuthorizationResponse,
    getWalletAttestation
  };
};
