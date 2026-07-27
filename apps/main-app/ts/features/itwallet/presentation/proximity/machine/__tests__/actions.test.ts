import { createProximityActionsImplementation } from "../actions";
import { ProximityFailureType } from "../failure";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn(),
  trackItwProximityQrCodeLoadingFailure: jest.fn(),
  trackItwProximityStart: jest.fn()
}));

import {
  trackItwProximityQrCodeLoadingFailure,
  trackItwProximityStart
} from "../../analytics";

describe("createProximityActionsImplementation", () => {
  const pop = jest.fn();

  const navigation = {
    pop
  } as never;

  const actions = createProximityActionsImplementation(navigation, {} as any);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the proximity navigator when closing the flow", () => {
    actions.closeProximity();

    expect(pop).toHaveBeenCalledTimes(1);
  });

  it("tracks the QR code loading failure when it occurs on the qrcode engagement mode", () => {
    const error = new Error("start failed");

    actions.trackQrCodeLoadingFailure({
      context: { engagementMode: "qrcode" },
      event: { type: "xstate.error.actor.test", error }
    } as any);

    expect(trackItwProximityQrCodeLoadingFailure).toHaveBeenCalledWith({
      reason: error,
      type: ProximityFailureType.RELYING_PARTY_GENERIC
    });
  });

  it("does not track the QR code loading failure when it occurs on the nfc engagement mode", () => {
    const error = new Error("start failed");

    actions.trackQrCodeLoadingFailure({
      context: { engagementMode: "nfc" },
      event: { type: "xstate.error.actor.test", error }
    } as any);

    expect(trackItwProximityQrCodeLoadingFailure).not.toHaveBeenCalled();
  });

  it.each([
    { engagementMode: "qrcode", proximity_flow: "qr_code" },
    { engagementMode: "nfc", proximity_flow: "nfc" }
  ])(
    "tracks the proximity start with proximity_flow $proximity_flow for engagementMode $engagementMode",
    ({ engagementMode, proximity_flow }) => {
      actions.trackProximityStart({ context: { engagementMode } } as any);

      expect(trackItwProximityStart).toHaveBeenCalledWith({ proximity_flow });
    }
  );
});
