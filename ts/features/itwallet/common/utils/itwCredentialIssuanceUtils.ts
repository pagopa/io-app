import { generate } from "@pagopa/io-react-native-crypto";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";
import uuid from "react-native-uuid";
import {
  itWalletIssuanceRedirectUri,
  itwEaaProviderBaseUrl,
  itwWalletProviderBaseUrl
} from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { createItWalletFetch } from "../../api/client";
import { getIntegrityContext } from "./itwIntegrityUtils";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";
import {
  DPOP_CREDENTIAL_KEYTAG,
  regenerateCryptoKey,
  WIA_CREDENTIAL_KEYTAG
} from "./itwCryptoContextUtils";

export type InitializeWalletParams = {
  integrityKeyTag: string;
  sessionToken: SessionToken;
};

export const initializeWallet = async ({
  integrityKeyTag,
  sessionToken
}: InitializeWalletParams) => {
  await regenerateCryptoKey(WIA_CREDENTIAL_KEYTAG);

  const appFetch = createItWalletFetch(itwWalletProviderBaseUrl, sessionToken);

  // Obtain a wallet attestation.

  const wiaCryptoContext = createCryptoContextFor(WIA_CREDENTIAL_KEYTAG);
  const integrityContext = getIntegrityContext(integrityKeyTag);

  const walletInstanceAttestation =
    await WalletInstanceAttestation.getAttestation({
      wiaCryptoContext,
      integrityContext,
      walletProviderBaseUrl: itwWalletProviderBaseUrl,
      appFetch
    });

  return {
    wiaCryptoContext,
    walletInstanceAttestation
  };
};

export type RequestCredentialParams = {
  credentialType: string;
  walletInstanceAttestation: string;
  wiaCryptoContext: CryptoContext;
};

export const requestCredential = async ({
  credentialType,
  walletInstanceAttestation,
  wiaCryptoContext
}: RequestCredentialParams) => {
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
  wiaCryptoContext: CryptoContext;
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
  wiaCryptoContext,
  walletInstanceAttestation,
  clientId,
  codeVerifier,
  credentialDefinition,
  issuerConf
}: ObtainCredentialParams) => {
  await regenerateCryptoKey(DPOP_CREDENTIAL_KEYTAG);

  // Create PID and DPoP crypto context;
  const pidCryptoContext = createCryptoContextFor(pid.keyTag);
  const dPopCryptoContext = createCryptoContextFor(DPOP_CREDENTIAL_KEYTAG);

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

  const credentialKeyTag = uuid.v4().toString();
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

  const { parsedCredential } =
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
    keyTag: credentialKeyTag
  };

  return {
    credential: storedCredential
  };
};
