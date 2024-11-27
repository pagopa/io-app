import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import * as t from "io-ts";
import { StoredCredential } from "./itwTypesUtils";

export const getCredentialStatusAttestation = async (
  credential: StoredCredential
) => {
  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);

  const rawStatusAttestation = await Credential.Status.statusAttestation(
    credential.issuerConf,
    credential.credential,
    credentialCryptoContext
  );

  const { parsedStatusAttestation } =
    await Credential.Status.verifyAndParseStatusAttestation(
      credential.issuerConf,
      rawStatusAttestation,
      { credentialCryptoContext }
    );

  return {
    statusAttestation: rawStatusAttestation.statusAttestation,
    parsedStatusAttestation
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
