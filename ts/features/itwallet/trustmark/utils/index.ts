import {
  createCryptoContextFor,
  Credential
} from "@pagopa/io-react-native-wallet";
import {
  CredentialMetadata,
  ParsedCredential
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
 * Maps a credential type to the correct type for the trustmark generation.
 * This type is used to display the correct credential name in the verifier website.
 * @param credential The stored credential
 * @returns The credential type for trustmark generation
 */
const getCredentialTypeForTrustmark = ({
  credentialType
}: CredentialMetadata) => {
  const trustmarkCredentialTypes: Record<string, string> = {
    mDL: "MDL"
  };
  return trustmarkCredentialTypes[credentialType] ?? credentialType;
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
  metadata: CredentialMetadata
) => {
  /**
   * Create the crypto context for the WIA
   */
  const wiaCryptoContext = createCryptoContextFor(WIA_KEYTAG);

  /**
   * Get the document number from the credential
   */
  const docNumber = getCredentialDocumentNumber(metadata.parsedCredential);

  /**
   * Generate the trustmark
   */
  const { jwt, expirationTime } =
    await Credential.Trustmark.getCredentialTrustmark({
      walletInstanceAttestation,
      wiaCryptoContext,
      docNumber,
      credentialType: getCredentialTypeForTrustmark(metadata)
    });

  return {
    jwt,
    expirationTime,
    url: `${VERIFIER_BASE_URL}?tm=${jwt}`
  };
};
