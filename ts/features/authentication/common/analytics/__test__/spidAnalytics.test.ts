import {
  EventProperties,
  trackLoginSpidError,
  trackLoginSpidIdpSelected
} from "../spidAnalytics";

import { AUTH_ERRORS } from "../../components/AuthErrorComponent";
import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("spidAnalytics", () => {
  const mockProps: EventProperties = {
    idp: "test-idp",
    "error message": "Something went wrong",
    flow: "auth"
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (buildEventProperties as jest.Mock).mockReturnValue({ mocked: true });
  });

  const expectTrackCalledWith = (eventName: string) => {
    expect(mixpanelTrack).toHaveBeenCalledWith(eventName, { mocked: true });
  };

  it("tracks ERROR_19 as LOGIN_SPID_ATTEMPTS_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_19, mockProps);
    expectTrackCalledWith("LOGIN_SPID_ATTEMPTS_ERROR");
  });

  it("tracks ERROR_20 as LOGIN_SPID_SECURITY_LEVEL", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_20, mockProps);
    expectTrackCalledWith("LOGIN_SPID_SECURITY_LEVEL");
  });

  it("tracks ERROR_21 as LOGIN_SPID_TIMEOUT_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_21, mockProps);
    expectTrackCalledWith("LOGIN_SPID_TIMEOUT_ERROR");
  });

  it("tracks ERROR_22 as LOGIN_SPID_DATA_SHARING_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_22, mockProps);
    expectTrackCalledWith("LOGIN_SPID_DATA_SHARING_ERROR");
  });

  it("tracks ERROR_23 as LOGIN_SPID_IDENTITY_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_23, mockProps);
    expectTrackCalledWith("LOGIN_SPID_IDENTITY_ERROR");
  });

  it("tracks ERROR_25 as LOGIN_SPID_CANCEL_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.ERROR_25, mockProps);
    expectTrackCalledWith("LOGIN_SPID_CANCEL_ERROR");
  });

  it("tracks CIEID_OPERATION_CANCEL as LOGIN_SPID_CANCEL_ERROR", () => {
    trackLoginSpidError(AUTH_ERRORS.CIEID_OPERATION_CANCEL, mockProps);
    expectTrackCalledWith("LOGIN_SPID_CANCEL_ERROR");
  });

  it("tracks CIEID_IOS_OPERATION_CANCELED_MESSAGE as LOGIN_SPID_CANCEL_ERROR", () => {
    trackLoginSpidError(
      AUTH_ERRORS.CIEID_IOS_OPERATION_CANCELED_MESSAGE,
      mockProps
    );
    expectTrackCalledWith("LOGIN_SPID_CANCEL_ERROR");
  });

  it("tracks MISSING_SAML_RESPONSE as LOGIN_ERROR_MESSAGE", () => {
    trackLoginSpidError(AUTH_ERRORS.MISSING_SAML_RESPONSE, mockProps);
    expectTrackCalledWith("LOGIN_ERROR_MESSAGE");
  });

  it("tracks unknown code as LOGIN_SPID_GENERIC_ERROR", () => {
    trackLoginSpidError("UNKNOWN_CODE", mockProps);
    expectTrackCalledWith("LOGIN_SPID_GENERIC_ERROR");
  });

  it("tracks login spid idp selected", async () => {
    const mockState = { some: "state" } as any;
    await trackLoginSpidIdpSelected("test-idp", mockState);

    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_METHOD",
      value: "test-idp"
    });

    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_SPID_IDP_SELECTED", {
      mocked: true
    });
  });
});
