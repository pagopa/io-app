import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import { itwEaaProviderBaseUrl } from "../../../../config";
import { StoredCredential } from "./itwTypesUtils";

export const getCredentialStatusAttestation = async (
  credential: string,
  credentialKeyTag: string
) => {
  const credentialCryptoContext = createCryptoContextFor(credentialKeyTag);

  const { issuerConf } = await Credential.Status.evaluateIssuerTrust(
    itwEaaProviderBaseUrl
  );

  const rawStatusAttestation = await Credential.Status.statusAttestation(
    issuerConf,
    credential,
    credentialCryptoContext
  );

  const { parsedStatusAttestation } =
    await Credential.Status.verifyAndParseStatusAttestation(
      issuerConf,
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
