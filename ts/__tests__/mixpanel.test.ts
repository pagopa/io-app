import { Mixpanel } from "mixpanel-react-native";
import * as MixpanelModule from "../mixpanel";
import { mixpanelToken, mixpanelUrl } from "../config";
import { updateMixpanelSuperProperties } from "../mixpanelConfig/superProperties";
import { updateMixpanelProfileProperties } from "../mixpanelConfig/profileProperties";

// Mock the Mixpanel class
jest.mock("mixpanel-react-native", () => {
  const mockPeople = {
    set: jest.fn(),
    setOnce: jest.fn()
  };

  const mockMixpanel = {
    init: jest.fn().mockResolvedValue(undefined),
    optInTracking: jest.fn(),
    optOutTracking: jest.fn(),
    setUseIpAddressForGeolocation: jest.fn(),
    track: jest.fn(),
    identify: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn(),
    flush: jest.fn(),
    registerSuperProperties: jest.fn(),
    getPeople: jest.fn().mockReturnValue(mockPeople)
  };

  return {
    Mixpanel: jest.fn(() => mockMixpanel)
  };
});

// Mock other imports
jest.mock("../utils/device", () => ({
  getDeviceId: jest.fn().mockReturnValue("test-device-id")
}));

jest.mock("../config", () => ({
  mixpanelToken: "test-token",
  mixpanelUrl: "https://test-api.mixpanel.com"
}));

jest.mock("../mixpanelConfig/superProperties", () => ({
  updateMixpanelSuperProperties: jest.fn().mockResolvedValue(undefined)
}));

jest.mock("../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn().mockResolvedValue(undefined)
}));

describe("Mixpanel module", () => {
  // eslint-disable-next-line functional/no-let
  let mockMixpanelInstance: Mixpanel;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module between tests
    jest.resetModules();

    // Get the mocked instance
    mockMixpanelInstance = new Mixpanel(mixpanelToken, true);
  });

  describe("initializeMixPanel", () => {
    it("should initialize mixpanel with correct parameters", async () => {
      const mockState = {} as any;

      await MixpanelModule.initializeMixPanel(mockState);

      expect(Mixpanel).toHaveBeenCalledWith(mixpanelToken, true);
      expect(mockMixpanelInstance.init).toHaveBeenCalledWith(
        undefined,
        undefined,
        mixpanelUrl
      );
      expect(mockMixpanelInstance.optInTracking).toHaveBeenCalled();
      expect(
        mockMixpanelInstance.setUseIpAddressForGeolocation
      ).toHaveBeenCalledWith(false);
      expect(updateMixpanelSuperProperties).toHaveBeenCalledWith(mockState);
      expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState);
    });

    it("should not reinitialize if mixpanel is already initialized", async () => {
      const mockState = {} as any;

      // First initialization
      await MixpanelModule.initializeMixPanel(mockState);

      // Reset mocks to check if they're called again
      jest.clearAllMocks();

      // Second initialization attempt
      await MixpanelModule.initializeMixPanel(mockState);

      // Should not be called a second time
      expect(Mixpanel).not.toHaveBeenCalled();
    });
  });

  describe("identifyMixpanel", () => {
    it("should identify user with device ID", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      await MixpanelModule.identifyMixpanel();

      expect(mockMixpanelInstance.identify).toHaveBeenCalledWith(
        "test-device-id"
      );
    });

    it("should do nothing if mixpanel is not initialized", async () => {
      // Ensure mixpanel is not initialized
      MixpanelModule.terminateMixpanel();

      await MixpanelModule.identifyMixpanel();

      expect(mockMixpanelInstance.identify).not.toHaveBeenCalled();
    });
  });

  describe("resetMixpanel", () => {
    it("should reset mixpanel", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      MixpanelModule.resetMixpanel();

      expect(mockMixpanelInstance.reset).toHaveBeenCalled();
    });

    it("should do nothing if mixpanel is not initialized", () => {
      // Ensure mixpanel is not initialized
      MixpanelModule.terminateMixpanel();

      MixpanelModule.resetMixpanel();

      expect(mockMixpanelInstance.reset).not.toHaveBeenCalled();
    });
  });

  describe("terminateMixpanel", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should terminate mixpanel and flush data", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      MixpanelModule.terminateMixpanel();

      expect(mockMixpanelInstance.flush).toHaveBeenCalled();

      // Fast-forward setTimeout
      jest.advanceTimersByTime(1000);
      expect(mockMixpanelInstance.optOutTracking).toHaveBeenCalled();

      // Should be undefined after termination
      expect(MixpanelModule.isMixpanelInstanceInitialized()).toBe(false);
    });

    it("should do nothing if mixpanel is not initialized", () => {
      // Make sure mixpanel is not initialized
      MixpanelModule.terminateMixpanel();
      jest.clearAllMocks();

      // Try to terminate again
      MixpanelModule.terminateMixpanel();

      expect(mockMixpanelInstance.flush).not.toHaveBeenCalled();
    });
  });

  describe("isMixpanelInstanceInitialized", () => {
    it("should return true when mixpanel is initialized", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      expect(MixpanelModule.isMixpanelInstanceInitialized()).toBe(true);
    });

    it("should return false when mixpanel is not initialized", () => {
      MixpanelModule.terminateMixpanel();

      expect(MixpanelModule.isMixpanelInstanceInitialized()).toBe(false);
    });
  });

  describe("getPeople", () => {
    it("should return people object when mixpanel is initialized", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      const people = MixpanelModule.getPeople();

      expect(mockMixpanelInstance.getPeople).toHaveBeenCalled();
      expect(people).toBeDefined();
    });

    it("should return undefined when mixpanel is not initialized", () => {
      MixpanelModule.terminateMixpanel();

      const people = MixpanelModule.getPeople();

      expect(people).toBeUndefined();
    });
  });

  describe("registerSuperProperties", () => {
    it("should register super properties when mixpanel is initialized", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      const properties = { testProperty: "value" };
      MixpanelModule.registerSuperProperties(properties);

      expect(mockMixpanelInstance.registerSuperProperties).toHaveBeenCalledWith(
        properties
      );
    });

    it("should do nothing when mixpanel is not initialized", () => {
      MixpanelModule.terminateMixpanel();

      const properties = { testProperty: "value" };
      MixpanelModule.registerSuperProperties(properties);

      expect(
        mockMixpanelInstance.registerSuperProperties
      ).not.toHaveBeenCalled();
    });
  });

  describe("mixpanelTrack", () => {
    it("should track events when mixpanel is initialized", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      const eventName = "test_event";
      const properties = { property: "value" };
      MixpanelModule.mixpanelTrack(eventName, properties);

      expect(mockMixpanelInstance.track).toHaveBeenCalledWith(
        eventName,
        properties
      );
    });

    it("should do nothing when mixpanel is not initialized", () => {
      MixpanelModule.terminateMixpanel();

      const eventName = "test_event";
      const properties = { property: "value" };
      MixpanelModule.mixpanelTrack(eventName, properties);

      expect(mockMixpanelInstance.track).not.toHaveBeenCalled();
    });
  });

  describe("enqueueMixpanelEvent", () => {
    beforeEach(() => {
      // Make sure mixpanel is not initialized for these tests
      MixpanelModule.terminateMixpanel();
      // Clear the queue
      MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.clear();
    });

    it("should enqueue events when mixpanel is not initialized", () => {
      const eventName = "test_event";
      const id = "test-id";
      const properties = { property: "value" };

      MixpanelModule.enqueueMixpanelEvent(eventName, id, properties);

      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.size
      ).toBe(1);
      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.get(id)
      ).toEqual({
        eventName,
        id,
        properties
      });
    });

    it("should overwrite previously enqueued events with the same ID", () => {
      const id = "test-id";

      // First event
      MixpanelModule.enqueueMixpanelEvent("event1", id, { property: "value1" });

      // Second event with same ID
      MixpanelModule.enqueueMixpanelEvent("event2", id, { property: "value2" });

      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.size
      ).toBe(1);
      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.get(id)
      ).toEqual({
        eventName: "event2",
        id,
        properties: { property: "value2" }
      });
    });

    it("should not enqueue events when mixpanel is initialized", async () => {
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      MixpanelModule.enqueueMixpanelEvent("test_event", "test-id", {
        property: "value"
      });

      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.size
      ).toBe(0);
    });
  });

  describe("processEnqueuedMixpanelEvents", () => {
    // eslint-disable-next-line sonarjs/no-identical-functions
    beforeEach(() => {
      // Make sure mixpanel is not initialized
      MixpanelModule.terminateMixpanel();
      // Clear the queue
      MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.clear();
    });

    it("should process all enqueued events when mixpanel is initialized", async () => {
      // Enqueue some events
      MixpanelModule.enqueueMixpanelEvent("event1", "id1", { p1: "v1" });
      MixpanelModule.enqueueMixpanelEvent("event2", "id2", { p2: "v2" });

      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.size
      ).toBe(2);

      // Initialize mixpanel which should trigger processing
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      // Events should be tracked and queue cleared
      expect(mockMixpanelInstance.track).toHaveBeenCalledTimes(2);
      expect(mockMixpanelInstance.track).toHaveBeenCalledWith("event1", {
        p1: "v1"
      });
      expect(mockMixpanelInstance.track).toHaveBeenCalledWith("event2", {
        p2: "v2"
      });
      expect(
        MixpanelModule.testable?.uninitializedMixpanelTrackingQueue.size
      ).toBe(0);
    });

    it("should process events in the order they were added", async () => {
      // Enqueue events in specific order
      MixpanelModule.enqueueMixpanelEvent("event1", "id1", { p: "v1" });
      MixpanelModule.enqueueMixpanelEvent("event2", "id2", { p: "v2" });
      MixpanelModule.enqueueMixpanelEvent("event3", "id3", { p: "v3" });

      // Initialize mixpanel which should trigger processing
      const mockState = {} as any;
      await MixpanelModule.initializeMixPanel(mockState);

      // Check order of calls
      expect((mockMixpanelInstance.track as jest.Mock).mock.calls[0][0]).toBe(
        "event1"
      );
      expect((mockMixpanelInstance.track as jest.Mock).mock.calls[1][0]).toBe(
        "event2"
      );
      expect((mockMixpanelInstance.track as jest.Mock).mock.calls[2][0]).toBe(
        "event3"
      );
    });
  });
});
