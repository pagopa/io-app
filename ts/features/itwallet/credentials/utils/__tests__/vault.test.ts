import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import { CredentialsVault } from "../vault";

jest.mock("@pagopa/io-react-native-secure-storage");

const mockSecureStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;

const CREDENTIAL_ID = "dc_sd_jwt_PersonalIdentificationData";
const CREDENTIAL_VALUE = "eyJhbGciOiJFUzI1NiIsInR5cCI6InZjK3NkLWp3dCJ9...";
const STORAGE_KEY = `itw:credential:${CREDENTIAL_ID}`;

describe("vault", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should return credential IDs filtering by prefix", async () => {
      mockSecureStorage.keys.mockResolvedValue([
        "itw:credential:credential1",
        "itw:credential:credential2",
        "other:key"
      ]);

      const result = await CredentialsVault.list();

      expect(result).toEqual(["credential1", "credential2"]);
      expect(mockSecureStorage.keys).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no credentials are stored", async () => {
      mockSecureStorage.keys.mockResolvedValue([]);

      const result = await CredentialsVault.list();

      expect(result).toEqual([]);
    });

    it("should throw on error", async () => {
      mockSecureStorage.keys.mockRejectedValue(new Error("Storage error"));

      await expect(CredentialsVault.list()).rejects.toThrow("Storage error");
    });
  });

  describe("store", () => {
    it("should store credential on success", async () => {
      mockSecureStorage.put.mockResolvedValue(undefined);

      await CredentialsVault.store(CREDENTIAL_ID, CREDENTIAL_VALUE);

      expect(mockSecureStorage.put).toHaveBeenCalledWith(
        STORAGE_KEY,
        CREDENTIAL_VALUE
      );
    });

    it("should throw on error", async () => {
      mockSecureStorage.put.mockRejectedValue(new Error("Storage error"));

      await expect(
        CredentialsVault.store(CREDENTIAL_ID, CREDENTIAL_VALUE)
      ).rejects.toThrow("Storage error");
    });
  });

  describe("get", () => {
    it("should return credential value on success", async () => {
      mockSecureStorage.get.mockResolvedValue(CREDENTIAL_VALUE);

      const result = await CredentialsVault.get(CREDENTIAL_ID);

      expect(result).toStrictEqual(CREDENTIAL_VALUE);
      expect(mockSecureStorage.get).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("should return undefined when value is not found", async () => {
      mockSecureStorage.get.mockRejectedValue(new Error("VALUE_NOT_FOUND"));

      const result = await CredentialsVault.get(CREDENTIAL_ID);

      expect(result).toBeUndefined();
    });

    it("should throw on unexpected error", async () => {
      mockSecureStorage.get.mockRejectedValue(new Error("Unexpected error"));

      await expect(CredentialsVault.get(CREDENTIAL_ID)).rejects.toThrow(
        "Unexpected error"
      );
    });
  });

  describe("remove", () => {
    it("should remove credential on success", async () => {
      mockSecureStorage.remove.mockResolvedValue(undefined);

      await CredentialsVault.remove(CREDENTIAL_ID);

      expect(mockSecureStorage.remove).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("should throw on error", async () => {
      mockSecureStorage.remove.mockRejectedValue(new Error("Storage error"));

      await expect(CredentialsVault.remove(CREDENTIAL_ID)).rejects.toThrow(
        "Storage error"
      );
    });
  });

  describe("removeAll", () => {
    it("should remove all credentials by ID", async () => {
      mockSecureStorage.remove.mockResolvedValue(undefined);

      await CredentialsVault.removeAll(["credential1", "credential2"]);

      expect(mockSecureStorage.remove).toHaveBeenCalledTimes(2);
      expect(mockSecureStorage.remove).toHaveBeenCalledWith(
        "itw:credential:credential1"
      );
      expect(mockSecureStorage.remove).toHaveBeenCalledWith(
        "itw:credential:credential2"
      );
    });

    it("should handle empty array gracefully", async () => {
      mockSecureStorage.remove.mockResolvedValue(undefined);

      await CredentialsVault.removeAll([]);

      expect(mockSecureStorage.remove).not.toHaveBeenCalled();
    });

    it("should throw if any removal fails", async () => {
      mockSecureStorage.remove
        .mockRejectedValueOnce(new Error("Storage error"))
        .mockResolvedValueOnce(undefined);

      await expect(
        CredentialsVault.removeAll(["credential1", "credential2"])
      ).rejects.toThrow("Storage error");
    });
  });

  describe("clear", () => {
    it("should clear all stored credentials", async () => {
      mockSecureStorage.keys.mockResolvedValue([
        "itw:credential:credential1",
        "itw:credential:credential2"
      ]);
      mockSecureStorage.remove.mockResolvedValue(undefined);

      await CredentialsVault.clear();

      expect(mockSecureStorage.keys).toHaveBeenCalledTimes(1);
      expect(mockSecureStorage.remove).toHaveBeenCalledTimes(2);
      expect(mockSecureStorage.remove).toHaveBeenCalledWith(
        "itw:credential:credential1"
      );
      expect(mockSecureStorage.remove).toHaveBeenCalledWith(
        "itw:credential:credential2"
      );
    });

    it("should handle empty vault gracefully", async () => {
      mockSecureStorage.keys.mockResolvedValue([]);

      await CredentialsVault.clear();

      expect(mockSecureStorage.keys).toHaveBeenCalledTimes(1);
      expect(mockSecureStorage.remove).not.toHaveBeenCalled();
    });

    it("should throw if listing keys fails", async () => {
      mockSecureStorage.keys.mockRejectedValue(
        new Error("Failed to list keys")
      );

      await expect(CredentialsVault.clear()).rejects.toThrow(
        "Failed to list keys"
      );
      expect(mockSecureStorage.remove).not.toHaveBeenCalled();
    });
  });
});
