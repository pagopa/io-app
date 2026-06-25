import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as E from "fp-ts/lib/Either";
import { isDefined } from "../../../../../utils/guards";
import {
  WellKnownClaim,
  parseClaims
} from "../../../common/utils/itwClaimsUtils";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import { validCredentialStatuses } from "../../../common/utils/itwCredentialUtils";
import { getIoWallet } from "../../../common/utils/itwIoWallet";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { ItwRemoteCredentialCombination } from "../analytics/utils/types";
import {
  EnrichedPresentationDetails,
  ItwRemoteQrRawPayload,
  PresentationDetails
} from "./itwRemoteTypeUtils";

// TODO: [SIW-3998] Remove when MDOC remote presentation will be supported
const isPresentationDetailSdJwt = <T extends PresentationDetails[number]>(
  input: T
): input is Extract<T, { format: "dc+sd-jwt" }> => input.format === "dc+sd-jwt";

/**
 * Maps a vct name to the corresponding credential type, used in UI contexts
 * Note: although this list is unlikely to change, you should ensure to have a
 * fallback when dealing with this list to prevent unwanted behaviours
 */
const credentialTypesByVct: { [vct: string]: CredentialType } = {
  personidentificationdata: CredentialType.PID,
  pid: CredentialType.PID,
  mdl: CredentialType.DRIVING_LICENSE,
  europeandisabilitycard: CredentialType.EUROPEAN_DISABILITY_CARD,
  europeanhealthinsurancecard: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
  education_degree: CredentialType.EDUCATION_DEGREE,
  education_enrollment: CredentialType.EDUCATION_ENROLLMENT,
  residency: CredentialType.RESIDENCY
};

/**
 * Utility function which returns the credentila type associated to the provided
 * vct
 *
 * @param vct Credential vct
 * @returns Credential type as string, undefine if not found
 */
export const getCredentialTypeByVct = (vct: string): string | undefined => {
  // Extracts the name from the vct. The https vct is deprecated and will be removed in the future.
  const match =
    vct.match(/^urn:[^:]+:([^:]+)/) || // urn:it-wallet:pid:1 -> urn:it-wallet:pid
    vct.match(/\/vct.*\/([^/]+)$/); // https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata -> /vct/v1.0.0/personidentificationdata
  // Extracts "personidentificationdata"
  const name = match ? match[1] : null;
  // Tries to match the extracted value to a credential type
  return name ? credentialTypesByVct[name.toLowerCase()] : undefined;
};

/**
 * Validate the QR code parameters by starting the presentation flow.
 *
 * @param params The raw parameters extracted from the QR code.
 * @returns An Either type with the validated parameters or the error.
 */
export const validateItwPresentationQrCodeParams = (
  itwVersion: ItwVersion,
  params: ItwRemoteQrRawPayload
) =>
  E.tryCatch(
    () => getIoWallet(itwVersion).RemotePresentation.startFlowFromQR(params),
    e =>
      e instanceof Error
        ? e
        : new Error("Unexpected error in QR code validation")
  );

/**
 * Enrich the result of the presentation request evaluation with localized claim
 * names for UI display.
 *
 * @param presentationDetails The presentation details with the credentials to
 *   present
 * @param credentialsByType A credentials map to extract the localized claim
 *   names
 * @returns The enriched presentation details
 */
export const enrichPresentationDetails = (
  presentationDetails: PresentationDetails,
  credentialsByType: Record<string, CredentialMetadata | undefined>
): EnrichedPresentationDetails =>
  presentationDetails
    .filter(isPresentationDetailSdJwt) // TODO: [SIW-3998] Support MDOC remote presentation
    .map(details => {
      const credentialType = getCredentialTypeByVct(details.vct);
      const credential = credentialType && credentialsByType[credentialType];

      // When the credential is not found, it is not available as a `StoredCredential`, so we hide it from the user.
      // The raw credential is still used for the presentation. Currently this only happens for the Wallet Attestation.
      if (!credential) {
        return {
          ...details,
          claimsToDisplay: [] // Hide from user
        };
      }

      const parsedClaims = parseClaims(credential.parsedCredential, {
        exclude: [WellKnownClaim.unique_id]
      });

      return {
        ...details,
        // Only include claims that are part of the parsed credential
        // This ensures that technical claims like `iat` are not displayed to the user
        claimsToDisplay: details.requiredDisclosures
          .map(disclosure =>
            parsedClaims.find(({ id }) => id === disclosure.name)
          )
          .filter(isDefined)
      };
    });

/**
 * Given the details of a presentation, group credentials by purpose for the UI.
 *
 * @param presentationDetails The details of the presentation with the requested
 *   credentials
 * @returns An object with required and optional credentials grouped by purpose
 */
export const groupCredentialsByPurpose = (
  presentationDetails: EnrichedPresentationDetails
) => {
  type Group = Record<string, EnrichedPresentationDetails>;
  const required: Group = {};
  const optional: Group = {};

  for (const item of presentationDetails) {
    for (const purpose of item.purposes) {
      const target = purpose.required ? required : optional;
      // eslint-disable-next-line functional/immutable-data
      target[purpose.description ?? ""] ??= [];
      // eslint-disable-next-line functional/immutable-data
      target[purpose.description ?? ""].push(item);
    }
  }

  return {
    required: Object.entries(required).map(([purpose, credentials]) => ({
      purpose,
      credentials
    })),
    optional: Object.entries(optional).map(([purpose, credentials]) => ({
      purpose,
      credentials
    }))
  };
};

/**
 * Determines whether a requested credential cannot be presented REMOTELY.
 *
 * Realigned presentation rules (proximity is never inhibited): - A non-valid
 * PID (expired/jwtExpired/revoked/unknown) cannot be presented remotely. It
 * remains presentable in proximity, where the verifier decides. - For any other
 * credential only revocation (`invalid`) blocks: expiry never does, as the
 * Relying Party is responsible for verifying it.
 */
const isInvalidForRemotePresentation = (
  credential: CredentialMetadata
): boolean => {
  const status = getCredentialStatus(credential);
  return credential.credentialType === CredentialType.PID
    ? !validCredentialStatuses.includes(status)
    : status === "invalid";
};

/** Return a list of credential types that cannot be presented remotely. */
export const getInvalidCredentials = (
  presentationDetails: PresentationDetails,
  credentialsByType: Record<string, CredentialMetadata | undefined>
) =>
  presentationDetails
    .filter(isPresentationDetailSdJwt) // TODO: [SIW-3998] Support MDOC remote presentation
    // Retrieve the type from the VCT map
    .map(({ vct }) => getCredentialTypeByVct(vct))
    // Removes undefined
    .filter(isDefined)
    // Retrieve the credential using the type from the previous step
    .map(type => credentialsByType[type])
    // Removes undefined
    .filter(isDefined)
    // Keeps only the credentials that cannot be presented remotely
    .filter(isInvalidForRemotePresentation)
    // Gets the invalid credential's type
    .map(c => c.credentialType);

/**
 * Derives the credential combination type from the presentation details. Used
 * for analytics tracking to monitor success rates by request type.
 */
export const getRemoteCredentialCombination = (
  presentationDetails: EnrichedPresentationDetails
): ItwRemoteCredentialCombination => {
  const requestedVcts = presentationDetails
    .filter(isPresentationDetailSdJwt) // TODO: [SIW-3998] Support MDOC remote presentation
    .map(d => d.vct);
  const credentialTypes = requestedVcts
    .map(getCredentialTypeByVct)
    .filter(isDefined);

  const hasPid = credentialTypes.includes(CredentialType.PID);
  const hasOtherCredentials = credentialTypes.some(
    t => t !== CredentialType.PID
  );

  if (hasPid && hasOtherCredentials) {
    return "PID_and_credentials";
  }
  if (hasPid) {
    return "PID";
  }
  return "other_credentials";
};

export const enum ClientIdPrefix {
  OPENID_FEDERATION = "openid_federation:",
  X509_HASH = "x509_hash:"
}
