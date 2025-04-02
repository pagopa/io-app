import { generate } from "@pagopa/io-react-native-crypto";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { v4 as uuidv4 } from "uuid";
import {
  itWalletIssuanceRedirectUri,
  itwEaaProviderBaseUrl
} from "../../../../config";
import {
  DPOP_KEYTAG,
  regenerateCryptoKey,
  WIA_KEYTAG
} from "./itwCryptoContextUtils";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";

export type RequestCredentialParams = {
  credentialType: string;
  walletInstanceAttestation: string;
};

export const requestCredential = async ({
  credentialType,
  walletInstanceAttestation
}: RequestCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    itwEaaProviderBaseUrl
  );

  // Start user authorization

  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation,
        redirectUri: `${itWalletIssuanceRedirectUri}`,
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
    credentialDefinition,
    requestedCredential: requestObject,
    issuerConf
  };
};

export type ObtainCredentialParams = {
  credentialType: string;
  walletInstanceAttestation: string;
  requestedCredential: RequestObject;
  pid: StoredCredential;
  clientId: string;
  codeVerifier: string;
  credentialDefinition: AuthorizationDetail;
  issuerConf: IssuerConfiguration;
};

export const obtainCredential = async ({
  credentialType,
  requestedCredential,
  pid,
  walletInstanceAttestation,
  clientId,
  codeVerifier,
  credentialDefinition,
  issuerConf
}: ObtainCredentialParams) => {
  // Get WIA crypto context
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  // Create PID and DPoP crypto context;
  await regenerateCryptoKey(DPOP_KEYTAG);
  const pidCryptoContext = createCryptoContextFor(pid.keyTag);
  const dPopCryptoContext = createCryptoContextFor(DPOP_KEYTAG);

  // Complete the user authorization via form_post.jwt mode
  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithFormPostJwtMode(
      requestedCredential,
      {
        wiaCryptoContext,
        pidCryptoContext,
        pid: pid.credential,
        walletInstanceAttestation
      }
    );

  const { accessToken } = await Credential.Issuance.authorizeAccess(
    issuerConf,
    code,
    clientId,
    `${itWalletIssuanceRedirectUri}`,
    codeVerifier,
    {
      walletInstanceAttestation,
      dPopCryptoContext,
      wiaCryptoContext
    }
  );

  // Create credential crypto context

  const credentialKeyTag = uuidv4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  // Obtain the credential

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialDefinition,
    {
      dPopCryptoContext,
      credentialCryptoContext
    }
  );

  // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.

  const { parsedCredential, issuedAt, expiration } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      format,
      { credentialCryptoContext, ignoreMissingAttributes: false }
    );

  const storedCredential: StoredCredential = {
    credential,
    parsedCredential,
    credentialType,
    format,
    issuerConf,
    keyTag: credentialKeyTag,
    jwt: {
      expiration: expiration.toISOString(),
      issuedAt: issuedAt?.toISOString()
    }
  };

  return {
    credential: storedCredential
  };
};
