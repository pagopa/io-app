import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import {
  CatalogueTranslations,
  DigitalCredentialMetadata
} from "./itwCredentialsCatalogueUtils.ts";
import { CredentialType } from "./itwMocksUtils.ts";
import { CredentialMetadata } from "./itwTypesUtils.ts";

/**
 * Some credentials do not receive the data source ("Origine dei dati") from the
 * catalogue and must always display a fixed value. This maps those credential
 * types to the value that should be shown wherever the auth source is rendered
 * (credential card header and issuance metadata list).
 */
const FORCED_AUTH_SOURCE_BY_TYPE: Partial<Record<CredentialType, string>> = {
  [CredentialType.PROOF_OF_AGE]: "IT-Wallet ID"
};

/**
 * Returns the forced data source value for credentials whose authentic source
 * is not provided by the catalogue, or `undefined` when the standard catalogue
 * resolution should be used.
 *
 * @param credentialType - The credential type to resolve the override for.
 */
export const getForcedItwAuthSource = (
  credentialType: string
): string | undefined =>
  FORCED_AUTH_SOURCE_BY_TYPE[credentialType as CredentialType];

/**
 * Get the localized auth source organization name for a catalogue credential.
 * Resolves `organization_name_l10n_id` via the provided translations when available,
 * falling back to the static `organization_name` field.
 *
 * @param credential - Catalogue metadata for the credential
 * @param translations - Optional flat translations map for the current locale (l10n_id → string)
 */
export const getItwAuthSource = (
  credential: DigitalCredentialMetadata,
  translations?: Record<string, string>
) =>
  pipe(
    credential.authentic_sources?.[0],
    O.fromNullable,
    O.map(source => {
      const l10nName =
        source.organization_name_l10n_id &&
        translations?.[source.organization_name_l10n_id];
      return l10nName ?? source.organization_name;
    }),
    O.toUndefined
  );

/**
 * Get the authentication source for a given credential based on its configuration.
 * This is only valid for legacy credentials (Documenti su IO)
 * @param credential - The credential to get the authentication source for.
 */
export const getAuthSource = (credential: CredentialMetadata) =>
  pipe(
    credential.issuerConf.credential_configurations_supported?.[
      credential.credentialId
    ],
    O.fromNullable,
    O.map(config => config.authentic_source),
    O.toUndefined
  );

// Re-export for callers that need the full translations map type
export type { CatalogueTranslations };
