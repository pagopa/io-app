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
import { type Identification } from "../../machine/eid/context";
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
  hardwareKeyTag,
  identification
}: {
  hardwareKeyTag: string;
  identification: Identification;
}) {
  const authorizationContext: AuthorizationContext | undefined =
    identification.mode === "spid"
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

  /* ---------------- Get a Wallet Instance Attestation ---------------- */
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

  /* ---------------- Authorize user and get access token ---------------- */
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
      idpHintsMap[identification.mode], // TODO: use idp ID to get the proper hint?
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

  /* ---------------- Get PID ---------------- */
  const credentialKeyTag = uuid.v4().toString();
  await generate(credentialKeyTag);
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

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
