import * as SecureStore from "expo-secure-store";
import * as Keychain from "react-native-keychain";

import * as Mixpanel from "../../mixpanel";
import { PinString } from "../../types/PinString";
import { deletePin, getPin, setPin } from "../keychain";

jest.mock("react-native-keychain", () => ({
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: "WHEN_UNLOCKED_THIS_DEVICE_ONLY"
  },
  STORAGE_TYPE: { AES_GCM_NO_AUTH: "AES_GCM_NO_AUTH" },
  getGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn()
}));

jest.mock("expo-secure-store", () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));

const mockGetGenericPassword = jest.mocked(Keychain.getGenericPassword);
const mockResetGenericPassword = jest.mocked(Keychain.resetGenericPassword);

const mockGetItemAsync = jest.mocked(SecureStore.getItemAsync);
const mockSetItemAsync = jest.mocked(SecureStore.setItemAsync);

const validPin = "123456" as PinString;

afterEach(() => {
  jest.restoreAllMocks();
});

describe("getPin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
  });

  it("should return the pin when a valid pin is stored", async () => {
    mockGetItemAsync.mockResolvedValue(validPin);
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: validPin,
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);

    const result = await getPin();
    expect(result).toBe(validPin);
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_GET_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
  });

  it("should track and rethrow a secure store read failure", async () => {
    mockGetItemAsync.mockRejectedValue(new Error("failed to read"));
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    await expect(getPin()).rejects.toThrow("failed to read");
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_GET_FAILURE",
      expect.objectContaining({ event_category: "KO", event_type: "error" })
    );
  });

  it("should preserve the legacy pin after a failed migration and retry on the next read", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: validPin,
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);
    mockSetItemAsync.mockRejectedValueOnce(new Error("failed to save"));

    await expect(getPin()).resolves.toBe(validPin);
    expect(mockSetItemAsync).toHaveBeenCalledWith("PIN", validPin, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
    });
    expect(mockResetGenericPassword).not.toHaveBeenCalled();

    await expect(getPin()).resolves.toBe(validPin);
    expect(mockGetGenericPassword).toHaveBeenCalledTimes(2);
    expect(mockSetItemAsync).toHaveBeenCalledTimes(2);
    expect(mockResetGenericPassword).toHaveBeenCalledTimes(1);
  });

  it("should track a successful migration", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: validPin,
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    await expect(getPin()).resolves.toBe(validPin);

    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      1,
      "PIN_KEYCHAIN_MIGRATION_REQUEST",
      {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      2,
      "PIN_KEYCHAIN_SET_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      3,
      "PIN_KEYCHAIN_MIGRATION_SUCCESS",
      {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      4,
      "PIN_KEYCHAIN_GET_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
  });

  it("should track a failed migration and keep the legacy pin", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: validPin,
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);
    mockSetItemAsync.mockRejectedValue(new Error("failed to save"));
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    await expect(getPin()).resolves.toBe(validPin);

    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      1,
      "PIN_KEYCHAIN_MIGRATION_REQUEST",
      {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined
      }
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      2,
      "PIN_KEYCHAIN_SET_FAILURE",
      expect.objectContaining({ event_category: "KO", event_type: "error" })
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      3,
      "PIN_KEYCHAIN_MIGRATION_FAILURE",
      {
        event_category: "KO",
        event_type: "error",
        flow: undefined
      }
    );
    expect(mixpanelTrackSpy).toHaveBeenNthCalledWith(
      4,
      "PIN_KEYCHAIN_GET_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
    expect(mockResetGenericPassword).not.toHaveBeenCalled();
  });

  it("should return undefined when the stored password does not match the pin pattern", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: "not-a-pin",
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);

    const result = await getPin();
    expect(result).toBeUndefined();
  });

  it("should return undefined when the stored password is empty", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: "",
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);

    const result = await getPin();
    expect(result).toBeUndefined();
  });

  it("should return undefined when there is no credential stored", async () => {
    mockGetGenericPassword.mockResolvedValue(false);

    const result = await getPin();
    expect(result).toBeUndefined();
  });
});

describe("setPin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return true when the pin is saved successfully", async () => {
    mockSetItemAsync.mockResolvedValue(undefined);
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    const result = await setPin(validPin);
    expect(result).toBe(true);
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_SET_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
  });

  it("should return false when saving the pin fails", async () => {
    mockSetItemAsync.mockRejectedValue(new Error("failed to save"));
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    const result = await setPin(validPin);
    expect(result).toBe(false);
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_SET_FAILURE",
      expect.objectContaining({ event_category: "KO", event_type: "error" })
    );
  });
});

describe("deletePin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the result of Keychain.resetGenericPassword", async () => {
    mockResetGenericPassword.mockResolvedValue(true);
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    const result = await deletePin();
    expect(result).toBe(true);
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_REMOVE_SUCCESS",
      expect.objectContaining({ event_category: "TECH" })
    );
  });

  it("should track and rethrow a secure store removal failure", async () => {
    jest
      .mocked(SecureStore.deleteItemAsync)
      .mockRejectedValue(new Error("failed to remove"));
    const mixpanelTrackSpy = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    await expect(deletePin()).rejects.toThrow("failed to remove");
    expect(mixpanelTrackSpy).toHaveBeenCalledWith(
      "PIN_KEYCHAIN_REMOVE_FAILURE",
      expect.objectContaining({ event_category: "KO", event_type: "error" })
    );
  });
});
