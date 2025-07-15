import { createActor, waitFor } from "xstate";
import { CieManager } from "@pagopa/io-react-native-cie";
import { cieMachineActors, StartCieManagerInput } from "../actors";
import { getCieUatEndpoint } from "../../../../../authentication/login/cie/utils/endpoints";

// Mock the CieManager
jest.mock("@pagopa/io-react-native-cie", () => ({
  CieManager: {
    startReading: jest.fn(),
    stopReading: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    setCustomIdpUrl: jest.fn()
  }
}));

const mockCieManager = CieManager as jest.Mocked<typeof CieManager>;

describe("CIE Machine Actors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("startCieManager", () => {
    it("should start CieManager with valid input and UAT CIE", async () => {
      const validInput: StartCieManagerInput = {
        pin: "12345678",
        serviceProviderUrl: "https://example.com",
        env: "pre"
      };

      const actor = createActor(cieMachineActors.startCieManager, {
        input: validInput
      });
      actor.start();

      await waitFor(actor, state => state.status === "done");

      expect(mockCieManager.setCustomIdpUrl).toHaveBeenCalledWith(
        getCieUatEndpoint()
      );

      expect(mockCieManager.startReading).toHaveBeenCalledWith(
        validInput.pin,
        validInput.serviceProviderUrl
      );
    });

    it("should start CieManager with valid input and PROD CIE", async () => {
      const validInput: StartCieManagerInput = {
        pin: "12345678",
        serviceProviderUrl: "https://example.com",
        env: "prod"
      };

      const actor = createActor(cieMachineActors.startCieManager, {
        input: validInput
      });
      actor.start();

      await waitFor(actor, state => state.status === "done");

      expect(mockCieManager.setCustomIdpUrl).toHaveBeenCalledWith(undefined);

      expect(mockCieManager.startReading).toHaveBeenCalledWith(
        validInput.pin,
        validInput.serviceProviderUrl
      );
    });

    it("should throw assertion error when serviceProviderUrl is missing", async () => {
      const invalidInput: StartCieManagerInput = {
        pin: "12345678",
        env: "pre"
      };

      const actor = createActor(cieMachineActors.startCieManager, {
        input: invalidInput
      });

      expect(actor.start).toThrow();
      expect(mockCieManager.startReading).not.toHaveBeenCalled();
    });

    it("should handle CieManager.startReading rejection", async () => {
      const validInput: StartCieManagerInput = {
        pin: "12345678",
        serviceProviderUrl: "https://example.com",
        env: "pre"
      };

      mockCieManager.startReading.mockRejectedValue("");

      const actor = createActor(cieMachineActors.startCieManager, {
        input: validInput
      });

      expect(actor.start).toThrow();
    });
  });

  describe("cieManagerActor", () => {
    it("should setup listeners and keep listening for events", async () => {
      const actor = createActor(cieMachineActors.cieManagerActor, {
        input: {
          isScreenReaderEnabled: true
        }
      });
      actor.start();

      // Setup events

      expect(CieManager.addListener).toHaveBeenCalledTimes(3);
      expect(CieManager.addListener).toHaveBeenNthCalledWith(
        1,
        "onEvent",
        expect.any(Function)
      );
      expect(CieManager.addListener).toHaveBeenNthCalledWith(
        2,
        "onError",
        expect.any(Function)
      );
      expect(CieManager.addListener).toHaveBeenNthCalledWith(
        3,
        "onSuccess",
        expect.any(Function)
      );

      expect(CieManager.stopReading).not.toHaveBeenCalled();

      expect(actor.getSnapshot().status).toBe("active");
    });
  });
});
