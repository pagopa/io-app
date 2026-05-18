import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { checkMultiple, RESULTS } from "react-native-permissions";
import {
  areProximityPermissionsGranted,
  isBluetoothPoweredOn,
  PROXIMITY_PERMISSIONS_TO_CHECK
} from "../index";

jest.mock("react-native-bluetooth-state-manager", () => ({
  __esModule: true,
  default: {
    getState: jest.fn()
  }
}));

jest.mock("react-native-permissions", () => ({
  checkMultiple: jest.fn(),
  PERMISSIONS: { IOS: { BLUETOOTH: "ios.bluetooth" } },
  RESULTS: { GRANTED: "granted", DENIED: "denied" }
}));

const mockedGetState = BluetoothStateManager.getState as jest.Mock;
const mockedCheckMultiple = checkMultiple as jest.Mock;

describe("isBluetoothPoweredOn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    ["PoweredOn", true],
    ["PoweredOff", false],
    ["Unknown", false],
    ["Resetting", false],
    ["Unauthorized", false],
    ["Unsupported", false]
  ])("returns %s → %s", async (state, expected) => {
    mockedGetState.mockResolvedValue(state);
    await expect(isBluetoothPoweredOn()).resolves.toBe(expected);
  });
});

describe("areProximityPermissionsGranted", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns true when every required permission is granted", async () => {
    mockedCheckMultiple.mockResolvedValue(
      Object.fromEntries(
        PROXIMITY_PERMISSIONS_TO_CHECK.map(p => [p, RESULTS.GRANTED])
      )
    );
    await expect(areProximityPermissionsGranted()).resolves.toBe(true);
  });

  it("returns false when at least one permission is missing", async () => {
    mockedCheckMultiple.mockResolvedValue(
      Object.fromEntries(
        PROXIMITY_PERMISSIONS_TO_CHECK.map((p, i) => [
          p,
          i === 0 ? RESULTS.DENIED : RESULTS.GRANTED
        ])
      )
    );
    await expect(areProximityPermissionsGranted()).resolves.toBe(false);
  });
});
