import { Credential } from "@pagopa/io-react-native-wallet";
import * as E from "fp-ts/lib/Either";
import {
  WellKnownClaim,
  parseClaims
} from "../../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import { validCredentialStatuses } from "../../../common/utils/itwCredentialUtils";
import { isDefined } from "../../../../../utils/guards";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  EnrichedPresentationDetails,
  ItwRemoteQrRawPayload,
  PresentationDetails
} from "./itwRemoteTypeUtils";

/**
 * Maps a vct name to the corresponding credential type, used in UI contexts
 * Note: although this list is unlikely to change, you should ensure to have
 * a fallback when dealing with this list to prevent unwanted behaviours
 */
const credentialTypesByVct: { [vct: string]: CredentialType } = {
  personidentificationdata: CredentialType.PID,
  mdl: CredentialType.DRIVING_LICENSE,
  europeandisabilitycard: CredentialType.EUROPEAN_DISABILITY_CARD,
  europeanhealthinsurancecard: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
  education_degree: CredentialType.EDUCATION_DEGREE,
  education_enrollment: CredentialType.EDUCATION_ENROLLMENT,
  residency: CredentialType.RESIDENCY
};

/**
 * Utility function which returns the credentila type associated to the provided vct
 * @param vct credential vct
 * @returns credential type as string, undefine if not found
 */
export const getCredentialTypeByVct = (vct: string): string | undefined => {
  // Extracts the name from the vct. For example:
  // From "https://pre.ta.wallet.ipzs.it/vct/v1.0.0/personidentificationdata"
  // Gets "/vct/v1.0.0/personidentificationdata"
  const match = vct.match(/\/vct(.*)\/([^/]+)$/);
  // Extracts "personidentificationdata"
  const name = match ? match[2] : null;
  // Tries to match the extracted value to a credential type
  return name ? credentialTypesByVct[name] : undefined;
};

/**
 * Validate the QR code parameters by starting the presentation flow.
 *
 * @param params The raw parameters extracted from the QR code.
 * @returns An Either type with the validated parameters or the error.
 */
export const validateItwPresentationQrCodeParams = (
  params: ItwRemoteQrRawPayload
) =>
  E.tryCatch(
    () => Credential.Presentation.startFlowFromQR(params),
    e =>
      e instanceof Error
        ? e
        : new Error("Unexpected error in QR code validation")
  );

/**
 * Enrich the result of the presentation request evaluation with localized claim names for UI display.
 *
 * @param presentationDetails The presentation details with the credentials to present
 * @param credentialsByType A credentials map to extract the localized claim names
 * @returns The enriched presentation details
 */
export const enrichPresentationDetails = (
  presentationDetails: PresentationDetails,
  credentialsByType: Record<string, StoredCredential | undefined>
): EnrichedPresentationDetails =>
  presentationDetails.map(details => {
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

    console.log("Parsed claims for credential", details.id, parsedClaims);

    return {
      ...details,
      // Only include claims that are part of the parsed credential
      // This ensures that technical claims like `iat` are not displayed to the user
      claimsToDisplay: details.requiredDisclosures
        .map(([, claimName]) => parsedClaims.find(({ id }) => id === claimName))
        .filter(isDefined)
    };
  });

type PresentationDetail = EnrichedPresentationDetails[number];

/**
 * Given the details of a presentation, group credentials by purpose for the UI.
 *
 * @param presentationDetails The details of the presentation with the requested credentials
 * @returns An object with required and optional credentials grouped by purpose
 */
export const groupCredentialsByPurpose = (
  presentationDetails: EnrichedPresentationDetails
) => {
  const required = {} as Record<string, Array<PresentationDetail>>;
  const optional = {} as Record<string, Array<PresentationDetail>>;

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
 * Return a list of credential types that have an invalid status.
 */
export const getInvalidCredentials = (
  presentationDetails: PresentationDetails,
  credentialsByType: Record<string, StoredCredential | undefined>
) =>
  presentationDetails
    // Retries the type from the VCT map
    .map(({ vct }) => getCredentialTypeByVct(vct))
    // Removes undefined
    .filter(isDefined)
    // Retrieve the credential using the type from the previous step
    .map(type => credentialsByType[type])
    // Removes undefined
    .filter(isDefined)
    // Removes credential with valid statuses
    .filter(c => !validCredentialStatuses.includes(getCredentialStatus(c)))
    // Gets the invalid credential's type
    .map(c => c.credentialType);
