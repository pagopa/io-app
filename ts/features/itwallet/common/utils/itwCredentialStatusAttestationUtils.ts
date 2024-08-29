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

  return Credential.Status.verifyAndParseStatusAttestation(
    issuerConf,
    rawStatusAttestation,
    { credentialCryptoContext }
  );
};

export const shouldRequestStatusAttestation = ({
  statusAttestation
}: StoredCredential) => {
  if (!statusAttestation) {
    return true;
  }

  switch (statusAttestation.credentialStatus) {
    // We could not determine the status, try to request another attestation
    case "unknown":
      return true;
    // The credential is invalid, no need to request another attestation
    case "invalid":
      return false;
    // The status attestation is expired, request a new one
    case "valid":
      return isAfter(
        new Date(),
        new Date(statusAttestation.parsedStatusAttestation.exp * 1000)
      );
    default:
      throw new Error("Unexpected credential status");
  }
};
