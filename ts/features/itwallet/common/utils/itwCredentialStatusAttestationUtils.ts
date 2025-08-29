import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import * as t from "io-ts";
import { CredentialFormat, StoredCredential } from "./itwTypesUtils";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { Env } from "./environment";

type IssuerConf = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

const fetchIssuerConfShared = createIssuerConfSharedFetch();

export const getCredentialStatusAttestation = async (
  credential: StoredCredential,
  env: Env
) => {
  // Legacy credentials carry the legacy Issuer configuration, which is incompatible with the new API.
  // In this scenario the new configuration is fetched and used instead of `credential.issuerConf`.
  const issuerConf =
    credential.format === CredentialFormat.LEGACY_SD_JWT
      ? await fetchIssuerConfShared(env)
      : (credential.issuerConf as IssuerConf);

  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const rawStatusAssertion = await Credential.Status.statusAssertion(
    issuerConf,
    credential.credential,
    credential.format as CredentialFormat,
    { credentialCryptoContext, wiaCryptoContext }
  );

  const { parsedStatusAssertion } =
    await Credential.Status.verifyAndParseStatusAssertion(
      issuerConf,
      rawStatusAssertion,
      credential.credential,
      credential.format as CredentialFormat
    );

  return {
    statusAttestation: rawStatusAssertion.statusAssertion,
    parsedStatusAttestation: parsedStatusAssertion
  };
};

export const shouldRequestStatusAttestation = ({
  storedStatusAttestation
}: StoredCredential) => {
  // When no status attestation is present, request a new one
  if (!storedStatusAttestation) {
    return true;
  }

  switch (storedStatusAttestation.credentialStatus) {
    // We could not determine the status, try to request another attestation
    case "unknown":
      return true;
    // The credential is invalid, no need to request another attestation
    case "invalid":
      return false;
    // When the status attestation is expired request a new one
    case "valid":
      return isAfter(
        new Date(),
        new Date(storedStatusAttestation.parsedStatusAttestation.exp * 1000)
      );
    default:
      throw new Error("Unexpected credential status");
  }
};

/**
 * Shape of a credential status attestation response error.
 */
export const StatusAttestationError = t.intersection([
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
  let sharedPromise: Promise<IssuerConf> | null = null;
  // eslint-disable-next-line functional/no-let
  let timestamp: number = -1;

  return function getIssuerConf(env: Env) {
    if (timestamp + maxAge * 1000 < Date.now() || !sharedPromise) {
      sharedPromise = Credential.Issuance.evaluateIssuerTrust(
        env.WALLET_EAA_PROVIDER_BASE_URL
      ).then(res => res.issuerConf);
      timestamp = Date.now();
    }
    return sharedPromise;
  };
}
