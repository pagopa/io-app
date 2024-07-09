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
import { type IdentificationMode } from "../../machine/eid/events";

// TODO: read from env
const SPID_HINT =
  "https://collaudo.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";
const CIE_HINT = "https://demo.spid.gov.it";

const idpHintsMap: Record<IdentificationMode, string> = {
  cieId: CIE_HINT,
  ciePin: CIE_HINT,
  spid: SPID_HINT
};

export async function getPid({
  walletInstanceAttestation,
  identificationMode
}: {
  walletInstanceAttestation: string;
  identificationMode: IdentificationMode;
}) {
  // Create identification context only for SPID
  const authorizationContext: AuthorizationContext | undefined =
    identificationMode === "spid"
      ? { authorize: openAuthenticationSession }
      : undefined;

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

  // Create credential crypto context
  const credentialKeyTag = uuid();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

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
      idpHintsMap[identificationMode],
      itWalletPidIssuanceRedirectUri,
      authorizationContext
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
