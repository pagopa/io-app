import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  RemotePresentation,
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
  CredentialOfferResolved,
  EvaluatedDcqlQueryResult,
  IssuerConfiguration,
  RequestObject
} from "./itwTypesUtils";
import { extractVerification } from "./itwCredentialUtils";
import { CredentialType } from "./itwMocksUtils";
import { Env } from "./environment";
import { enrichErrorWithMetadata } from "./itwFailureUtils";
import { getIoWallet } from "./itwIoWallet";
import { getWalletUnitAttestation } from "./itwAttestationUtils";

/**
 * List of credentials that cannot be issued in parallel, only sequentially.
 * Currently only the mDL must be requested sequentially because of locking issues.
 */
const SEQUENTIAL_ISSUANCE_CREDENTIALS = ["mDL"];
const NO_SUPPORTED_CREDENTIAL_CONFIGURATION_IDS_ERROR =
  "No supported credential configuration IDs found for the resolved credential offer";

/**
 * Credentials that must be obtained in batch (multiple copies in a single issuance), keyed by
 * credential type. Each entry declares the number of copies the app wants to obtain. These are
 * typically one-time-use credentials, where each copy is consumed on a single presentation.
 *
 * The desired count is an app-side preference: the effective batch size is always clamped to the
 * issuer's advertised `credential_issuance_batch_size` (see {@link getEffectiveBatchSize}).
 */
export const BATCH_ISSUANCE_CREDENTIALS: Record<
  string,
  { desiredCount: number }
> = {
  [CredentialType.PROOF_OF_AGE]: { desiredCount: 5 }
};

/**
 * Computes how many copies of a credential to request in a single issuance.
 *
 * Returns 1 (single issuance) when the credential type is not configured for batch issuance or
 * when the issuer does not advertise batch support. Otherwise returns the app's desired count
 * clamped to the issuer's `credential_issuance_batch_size`.
 *
 * @param credentialType The type of credential being issued
 * @param issuerBatchSize The issuer's advertised max batch size, if any
 * @returns The number of credential copies to obtain (>= 1)
 */
export const getEffectiveBatchSize = (
  credentialType: string,
  issuerBatchSize: number | undefined
): number => {
  const config = BATCH_ISSUANCE_CREDENTIALS[credentialType];
  if (!config || !issuerBatchSize || issuerBatchSize <= 1) {
    return 1;
  }
  return Math.max(1, Math.min(config.desiredCount, issuerBatchSize));
};

export type RequestCredential = (args: {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  walletInstanceAttestation: string;
  skipMdocIssuance: boolean;
  resolvedCredentialOffer?: CredentialOfferResolved;
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
 *
 * When issuance starts from a Credential Offer, the `authorization_code` grant
 * details drive the flow: the offer's `authorization_server` is validated
 * against the issuer metadata during trust evaluation, while `scope` and
 * `issuer_state` are forwarded to the Pushed Authorization Request.
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param skipMdocIssuance - Whether mDoc credential configurations must be excluded from the request
 * @param resolvedCredentialOffer - The resolved Credential Offer with its grant details, when issuance starts from an offer
 * @param pid - The PID credential to evaluate the issuer DCQL query before showing the trust issuer screen
 * @returns The credential request object
 */
export const requestCredential: RequestCredential = async ({
  env,
  itwVersion,
  credentialType,
  walletInstanceAttestation,
  skipMdocIssuance,
  resolvedCredentialOffer,
  pid
}) => {
  const ioWallet = getIoWallet(itwVersion);

  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const authorizationCodeGrant =
    resolvedCredentialOffer?.grantDetails.authorizationCodeGrant;

  // Evaluate issuer trust. The authorization server declared by the offer
  // must match one of the issuer metadata `authorization_servers`.
  const credentialIssuer =
    resolvedCredentialOffer?.offer.credential_issuer ??
    env.WALLET_EAA_PROVIDER_BASE_URL.value(itwVersion);
  const { issuerConf } = await ioWallet.CredentialIssuance.evaluateIssuerTrust(
    credentialIssuer,
    { authorizationServer: authorizationCodeGrant?.authorizationServer }
  );

  const credentialIds = resolvedCredentialOffer?.offer
    .credential_configuration_ids
    ? resolvedCredentialOffer.offer.credential_configuration_ids.filter(id => {
        const config = issuerConf.credential_configurations_supported[id];
        return (
          config !== undefined &&
          config.scope === credentialType &&
          (!skipMdocIssuance || config.format !== CredentialFormat.MDOC)
        );
      })
    : getCredentialConfigurationIds(
        issuerConf,
        credentialType,
        skipMdocIssuance
      );

  if (resolvedCredentialOffer && credentialIds.length === 0) {
    throw new Error(NO_SUPPORTED_CREDENTIAL_CONFIGURATION_IDS_ERROR);
  }

  // Start user authorization
  const { issuerRequestUri, clientId, codeVerifier, responseMode } =
    await ioWallet.CredentialIssuance.startUserAuthorization(
      issuerConf,
      credentialIds,
      { proofType: "none" },
      {
        walletInstanceAttestation,
        redirectUri: env.ISSUANCE_REDIRECT_URI,
        wiaCryptoContext,
        // Offer flow only: forwarded to the PAR, omitted in the catalogue flow
        scope: authorizationCodeGrant?.scope,
        issuerState: authorizationCodeGrant?.issuerState
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
      requestObject.dcql_query as RemotePresentation.DcqlQuery,
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
      return (
        await ioWallet.CredentialIssuance.completeUserAuthorizationWithFormPostJwtMode(
          requestObject,
          issuerConf,
          evaluatedDcqlQuery,
          { wiaCryptoContext }
        )
      ).code;
    }

    return (
      await ioWallet.CredentialIssuance.completeEaaUserAuthorizationWithQueryMode(
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

  return verifyAndBuildCredentialBundle({
    ioWallet,
    issuerConf,
    credential,
    format,
    credentialConfigurationId: credential_configuration_id,
    credentialCryptoContext,
    keyTag,
    credentialType,
    walletUnitAttestationId,
    env
  });
};

type VerifyAndBuildCredentialBundleParams = {
  ioWallet: ReturnType<typeof getIoWallet>;
  issuerConf: IssuerConfiguration;
  credential: string;
  format: string;
  credentialConfigurationId: string;
  credentialCryptoContext: CryptoContext;
  keyTag: string;
  credentialType: string;
  walletUnitAttestationId?: string;
  env: Env;
};

/**
 * Verifies and parses a freshly obtained credential and packages it into a {@link CredentialBundle}.
 * Shared by single and batch issuance so the metadata is built identically regardless of the
 * issuance path. The `credentialId` is the issuer's `credential_configuration_id`, shared by all
 * copies of the same credential; instances are told apart by their unique `keyTag`.
 *
 * The `ignoreMissingAttributes` flag must be false for mDoc credentials, since some attributes are
 * intentionally not presented during Proximity presentation; it is only relaxed for SD-JWT.
 */
const verifyAndBuildCredentialBundle = async ({
  ioWallet,
  issuerConf,
  credential,
  format,
  credentialConfigurationId,
  credentialCryptoContext,
  keyTag,
  credentialType,
  walletUnitAttestationId,
  env
}: VerifyAndBuildCredentialBundleParams): Promise<CredentialBundle> => {
  const { parsedCredential, issuedAt, expiration } =
    await ioWallet.CredentialIssuance.verifyAndParseCredential(
      issuerConf,
      credential,
      credentialConfigurationId,
      {
        credentialCryptoContext,
        ignoreMissingAttributes: true
      },
      env.X509_CERT_ROOT
    );

  return {
    credential,
    metadata: {
      parsedCredential,
      credentialType,
      credentialId: credentialConfigurationId,
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

export type AuthorizedBatchCredentialMetadata = {
  /**
   * One key per credential copy to obtain in the batch. All keys are attested by the same WUA.
   */
  keyTags: ReadonlyArray<string>;
  authDetails: CredentialAccessToken["authorization_details"][number];
  walletUnitAttestation?: string;
  walletUnitAttestationId?: string;
};

type GenerateBatchKeysWithWalletUnitAttestation = (
  accessToken: CredentialAccessToken,
  batchSize: number,
  params: {
    env: Env;
    itwVersion: ItwVersion;
    hardwareKeyTag: string;
    sessionToken: string;
  }
) => Promise<ReadonlyArray<AuthorizedBatchCredentialMetadata>>;

/**
 * Batch variant of {@link generateKeysWithWalletUnitAttestation}. For each authorization detail it
 * generates `batchSize` cryptographic keys and, when supported, a single Wallet Unit Attestation
 * that attests all of them (the WUA endpoint accepts multiple keys at once, correlated via
 * `walletUnitAttestationId`).
 *
 * This function MUST be called before {@link obtainCredentialsBatch} because key generation is a
 * preliminary step.
 *
 * @param accessToken The Issuer access token with the authorization details
 * @param batchSize The number of credential copies (and keys) to generate per authorization detail
 * @returns The authorization details enriched with the generated keys and WUA if supported
 */
export const generateBatchKeysWithWalletUnitAttestation: GenerateBatchKeysWithWalletUnitAttestation =
  async (
    accessToken,
    batchSize,
    { env, itwVersion, hardwareKeyTag, sessionToken }
  ) => {
    const ioWallet = getIoWallet(itwVersion);

    return Promise.all(
      accessToken.authorization_details.map(async authDetails => {
        const keyTags = Array.from({ length: batchSize }, () =>
          uuidv4().toString()
        );

        // If the WUA is supported, all keys are attested by a single Wallet Unit Attestation
        if (ioWallet.WalletUnitAttestation.isSupported) {
          const walletUnitAttestation = await getWalletUnitAttestation(
            env,
            itwVersion,
            keyTags,
            hardwareKeyTag,
            sessionToken
          );
          const walletUnitAttestationId = uuidv4().toString();
          return {
            keyTags,
            authDetails,
            walletUnitAttestation,
            walletUnitAttestationId
          };
        }

        // If the WUA is not supported, only generate the cryptographic keys
        await Promise.all(keyTags.map(generate));
        return { keyTags, authDetails };
      })
    );
  };

export type ObtainCredentialsBatch = (args: {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  authorizedCredentials: ReadonlyArray<AuthorizedBatchCredentialMetadata>;
  clientId: string;
  issuerConf: IssuerConfiguration;
  accessToken: CredentialAccessToken;
}) => Promise<ReadonlyArray<CredentialBundle>>;

/**
 * Obtains multiple copies of a credential from the issuer in a single batch request, using
 * `obtainCredentialsBatch` from the wallet SDK. Each authorization detail is requested with its
 * own set of crypto contexts (one per copy) and all returned credentials are verified and packaged
 * into {@link CredentialBundle}s. All copies of the same credential share the `credentialId`
 * (the issuer's `credential_configuration_id`); copies are told apart by their unique `keyTag`.
 *
 * Keys MUST be generated beforehand via {@link generateBatchKeysWithWalletUnitAttestation}.
 *
 * @returns The flattened list of obtained credential bundles
 */
export const obtainCredentialsBatch: ObtainCredentialsBatch = async ({
  authorizedCredentials,
  env,
  itwVersion,
  credentialType,
  accessToken,
  clientId,
  issuerConf
}) => {
  const ioWallet = getIoWallet(itwVersion);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  const bundlesByAuthDetail = await Promise.all(
    authorizedCredentials.map(
      async ({
        keyTags,
        authDetails,
        walletUnitAttestation,
        walletUnitAttestationId
      }): Promise<ReadonlyArray<CredentialBundle>> => {
        const { credential_configuration_id, credential_identifiers } =
          authDetails;
        const credentialCryptoContexts = keyTags.map(createCryptoContextFor);

        const obtainedCredentials =
          await ioWallet.CredentialIssuance.obtainCredentialsBatch(
            issuerConf,
            accessToken,
            clientId,
            {
              credential_configuration_id,
              credential_identifier: credential_identifiers[0]
            },
            {
              dPopCryptoContext,
              credentialCryptoContexts,
              walletUnitAttestation
            }
          ).catch(
            enrichErrorWithMetadata({
              credentialId: credential_configuration_id
            })
          );

        return Promise.all(
          obtainedCredentials.map(({ credential, format }, index) =>
            verifyAndBuildCredentialBundle({
              ioWallet,
              issuerConf,
              credential,
              format,
              credentialConfigurationId: credential_configuration_id,
              credentialCryptoContext: credentialCryptoContexts[index],
              keyTag: keyTags[index],
              credentialType,
              walletUnitAttestationId,
              env
            })
          )
        );
      }
    )
  );

  return bundlesByAuthDetail.flat();
};
