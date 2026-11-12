import { ITW_PROXIMITY_ROUTES } from "../../navigation/routes";
import {
  closeProximityAction,
  navigateToPresentmentScreenAction,
  trackProximityStartAction,
  trackProximitySuccessAction,
  trackQrCodeLoadingFailureAction
} from "../actions";
import { ProximityFailureType } from "../failure";

jest.mock("../../analytics", () => ({
  trackItwProximityQrCode: jest.fn(),
  trackItwProximityQrCodeLoadingFailure: jest.fn(),
  trackItwProximityPresentationCompleted: jest.fn(),
  trackItwProximityStart: jest.fn()
}));

import {
  trackItwProximityPresentationCompleted,
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

  it.each([
    {
      name: "the presentment screen is focused",
      proximityState: {
        index: 0,
        routes: [{ name: ITW_PROXIMITY_ROUTES.PRESENTMENT }]
      },
      expectedCalls: 0
    },
    {
      name: "the proximity navigator is not initialized yet",
      proximityState: undefined,
      expectedCalls: 0
    },
    {
      name: "another proximity screen is focused",
      proximityState: {
        index: 1,
        routes: [
          { name: ITW_PROXIMITY_ROUTES.PRESENTMENT },
          { name: ITW_PROXIMITY_ROUTES.BLUETOOTH_ACTIVATION }
        ]
      },
      expectedCalls: 1
    }
  ])(
    "navigates to the presentment screen $expectedCalls times when $name",
    ({ proximityState, expectedCalls }) => {
      const navigate = jest.fn();
      const getState = () => ({
        routes: [
          {
            name: ITW_PROXIMITY_ROUTES.MAIN,
            params: { screen: ITW_PROXIMITY_ROUTES.PRESENTMENT },
            state: proximityState
          }
        ]
      });

      navigateToPresentmentScreenAction({
        context: { deps: { navigation: { getState, navigate }, store } }
      } as any);

      expect(navigate).toHaveBeenCalledTimes(expectedCalls);
    }
  );

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
    {
      engagementMode: "qrcode",
      retrievalMethod: "ble",
      proximity_flow: "qr_code"
    },
    {
      engagementMode: "nfc",
      retrievalMethod: "ble",
      proximity_flow: "nfc_ble"
    },
    { engagementMode: "nfc", retrievalMethod: "nfc", proximity_flow: "nfc_nfc" }
  ])(
    "tracks the proximity start with proximity_flow $proximity_flow for engagementMode $engagementMode and retrievalMethod $retrievalMethod",
    ({ engagementMode, retrievalMethod, proximity_flow }) => {
      trackProximityStartAction({
        context: { engagementMode, retrievalMethod }
      } as any);

      expect(trackItwProximityStart).toHaveBeenCalledWith({ proximity_flow });
    }
  );

  it.each([
    {
      engagementMode: "qrcode",
      retrievalMethod: "ble",
      proximity_flow: "qr_code"
    },
    {
      engagementMode: "nfc",
      retrievalMethod: "ble",
      proximity_flow: "nfc_ble"
    },
    { engagementMode: "nfc", retrievalMethod: "nfc", proximity_flow: "nfc_nfc" }
  ] as const)(
    "tracks the proximity success with proximity_flow $proximity_flow for engagementMode $engagementMode and retrievalMethod $retrievalMethod",
    ({ engagementMode, retrievalMethod, proximity_flow }) => {
      trackProximitySuccessAction({
        context: { engagementMode, retrievalMethod }
      } as any);

      expect(trackItwProximityPresentationCompleted).toHaveBeenCalledWith({
        proximity_flow
      });
    }
  );
});
