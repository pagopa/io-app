import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  Credential
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
import { Env } from "./environment";
import { enrichErrorWithMetadata } from "./itwFailureUtils";

export type RequestCredentialParams = {
  env: Env;
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
 * @param credentialType - The type of credential to request
 * @param walletInstanceAttestation - The wallet instance attestation
 * @returns The credential request object
 */
export const requestCredential = async ({
  env,
  credentialType,
  walletInstanceAttestation,
  skipMdocIssuance
}: RequestCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    env.WALLET_EAA_PROVIDER_BASE_URL
  );

  const credentialIds = getCredentialConfigurationIds(
    issuerConf,
    credentialType,
    skipMdocIssuance
  );

  // Start user authorization
  const { issuerRequestUri, clientId, codeVerifier } =
    await Credential.Issuance.startUserAuthorization(
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
    await Credential.Issuance.getRequestedCredentialToBePresented(
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
  credentialType: string;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  issuerConf: IssuerConfiguration;
  operationType?: "reissuing";
};

/**
 * Obtains a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param credentialType - The type of credential to request
 * @param requestedCredential - The requested credential as a RequestObject
 * @param pid - The PID credential
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param clientId - The client ID
 * @param codeVerifier - The code verifier
 * @param issuerConf - The issuer configuration
 * @param operationType - The operation type, e.g., "reissuing"
 * @returns The obtained credential
 */
export const obtainCredential = async ({
  env,
  credentialType,
  requestedCredential: requestObject,
  pid,
  walletInstanceAttestation,
  clientId,
  codeVerifier,
  issuerConf,
  operationType
}: ObtainCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Create PID and DPoP crypto context;
  await regenerateCryptoKey(DPOP_KEYTAG);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // Complete the user authorization via form_post.jwt mode
  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode(
      requestObject,
      pid.credential,
      {
        wiaCryptoContext,
        pidCryptoContext: createCryptoContextFor(pid.keyTag)
      }
    );

  const { accessToken } = await Credential.Issuance.authorizeAccess(
    issuerConf,
    code,
    clientId,
    env.ISSUANCE_REDIRECT_URI,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );

  const params: Omit<RequestAndParseCredentialParams, "authDetails"> = {
    accessToken,
    clientId,
    credentialType,
    env,
    dPopCryptoContext,
    issuerConf,
    operationType
  };

  if (SEQUENTIAL_ISSUANCE_CREDENTIALS.includes(credentialType)) {
    const credentials: Array<StoredCredential> = [];
    for (const authDetails of accessToken.authorization_details) {
      const credential = await requestAndParseCredential({
        ...params,
        authDetails
      });
      // eslint-disable-next-line functional/immutable-data
      credentials.push(credential);
    }
    return { credentials };
  }

  const credentials = await Promise.all(
    accessToken.authorization_details.map(authDetails =>
      requestAndParseCredential({ ...params, authDetails })
    )
  );

  return { credentials };
};

const getCredentialConfigurationIds = (
  issuerConfig: IssuerConfiguration,
  credentialType: string,
  skipMdocIssuance: boolean
) => {
  const { credential_configurations_supported } =
    issuerConfig.openid_credential_issuer;

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
  authDetails: CredentialAccessToken["authorization_details"][number];
  clientId: string;
  env: Env;
  dPopCryptoContext: CryptoContext;
  operationType?: "reissuing";
};

const requestAndParseCredential = async ({
  issuerConf,
  credentialType,
  accessToken,
  authDetails,
  clientId,
  dPopCryptoContext,
  env,
  operationType
}: RequestAndParseCredentialParams) => {
  const { credential_configuration_id, credential_identifiers } = authDetails;
  const credentialKeyTag = uuidv4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  // Obtain the credential
  const { credential, format } = await Credential.Issuance.obtainCredential(
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
    },
    operationType
  ).catch(
    enrichErrorWithMetadata({
      credentialId: credential_configuration_id
    })
  );
  // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.
  // The ignoreMissingAttributes must be set to false for mDoc credentials since
  // there are some attributes that should not be presented during Proximity presentation.
  const { parsedCredential, issuedAt, expiration } =
    await Credential.Issuance.verifyAndParseCredential(
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
    keyTag: credentialKeyTag,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    }
  };
};
