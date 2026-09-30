import { ISO18013_5 } from "@pagopa/io-react-native-iso18013";
import { BleManager, State } from "react-native-ble-plx";
import { assign, createActor, fromPromise, waitFor } from "xstate";

import { testProximityDeps } from "../../../../machine/utils/testDeps";
import { itwProximityMachine } from "../machine";

const bluetoothListeners = new Set<(state: State) => void>();
const nativeSubscriptions = new Set<{ remove: jest.Mock }>();
const navigateToBluetoothActivationScreen = jest.fn();
const navigateToPresentmentScreen = jest.fn();
const navigateToNfcPresentmentScreen = jest.fn();
const startEngagement = jest.fn(async (): Promise<void> => undefined);
const onStateChange = jest.fn((listener: (state: State) => void) => {
  bluetoothListeners.add(listener);
  return { remove: () => bluetoothListeners.delete(listener) };
});

const makeActor = (engagementMode: ISO18013_5.EngagementMode = "qrcode") =>
  createActor(
    itwProximityMachine.provide({
      actions: {
        onInit: assign({ credentials: {}, engagementMode }),
        navigateToPresentmentScreen,
        navigateToNfcPresentmentScreen,
        navigateToClaimsDisclosureScreen: jest.fn(),
        navigateToBluetoothActivationScreen,
        trackQrCodeLoadingFailure: jest.fn()
      },
      actors: {
        checkBluetoothPermissions: fromPromise(async () => true),
        checkBluetoothActivation: fromPromise(async () => true),
        startEngagement: fromPromise(startEngagement)
      }
    }),
    { input: { deps: testProximityDeps() } }
  );

const emitQr = (data: string) => {
  const qrListener = jest
    .mocked(ISO18013_5.addListener)
    .mock.calls.filter(([event]) => event === "onQrCodeString")
    .at(-1)?.[1];
  expect(qrListener).toBeDefined();
  qrListener?.({ data });
};

const emitBluetooth = (state: State) =>
  bluetoothListeners.forEach(listener => listener(state));

const expectNativeCleanup = () => {
  nativeSubscriptions.forEach(subscription =>
    expect(subscription.remove).toHaveBeenCalledTimes(1)
  );
  expect(bluetoothListeners.size).toBe(0);
};

describe("proximity Bluetooth interruption", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    bluetoothListeners.clear();
    nativeSubscriptions.clear();
    jest
      .mocked(BleManager)
      .mockImplementation(() => ({ onStateChange }) as unknown as BleManager);
    jest.mocked(ISO18013_5.addListener).mockImplementation(() => {
      const subscription = { remove: jest.fn() };
      nativeSubscriptions.add(subscription);
      return subscription as unknown as ReturnType<
        typeof ISO18013_5.addListener
      >;
    });
    jest.mocked(ISO18013_5.close).mockResolvedValue(true);
  });

  it.each([
    {
      name: "QR waiting",
      engagementMode: "qrcode" as const,
      connecting: false
    },
    { name: "NFC waiting", engagementMode: "nfc" as const, connecting: false },
    {
      name: "QR connecting",
      engagementMode: "qrcode" as const,
      connecting: true
    },
    { name: "NFC connecting", engagementMode: "nfc" as const, connecting: true }
  ])(
    "restarts $name after Bluetooth activation",
    async ({ engagementMode, connecting }) => {
      const actor = makeActor(engagementMode);
      try {
        actor.start();
        actor.send({ type: "start" });
        await waitFor(actor, snapshot =>
          snapshot.matches({ Presentment: "AwaitingConnection" })
        );
        if (engagementMode === "qrcode") {
          emitQr("mdoc://interrupted-session");
          expect(actor.getSnapshot().context.qrCodeString).toBe(
            "mdoc://interrupted-session"
          );
        }
        if (connecting) {
          actor.send({ type: "device-connecting" });
        }
        expect(onStateChange).toHaveBeenCalledWith(expect.any(Function), true);
        emitBluetooth(State.Unknown);
        emitBluetooth(State.PoweredOn);
        expect(navigateToBluetoothActivationScreen).not.toHaveBeenCalled();

        emitBluetooth(State.PoweredOff);
        emitBluetooth(State.PoweredOff);

        expect(navigateToBluetoothActivationScreen).toHaveBeenCalledTimes(1);
        expect(actor.getSnapshot().context.qrCodeString).toBeUndefined();
        expect(ISO18013_5.close).toHaveBeenCalledTimes(1);
        expect(ISO18013_5.sendErrorResponse).not.toHaveBeenCalled();
        expectNativeCleanup();

        actor.send({ type: "continue" });
        await waitFor(actor, snapshot =>
          snapshot.matches({ Presentment: "AwaitingConnection" })
        );
        expect(startEngagement).toHaveBeenCalledTimes(2);
        expect(actor.getSnapshot().context.qrCodeString).toBeUndefined();
        expect(actor.getSnapshot().context.engagementMode).toBe(engagementMode);
        if (engagementMode === "qrcode") {
          emitQr("mdoc://fresh-session");
          expect(actor.getSnapshot().context.qrCodeString).toBe(
            "mdoc://fresh-session"
          );
          expect(navigateToPresentmentScreen).toHaveBeenCalledTimes(2);
          expect(navigateToNfcPresentmentScreen).not.toHaveBeenCalled();
        } else {
          expect(navigateToNfcPresentmentScreen).toHaveBeenCalledTimes(2);
          expect(navigateToPresentmentScreen).not.toHaveBeenCalled();
        }
      } finally {
        actor.stop();
      }
      expectNativeCleanup();
      expect(ISO18013_5.close).toHaveBeenCalledTimes(2);
    }
  );

  it("clears QR generation failure when Bluetooth is disabled during startup", async () => {
    startEngagement.mockRejectedValueOnce(new Error("engagement failed"));
    const actor = makeActor();
    try {
      actor.start();
      actor.send({ type: "start" });
      await waitFor(actor, snapshot => !!snapshot.context.failure);
      emitBluetooth(State.PoweredOff);
      expect(navigateToBluetoothActivationScreen).toHaveBeenCalledTimes(1);
      expect(actor.getSnapshot().context.failure).toBeUndefined();
      expectNativeCleanup();
    } finally {
      actor.stop();
    }
  });
});
