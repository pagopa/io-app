import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { DigitalCredentialMetadata } from "./itwCredentialsCatalogueUtils.ts";
import { CredentialMetadata } from "./itwTypesUtils.ts";

export const getItwAuthSource = (credential: DigitalCredentialMetadata) =>
  pipe(
    credential.authentic_sources?.[0],
    O.fromNullable,
    O.map(source => source.organization_name),
    O.toUndefined
  );

/**
 * Get the authentication source for a given credential based on its configuration.
 * This is only valid for legacy credentials (Documenti su IO)
 * @param credential - The credential to get the authentication source for.
 */
export const getAuthSource = ({
  credentialId,
  issuerConf
}: CredentialMetadata) =>
  pipe(
    issuerConf.openid_credential_issuer.credential_configurations_supported?.[
      credentialId
    ],
    O.fromNullable,
    O.map(config => config.authentic_source),
    O.toUndefined
  );
