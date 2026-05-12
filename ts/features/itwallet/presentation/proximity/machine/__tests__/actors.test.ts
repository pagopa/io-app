import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { createActor, waitFor } from "xstate";
import { EventSubscription } from "react-native";
import { createProximityActorsImplementation } from "../actors";
import { Env } from "../../../../common/utils/environment";

jest.mock("react-native-bluetooth-state-manager", () => ({
  __esModule: true,
  default: {
    getState: jest.fn(),
    onStateChange: jest.fn()
  }
}));
jest.mock("react-native-permissions", () => ({
  checkMultiple: jest.fn(),
  requestMultiple: jest.fn(),
  PERMISSIONS: { IOS: { BLUETOOTH: "ios.bluetooth" } },
  RESULTS: { GRANTED: "granted" }
}));
jest.mock("../../analytics", () => ({
  trackItwProximityBluetoothBlock: jest.fn(),
  trackItwProximityBluetoothBlockAction: jest.fn()
}));
jest.mock("@pagopa/io-react-native-iso18013", () => ({
  ISO18013_5: {
    close: jest.fn().mockResolvedValue(undefined),
    startEngagement: jest.fn().mockResolvedValue(undefined)
  }
}));

const mockBSM = BluetoothStateManager as jest.Mocked<
  typeof BluetoothStateManager
>;

const T_ENV = {} as Env;

describe("createProximityActorsImplementation – checkBluetoothIsActive", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * Simulates onStateChange(cb, emitCurrentState: true): the library calls
   * getState() async to emit the current state, AND subscribes to future
   * state changes via addEventListener.
   */
  const mockOnStateChange = (immediateState: string, futureState?: string) => {
    // eslint-disable-next-line functional/no-let
    let capturedListener: ((state: string) => void) | undefined;

    mockBSM.onStateChange.mockImplementation((listener, emitCurrentState) => {
      capturedListener = listener as (state: string) => void;

      if (emitCurrentState) {
        // Simulate the async getState() call inside onStateChange
        void Promise.resolve().then(() => capturedListener?.(immediateState));
      }

      return { remove: jest.fn() } as unknown as EventSubscription;
    });

    return {
      emitFutureState: (state: string = futureState ?? "") => {
        capturedListener?.(state);
      }
    };
  };

  it("resolves true when state is immediately PoweredOn", async () => {
    mockOnStateChange("PoweredOn");

    const { checkBluetoothIsActive } =
      createProximityActorsImplementation(T_ENV);
    const actor = createActor(checkBluetoothIsActive);
    actor.start();

    const snapshot = await waitFor(
      actor,
      s => s.status === "done" || s.status === "error"
    );

    expect(snapshot.output).toBe(true);
  });

  it("resolves false when state is immediately PoweredOff", async () => {
    mockOnStateChange("PoweredOff");

    const { checkBluetoothIsActive } =
      createProximityActorsImplementation(T_ENV);
    const actor = createActor(checkBluetoothIsActive);
    actor.start();

    const snapshot = await waitFor(
      actor,
      s => s.status === "done" || s.status === "error"
    );

    expect(snapshot.output).toBe(false);
  });

  /**
   * Regression test: on iOS the CBCentralManager goes through a brief
   * "Unknown" initialization phase the first time it is used after an app
   * update that introduces CoreBluetooth. getState() returns "Unknown" during
   * this window; checkBluetoothIsActive must wait for the state to settle to
   * "PoweredOn" before resolving true, instead of incorrectly resolving false
   * and showing the Enable-Bluetooth screen.
   */
  it("waits for state to settle when initially Unknown, resolves true on PoweredOn", async () => {
    const { emitFutureState } = mockOnStateChange("Unknown");

    const { checkBluetoothIsActive } =
      createProximityActorsImplementation(T_ENV);
    const actor = createActor(checkBluetoothIsActive);
    actor.start();

    // Let getState() inside onStateChange resolve (emits "Unknown" → ignored)
    await Promise.resolve();
    await Promise.resolve();

    // Simulate CoreBluetooth finishing its initialization
    emitFutureState("PoweredOn");

    const snapshot = await waitFor(
      actor,
      s => s.status === "done" || s.status === "error"
    );

    expect(snapshot.output).toBe(true);
  });

  it("waits for state to settle when initially Resetting, resolves false on PoweredOff", async () => {
    const { emitFutureState } = mockOnStateChange("Resetting");

    const { checkBluetoothIsActive } =
      createProximityActorsImplementation(T_ENV);
    const actor = createActor(checkBluetoothIsActive);
    actor.start();

    await Promise.resolve();
    await Promise.resolve();

    emitFutureState("PoweredOff");

    const snapshot = await waitFor(
      actor,
      s => s.status === "done" || s.status === "error"
    );

    expect(snapshot.output).toBe(false);
  });

  it("times out and resolves false if state never settles from Unknown", async () => {
    // onStateChange emits Unknown immediately; no future state change arrives
    mockOnStateChange("Unknown");

    const { checkBluetoothIsActive } =
      createProximityActorsImplementation(T_ENV);
    const actor = createActor(checkBluetoothIsActive);
    actor.start();

    // Advance past the 3-second timeout inside the actor
    jest.advanceTimersByTime(3000);

    const snapshot = await waitFor(
      actor,
      s => s.status === "done" || s.status === "error",
      { timeout: 5000 }
    );

    expect(snapshot.output).toBe(false);
  });
});
