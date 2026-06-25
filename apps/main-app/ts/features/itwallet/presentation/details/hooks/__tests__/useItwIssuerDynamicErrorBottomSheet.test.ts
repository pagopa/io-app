import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { getIssuerDynamicErrorBottomSheetContentConfig } from "../useItwIssuerDynamicErrorBottomSheet";

describe("getIssuerDynamicErrorBottomSheetContentConfig", () => {
  it("returns updateAndRemove for expired driving licenses", () => {
    const result = getIssuerDynamicErrorBottomSheetContentConfig(
      ItwStoredCredentialsMocks.mdl,
      "expired"
    );

    expect(result).toEqual({
      actionMode: "updateAndRemove",
      showDrivingLicenseExtraContent: true
    });
  });

  it("returns updateAndRemove only for credential_invalid issuer errors", () => {
    const result = getIssuerDynamicErrorBottomSheetContentConfig(
      {
        ...ItwStoredCredentialsMocks.mdl,
        storedStatusAssertion: {
          credentialStatus: "invalid",
          errorCode: "credential_invalid"
        }
      },
      "invalid"
    );

    expect(result).toEqual({
      actionMode: "updateAndRemove",
      showDrivingLicenseExtraContent: false
    });
  });

  it("returns acknowledgeOnly for credential_suspended issuer errors", () => {
    const result = getIssuerDynamicErrorBottomSheetContentConfig(
      {
        ...ItwStoredCredentialsMocks.mdl,
        storedStatusAssertion: {
          credentialStatus: "invalid",
          errorCode: "credential_suspended"
        }
      },
      "invalid"
    );

    expect(result).toEqual({
      actionMode: "acknowledgeOnly",
      showDrivingLicenseExtraContent: false
    });
  });

  it("returns removeOnly for other invalid driving license issuer errors", () => {
    const result = getIssuerDynamicErrorBottomSheetContentConfig(
      {
        ...ItwStoredCredentialsMocks.mdl,
        storedStatusAssertion: {
          credentialStatus: "invalid",
          errorCode: "driving_license_suspended"
        }
      },
      "invalid"
    );

    expect(result).toEqual({
      actionMode: "removeOnly",
      showDrivingLicenseExtraContent: false
    });
  });
});
