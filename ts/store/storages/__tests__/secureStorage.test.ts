import * as SecureStorage from "@pagopa/io-react-native-secure-storage";
import * as Sentry from "@sentry/react-native";
import createSecureStorage, { isValueNotFoundError } from "../secureStorage";

jest.mock("@pagopa/io-react-native-secure-storage", () => ({
  get: jest.fn(),
  put: jest.fn(),
  remove: jest.fn()
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn()
}));

describe("SecureStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("isValueNotFoundError", () => {
    test.each([
      [{ message: "VALUE_NOT_FOUND", userInfo: {} }, true],
      [{ message: "OTHER_ERROR", userInfo: {} }, false],
      ["string", false],
      [null, false],
      [undefined, false]
    ])("given %p as argument, returns %p", (error, result) => {
      expect(isValueNotFoundError(error)).toBe(result);
    });
  });

  describe("createSecureStorage", () => {
    const storage = createSecureStorage();
    const myKey = "myKey";
    const myValue = "myValue";

    describe("getItem", () => {
      it("should return the value when SecureStorage.get succeeds", async () => {
        (SecureStorage.get as jest.Mock).mockResolvedValue(myValue);

        const result = await storage.getItem(myKey);
        expect(result).toBe(myValue);
        expect(SecureStorage.get).toHaveBeenCalledWith(myKey);
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it("should return undefined and NOT track error when VALUE_NOT_FOUND occurs", async () => {
        (SecureStorage.get as jest.Mock).mockRejectedValue({
          message: "VALUE_NOT_FOUND",
          userInfo: {}
        });

        const result = await storage.getItem(myKey);
        expect(result).toBeUndefined();
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it("should return undefined AND track error on generic failures", async () => {
        const error = new Error("Decryption failed");
        (SecureStorage.get as jest.Mock).mockRejectedValue(error);

        const result = await storage.getItem(myKey);
        expect(result).toBeUndefined();
        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
          tags: { isRequired: true }
        });
      });
    });

    describe("setItem", () => {
      it("should call SecureStorage.put correctly", async () => {
        (SecureStorage.put as jest.Mock).mockResolvedValue(undefined);

        await storage.setItem(myKey, myValue);
        expect(SecureStorage.put).toHaveBeenCalledWith(myKey, myValue);
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it("should track error on Sentry if put fails", async () => {
        const error = new Error("Disk full");
        (SecureStorage.put as jest.Mock).mockRejectedValue(error);

        await storage.setItem(myKey, myValue);
        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
          tags: { isRequired: true }
        });
      });
    });

    describe("removeItem", () => {
      it("should call SecureStorage.remove correctly", async () => {
        (SecureStorage.remove as jest.Mock).mockResolvedValue(undefined);

        await storage.removeItem(myKey);
        expect(SecureStorage.remove).toHaveBeenCalledWith(myKey);
        expect(Sentry.captureException).not.toHaveBeenCalled();
      });

      it("should track error on Sentry if remove fails", async () => {
        const error = new Error("Access denied");
        (SecureStorage.remove as jest.Mock).mockRejectedValue(error);

        await storage.removeItem(myKey);
        expect(Sentry.captureException).toHaveBeenCalledWith(error, {
          tags: { isRequired: true }
        });
      });
    });
  });
});
