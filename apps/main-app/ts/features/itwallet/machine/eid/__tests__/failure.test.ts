import { Errors } from "@pagopa/io-react-native-wallet";

import { IssuanceFailureType, mapEventToFailure } from "../failure";

describe("mapEventToFailure", () => {
  const taxIdCodeMismatchError = new Errors.IssuerResponseError({
    message: "Identity mismatch",
    reason: { error: "tax_id_code_mismatch" },
    statusCode: 400
  });

  const identityMismatchScenarios = [
    {
      name: "CIE+PIN",
      identificationMode: "ciePin",
      expectedType: IssuanceFailureType.NOT_MATCHING_IDENTITY
    },
    {
      name: "SPID+CIE",
      identificationMode: "spid",
      expectedType: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY
    },
    {
      name: "CieID",
      identificationMode: "cieId",
      expectedType: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY
    },
    {
      name: "missing identification mode",
      identificationMode: undefined,
      expectedType: IssuanceFailureType.CIE_NOT_MATCHING_AUTHENTICATION_IDENTITY
    }
  ] as const;

  test.each(identityMismatchScenarios)(
    "maps tax id code mismatch errors for $name to $expectedType",
    ({ identificationMode, expectedType }) => {
      expect(
        mapEventToFailure(
          {
            type: "error",
            scope: "cie-mrtd-pop",
            error: taxIdCodeMismatchError
          },
          identificationMode
        )
      ).toStrictEqual({
        type: expectedType,
        reason: taxIdCodeMismatchError
      });
    }
  );

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
