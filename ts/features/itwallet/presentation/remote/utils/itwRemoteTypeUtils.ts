import * as E from "fp-ts/lib/Either";
import { Credential } from "@pagopa/io-react-native-wallet";

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

export type ItwRemoteRequestPayload =
  ReturnType<Credential.Presentation.StartFlow>;

/**
 * Alias for the Relying Party's Entity Configuration type
 */
export type RelyingPartyConfiguration = Awaited<
  ReturnType<Credential.Presentation.EvaluateRelyingPartyTrust>
>["rpConf"];

/**
 * Type representing the parsed DCQL query with the presentation details
 */
export type PresentationDetails = Awaited<
  ReturnType<Credential.Presentation.EvaluateDcqlQuery>
>;
