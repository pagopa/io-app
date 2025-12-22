import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import * as Sentry from "@sentry/react-native";
import vault from "../vault";

jest.mock("@pagopa/io-react-native-secure-storage");
jest.mock("@sentry/react-native");

const mockSecureStorage = SecureStorage as jest.Mocked<typeof SecureStorage>;
const mockSentry = Sentry as jest.Mocked<typeof Sentry>;

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

      const result = await vault.list();

      expect(result).toEqual(["credential1", "credential2"]);
      expect(mockSecureStorage.keys).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no credentials are stored", async () => {
      mockSecureStorage.keys.mockResolvedValue([]);

      const result = await vault.list();

      expect(result).toEqual([]);
    });

    it("should return empty array and report to Sentry on error", async () => {
      const error = new Error("Storage error");
      mockSecureStorage.keys.mockRejectedValue(error);

      const result = await vault.list();

      expect(result).toEqual([]);
      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: { isRequired: true },
        extra: { operation: "list" }
      });
    });
  });

  describe("store", () => {
    it("should store credential and return true on success", async () => {
      mockSecureStorage.put.mockResolvedValue(undefined);

      const result = await vault.store(CREDENTIAL_ID, CREDENTIAL_VALUE);

      expect(result).toBe(true);
      expect(mockSecureStorage.put).toHaveBeenCalledWith(
        STORAGE_KEY,
        CREDENTIAL_VALUE
      );
    });

    it("should return false and report to Sentry on error", async () => {
      const error = new Error("Storage error");
      mockSecureStorage.put.mockRejectedValue(error);

      const result = await vault.store(CREDENTIAL_ID, CREDENTIAL_VALUE);

      expect(result).toBe(false);
      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: { isRequired: true },
        extra: { operation: "put", key: STORAGE_KEY }
      });
    });
  });

  describe("get", () => {
    it("should return credential value on success", async () => {
      mockSecureStorage.get.mockResolvedValue(CREDENTIAL_VALUE);

      const result = await vault.get(CREDENTIAL_ID);

      expect(result).toBe(CREDENTIAL_VALUE);
      expect(mockSecureStorage.get).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("should return undefined when value is not found", async () => {
      const error = new Error("VALUE_NOT_FOUND");
      mockSecureStorage.get.mockRejectedValue(error);

      const result = await vault.get(CREDENTIAL_ID);

      expect(result).toBeUndefined();
      expect(mockSentry.captureException).not.toHaveBeenCalled();
    });

    it("should return undefined and report to Sentry on unexpected error", async () => {
      const error = new Error("Unexpected error");
      mockSecureStorage.get.mockRejectedValue(error);

      const result = await vault.get(CREDENTIAL_ID);

      expect(result).toBeUndefined();
      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: { isRequired: true },
        extra: { operation: "get", key: STORAGE_KEY }
      });
    });
  });

  describe("remove", () => {
    it("should remove credential and return true on success", async () => {
      mockSecureStorage.remove.mockResolvedValue(undefined);

      const result = await vault.remove(CREDENTIAL_ID);

      expect(result).toBe(true);
      expect(mockSecureStorage.remove).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("should return false and report to Sentry on error", async () => {
      const error = new Error("Storage error");
      mockSecureStorage.remove.mockRejectedValue(error);

      const result = await vault.remove(CREDENTIAL_ID);

      expect(result).toBe(false);
      expect(mockSentry.captureException).toHaveBeenCalledWith(error, {
        tags: { isRequired: true },
        extra: { operation: "remove", key: STORAGE_KEY }
      });
    });
  });

  describe("removeAll", () => {
    it("should remove all stored credentials", async () => {
      mockSecureStorage.keys.mockResolvedValue([
        "itw:credential:credential1",
        "itw:credential:credential2"
      ]);
      mockSecureStorage.remove.mockResolvedValue(undefined);

      await vault.removeAll();

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

      await vault.removeAll();

      expect(mockSecureStorage.remove).not.toHaveBeenCalled();
    });
  });
});
