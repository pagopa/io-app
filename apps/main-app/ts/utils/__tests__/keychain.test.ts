import * as SecureStore from "expo-secure-store";
import * as Keychain from "react-native-keychain";

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

describe("getPin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetItemAsync.mockResolvedValue(null);
    mockSetItemAsync.mockResolvedValue(undefined);
  });

  it("should return the pin when a valid pin is stored", async () => {
    mockGetGenericPassword.mockResolvedValue({
      username: "PIN",
      password: validPin,
      service: "service",
      storage: "storage"
    } as unknown as Awaited<ReturnType<typeof Keychain.getGenericPassword>>);

    const result = await getPin();
    expect(result).toBe(validPin);
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

    const result = await setPin(validPin);
    expect(result).toBe(true);
  });

  it("should return false when saving the pin fails", async () => {
    mockSetItemAsync.mockRejectedValue(new Error("failed to save"));

    const result = await setPin(validPin);
    expect(result).toBe(false);
  });
});

describe("deletePin", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the result of Keychain.resetGenericPassword", async () => {
    mockResetGenericPassword.mockResolvedValue(true);

    const result = await deletePin();
    expect(result).toBe(true);
  });
});
