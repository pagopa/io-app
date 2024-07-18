import { deleteKey, generate } from "@pagopa/io-react-native-crypto";
import {
  type AuthorizationContext,
  createCryptoContextFor,
  WalletInstanceAttestation,
  Credential
} from "@pagopa/io-react-native-wallet";
import { type CryptoContext } from "@pagopa/io-react-native-jwt";
import uuid from "react-native-uuid";
import { openAuthenticationSession } from "@pagopa/io-react-native-login-utils";
import {
  itwWalletProviderBaseUrl,
  itwPidProviderBaseUrl,
  itWalletIssuanceRedirectUri,
  itWalletIssuanceRedirectUriCie
} from "../../../../config";
import { type IdentificationContext } from "../../machine/eid/context";
import { getIntegrityContext } from "./itwIntegrityUtils";
import { StoredCredential } from "./itwTypesUtils";

// TODO: use withEphemeralKey imported from @pagopa/io-react-native-wallet
export const withEphemeralKey = async <R>(
  fn: (ephemeralContext: CryptoContext) => Promise<R>
): Promise<R> => {
  const keytag = `ephemeral-${uuid.v4()}`;
  await generate(keytag);
  const ephemeralContext = createCryptoContextFor(keytag);
  return fn(ephemeralContext).finally(() => deleteKey(keytag));
};

// TODO [SIW-1359]: get the correct urls for production
const SPID_HINT = "https://demo.spid.gov.it";
const CIE_HINT =
  "https://collaudo.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";

const idpHintsMap: Record<IdentificationContext["mode"], string> = {
  cieId: CIE_HINT,
  ciePin: CIE_HINT,
  spid: SPID_HINT
};

// Different scheme to avoid conflicts with the scheme
// handled by io-react-native-login-utils's activity
const getRedirectUri = (identificationMode: IdentificationContext["mode"]) =>
  identificationMode === "cieId"
    ? itWalletIssuanceRedirectUriCie
    : itWalletIssuanceRedirectUri;

export async function getPid({
  integrityKeyTag,
  identification
}: {
  integrityKeyTag: string;
  identification: IdentificationContext;
}): Promise<StoredCredential> {
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

  return withEphemeralKey(async wiaCryptoContext => {
    /* ---------------- Get a Wallet Instance Attestation ---------------- */
    const integrityContext = getIntegrityContext(integrityKeyTag);

    const walletInstanceAttestation =
      await WalletInstanceAttestation.getAttestation({
        wiaCryptoContext,
        integrityContext,
        walletProviderBaseUrl: itwWalletProviderBaseUrl
      });

    /* ---------------- Authorize user and get access token ---------------- */
    const redirectUri = getRedirectUri(identification.mode);

    const { issuerRequestUri, clientId, codeVerifier, credentialDefinition } =
      await Credential.Issuance.startUserAuthorization(
        issuerConf,
        credentialType,
        {
          walletInstanceAttestation,
          redirectUri,
          wiaCryptoContext
        }
      );

    const { code } =
      await Credential.Issuance.completeUserAuthorizationWithQueryMode(
        issuerRequestUri,
        clientId,
        issuerConf,
        idpHintsMap[identification.mode], // TODO [SIW-1359]: pass the IDP id to the SPID hint
        redirectUri,
        authorizationContext
      );

    const { accessToken, tokenRequestSignedDPop } =
      await Credential.Issuance.authorizeAccess(
        issuerConf,
        code,
        clientId,
        redirectUri,
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

    return {
      parsedCredential,
      issuerConf,
      keyTag: credentialKeyTag,
      credentialType,
      format,
      credential
    };
  });
}
