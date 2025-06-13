import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import {
  ParsedCredential,
  StoredCredential
} from "../../common/utils/itwTypesUtils";
import { WellKnownClaim } from "../../common/utils/itwClaimsUtils";
import { WIA_KEYTAG } from "../../common/utils/itwCryptoContextUtils";
import { Env } from "../../common/utils/environment";

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

/**
 * Generates the trustmark URL for a credential.
 * @param env - The environment to use for the verifier base URL
 * @param walletInstanceAttestation - The wallet instance attestation
 * @param credential - The credential to generate the trustmark for
 * @returns the trustmark URL
 */
export const getCredentialTrustmark = async (
  { VERIFIER_BASE_URL }: Env,
  walletInstanceAttestation: string,
  credential: StoredCredential
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
    url: `${VERIFIER_BASE_URL}?tm=${jwt}`
  };
};
