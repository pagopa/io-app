import {
  createCryptoContextFor,
  Credential as LegacyCredential
} from "@pagopa/io-react-native-wallet";
import { Credential } from "@pagopa/io-react-native-wallet-v2";
import { isAfter } from "date-fns";
import * as t from "io-ts";
import { LegacyIssuerConfiguration, StoredCredential } from "./itwTypesUtils";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";

type IssuerConf = Awaited<
  ReturnType<Credential.Issuance.EvaluateIssuerTrust>
>["issuerConf"];

// TODO: [SIW-2530] remove after full migration to API 1.0
// Maybe rename to status assertion?
const getLegacyCredentialStatusAttestation = async (
  credential: StoredCredential
) => {
  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);

  const rawStatusAttestation = await LegacyCredential.Status.statusAttestation(
    credential.issuerConf as LegacyIssuerConfiguration,
    credential.credential,
    credentialCryptoContext
  );

  const { parsedStatusAttestation } =
    await LegacyCredential.Status.verifyAndParseStatusAttestation(
      credential.issuerConf as LegacyIssuerConfiguration,
      rawStatusAttestation,
      { credentialCryptoContext }
    );

  return {
    statusAttestation: rawStatusAttestation.statusAttestation,
    parsedStatusAttestation
  };
};

export const getCredentialStatusAttestation = async (
  credential: StoredCredential,
  newApiEnabled = false // TODO: [SIW-2530] remove after full migration to API 1.0
) => {
  if (!newApiEnabled) {
    return getLegacyCredentialStatusAttestation(credential);
  }

  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const rawStatusAssertion = await Credential.Status.statusAssertion(
    credential.issuerConf as IssuerConf,
    credential.credential,
    credential.format,
    { credentialCryptoContext, wiaCryptoContext }
  );

  const { parsedStatusAssertion } =
    await Credential.Status.verifyAndParseStatusAssertion(
      credential.issuerConf as IssuerConf,
      rawStatusAssertion,
      credential.credential,
      credential.format
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
