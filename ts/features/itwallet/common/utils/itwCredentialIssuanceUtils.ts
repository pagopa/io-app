import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  type ItwVersion
} from "@pagopa/io-react-native-wallet";
import { v4 as uuidv4 } from "uuid";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import {
  CredentialAccessToken,
  CredentialFormat,
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";
import { extractVerification } from "./itwCredentialUtils";
import { Env } from "./environment";
import { enrichErrorWithMetadata } from "./itwFailureUtils";
import { getIoWallet } from "./itwIoWallet";
import { getWalletUnitAttestation } from "./itwAttestationUtils";

export type RequestCredentialParams = {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  walletInstanceAttestation: string;
  skipMdocIssuance: boolean;
};

/**
 * List of credentials that cannot be issued in parallel, only sequentially.
 * Currently only the mDL must be requested sequentially because of locking issues.
 */
const SEQUENTIAL_ISSUANCE_CREDENTIALS = ["mDL"];

/**
 * Requests a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @returns The credential request object
 */
export const requestCredential = async ({
  env,
  itwVersion,
  credentialType,
  walletInstanceAttestation,
  skipMdocIssuance
}: RequestCredentialParams) => {
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
  const { issuerRequestUri, clientId, codeVerifier } =
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

  return {
    clientId,
    codeVerifier,
    requestedCredential: requestObject,
    issuerConf
  };
};

export type CompleteAuthFlowParams = {
  env: Env;
  itwVersion: ItwVersion;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  codeVerifier: string;
  issuerConf: IssuerConfiguration;
};

export const completeAuthFlow = async ({
  env,
  itwVersion,
  requestedCredential: requestObject,
  issuerConf,
  pid,
  codeVerifier,
  walletInstanceAttestation
}: CompleteAuthFlowParams) => {
  const ioWallet = getIoWallet(itwVersion);

  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Create PID and DPoP crypto context;
  await regenerateCryptoKey(DPOP_KEYTAG);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // Complete the user authorization via form_post.jwt mode
  const { code } =
    await ioWallet.CredentialIssuance.completeUserAuthorizationWithFormPostJwtMode(
      requestObject,
      issuerConf,
      pid.credential,
      {
        wiaCryptoContext,
        pidKeyTag: pid.keyTag
      }
    );

  return await ioWallet.CredentialIssuance.authorizeAccess(
    issuerConf,
    code,
    env.ISSUANCE_REDIRECT_URI,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );
};

export type ObtainCredentialParams = {
  authorizedCredentials: ReadonlyArray<AuthorizedCredentialMetadata>;
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  clientId: string;
  issuerConf: IssuerConfiguration;
  accessToken: CredentialAccessToken;
};

/**
 * Obtains a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param itwVersion - IT-Wallet technical specs version
 * @param credentialType - The type of credential to request
 * @param requestedCredential - The requested credential as a RequestObject
 * @param pid - The PID credential
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param clientId - The client ID
 * @param codeVerifier - The code verifier
 * @param issuerConf - The issuer configuration
 * @returns The obtained credential
 */
export const obtainCredential = async ({
  authorizedCredentials,
  env,
  itwVersion,
  credentialType,
  accessToken,
  clientId,
  issuerConf
}: ObtainCredentialParams) => {
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
    const credentials: Array<StoredCredential> = [];
    for (const credentialParams of authorizedCredentials) {
      const credential = await requestAndParseCredential({
        ...commonParams,
        ...credentialParams
      });
      // eslint-disable-next-line functional/immutable-data
      credentials.push(credential);
    }
    return { credentials };
  }

  const credentials = await Promise.all(
    authorizedCredentials.map(credentialParams =>
      requestAndParseCredential({ ...commonParams, ...credentialParams })
    )
  );

  return { credentials };
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

const requestAndParseCredential = async ({
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
}: RequestAndParseCredentialParams &
  AuthorizedCredentialMetadata): Promise<StoredCredential> => {
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
    verification: extractVerification({ format, credential, parsedCredential }),
    walletUnitAttestationId
  };
};

export type AuthorizedCredentialMetadata = {
  keyTag: string;
  authDetails: CredentialAccessToken["authorization_details"][number];
  walletUnitAttestation?: string;
  walletUnitAttestationId?: string;
};

/**
 * Create the keys and the WUA for each credential to request. The exact credentials are taken from the authorization details
 * of the Issuer's access token, that contains the list of authorized credential identifiers. At present we always receive one
 * credential identifier, so we can generate one key/WUA per authorization detail.
 *
 * If the WUA is not supported, only the keys are generated.
 *
 * @param accessToken The Issuer access token with the authorization details
 * @param params.env Environment variables
 * @param params.itwVersion IT-Wallet technical specs version
 * @param params.hardwareKeyTag The hardware key associated with the Wallet Instance
 * @param params.sessionToken The session token for the Wallet Provider API
 * @returns The authorization details enriched with the generated keys and WUA if supported
 */
export const generateKeysWithWalletUnitAttestation = async (
  accessToken: CredentialAccessToken,
  {
    env,
    itwVersion,
    hardwareKeyTag,
    sessionToken
  }: {
    env: Env;
    itwVersion: ItwVersion;
    hardwareKeyTag: string;
    sessionToken: string;
  }
): Promise<Array<AuthorizedCredentialMetadata>> => {
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
