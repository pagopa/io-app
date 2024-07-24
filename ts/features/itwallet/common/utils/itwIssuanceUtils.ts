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
  itWalletIssuanceRedirectUriCie,
  itwIdpHintTest
} from "../../../../config";
import { type IdentificationContext } from "../../machine/eid/context";
import { createItWalletFetch } from "../../api/client";
import { SessionToken } from "../../../../types/SessionToken";
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

// Different scheme to avoid conflicts with the scheme
// handled by io-react-native-login-utils's activity
const getRedirectUri = (identificationMode: IdentificationContext["mode"]) =>
  identificationMode === "cieId"
    ? itWalletIssuanceRedirectUriCie
    : itWalletIssuanceRedirectUri;

export async function getPid({
  integrityKeyTag,
  sessionToken,
  identification
}: {
  integrityKeyTag: string;
  sessionToken: SessionToken;
  identification: IdentificationContext;
}): Promise<StoredCredential> {
  const authorizationContext: AuthorizationContext | undefined =
    identification.mode === "spid"
      ? { authorize: openAuthenticationSession }
      : undefined;

  const idpHint = getIdpHint(identification);

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
    // This must be used only for API calls mediated through our backend which are related to the wallet instance only
    const appFetch = createItWalletFetch(
      itwWalletProviderBaseUrl,
      sessionToken
    );

    const walletInstanceAttestation =
      await WalletInstanceAttestation.getAttestation({
        wiaCryptoContext,
        integrityContext,
        walletProviderBaseUrl: itwWalletProviderBaseUrl,
        appFetch
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
        idpHint,
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

/**
 * Consts for the IDP hints in test for SPID and CIE and in production for CIE.
 * In production for SPID the hint is retrieved from the IDP ID via the {@link getSpidProductionIdpHint} function.
 */
const SPID_HINT_TEST = "https://demo.spid.gov.it";
const CIE_HINT_TEST =
  "https://collaudo.idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";
const CIE_HINT_PROD =
  "https://idserver.servizicie.interno.gov.it/idp/profile/SAML2/POST/SSO";

/**
 * Object of the SPID IDP IDs and the corresponding production hint URLs.
 */
const SPID_IDP_HINTS: { [key: string]: string } = {
  arubaid: "https://loginspid.aruba.it",
  ehtid: "https://id.eht.eu",
  infocamereid: "https://loginspid.infocamere.it",
  infocertid: "https://identity.infocert.it",
  intesiid: "https://idp.intesigroup.com",
  lepidaid: "https://id.lepida.it/idp/shibboleth",
  namirialid: "https://idp.namirialtsp.com/idp",
  posteid: "https://posteid.poste.it",
  sielteid: "https://identity.sieltecloud.it",
  spiditalia: "https://spid.register.it",
  timid: "https://login.id.tim.it/affwebservices/public/saml2sso",
  teamsystemid: "https://spid.teamsystem.com/idp"
};

/**
 * Get the IDP hint based on the identification context.
 * If the {@link itwIdpHintTest} is true the hint will be the test one, otherwise the production one.
 * In production for SPID the hint is retrieved from the IDP ID via the {@link getSpidProductionIdpHint} function,
 * for CIE the hint is always the same and it's defined in the {@link CIE_HINT_PROD} constant.
 * @param idCtx the identification context which contains the mode and the IDP ID if the mode is SPID
 * @returns the IDP hint to be provided to the {@link openAuthenticationSession} function
 */
const getIdpHint = (idCtx: IdentificationContext) => {
  const isSpidMode = idCtx.mode === "spid";
  if (itwIdpHintTest) {
    return isSpidMode ? SPID_HINT_TEST : CIE_HINT_TEST;
  } else {
    return isSpidMode ? getSpidProductionIdpHint(idCtx.idpId) : CIE_HINT_PROD;
  }
};

/**
 * Map of the SPID IDP IDs and the corresponding production hint URLs.
 * If the IDP ID is not present in the map an error is thrown.
 * @param spidIdpId
 * @throws {@link Error} if the IDP ID is not present in the map
 * @returns
 */
const getSpidProductionIdpHint = (spidIdpId: string) => {
  if (!(spidIdpId in SPID_IDP_HINTS)) {
    throw new Error(`Unknown idp ${spidIdpId}`);
  }
  return SPID_IDP_HINTS[spidIdpId];
};
