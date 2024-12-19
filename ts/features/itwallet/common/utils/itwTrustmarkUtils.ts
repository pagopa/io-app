import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import { WellKnownClaim } from "./itwClaimsUtils";
import { ParsedCredential, StoredCredential } from "./itwTypesUtils";
import { WIA_KEYTAG } from "./itwCryptoContextUtils";

/**
 * Returns the document number for a credential, if applicable
 * @param credential the credential from which to extract the document number
 * @returns a string representing the document number, undefined if not found
 */
export const getCredentialDocumentNumber = (
  parsedCredential: ParsedCredential
): string | undefined => {
  const documentNumberClaim = parsedCredential[WellKnownClaim.document_number];
  return documentNumberClaim?.value as string;
};

export const getCredentialTrustmark = async (
  walletInstanceAttestation: string,
  credential: StoredCredential,
  verifierUrl: string
) => {
  /**
   * Create the crypto context for the WIA
   */
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  /**
   * Get the document number from the credential
   */
  const docNumber = getCredentialDocumentNumber(credential.parsedCredential);

  /**
   * Generate the trustmark
   */
  const { jwt, expirationTime } =
    await Credential.Trustmark.getCredentialTrustmark({
      walletInstanceAttestation,
      wiaCryptoContext,
      credentialType: credential.credentialType,
      docNumber
    });

  return {
    jwt,
    expirationTime,
    url: `${verifierUrl}?tm=${jwt}`
  };
};
