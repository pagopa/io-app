import { fingerprintAcknowledged } from "../actions";
import { sessionExpired } from "../../../authentication/common/store/actions";
import { isFingerprintAcknowledgedSelector } from "../selectors";
import reducer, { OnboardingState } from "../reducers";

describe("onboarding reducer", () => {
  const INITIAL_STATE: OnboardingState = {
    isFingerprintAcknowledged: false
  };

  it("should return the initial state", () => {
    expect(reducer(undefined, { type: "UNKNOWN_ACTION" } as any)).toEqual(
      INITIAL_STATE
    );
  });

  it("should handle fingerprintAcknowledged", () => {
    const newState = reducer(INITIAL_STATE, fingerprintAcknowledged());
    expect(newState).toEqual({
      isFingerprintAcknowledged: true
    });
  });

  it("should reset state on sessionExpired", () => {
    const prevState: OnboardingState = { isFingerprintAcknowledged: true };
    const newState = reducer(prevState, sessionExpired());
    expect(newState).toEqual(INITIAL_STATE);
  });
});

describe("isFingerprintAcknowledgedSelector", () => {
  it("should return true when acknowledged", () => {
    const mockState = {
      onboarding: { isFingerprintAcknowledged: true }
    } as any;
    expect(isFingerprintAcknowledgedSelector(mockState)).toBe(true);
  });

  it("should return false when not acknowledged", () => {
    const mockState = {
      onboarding: { isFingerprintAcknowledged: false }
    } as any;
    expect(isFingerprintAcknowledgedSelector(mockState)).toBe(false);
  });
});
