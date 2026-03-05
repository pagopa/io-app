import {
  ItwVersion,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";
import { isAfter } from "date-fns";
import * as t from "io-ts";
import { CredentialFormat, StoredCredential } from "./itwTypesUtils";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";
import { getIoWallet } from "./itwIoWallet";

export const getCredentialStatusAssertion = async (
  credential: StoredCredential,
  itwVersion: ItwVersion
) => {
  const ioWallet = getIoWallet(itwVersion);

  if (!ioWallet.CredentialStatus.statusAssertion.isSupported) {
    throw new Error(
      `Status assertion is not supported in IT-Wallet v${itwVersion}`
    );
  }

  const credentialCryptoContext = createCryptoContextFor(credential.keyTag);
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  const rawStatusAssertion =
    await ioWallet.CredentialStatus.statusAssertion.get(
      credential.issuerConf,
      credential.credential,
      credential.format as CredentialFormat,
      { credentialCryptoContext, wiaCryptoContext }
    );

  const { parsedStatusAssertion } =
    await ioWallet.CredentialStatus.statusAssertion.verifyAndParse(
      credential.issuerConf,
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
