import {
  ItwVersion,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import * as t from "io-ts";
import {
  CredentialFormat,
  IssuerConfiguration,
  StoredCredential
} from "./itwTypesUtils";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { getIoWallet } from "./itwIoWallet";
import { Env } from "./environment";

const fetchIssuerConfShared = createIssuerConfSharedFetch();

export const getCredentialStatusAssertion = async (
  credential: StoredCredential,
  env: Env,
  itwVersion: ItwVersion
) => {
  const ioWallet = getIoWallet(itwVersion);

  if (!ioWallet.CredentialStatus.statusAssertion.isSupported) {
    throw new Error(
      `Status assertion is not supported in IT-Wallet v${itwVersion}`
    );
  }

  // Legacy credentials carry the legacy Issuer configuration, which is incompatible with the new API.
  // In this scenario the new configuration is fetched and used instead of `credential.issuerConf`.
  const issuerConf =
    credential.format === CredentialFormat.LEGACY_SD_JWT
      ? await fetchIssuerConfShared(env, itwVersion)
      : credential.issuerConf;

  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const rawStatusAssertion =
    await ioWallet.CredentialStatus.statusAssertion.get(
      issuerConf,
      credential.credential,
      credential.format as CredentialFormat,
      { credentialCryptoContext, wiaCryptoContext }
    );

  const { parsedStatusAssertion } =
    await ioWallet.CredentialStatus.statusAssertion.verifyAndParse(
      issuerConf,
      rawStatusAssertion,
      credential.credential,
      credential.format as CredentialFormat
    );

  return {
    statusAssertion: rawStatusAssertion.statusAssertion,
    parsedStatusAssertion
  };
};

export const shouldRequestStatusAssertion = ({
  storedStatusAssertion,
  jwt
}: StoredCredential) => {
  // Skip status assertion check for expired JWTs to avoid credential_not_found errors with 0.7 credentials
  if (isAfter(new Date(), new Date(jwt.expiration))) {
    return false;
  }

  // When no status assertion is present, request a new one
  if (!storedStatusAssertion) {
    return true;
  }

  switch (storedStatusAssertion.credentialStatus) {
    // We could not determine the status or the credential is invalid, try to request another assertion
    case "unknown":
    case "invalid":
      return true;
    // When the status assertion is expired request a new one
    case "valid":
      return isAfter(
        new Date(),
        new Date(storedStatusAssertion.parsedStatusAssertion.exp * 1000)
      );
    default:
      throw new Error("Unexpected credential status");
  }
};

/**
 * Shape of a credential status assertion response error.
 */
export const StatusAssertionError = t.intersection([
  t.type({ error: t.string }),
  t.partial({ error_description: t.string })
]);

/**
 * Create a shared promise to fetch the new Issuer Entity Configuration.
 * Multiple invocations of this function will reuse the same promise,
 * avoiding multiple HTTP calls for the same result.
 *
 * @param maxAge Time in seconds to share the promise, defaults to 24 hours
 * @return The shared promise that resolves to the Issuer Configuration
 */
function createIssuerConfSharedFetch(maxAge = 86400) {
  // eslint-disable-next-line functional/no-let
  let sharedPromise: Promise<IssuerConfiguration> | null = null;
  // eslint-disable-next-line functional/no-let
  let timestamp: number = -1;

  return function getIssuerConf(env: Env, itwVersion: ItwVersion) {
    if (timestamp + maxAge * 1000 < Date.now() || !sharedPromise) {
      const ioWallet = getIoWallet(itwVersion);
      sharedPromise = ioWallet.CredentialIssuance.evaluateIssuerTrust(
        env.WALLET_EAA_PROVIDER_BASE_URL.value(itwVersion)
      ).then(res => res.issuerConf);
      timestamp = Date.now();
    }
    return sharedPromise;
  };
}
