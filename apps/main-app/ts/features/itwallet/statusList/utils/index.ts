import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { CredentialIssuance, ItwVersion } from "@pagopa/io-react-native-wallet";

import { assert } from "../../../../utils/assert";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";
import { InvalidTslCredentialStatus } from "./errors";
import {
  CredentialIssuerMetadataSchema,
  WalletProviderMetadataSchema
} from "./schemas";

/**
 * Function to get the credential status from its token status list (TSL). The list is fetched from the `uri` extracted from
 * the raw credential, it is verified and parsed, and then the credential status at `idx` is extracted.
 * When the status is not valid, the function throws so its behavior is consistent with `getCredentialStatusAssertion`.
 *
 * @param credentialBundle The bundle with the raw credential
 * @param itwVersion Current IT-Wallet specifications version
 * @param keys The JWKS to verify the status list
 * @returns The extracted credential status and the status list
 * @throws {InvalidTslCredentialStatus}
 */
export const getCredentialStatusFromStatusList = async (
  itwVersion: ItwVersion,
  credential: string,
  credentialId: string,
  credentialFormat: CredentialIssuance.CredentialFormat,
  keys: IssuerConfiguration["keys"]
) => {
  const ioWallet = getIoWallet(itwVersion);
  assert(
    ioWallet.CredentialStatus.statusList.isSupported,
    `Status List is not supported by API ${itwVersion}`
  );

  const { uri, idx, statusList } =
    await ioWallet.CredentialStatus.statusList.get(
      credential,
      credentialFormat as CredentialIssuance.CredentialFormat
    );
  const parsed = await ioWallet.CredentialStatus.statusList.verifyAndParse(
    keys,
    statusList
  );
  assert(parsed.sub === uri, `Status List Token sub does not match URI ${uri}`);

  const { status, rawStatus } = ioWallet.CredentialStatus.statusList.getStatus(
    parsed.status_list,
    idx
  );

  // Every status check in the app is done against the lowercase value, so it is transformed here.
  // TODO: [SIW-4664] Export a more accurate type from `getStatus`.
  const canonicalStatus = status.toLowerCase();

  if (canonicalStatus !== "valid") {
    throw new InvalidTslCredentialStatus(credentialId, rawStatus);
  }

  return {
    idx,
    parsedStatusList: parsed,
    rawStatus,
    status: canonicalStatus,
    statusList,
    uri
  };
};

const getFederationEntityConfiguration = async (token: string) => {
  const { payload } = decodeJwt(token);
  const issuer = new URL(String(payload.iss));
  assert(
    issuer.protocol === "https:",
    "Status List issuer must use the HTTPS protocol"
  );

  const federationUrl = `${issuer.href.replace(
    /\/$/,
    ""
  )}/.well-known/openid-federation`;
  const response = await fetch(federationUrl);
  assert(
    response.ok,
    `Unable to fetch OpenID Federation metadata from ${federationUrl}`
  );

  return decodeJwt(await response.text()).payload;
};

/**
 * Resolves Status Issuer JWKS from its OpenID Federation metadata.
 * Status List Token payload is decoded only to discover its issuer; signature
 * verification is performed separately with returned keys. Both Credential
 * Issuer and Wallet Provider metadata are supported because each can own
 * Status List Tokens cached by wallet.
 *
 * @param statusListToken Encoded Status List Token
 * @returns Status Issuer keys used to verify Status List Token
 */
export const getKeysForStatusListToken = async (statusListToken: string) => {
  const payload = await getFederationEntityConfiguration(statusListToken);
  const credentialIssuer = CredentialIssuerMetadataSchema.safeParse(payload);

  if (credentialIssuer.success) {
    return credentialIssuer.data.metadata.openid_credential_issuer.jwks.keys;
  }

  const walletProvider = WalletProviderMetadataSchema.parse(payload);
  return walletProvider.metadata.wallet_solution.jwks.keys;
};

/**
 * Fetches JWKS from Wallet Provider's OpenID Federation metadata,
 * used to verify Wallet Unit Attestation Status List Token.
 *
 * @param walletUnitAttestation Encoded Wallet Unit Attestation
 * @returns JWKS keys from Wallet Provider
 */
export const getKeysForWuaStatusList = async (
  walletUnitAttestation: string
) => {
  const payload = await getFederationEntityConfiguration(walletUnitAttestation);
  const walletProvider = WalletProviderMetadataSchema.parse(payload);

  return walletProvider.metadata.wallet_solution.jwks.keys;
};
