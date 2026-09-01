import {
  verifyCertificateChain,
  X509CertificateOptions
} from "@pagopa/io-react-native-crypto";
import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { CredentialIssuance, ItwVersion } from "@pagopa/io-react-native-wallet";
import { KEYUTIL, KJUR, RSAKey, X509 } from "jsrsasign";

import { assert } from "../../../../utils/assert";
import { getIoWallet } from "../../common/utils/itwIoWallet";
import { IssuerConfiguration } from "../../common/utils/itwTypesUtils";
import { InvalidTslCredentialStatus } from "./errors";
import { StatusListX5cSchema, WalletProviderMetadataSchema } from "./schemas";

const X509_VALIDATION_OPTIONS: X509CertificateOptions = {
  connectTimeout: 10_000,
  readTimeout: 10_000,
  requireCrl: false
};

/**
 * Validates a Status List Token certificate chain, then extracts the public
 * key from the validated leaf certificate.
 *
 * @param statusListToken Encoded Status List Token
 * @param x509CertRoot Configured X.509 trust anchor
 * @returns Signing key used to verify the Status List Token
 */
export const getKeysForStatusListToken = async (
  statusListToken: string,
  x509CertRoot: string
): Promise<IssuerConfiguration["keys"]> => {
  assert(x509CertRoot.length > 0, "Status List trust anchor is missing");

  const { protectedHeader } = decodeJwt(statusListToken);
  const x5c = StatusListX5cSchema.parse(protectedHeader.x5c);
  assert(protectedHeader.kid, "Status List Token kid is missing");
  const certificateChain =
    x5c.length > 1 && x5c.at(-1) === x509CertRoot ? x5c.slice(0, -1) : x5c;
  const validationResult = await verifyCertificateChain(
    certificateChain,
    x509CertRoot,
    X509_VALIDATION_OPTIONS
  );

  assert(
    validationResult.isValid,
    `Status List certificate chain validation failed: ${validationResult.validationStatus} - ${validationResult.errorMessage}`
  );

  const leafCertificate = new X509();
  leafCertificate.readCertPEM(
    `-----BEGIN CERTIFICATE-----\n${x5c[0]}\n-----END CERTIFICATE-----`
  );
  const certificatePublicKey = leafCertificate.getPublicKey();
  assert(
    certificatePublicKey instanceof RSAKey ||
      certificatePublicKey instanceof KJUR.crypto.ECDSA,
    "Status List certificate uses an unsupported public key"
  );
  const publicKey = KEYUTIL.getJWKFromKey(certificatePublicKey);

  return [
    {
      ...publicKey,
      kid: protectedHeader.kid
    } as IssuerConfiguration["keys"][number]
  ];
};

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
