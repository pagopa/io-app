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
