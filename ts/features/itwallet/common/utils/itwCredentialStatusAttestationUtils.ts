import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { addHours, isAfter } from "date-fns";
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

export const isStatusAttestationMissingOrExpired = ({
  statusAttestation
}: StoredCredential) => {
  if (
    !statusAttestation ||
    statusAttestation.parsedStatusAttestation === null
  ) {
    return true;
  }
  return isAfter(
    new Date(),
    addHours(new Date(statusAttestation.parsedStatusAttestation.exp * 1000), 24)
  );
};
