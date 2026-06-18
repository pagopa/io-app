import { Errors } from "@pagopa/io-react-native-wallet";
import { IssuanceFailureType, mapEventToFailure } from "../failure";

describe("mapEventToFailure", () => {
  it("maps MRTD tax id code mismatch errors to the dedicated failure", () => {
    const error = new Errors.IssuerResponseError({
      message: "MRTD PoP verification failed",
      reason: { error: "tax_id_code_mismatch" },
      statusCode: 400
    });

    expect(
      mapEventToFailure({
        type: "error",
        scope: "cie-mrtd-pop",
        error
      })
    ).toStrictEqual({
      type: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY,
      reason: error
    });
  });

  it("keeps mapping generic issuer errors to ISSUER_GENERIC", () => {
    const error = new Errors.IssuerResponseError({
      message: "Issuer failure",
      reason: { error: "issuer_error" },
      statusCode: 500
    });

    expect(
      mapEventToFailure({
        type: "error",
        scope: "cie-mrtd-pop",
        error
      })
    ).toStrictEqual({
      type: IssuanceFailureType.ISSUER_GENERIC,
      reason: error
    });
  });

  it("keeps mapping unknown errors to UNEXPECTED", () => {
    const error = new Error("Unexpected failure");

    expect(
      mapEventToFailure({
        type: "error",
        scope: "cie-mrtd-pop",
        error
      })
    ).toStrictEqual({
      type: IssuanceFailureType.UNEXPECTED,
      reason: error
    });
  });
});
