import I18n from "i18next";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { CredentialType } from "./itwMocksUtils.ts";
import { StoredCredential } from "./itwTypesUtils.ts";

/**
 * Mapping of credential types to their respective authentication sources.
 * This is temporary until we wait the implementation of the VCT/Credential catalog
 * Add more mappings as needed.
 */
const ItwCredentialAuthSource: {
  [type: string]: string;
} = {
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: I18n.t(
    "features.itWallet.presentation.authSource.mef"
  ),
  [CredentialType.EUROPEAN_DISABILITY_CARD]: I18n.t(
    "features.itWallet.presentation.authSource.inps"
  ),
  [CredentialType.DRIVING_LICENSE]: I18n.t(
    "features.itWallet.presentation.authSource.mit"
  ),
  [CredentialType.EDUCATION_DEGREE]: I18n.t(
    "features.itWallet.presentation.authSource.anis"
  ),
  [CredentialType.EDUCATION_ENROLLMENT]: I18n.t(
    "features.itWallet.presentation.authSource.anis"
  )
};

/**
 * Get the authentication source for a given credential based on its type.
 * This is temporary until we wait the implementation of the VCT/Credential catalog
 * @param credential - The credential to get the authentication source for.
 */
export const getItwAuthSource = (
  credential: StoredCredential
): string | undefined => ItwCredentialAuthSource[credential.credentialType];

/**
 * Get the authentication source for a given credential based on its configuration.
 * This is only valid for legacy credentials (Documenti su IO)
 * @param credential - The credential to get the authentication source for.
 */
export const getAuthSource = (credential: StoredCredential) =>
  pipe(
    credential.issuerConf.openid_credential_issuer
      .credential_configurations_supported?.[credential.credentialId],
    O.fromNullable,
    O.map(config => config.authentic_source),
    O.toUndefined
  );
