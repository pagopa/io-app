import { createActor, waitFor } from "xstate";
import { CieManager } from "@pagopa/io-react-native-cie";
import actors, { StartCieManagerInput } from "../actors";

// Mock the CieManager
jest.mock("@pagopa/io-react-native-cie", () => ({
  CieManager: {
    startReading: jest.fn(),
    stopReading: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn()
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
    it("should start CieManager with valid input", async () => {
      const validInput: StartCieManagerInput = {
        pin: "12345678",
        serviceProviderUrl: "https://example.com"
      };

      const actor = createActor(actors.startCieManager, {
        input: validInput
      });
      actor.start();

      await waitFor(actor, state => state.status === "done");

      expect(mockCieManager.startReading).toHaveBeenCalledWith(
        validInput.pin,
        validInput.serviceProviderUrl
      );
    });

    it("should throw assertion error when serviceProviderUrl is missing", async () => {
      const invalidInput: StartCieManagerInput = {
        pin: "12345678"
      };

      const actor = createActor(actors.startCieManager, {
        input: invalidInput
      });

      expect(actor.start).toThrow();
      expect(mockCieManager.startReading).not.toHaveBeenCalled();
    });

    it("should handle CieManager.startReading rejection", async () => {
      const validInput: StartCieManagerInput = {
        pin: "12345678",
        serviceProviderUrl: "https://example.com"
      };

      mockCieManager.startReading.mockRejectedValue("");

      const actor = createActor(actors.startCieManager, {
        input: validInput
      });

      expect(actor.start).toThrow();
    });
  });
});
