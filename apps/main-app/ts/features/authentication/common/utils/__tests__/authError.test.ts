import I18n from "i18next";

import { AUTH_ERRORS, getAuthErrorDetails } from "../authError";

describe("getAuthErrorDetails", () => {
  const genericDetails = {
    pictogram: "umbrella",
    title: I18n.t("authentication.auth_errors.generic.title"),
    subtitle: I18n.t("authentication.auth_errors.generic.subtitle")
  };

  const mappedCases = [
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_19,
      expected: {
        pictogram: "passcode",
        title: I18n.t("authentication.auth_errors.error_19.title"),
        subtitle: I18n.t("authentication.auth_errors.error_19.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_20,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_20.title"),
        subtitle: I18n.t("authentication.auth_errors.error_20.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_21,
      expected: {
        pictogram: "time",
        title: I18n.t("authentication.auth_errors.error_21.title"),
        subtitle: I18n.t("authentication.auth_errors.error_21.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_22,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_22.title"),
        subtitle: I18n.t("authentication.auth_errors.error_22.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_23,
      expected: {
        pictogram: "attention",
        title: I18n.t("authentication.auth_errors.error_23.title"),
        subtitle: I18n.t("authentication.auth_errors.error_23.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_25,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.ERROR_1001,
      expected: {
        pictogram: "identityCheck",
        title: I18n.t("authentication.auth_errors.error_1001.title"),
        subtitle: I18n.t("authentication.auth_errors.error_1001.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.CIEID_OPERATION_CANCEL,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.CIEID_IOS_OPERATION_CANCELED_MESSAGE,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.error_25.title"),
        subtitle: I18n.t("authentication.auth_errors.error_25.subtitle")
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.CIEID_IOS_INVALID_OPERATION_MESSAGE,
      expected: genericDetails
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.MISSING_SAML_RESPONSE,
      expected: {
        pictogram: "accessDenied",
        title: I18n.t("authentication.auth_errors.missing_saml_response.title"),
        subtitle: I18n.t(
          "authentication.auth_errors.missing_saml_response.subtitle"
        )
      }
    },
    {
      errorCodeOrMessage: AUTH_ERRORS.GENERIC_ERROR,
      expected: genericDetails
    }
  ];

  test.each(mappedCases)(
    "returns the mapped details for $errorCodeOrMessage",
    ({ errorCodeOrMessage, expected }) => {
      expect(getAuthErrorDetails(errorCodeOrMessage)).toEqual(expected);
    }
  );

  it("falls back to the generic error details when the code is not mapped", () => {
    expect(getAuthErrorDetails("some_unmapped_raw_error")).toEqual(
      genericDetails
    );
  });

  it("falls back to the generic error details when no code is provided", () => {
    expect(getAuthErrorDetails(undefined)).toEqual(genericDetails);
  });
});
