import {
  closeProximityAction,
  trackProximityStartAction,
  trackQrCodeLoadingFailureAction
} from "../actions";
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

describe("itwProximityMachine actions", () => {
  const pop = jest.fn();

  const navigation = {
    pop
  } as never;

  const store = {} as never;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("pops the proximity navigator when closing the flow", () => {
    closeProximityAction({
      context: { deps: { navigation, store } }
    } as any);

    expect(pop).toHaveBeenCalledTimes(1);
  });

  it("tracks the QR code loading failure when it occurs on the qrcode engagement mode", () => {
    const error = new Error("start failed");

    trackQrCodeLoadingFailureAction({
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

    trackQrCodeLoadingFailureAction({
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
      trackProximityStartAction({ context: { engagementMode } } as any);

      expect(trackItwProximityStart).toHaveBeenCalledWith({ proximity_flow });
    }
  );
});
