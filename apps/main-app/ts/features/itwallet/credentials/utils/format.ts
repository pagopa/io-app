import {
  CredentialFormat,
  CredentialMetadata
} from "../../common/utils/itwTypesUtils";

/**
 * Formats a credential may be displayed in, from the most to the least preferred.
 * A credential is often issued in multiple formats at once, but the UI must always render
 * the same one, otherwise its claims (and the status derived from them) would change
 * depending on which copy is read.
 */
export const DISPLAY_FORMAT_PRIORITY: ReadonlyArray<CredentialFormat> = [
  CredentialFormat.SD_JWT,
  CredentialFormat.LEGACY_SD_JWT,
  CredentialFormat.MDOC
];

const getFormatRank = (format: string) => {
  const rank = DISPLAY_FORMAT_PRIORITY.indexOf(format as CredentialFormat);
  return rank === -1 ? DISPLAY_FORMAT_PRIORITY.length : rank;
};

/**
 * Reduces a list of credentials to a single entry per type, keeping the copy in the format
 * with the highest display priority. See {@link DISPLAY_FORMAT_PRIORITY}.
 *
 * @param credentials - The credentials, possibly containing multiple formats of the same type
 * @returns One credential per type, in the format to display
 */
export const pickCredentialsToDisplay = (
  credentials: ReadonlyArray<CredentialMetadata>
): Array<CredentialMetadata> => [
  ...credentials
    .reduce<Map<string, CredentialMetadata>>((acc, credential) => {
      const current = acc.get(credential.credentialType);
      if (
        !current ||
        getFormatRank(credential.format) < getFormatRank(current.format)
      ) {
        acc.set(credential.credentialType, credential);
      }
      return acc;
    }, new Map())
    .values()
];
