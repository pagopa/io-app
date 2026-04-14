import { createProximityActionsImplementation } from "../actions";
import {
  trackItwProximityQrCode,
  trackItwProximityQrCodeLoadingFailure
} from "../../analytics";
import { ProximityFailureType } from "../failure";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn(),
  trackItwProximityQrCodeLoadingFailure: jest.fn()
}));

describe("createProximityActionsImplementation", () => {
  const pop = jest.fn();

  const navigation = {
    pop
  } as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the proximity navigator on success", () => {
    const actions = createProximityActionsImplementation(navigation, {} as any);

    actions.navigateToWallet();

    expect(pop).toHaveBeenCalledTimes(1);
  });

  it("pops the proximity navigator when closing the flow", () => {
    const actions = createProximityActionsImplementation(navigation, {} as any);

    actions.closeProximity();

    expect(pop).toHaveBeenCalledTimes(1);
  });

  describe("trackQrCodeGenerationOutcome", () => {
    it("tracks qr code success when context has no failure", () => {
      const actions = createProximityActionsImplementation(navigation);

      actions.trackQrCodeGenerationOutcome({
        context: {},
        event: { type: "start" }
      } as never);

      expect(trackItwProximityQrCode).toHaveBeenCalledTimes(1);
      expect(trackItwProximityQrCodeLoadingFailure).not.toHaveBeenCalled();
    });

    it("tracks qr code failure when context has a failure", () => {
      const actions = createProximityActionsImplementation(navigation);
      const error = new Error("engagement failed");

      actions.trackQrCodeGenerationOutcome({
        context: {
          failure: {
            type: ProximityFailureType.RELYING_PARTY_GENERIC,
            reason: error
          }
        },
        event: { type: "device-error", error }
      } as never);

      expect(trackItwProximityQrCodeLoadingFailure).toHaveBeenCalledTimes(1);
      expect(trackItwProximityQrCodeLoadingFailure).toHaveBeenCalledWith(
        expect.objectContaining({
          type: ProximityFailureType.RELYING_PARTY_GENERIC,
          reason: expect.objectContaining({ errorDescription: error.message })
        })
      );
      expect(trackItwProximityQrCode).not.toHaveBeenCalled();
    });
  });
});
