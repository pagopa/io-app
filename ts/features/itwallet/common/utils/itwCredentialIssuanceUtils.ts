import { generate } from "@pagopa/io-react-native-crypto";
import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
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
};

type IssuerConf = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

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
  walletInstanceAttestation
}: RequestCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    env.WALLET_EAA_PROVIDER_BASE_URL
  );

  const credentialIds = getCredentialConfigurationIds(
    issuerConf,
    credentialType
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
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  issuerConf: IssuerConf;
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
  issuerConf
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
            }
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
            { credentialCryptoContext, ignoreMissingAttributes: false }
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

const getCredentialConfigurationIds = (
  issuerConfig: Awaited<
    ReturnType<Credential.Issuance.EvaluateIssuerTrust>
  >["issuerConf"],
  credentialType: string
) => {
  const { credential_configurations_supported } =
    issuerConfig.openid_credential_issuer;
  const supportedConfigurationsByScope = Object.entries(
    credential_configurations_supported
  ).reduce<Record<string, Array<string>>>(
    (acc, [configId, config]) => ({
      ...acc,
      // TODO: [SIW-2740] This check can be removed once `mso_mdoc` format supports verification and parsing.
      [config.scope]:
        config.format === CredentialFormat.SD_JWT
          ? [...(acc[config.scope] || []), configId]
          : acc[config.scope]
    }),
    {}
  );

  return supportedConfigurationsByScope[credentialType] || [];
};
