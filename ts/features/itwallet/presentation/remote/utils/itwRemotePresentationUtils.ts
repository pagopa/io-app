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
import { assert } from "../../../../../utils/assert";
import {
  EnrichedPresentationDetails,
  ItwRemoteQrRawPayload,
  PresentationDetails
} from "./itwRemoteTypeUtils";

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
    const credential = credentialsByType[details.vct];

    // This should never happen if we pass the DCQL query evaluation
    assert(credential, `${details.vct} credential was not found in the wallet`);

    const parsedClaims = parseClaims(credential.parsedCredential, {
      exclude: [WellKnownClaim.unique_id]
    });

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
export const getInvalidCredentials = (credentials: Array<StoredCredential>) =>
  credentials
    .filter(c => !validCredentialStatuses.includes(getCredentialStatus(c)))
    .map(c => c.credentialType);
