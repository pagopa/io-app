import { Errors } from "@pagopa/io-react-native-wallet";

import * as Mixpanel from "../../../../../mixpanel";
import { ITW_ISSUANCE_ERRORS_EVENTS } from "../enum";
import { trackItwIdRequestFailure } from "../index";

const baseProperties = {
  ITW_ID_method: "cieId",
  caused_by: "CredentialIssuer",
  itw_flow: "L3",
  type: "ISSUER_GENERIC"
} as const;

describe("issuance analytics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("tracks the message of WebView errors, as Error has no enumerable props", () => {
    const mixpanelTrack = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    trackItwIdRequestFailure({
      ...baseProperties,
      reason: new Error("CIEID_WEBVIEW_HTTP_ERROR_500")
    });

    expect(mixpanelTrack).toHaveBeenCalledWith(
      ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_REQUEST_FAILURE,
      expect.objectContaining({
        reason: {
          code: "WEBVIEW_ERROR",
          errorDescription: "CIEID_WEBVIEW_HTTP_ERROR_500"
        }
      })
    );
  });

  it("leaves other reasons untouched", () => {
    const mixpanelTrack = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();
    const reason = new Errors.IssuerResponseError({
      message: "Issuer failure",
      reason: { error: "issuer_error" },
      statusCode: 500
    });

    trackItwIdRequestFailure({ ...baseProperties, reason });

    expect(mixpanelTrack).toHaveBeenCalledWith(
      ITW_ISSUANCE_ERRORS_EVENTS.ITW_ID_REQUEST_FAILURE,
      expect.objectContaining({ reason })
    );
  });
});
