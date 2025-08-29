import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet-v2";
import { v4 as uuidv4 } from "uuid";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import {
  CredentialFormat,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";
import { Env } from "./environment";
import { enrichErrorWithMetadata } from "./itwFailureUtils";

export type RequestCredentialParams = {
  env: Env;
  credentialType: string;
  walletInstanceAttestation: string;
  isPidL3: boolean;
};

type IssuerConf = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];
type CredentialConfigurationSupported =
  IssuerConf["openid_credential_issuer"]["credential_configurations_supported"];

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
  isPidL3
}: RequestCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    new URL("1-0", env.WALLET_EAA_PROVIDER_BASE_URL).toString() // TODO: [SIW-2530] Move "1-0" to WALLET_PID_PROVIDER_BASE_URL after migrating to the new API
  );

  const credentialIds = getCredentialConfigurationIds(
    issuerConf,
    credentialType,
    isPidL3
  );

  // Start user authorization
  const { issuerRequestUri, clientId, codeVerifier } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialIds,
      {
        walletInstanceAttestation,
        redirectUri: `${env.ISSUANCE_REDIRECT_URI}`,
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
  // TODO: [SIW-2530] After fully migrating to the new API, rename this param to "requestObject"
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  issuerConf: IssuerConf;
  operationType?: "reissuing";
};

// TODO: [SIW-2530] Update JSDoc accordingly
/**
 * Obtains a credential from the issuer.
 * @param env - The environment to use for the wallet provider base URL
 * @param credentialType - The type of credential to request
 * @param requestedCredential - The requested credential
 * @param pid - The PID credential
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param clientId - The client ID
 * @param codeVerifier - The code verifier
 * @param credentialDefinition - The credential definition
 * @param issuerConf - The issuer configuration
 * @param operationType - The operation type, e.g., "reissuing"
 * @returns The obtained credential
 */
export const obtainCredential = async ({
  env,
  credentialType,
  // TODO: [SIW-2530] After fully migrating to the new API, rename this param to "requestObject"
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
    `${env.ISSUANCE_REDIRECT_URI}`,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );

  const credentials = await Promise.all(
    accessToken.authorization_details.map(
      async ({ credential_configuration_id, credential_identifiers }) => {
        const credentialKeyTag = uuidv4().toString();
        await generate(credentialKeyTag);
        const credentialCryptoContext =
          createCryptoContextFor(credentialKeyTag);

        // Obtain the credential
        const { credential, format } =
          await Credential.Issuance.obtainCredential(
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
        const { parsedCredential, issuedAt, expiration } =
          await Credential.Issuance.verifyAndParseCredential(
            issuerConf,
            credential,
            credential_configuration_id,
            { credentialCryptoContext, ignoreMissingAttributes: false },
            `${env.X509_CERT_ROOT}`
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
      }
    )
  );

  return {
    credentials
  };
};

/**
 * Retrieves the list of credential configuration IDs for a given credential type,
 * optionally filtered by PID level.
 *
 * @param issuerConf - The issuer configuration object
 * @param credentialType - The credential type (or scope) to filter by
 * @param isPidL3 - A boolean flag indicating whether the PID level is L3
 * @returns An array of credential configuration IDs (strings) associated with the given credential type.
 *   - If `isPidL3` is true, all configurations are considered.
 *   - Otherwise, only configurations with `format === CredentialFormat.SD_JWT` are considered.
 *   - Returns an empty array if no configuration matches.
 */
const getCredentialConfigurationIds = (
  { openid_credential_issuer }: IssuerConf,
  credentialType: string,
  isPidL3: boolean
) => {
  const supportedConfigurationsByScope = getConfigByPIDLevel(
    openid_credential_issuer.credential_configurations_supported,
    isPidL3
  ).reduce<Record<string, Array<string>>>(
    (acc, [configId, config]) => ({
      ...acc,
      [config.scope]: [...(acc[config.scope] || []), configId]
    }),
    {}
  );

  return supportedConfigurationsByScope[credentialType] || [];
};

/**
 * Filters the credential configurations based on the PID level.
 *
 * @param credentialConfigurationSupported - The `credential_configurations_supported` object of the credential issuer EC
 * @param isPidL3 - A boolean flag indicating whether the PID level is L3
 * @returns An array of `[key, value]` pairs where:
 *   - `key` is the configuration name (string)
 *   - `value` is the corresponding configuration object
 *
 * If `isPidL3` is true, all configurations are returned.
 * Otherwise, only the configurations with `format === CredentialFormat.SD_JWT` are returned.
 */
const getConfigByPIDLevel = (
  credentialConfigurationSupported: CredentialConfigurationSupported,
  isPidL3: boolean
) => {
  const config = Object.entries(credentialConfigurationSupported);

  return isPidL3
    ? config
    : config.filter(([, { format }]) => format === CredentialFormat.SD_JWT);
};
