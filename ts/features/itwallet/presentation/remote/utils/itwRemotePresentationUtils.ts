import { Credential } from "@pagopa/io-react-native-wallet";
import * as E from "fp-ts/lib/Either";
import {
  ClaimDisplayFormat,
  getClaimsFullLocale
} from "../../../common/utils/itwClaimsUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import {
  EnrichedPresentationDetails,
  ItwRemoteRequestPayload,
  PresentationDetails
} from "./itwRemoteTypeUtils";

/**
 * Validate the QR code parameters by starting the presentation flow.
 *
 * @param params The raw parameters extracted from the QR code.
 * @returns An Either type with the validated parameters or the error.
 */
export const validateItwPresentationQrCodeParams = (params: {
  [K in keyof ItwRemoteRequestPayload]?: ItwRemoteRequestPayload[K] | null;
}) =>
  E.tryCatch(
    () =>
      Credential.Presentation.startFlowFromQR({
        clientId: params.clientId ?? undefined,
        requestUri: params.requestUri ?? undefined,
        requestUriMethod: params.requestUriMethod ?? undefined,
        state: params.state ?? undefined
      }),
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
  credentialsByType: Record<string, StoredCredential>
): EnrichedPresentationDetails => {
  const claimsLocale = getClaimsFullLocale();

  return presentationDetails.map(c => {
    const credential = credentialsByType[c.vct];
    return {
      ...c,
      claimsToDisplay: c.requiredDisclosures.map<ClaimDisplayFormat>(
        ([, claimName, claimValue]) => {
          const claimDisplayName = credential?.parsedCredential[claimName].name;
          return {
            id: claimName,
            label:
              typeof claimDisplayName === "string"
                ? claimDisplayName
                : claimDisplayName?.[claimsLocale] ?? claimName,
            value: claimValue as string
          };
        }
      )
    };
  });
};

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
