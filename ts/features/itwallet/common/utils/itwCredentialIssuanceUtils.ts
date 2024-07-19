import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import {
  AuthorizationDetail,
  createCryptoContextFor,
  Credential,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";
import { constNull } from "fp-ts/lib/function";
import uuid from "react-native-uuid";
import {
  itWalletIssuanceRedirectUri,
  itwEaaProviderBaseUrl,
  itwWalletProviderBaseUrl
} from "../../../../config";
import { getIntegrityContext } from "./itwIntegrityUtils";
import { CredentialType } from "./itwMocksUtils";
import {
  IssuerConfiguration,
  RequestObject,
  StoredCredential
} from "./itwTypesUtils";

const WIA_CRDENTIAL_KEYTAG = "WIA_CRDENTIAL_KEYTAG";

export type InitializeWalletParams = {
  integrityKeyTag: string;
};

export const initializeWallet = async ({
  integrityKeyTag
}: InitializeWalletParams) => {
  await deleteKey(WIA_CRDENTIAL_KEYTAG)
    .catch(constNull)
    .finally(() => generate(WIA_CRDENTIAL_KEYTAG));

  // Obtain a wallet attestation.

  const wiaCryptoContext = createCryptoContextFor(WIA_CRDENTIAL_KEYTAG);
  const integrityContext = getIntegrityContext(integrityKeyTag);
  const walletInstanceAttestation =
    await WalletInstanceAttestation.getAttestation({
      wiaCryptoContext,
      integrityContext,
      walletProviderBaseUrl: itwWalletProviderBaseUrl
    });

  return {
    wiaCryptoContext,
    walletInstanceAttestation
  };
};

export type RequestCredentialParams = {
  credentialType: CredentialType;
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
  credentialType: CredentialType;
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
  // Create PID crypto context;
  const pidCryptoContext = createCryptoContextFor(pid.keyTag);

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

  const { accessToken, tokenRequestSignedDPop } =
    await Credential.Issuance.authorizeAccess(
      issuerConf,
      code,
      clientId,
      `${itWalletIssuanceRedirectUri}`,
      codeVerifier,
      {
        walletInstanceAttestation,
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
    tokenRequestSignedDPop,
    {
      credentialCryptoContext
    }
  );

  // Parse and verify the credential. The ignoreMissingAttributes flag must be set to false or omitted in production.

  const { parsedCredential } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      format,
      { credentialCryptoContext, ignoreMissingAttributes: true }
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

export const disposeWallet = async () => {
  await deleteKey(WIA_CRDENTIAL_KEYTAG).catch(constNull);
};
