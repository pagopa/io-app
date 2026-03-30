/* eslint-disable functional/no-let */
/* eslint-disable @typescript-eslint/no-var-requires */
import type { IoWallet, ItwVersion } from "@pagopa/io-react-native-wallet";

jest.mock("@pagopa/io-react-native-wallet", () => ({
  IoWallet: jest.fn()
}));

describe("getIoWallet", () => {
  let MockIoWallet: jest.Mock;
  let getIoWallet: (version: ItwVersion) => IoWallet;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    // Require modules again to properly reset their state
    MockIoWallet = require("@pagopa/io-react-native-wallet").IoWallet;
    getIoWallet = require("../itwIoWallet").getIoWallet;
  });

  it("should create a new instance when it does not exist in the registry", () => {
    const version: ItwVersion = "1.3.3";
    const instance = getIoWallet(version);

    expect(MockIoWallet).toHaveBeenCalledTimes(1);
    expect(MockIoWallet).toHaveBeenCalledWith({ version });
    expect(instance).toBeDefined();
  });

  it("should reuse the same instance for the same version", () => {
    const version: ItwVersion = "1.3.3";
    const instance1 = getIoWallet(version);
    const instance2 = getIoWallet(version);

    expect(MockIoWallet).toHaveBeenCalledTimes(1);
    expect(instance1).toBe(instance2);
  });

  it("should create different instances for different versions", () => {
    const instance1 = getIoWallet("1.0.0");
    const instance2 = getIoWallet("1.3.3");

    expect(MockIoWallet).toHaveBeenNthCalledWith(1, { version: "1.0.0" });
    expect(MockIoWallet).toHaveBeenNthCalledWith(2, { version: "1.3.3" });
    expect(instance1).not.toBe(instance2);
  });
});
