import { trackIdentificationAction } from "../index";
import {
  identificationCancel,
  identificationFailure,
  identificationForceLogout,
  identificationPinReset,
  identificationRequest,
  identificationStart,
  identificationSuccess
} from "../../store/actions";
import { PinString } from "../../../../types/PinString";
import { mixpanelTrack } from "../../../../mixpanel";

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../config", () => ({
  mixpanelToken: "test-token"
}));

describe("trackIdentificationAction", () => {
  it("should track 'identificationRequest' action", () => {
    trackIdentificationAction(identificationRequest(true));
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_REQUEST");
  });

  it("should track 'identificationStart' action", () => {
    trackIdentificationAction(identificationStart("123456" as PinString, true));
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_START");
  });

  it("should track 'identificationCancel' action", () => {
    trackIdentificationAction(identificationCancel());
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_CANCEL");
  });

  it("should track 'identificationSuccess' action with payload", () => {
    trackIdentificationAction(identificationSuccess({ isBiometric: true }));
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "IDENTIFICATION_SUCCESS",
      expect.objectContaining({ identification_method: "bio" })
    );
  });

  it("should track 'identificationFailure' action", () => {
    trackIdentificationAction(identificationFailure());
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_FAILURE");
  });

  it("should track 'identificationPinReset' action", () => {
    trackIdentificationAction(identificationPinReset());
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_PIN_RESET");
  });

  it("should track 'identificationForceLogout' action", () => {
    trackIdentificationAction(identificationForceLogout());
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_FORCE_LOGOUT");
  });

  it("should track 'identificationSuccess' with proper parameters", () => {
    trackIdentificationAction(identificationSuccess({ isBiometric: true }));
    expect(mixpanelTrack).toHaveBeenCalledWith("IDENTIFICATION_SUCCESS", {
      event_category: "UX",
      event_type: "confirm",
      flow: undefined,
      identification_method: "bio"
    });
  });
});
