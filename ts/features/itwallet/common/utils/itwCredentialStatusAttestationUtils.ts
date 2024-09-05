import {
  createCryptoContextFor,
  Credential,
  Errors
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import { StoredCredential } from "./itwTypesUtils";

export const fetchCredentialStatusAttestation = async (
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
 * This function updates the given credential with a fresh status attestation.
 *
 * Note that it makes a request to the credential issuer.
 */
export const updateCredentialWithStatusAttestation = async (
  credential: StoredCredential
): Promise<StoredCredential> => {
  try {
    const { parsedStatusAttestation, statusAttestation } =
      await fetchCredentialStatusAttestation(credential);

    return {
      ...credential,
      storedStatusAttestation: {
        credentialStatus: "valid",
        statusAttestation,
        parsedStatusAttestation: parsedStatusAttestation.payload
      }
    };
  } catch (error) {
    return {
      ...credential,
      storedStatusAttestation: {
        credentialStatus:
          error instanceof Errors.StatusAttestationInvalid
            ? "invalid" // The credential was revoked
            : "unknown" // We do not have enough information on the status, the error was unexpected
      }
    };
  }
};
