import { generate } from "@pagopa/io-react-native-crypto";
import {
  type AuthorizationContext,
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { v4 as uuid } from "uuid";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  itWalletPidIssuanceRedirectUri,
  itwWalletProviderBaseUrl
} from "../../../../config";

export async function getPid({
  walletInstanceAttestation,
  idphint
}: {
  walletInstanceAttestation: string;
  idphint: string;
}) {
  // Create credential crypto context
  const credentialKeyTag = uuid();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  // Create identification context
  const authorizationContext: AuthorizationContext = {
    authorize: openAuthenticationSession
  };

  // Start the issuance flow
  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: itwWalletProviderBaseUrl,
    credentialType: "PersonIdentificationData"
  });

  const { issuerUrl, credentialType } = startFlow();

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const wiaKeyTag = uuid();
  await generate(wiaKeyTag);
  const wiaCryptoContext = createCryptoContextFor(wiaKeyTag);

  // Start user authorization
  const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
    await Credential.Issuance.startUserAuthorization(
      issuerConf,
      credentialType,
      {
        walletInstanceAttestation,
        redirectUri: itWalletPidIssuanceRedirectUri,
        wiaCryptoContext
      }
    );

  const { code } =
    await Credential.Issuance.completeUserAuthorizationWithQueryMode(
      issuerRequestUri,
      clientId,
      issuerConf,
      authorizationContext,
      idphint,
      itWalletPidIssuanceRedirectUri
    );

  const { accessToken, tokenRequestSignedDPop } =
    await Credential.Issuance.authorizeAccess(
      issuerConf,
      code,
      clientId,
      itWalletPidIssuanceRedirectUri,
      codeVerifier,
      {
        walletInstanceAttestation,
        wiaCryptoContext
      }
    );

  const { credential, format } = await Credential.Issuance.obtainCredential(
    issuerConf,
    accessToken,
    clientId,
    credentialDefinition,
    tokenRequestSignedDPop,
    { credentialCryptoContext }
  );

  const { parsedCredential } =
    await Credential.Issuance.verifyAndParseCredential(
      issuerConf,
      credential,
      format,
      { credentialCryptoContext }
    );

  return parsedCredential;
}
