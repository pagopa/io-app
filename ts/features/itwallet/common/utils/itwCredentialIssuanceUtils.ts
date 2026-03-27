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

export type ObtainCredentialParams = {
  env: Env;
  itwVersion: ItwVersion;
  credentialType: string;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  issuerConf: IssuerConfiguration;
  hardwareKeyTag: string;
  sessionToken: string;
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
  env,
  itwVersion,
  credentialType,
  requestedCredential: requestObject,
  pid,
  walletInstanceAttestation,
  clientId,
  codeVerifier,
  issuerConf,
  hardwareKeyTag,
  sessionToken
}: ObtainCredentialParams) => {
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

  const { accessToken } = await ioWallet.CredentialIssuance.authorizeAccess(
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

  const credentialIssuanceMaterials = await prepareCredentialIssuanceMaterials(
    accessToken,
    {
      env,
      itwVersion,
      hardwareKeyTag,
      sessionToken
    }
  );

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
    for (const credentialParams of credentialIssuanceMaterials) {
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
    credentialIssuanceMaterials.map(credentialParams =>
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
  walletUnitAttestation,
  walletUnitAttestationId
}: RequestAndParseCredentialParams & CredentialIssuanceMaterials) => {
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
        credentialCryptoContext
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
    walletUnitAttestation,
    walletUnitAttestationId
  };
};

type CredentialIssuanceMaterials = {
  keyTag: string;
  authDetails: CredentialAccessToken["authorization_details"][number];
  walletUnitAttestation?: string;
  walletUnitAttestationId?: string;
};

export const prepareCredentialIssuanceMaterials = async (
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
): Promise<Array<CredentialIssuanceMaterials>> => {
  const ioWallet = getIoWallet(itwVersion);

  // Create a key tag for each credential to request
  const materials = accessToken.authorization_details.map(authDetails => ({
    keyTag: uuidv4().toString(),
    authDetails
  }));

  // When the WUA is not supported, only generate cryptographic keys
  if (!ioWallet.WalletUnitAttestation.isSupported) {
    await Promise.all(materials.map(x => generate(x.keyTag)));
    return materials;
  }

  // Request the WUA: keys are generated via the KeyAttestationCryptoContext
  // and sent to the Wallet Provider to get the attestation
  const walletUnitAttestation = await getWalletUnitAttestation(
    env,
    itwVersion,
    materials.map(x => x.keyTag),
    hardwareKeyTag,
    sessionToken
  );

  // Create a unique ID to correlate multiple keys to the same WUA
  const walletUnitAttestationId = uuidv4().toString();

  return materials.map(material => ({
    ...material,
    walletUnitAttestation,
    walletUnitAttestationId
  }));
};
