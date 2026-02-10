import { createSelector } from "reselect";
import { makeSelectAllCredentials } from "../../../../credentials/store/selectors";
import {
  CredentialFormat,
  CredentialMetadata,
  MdocSupportedCredentialConfiguration
} from "../../../../common/utils/itwTypesUtils";

/**
 * Returns the credentials object from the itw credentials state.
 * Only MDOC credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
const itwCredentialsAsMdocSelector = makeSelectAllCredentials(
  CredentialFormat.MDOC
);

/**
 * Returns the credentials object by doc type.
 * Only MDOC credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object by doc type.
 */
export const itwCredentialsByTypeSelector = createSelector(
  itwCredentialsAsMdocSelector,
  (credentials): Record<string, CredentialMetadata> =>
    Object.values(credentials).reduce<Record<string, CredentialMetadata>>(
      (acc, credential) => {
        const { credentialId, issuerConf } = credential;

        const doctype = (
          issuerConf.openid_credential_issuer
            .credential_configurations_supported[
            credentialId
          ] as MdocSupportedCredentialConfiguration
        ).doctype;

        return {
          ...acc,
          [doctype]: credential
        };
      },
      {}
    )
);
