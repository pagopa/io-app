import { generate } from "@pagopa/io-react-native-crypto";
import {
  type AuthorizationContext,
  createCryptoContextFor,
  WalletInstanceAttestation,
  Credential
} from "@pagopa/io-react-native-wallet";
import uuid from "react-native-uuid";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  itWalletPidIssuanceRedirectUri,
  itwWalletProviderBaseUrl,
  itwPidProviderBaseUrl
} from "../../../../config";
import { type IdentificationMode } from "../../machine/eid/events";
import { getIntegrityContext } from "./itwIntegrityUtils";

// TODO: read from env
const SPID_HINT = "https://demo.spid.gov.it";
const CIE_HINT =
  "https://collaudo.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";

const idpHintsMap: Record<IdentificationMode, string> = {
  cieId: CIE_HINT,
  ciePin: CIE_HINT,
  spid: SPID_HINT
};

export async function getPid({
  identificationMode,
  hardwareKeyTag
}: {
  hardwareKeyTag: string;
  identificationMode: IdentificationMode;
}) {
  const integrityContext = getIntegrityContext(hardwareKeyTag);

  const wiaKeyTag = uuid.v4().toString();
  await generate(wiaKeyTag);
  const wiaCryptoContext = createCryptoContextFor(wiaKeyTag);

  const walletInstanceAttestation =
    await WalletInstanceAttestation.getAttestation({
      wiaCryptoContext,
      integrityContext,
      walletProviderBaseUrl: itwWalletProviderBaseUrl
    });

  const authorizationContext: AuthorizationContext | undefined =
    identificationMode === "spid"
      ? { authorize: openAuthenticationSession }
      : undefined;

  const startFlow: Credential.Issuance.StartFlow = () => ({
    issuerUrl: itwPidProviderBaseUrl,
    credentialType: "PersonIdentificationData"
  });

  const { issuerUrl, credentialType } = startFlow();

  // Evaluate issuer trust
  const { issuerConf } = await Credential.Issuance.evaluateIssuerTrust(
    issuerUrl
  );

  const credentialKeyTag = uuid.v4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

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
