import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  type CredentialIssuance,
  type ItwVersion
} from "@pagopa/io-react-native-wallet";
import { v4 as uuidv4 } from "uuid";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import { getRedirects } from "@pagopa/io-react-native-login-utils";
import last from "lodash/last";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialFormat,
  DcqlQuery,
  EvaluatedDcqlQueryResult,
  IssuerConfiguration,
  RequestObject
} from "./itwTypesUtils";
import { extractVerification } from "./itwCredentialUtils";
import { Env } from "./environment";
import { enrichErrorWithMetadata } from "./itwFailureUtils";
import { getIoWallet } from "./itwIoWallet";
import { getWalletUnitAttestation } from "./itwAttestationUtils";

/**
 * List of credentials that cannot be issued in parallel, only sequentially.
 * Currently only the mDL must be requested sequentially because of locking issues.
 */
const SEQUENTIAL_ISSUANCE_CREDENTIALS = ["mDL"];

type CompleteFormPostWithEvaluatedDcqlQuery = (
  requestObject: RequestObject,
  issuerConf: IssuerConfiguration,
  evaluatedDcqlQuery: EvaluatedDcqlQueryResult,
  context: { wiaCryptoContext: CryptoContext }
) => ReturnType<
  CredentialIssuance.IssuanceApi["completeUserAuthorizationWithFormPostJwtMode"]
>;

type CompleteEaaWithEvaluatedDcqlQuery = (
  requestObject: RequestObject,
  issuerConf: IssuerConfiguration,
  evaluatedDcqlQuery: EvaluatedDcqlQueryResult,
  redirectUri: string,
  context?: {
    fetchFinalRedirectUri?: (url: string) => Promise<string | undefined>;
  }
) => ReturnType<
  CredentialIssuance.IssuanceApi["completeEaaUserAuthorizationWithQueryMode"]
>;

export type RequestCredential = (args: {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  walletInstanceAttestation: string;
  skipMdocIssuance: boolean;
  pid: CredentialBundle;
}) => Promise<{
  clientId: string;
  codeVerifier: string;
  requestedCredential: RequestObject;
  issuerConf: IssuerConfiguration;
  evaluatedDcqlQuery: EvaluatedDcqlQueryResult;
  responseMode?: string;
}>;

/**
 * Requests a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param pid - The PID credential to evaluate the issuer DCQL query before showing the trust issuer screen
 * @returns The credential request object
 */
export const requestCredential: RequestCredential = async ({
  env,
  itwVersion,
  credentialType,
  walletInstanceAttestation,
  skipMdocIssuance,
  pid
}) => {
  const ioWallet = getIoWallet(itwVersion);

  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await ioWallet.CredentialIssuance.evaluateIssuerTrust(
    env.WALLET_EAA_PROVIDER_BASE_URL.value(itwVersion)
  );

  const credentialIds = getCredentialConfigurationIds(
    issuerConf,
    credentialType,
    skipMdocIssuance
  );

  // Start user authorization
  const { issuerRequestUri, clientId, codeVerifier, responseMode } =
    await ioWallet.CredentialIssuance.startUserAuthorization(
      issuerConf,
      credentialIds,
      { proofType: "none" },
      {
        walletInstanceAttestation,
        redirectUri: env.ISSUANCE_REDIRECT_URI,
        wiaCryptoContext
      }
    );

  const requestObject =
    await ioWallet.CredentialIssuance.getRequestedCredentialToBePresented(
      issuerRequestUri,
      clientId,
      issuerConf
    );

  const evaluatedDcqlQuery =
    await ioWallet.RemotePresentation.evaluateDcqlQuery(
      requestObject.dcql_query as DcqlQuery,
      [[pid.metadata.keyTag, pid.credential]]
    );
  return {
    clientId,
    codeVerifier,
    responseMode,
    requestedCredential: requestObject,
    issuerConf,
    evaluatedDcqlQuery
  };
};

export type CompleteAuthFlow = (args: {
  env: Env;
  itwVersion: ItwVersion;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  evaluatedDcqlQuery: EvaluatedDcqlQueryResult;
  codeVerifier: string;
  issuerConf: IssuerConfiguration;
  responseMode?: string;
}) => Promise<{ accessToken: CredentialAccessToken }>;

/**
 * Function to complete the authorization flow. It must be used to obtain the access token
 * for the requested credential(s).
 * This token is then used in {@link obtainCredential} to get the credential from the Issuer.
 * When no response mode is provided the flow expects the code in the query string;
 * the legacy `form_post.jwt` mode must be requested explicitly.
 * @returns The access token with the authorized credentials.
 */
export const completeAuthFlow: CompleteAuthFlow = async ({
  env,
  itwVersion,
  requestedCredential: requestObject,
  issuerConf,
  evaluatedDcqlQuery,
  codeVerifier,
  responseMode,
  walletInstanceAttestation
}) => {
  const ioWallet = getIoWallet(itwVersion);

  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Create PID and DPoP crypto context;
  await regenerateCryptoKey(DPOP_KEYTAG);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // Complete the user authorization and obtain the code to exchange for the access token.
  // Two modes are supported for backward compatibility with IT-Wallet 1.0.
  const getAuthorizationCode = async (): Promise<string> => {
    if (responseMode === "form_post.jwt") {
      const completeUserAuthorizationWithFormPostJwtMode = ioWallet
        .CredentialIssuance
        .completeUserAuthorizationWithFormPostJwtMode as unknown as CompleteFormPostWithEvaluatedDcqlQuery;

      return (
        await completeUserAuthorizationWithFormPostJwtMode(
          requestObject,
          issuerConf,
          evaluatedDcqlQuery,
          { wiaCryptoContext }
        )
      ).code;
    }
    const completeEaaUserAuthorizationWithQueryMode = ioWallet
      .CredentialIssuance
      .completeEaaUserAuthorizationWithQueryMode as unknown as CompleteEaaWithEvaluatedDcqlQuery;

    return (
      await completeEaaUserAuthorizationWithQueryMode(
        requestObject,
        issuerConf,
        evaluatedDcqlQuery,
        env.ISSUANCE_REDIRECT_URI, // The redirect uri must be a valid HTTP url that can be followed
        {
          // Workaround for a known bug affecting React Native 0.82-0.83 (https://github.com/facebook/react-native/issues/55248)
          // TODO: it can be removed after upgrading to RN 0.84+
          fetchFinalRedirectUri: url => getRedirects(url, {}, "code").then(last)
        }
      )
    ).code;
  };

  return await ioWallet.CredentialIssuance.authorizeAccess(
    issuerConf,
    await getAuthorizationCode(),
    env.ISSUANCE_REDIRECT_URI,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );
};

export type ObtainCredential = (args: {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  authorizedCredentials: ReadonlyArray<AuthorizedCredentialMetadata>;
  clientId: string;
  issuerConf: IssuerConfiguration;
  accessToken: CredentialAccessToken;
}) => Promise<ReadonlyArray<CredentialBundle>>;

/**
 * Obtains a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param credentialType - The type of credential to request
 * @param authorizedCredentials - The list of authorized credentials to obtain
 * @param clientId - The client ID
 * @param issuerConf - The issuer configuration
 * @param accessToken - The access token obtained from {@link completeAuthFlow}
 * @returns The obtained credential
 */
export const obtainCredential: ObtainCredential = async ({
  authorizedCredentials,
  env,
  itwVersion,
  credentialType,
  accessToken,
  clientId,
  issuerConf
}) => {
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  const commonParams: RequestAndParseCredentialParams = {
    accessToken,
    clientId,
    credentialType,
    env,
    dPopCryptoContext,
    issuerConf,
    itwVersion
  };

  if (SEQUENTIAL_ISSUANCE_CREDENTIALS.includes(credentialType)) {
    const credentials: Array<CredentialBundle> = [];
    for (const credentialParams of authorizedCredentials) {
      const credential = await requestAndParseCredential({
        ...commonParams,
        ...credentialParams
      });
      // eslint-disable-next-line functional/immutable-data
      credentials.push(credential);
    }
    return credentials;
  }

  return await Promise.all(
    authorizedCredentials.map(credentialParams =>
      requestAndParseCredential({ ...commonParams, ...credentialParams })
    )
  );
};

const getCredentialConfigurationIds = (
  issuerConfig: IssuerConfiguration,
  credentialType: string,
  skipMdocIssuance: boolean
) => {
  const { credential_configurations_supported } = issuerConfig;

  const supportedConfigurationsByScope = Object.entries(
    credential_configurations_supported
  )
    .filter(
      ([, config]) =>
        !skipMdocIssuance || config.format !== CredentialFormat.MDOC
    )
    .reduce<Record<string, Array<string>>>(
      (acc, [configId, config]) => ({
        ...acc,
        [config.scope]: [...(acc[config.scope] || []), configId]
      }),
      {}
    );

  return supportedConfigurationsByScope[credentialType] || [];
};

type RequestAndParseCredentialParams = {
  issuerConf: IssuerConfiguration;
  credentialType: string;
  accessToken: CredentialAccessToken;
  clientId: string;
  env: Env;
  itwVersion: ItwVersion;
  dPopCryptoContext: CryptoContext;
};

type RequestAndParseCredential = (
  args: RequestAndParseCredentialParams & AuthorizedCredentialMetadata
) => Promise<CredentialBundle>;

/**
 * Utility function that requests and parses an already authorized credential. For this reason,
 * the function requires the Issuer's access token with the authorization details. Key generation MUST
 * be handled outside the function by calling {@link generateKeysWithWalletUnitAttestation}.
 *
 * @returns The credential bundle with the newly obtained credential
 */
const requestAndParseCredential: RequestAndParseCredential = async ({
  issuerConf,
  credentialType,
  accessToken,
  authDetails,
  clientId,
  dPopCryptoContext,
  env,
  itwVersion,
  keyTag,
  walletUnitAttestationId,
  walletUnitAttestation
}) => {
  const ioWallet = getIoWallet(itwVersion);
  const { credential_configuration_id, credential_identifiers } = authDetails;
  const credentialCryptoContext = createCryptoContextFor(keyTag);

  // Obtain the credential
  const { credential, format } =
    await ioWallet.CredentialIssuance.obtainCredential(
      issuerConf,
      accessToken,
      clientId,
      {
        credential_configuration_id,
        credential_identifier: credential_identifiers[0]
      },
      {
        dPopCryptoContext,
        credentialCryptoContext,
        walletUnitAttestation
      }
    ).catch(
      enrichErrorWithMetadata({
        credentialId: credential_configuration_id
      })
    );
  // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
  // The ignoreMissingAttributes must be set to false for mDoc credentials since
  // there are some attributes that should not be presented during Proximity presentation.
  const { parsedCredential, issuedAt, expiration } =
    await ioWallet.CredentialIssuance.verifyAndParseCredential(
      issuerConf,
      credential,
      credential_configuration_id,
      {
        credentialCryptoContext,
        ignoreMissingAttributes: format === CredentialFormat.SD_JWT
      },
      env.X509_CERT_ROOT
    );

  return {
    credential,
    metadata: {
      parsedCredential,
      credentialType,
      credentialId: credential_configuration_id,
      format,
      issuerConf,
      keyTag,
      jwt: {
        expiration: expiration.toISOString(),
        issuedAt: issuedAt?.toISOString()
      },
      spec_version: ioWallet.version,
      verification: extractVerification({
        format,
        credential,
        parsedCredential
      }),
      walletUnitAttestationId
    }
  };
};

export type AuthorizedCredentialMetadata = {
  keyTag: string;
  authDetails: CredentialAccessToken["authorization_details"][number];
  walletUnitAttestation?: string;
  walletUnitAttestationId?: string;
};

type GenerateKeysWithWalletUnitAttestation = (
  accessToken: CredentialAccessToken,
  params: {
    env: Env;
    itwVersion: ItwVersion;
    hardwareKeyTag: string;
    sessionToken: string;
  }
) => Promise<ReadonlyArray<AuthorizedCredentialMetadata>>;

/**
 * Create the keys and the WUA for each credential to request. The exact credentials are taken from the authorization details
 * of the Issuer's access token, that contains the list of authorized credential identifiers. At present we always receive one
 * credential identifier, so we can generate one key/WUA per authorization detail.
 *
 * If the WUA is not supported, only the keys are generated.
 *
 * This function MUST be called before {@link requestAndParseCredential} because key generation is a preliminary step.
 *
 * @param accessToken The Issuer access token with the authorization details
 * @param params.env Environment variables
 * @param params.itwVersion IT-Wallet technical specs version
 * @param params.hardwareKeyTag The hardware key associated with the Wallet Instance
 * @param params.sessionToken The session token for the Wallet Provider API
 * @returns The authorization details enriched with the generated keys and WUA if supported
 */
export const generateKeysWithWalletUnitAttestation: GenerateKeysWithWalletUnitAttestation =
  async (accessToken, { env, itwVersion, hardwareKeyTag, sessionToken }) => {
    const ioWallet = getIoWallet(itwVersion);

    return Promise.all(
      accessToken.authorization_details.map(async authDetails => {
        const keyTag = uuidv4().toString();

        // If the WUA is supported, keys are generated via the KeyAttestationCryptoContext
        // and sent to the Wallet Provider to get the Wallet Unit Attestation
        if (ioWallet.WalletUnitAttestation.isSupported) {
          const walletUnitAttestation = await getWalletUnitAttestation(
            env,
            itwVersion,
            [keyTag],
            hardwareKeyTag,
            sessionToken
          );
          // Unique ID to correlate multiple keys to the same WUA (ex. batch issuance)
          const walletUnitAttestationId = uuidv4().toString();
          return {
            keyTag,
            authDetails,
            walletUnitAttestation,
            walletUnitAttestationId
          };
        }

        // If the WUA is not supported, only generate the cryptographic key
        await generate(keyTag);
        return { keyTag, authDetails };
      })
    );
  };
