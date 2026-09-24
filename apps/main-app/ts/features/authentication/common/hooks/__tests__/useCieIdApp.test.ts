import { openCieIdApp } from "@pagopa/io-react-native-cieid";
import { renderHook, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";

import { useCieIdApp } from "../useCieIdApp";

jest.mock("@pagopa/io-react-native-cieid", () => ({
  openCieIdApp: jest.fn()
}));

const mockedOpenCieIdApp = jest.mocked(openCieIdApp);

jest.mock("../../../../../utils/platform", () => ({
  isAndroid: false,
  isIos: false
}));

const platformMock = jest.requireMock("../../../../../utils/platform") as {
  isAndroid: boolean;
  isIos: boolean;
};

const IO_LOGIN_CIE_URL_SCHEME = "iologincie:";

const setPlatform = (platform: "android" | "ios" | "none") => {
  // eslint-disable-next-line functional/immutable-data
  platformMock.isAndroid = platform === "android";
  // eslint-disable-next-line functional/immutable-data
  platformMock.isIos = platform === "ios";
};

describe("useCieIdApp", () => {
  const onFailure = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setPlatform("none");

    jest.spyOn(Linking, "addEventListener").mockReturnValue({
      remove: jest.fn()
    } as unknown as ReturnType<typeof Linking.addEventListener>);
  });

  describe("Linking url listener", () => {
    it("should subscribe to the url event on mount and remove it on unmount", () => {
      const removeSpy = jest.fn();
      const addEventListenerSpy = jest
        .spyOn(Linking, "addEventListener")
        .mockReturnValue({ remove: removeSpy } as unknown as ReturnType<
          typeof Linking.addEventListener
        >);

      const { unmount } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "url",
        expect.any(Function)
      );
      unmount();
      expect(removeSpy).toHaveBeenCalledTimes(1);
    });

    it("should ignore urls that don't match the CIE login url scheme", () => {
      jest
        .spyOn(Linking, "addEventListener")
        .mockImplementation((_type, callback) => {
          callback({ url: "https://example.com" });

          return { remove: jest.fn() } as unknown as ReturnType<
            typeof Linking.addEventListener
          >;
        });

      renderHook(() => useCieIdApp({ onFailure, onSuccess }));

      expect(onSuccess).not.toHaveBeenCalled();
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should call onFailure with the extracted error message when the url contains a CIE ID error", () => {
      jest
        .spyOn(Linking, "addEventListener")
        .mockImplementation((_type, callback) => {
          callback({
            url: `${IO_LOGIN_CIE_URL_SCHEME}cieiderror?cieid_error_message=generic_error`
          });
          return { remove: jest.fn() } as unknown as ReturnType<
            typeof Linking.addEventListener
          >;
        });

      renderHook(() => useCieIdApp({ onFailure, onSuccess }));

      expect(onFailure).toHaveBeenCalledWith("generic_error");
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should call onSuccess with the continuation url when there is no CIE ID error", () => {
      jest
        .spyOn(Linking, "addEventListener")
        .mockImplementation((_type, callback) => {
          callback({
            url: `${IO_LOGIN_CIE_URL_SCHEME}//continue-url`
          });
          return { remove: jest.fn() } as unknown as ReturnType<
            typeof Linking.addEventListener
          >;
        });

      renderHook(() => useCieIdApp({ onFailure, onSuccess }));

      expect(onSuccess).toHaveBeenCalledWith("//continue-url");
      expect(onFailure).not.toHaveBeenCalled();
    });
  });

  describe("startCieIdApp on Android", () => {
    beforeEach(() => {
      setPlatform("android");
    });

    it("should call openCieIdApp with the production environment by default", () => {
      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(mockedOpenCieIdApp).toHaveBeenCalledWith(
        "https://example.com/auth",
        expect.any(Function),
        "production"
      );
    });

    it("should call openCieIdApp with the preprod environment when useUat is true", () => {
      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess, useUat: true })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(mockedOpenCieIdApp).toHaveBeenCalledWith(
        "https://example.com/auth",
        expect.any(Function),
        "preprod"
      );
    });

    it("should call onSuccess with the returned url when openCieIdApp succeeds", () => {
      mockedOpenCieIdApp.mockImplementationOnce((_url, callback) => {
        callback({ id: "URL", url: "https://example.com/continue" });
      });

      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(onSuccess).toHaveBeenCalledWith("https://example.com/continue");
      expect(onFailure).not.toHaveBeenCalled();
    });

    it("should call onFailure with the error code when openCieIdApp fails", () => {
      mockedOpenCieIdApp.mockImplementationOnce((_url, callback) => {
        callback({ id: "ERROR", code: "GENERIC_ERROR" });
      });

      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(onFailure).toHaveBeenCalledWith("GENERIC_ERROR");
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("should not call Linking.openURL", () => {
      const openURLSpy = jest.spyOn(Linking, "openURL");

      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(openURLSpy).not.toHaveBeenCalled();
    });
  });

  describe("startCieIdApp on iOS", () => {
    beforeEach(() => {
      setPlatform("ios");
    });

    it("should call Linking.openURL with the CIEID scheme and source app", async () => {
      const openURLSpy = jest.spyOn(Linking, "openURL").mockResolvedValue(true);

      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      await waitFor(() => {
        expect(openURLSpy).toHaveBeenCalledWith(
          "CIEID://https://example.com/auth&sourceApp=iologincie"
        );
        expect(onFailure).not.toHaveBeenCalled();
      });
    });

    it("should call onFailure when Linking.openURL rejects", async () => {
      const openURLError = new Error("Unable to open URL");
      jest.spyOn(Linking, "openURL").mockRejectedValue(openURLError);

      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      await waitFor(() => {
        expect(onFailure).toHaveBeenCalledWith(openURLError);
      });
    });

    it("should not call openCieIdApp", () => {
      const { result } = renderHook(() =>
        useCieIdApp({ onFailure, onSuccess })
      );

      result.current.startCieIdApp("https://example.com/auth");

      expect(mockedOpenCieIdApp).not.toHaveBeenCalled();
    });
  });
});
