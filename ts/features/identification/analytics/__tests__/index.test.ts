import { Mixpanel } from "mixpanel-react-native";
import { mixpanelToken } from "../../../../config";
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

// Mock the Mixpanel class
jest.mock("mixpanel-react-native", () => {
  const mockMixpanel = {
    track: jest.fn()
  };

  return {
    Mixpanel: jest.fn(() => mockMixpanel)
  };
});

jest.mock("../../../../config", () => ({
  mixpanelToken: "test-token"
}));

describe("trackIdentificationAction", () => {
  const mockMixpanel = new Mixpanel(mixpanelToken, true);
  const tracker = trackIdentificationAction(mockMixpanel);

  it("should track identificationRequest action", () => {
    tracker(identificationRequest(true));
    expect(mockMixpanel.track).toHaveBeenCalledWith("IDENTIFICATION_REQUEST");
  });

  it("should track identificationStart action", () => {
    tracker(identificationStart("123456" as PinString, true));
    expect(mockMixpanel.track).toHaveBeenCalledWith("IDENTIFICATION_START");
  });

  it("should track identificationCancel action", () => {
    tracker(identificationCancel());
    expect(mockMixpanel.track).toHaveBeenCalledWith("IDENTIFICATION_CANCEL");
  });

  it("should track identificationSuccess action with payload", () => {
    tracker(identificationSuccess({ isBiometric: true }));
    expect(mockMixpanel.track).toHaveBeenCalledWith(
      "IDENTIFICATION_SUCCESS",
      expect.objectContaining({ identification_method: "bio" })
    );
  });

  it("should track identificationFailure action", () => {
    tracker(identificationFailure());
    expect(mockMixpanel.track).toHaveBeenCalledWith("IDENTIFICATION_FAILURE");
  });

  it("should track identificationPinReset action", () => {
    tracker(identificationPinReset());
    expect(mockMixpanel.track).toHaveBeenCalledWith("IDENTIFICATION_PIN_RESET");
  });

  it("should track identificationForceLogout action", () => {
    tracker(identificationForceLogout());
    expect(mockMixpanel.track).toHaveBeenCalledWith(
      "IDENTIFICATION_FORCE_LOGOUT"
    );
  });
});
