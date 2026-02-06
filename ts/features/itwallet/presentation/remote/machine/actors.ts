import {
  createCryptoContextFor,
  Credential,
  Trust
} from "@pagopa/io-react-native-wallet";
import * as O from "fp-ts/lib/Option";
import { fromPromise } from "xstate";
import { useIOStore } from "../../../../../store/hooks";
import { assert } from "../../../../../utils/assert";
import { sessionTokenSelector } from "../../../../authentication/common/store/selectors";
import { Env } from "../../../common/utils/environment";
import { getAttestation } from "../../../common/utils/itwAttestationUtils";
import { WIA_KEYTAG } from "../../../common/utils/itwCryptoContextUtils";
import { pollForStoreValue } from "../../../common/utils/itwStoreUtils";
import {
  CredentialFormat,
  CredentialMetadata,
  RequestObject,
  WalletInstanceAttestations
} from "../../../common/utils/itwTypesUtils";
import { CredentialsVault } from "../../../credentials/utils/vault";
import {
  itwIntegrityKeyTagSelector,
  itwIntegrityServiceStatusSelector
} from "../../../issuance/store/selectors";
import {
  enrichPresentationDetails,
  getInvalidCredentials
} from "../utils/itwRemotePresentationUtils";
import {
  DcqlQuery,
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  RelyingPartyConfiguration
} from "../utils/itwRemoteTypeUtils";
import { InvalidCredentialsStatusError } from "./failure";

type CredentialsSdJwt =
  Parameters<Credential.Presentation.EvaluateDcqlQuery>[0];

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

export type GetPresentationDetailsInput = {
  walletInstanceAttestation: WalletInstanceAttestations;
  credentials: Record<string, CredentialMetadata>;
  rpConf: RelyingPartyConfiguration;
  rpSubject: string;
  qrCodePayload: ItwRemoteRequestPayload;
  requestObjectEncodedJwt: string;
};

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

    // Create the trust chain for the Relying Party
    const builtChainJwts = await Trust.Build.buildTrustChain(
      qrCodePayload.client_id,
      trustAnchorEntityConfig
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
    const {
      rpConf,
      rpSubject,
      qrCodePayload,
      requestObjectEncodedJwt,
      credentials,
      walletInstanceAttestation
    } = input;

    const wiaSdJwt = walletInstanceAttestation[CredentialFormat.SD_JWT];
    assert(wiaSdJwt, "Missing Wallet Attestation in SD-JWT format");

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

    // Retrieve all credentials from the vault to prepare them for the DCQL evaluation.
    // The evaluation will require the full credential.
    const credentialsData = await Promise.all(
      Object.values(credentials).map(async c => {
        const credential = await CredentialsVault.get(c.credentialId);
        assert(
          credential,
          `Credential with id ${c.credentialId} not found in secure storage`
        );
        return {
          keyTag: c.keyTag,
          credential
        };
      })
    );

    // Prepare credentials to evaluate the Relying Party request
    const credentialsSdJwt = prepareCredentialsForDcqlEvaluation([
      ...credentialsData,
      { keyTag: WIA_KEYTAG, credential: wiaSdJwt }
    ]);

    // Evaluate the DCQL query against the credentials contained in the Wallet
    const result = Credential.Presentation.evaluateDcqlQuery(
      credentialsSdJwt,
      requestObject.dcql_query as DcqlQuery
    );

    // Check whether any of the requested credential is invalid
    const invalidCredentials = getInvalidCredentials(result, credentials);

    if (invalidCredentials.length > 0) {
      throw new InvalidCredentialsStatusError(invalidCredentials);
    }

    // Add localization to the requested claims
    const presentationDetails = enrichPresentationDetails(result, credentials);

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

  const getWalletAttestation = fromPromise<WalletInstanceAttestations>(
    async () => {
      // In the same-device flow the app might be launched directly to the presentation machine,
      // and the integrity service necessary to get the attestation might not yet be ready.
      const integrityServiceStatus = await pollForStoreValue({
        getState: store.getState,
        selector: itwIntegrityServiceStatusSelector,
        condition: value => value !== undefined
      }).catch(() => {
        throw new Error("Integrity service status check timed out");
      });
      assert(
        integrityServiceStatus === "ready",
        `Integrity service status is ${integrityServiceStatus}`
      );

      const sessionToken = sessionTokenSelector(store.getState());
      const integrityKeyTag = O.toUndefined(
        itwIntegrityKeyTagSelector(store.getState())
      );

      assert(sessionToken, "sessionToken is undefined");
      assert(integrityKeyTag, "integrityKeyTag is undefined");

      return getAttestation(env, integrityKeyTag, sessionToken);
    }
  );

  return {
    evaluateRelyingPartyTrust,
    getRequestObject,
    getPresentationDetails,
    sendAuthorizationResponse,
    getWalletAttestation
  };
};

const prepareCredentialsForDcqlEvaluation = (
  credentials: ReadonlyArray<{ keyTag: string; credential: string }>
): CredentialsSdJwt =>
  credentials.map(({ keyTag, credential }) => [
    createCryptoContextFor(keyTag),
    credential
  ]);
