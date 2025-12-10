import { renderHook } from "@testing-library/react-native";
import { act } from "react";
import {
  CieManager,
  InternalAuthAndMrtdResponse,
  NfcError,
  NfcEvent
} from "@pagopa/io-react-native-cie";
import HapticFeedback, {
  HapticFeedbackTypes
} from "react-native-haptic-feedback";
import { Platform } from "react-native";
import {
  ReadStatus,
  useCieInternalAuthAndMrtdReading
} from "../useCieInternalAuthAndMrtdReading";

const TEST_CAN = "123456";
const TEST_CHALLENGE = "test_challenge";

jest.mock("@pagopa/io-react-native-cie", () => ({
  CieManager: {
    addListener: jest.fn().mockReturnValue(jest.fn),
    removeAllListeners: jest.fn(),
    setCurrentAlertMessage: jest.fn(),
    setAlertMessage: jest.fn(),
    stopReading: jest.fn(async () => null),
    startInternalAuthAndMRTDReading: jest.fn()
  }
}));

describe("useCieInternalAuthAndMrtdReading", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should start in Idle state", () => {
    const { result } = renderHook(() => useCieInternalAuthAndMrtdReading());

    expect(result.current.readState).toStrictEqual({ status: ReadStatus.IDLE });
  });

  it("should not re-render on first execution of 'startReading'", async () => {
    const spyOnStartInternalAuth = jest.spyOn(
      CieManager,
      "startInternalAuthAndMRTDReading"
    );
    const { result } = renderHook(() => useCieInternalAuthAndMrtdReading());

    const initialState = result.current.readState;

    expect(spyOnStartInternalAuth).not.toHaveBeenCalled();

    await act(async () => {
      await result.current.startReading(TEST_CAN, TEST_CHALLENGE, "base64url");
    });

    const stateAfterStartReading = result.current.readState;

    expect(spyOnStartInternalAuth).toHaveBeenCalledTimes(1);
    expect(spyOnStartInternalAuth).toHaveBeenCalledWith(
      TEST_CAN,
      TEST_CHALLENGE,
      "base64url"
    );
    expect(initialState).toBe(stateAfterStartReading);
  });
  it('should register to "onEvent", "onError" and "onInternalAuthAndMRTDWithPaceSuccess" events', () => {
    const spyOnAddListener = jest.spyOn(CieManager, "addListener");
    expect(spyOnAddListener).toHaveBeenCalledTimes(0);

    renderHook(() => useCieInternalAuthAndMrtdReading());

    expect(spyOnAddListener).toHaveBeenCalledTimes(3);

    expect(spyOnAddListener).toHaveBeenCalledWith(
      "onEvent",
      expect.any(Function)
    );
    expect(spyOnAddListener).toHaveBeenCalledWith(
      "onError",
      expect.any(Function)
    );
    expect(spyOnAddListener).toHaveBeenCalledWith(
      "onInternalAuthAndMRTDWithPaceSuccess",
      expect.any(Function)
    );
  });
  it('should remove all listeners and invoke "CieManager.stopReading" on unmount', () => {
    const mockRemove = jest.fn();
    jest.spyOn(CieManager, "addListener").mockReturnValue(mockRemove);

    const spyOnStopReading = jest.spyOn(CieManager, "stopReading");

    const { unmount } = renderHook(() => useCieInternalAuthAndMrtdReading());

    expect(mockRemove).not.toHaveBeenCalled();
    expect(spyOnStopReading).not.toHaveBeenCalled();

    act(() => {
      unmount();
    });

    expect(mockRemove).toHaveBeenCalledTimes(3);
    expect(spyOnStopReading).toHaveBeenCalledTimes(1);
  });
  it.each([
    "CONNECTED",
    "GET_SERVICE_ID",
    "SELECT_IAS",
    "SELECT_CIE",
    "READ_FILE"
  ])(
    'should trigger HapticFeedback only when the "ON_TAG_DISCOVERED" event is sent, not for "%s"',
    eventName => {
      const spyOnAddListener = jest.spyOn(CieManager, "addListener");
      const spyOnHapticFeedbackTrigger = jest.spyOn(HapticFeedback, "trigger");
      const { result } = renderHook(() => useCieInternalAuthAndMrtdReading());

      expect(spyOnAddListener.mock.calls[0][0]).toBe("onEvent");

      const onEventCallback = spyOnAddListener.mock.calls[0][1] as (
        event: NfcEvent
      ) => void;
      const progress1 = Math.random();

      act(() => {
        onEventCallback({ name: eventName, progress: progress1 });
      });

      expect(result.current.readState).toStrictEqual({
        status: ReadStatus.READING,
        progress: progress1
      });

      expect(spyOnHapticFeedbackTrigger).not.toHaveBeenCalled();

      const progress2 = Math.random();
      act(() => {
        onEventCallback({ name: "ON_TAG_DISCOVERED", progress: progress2 });
      });

      expect(spyOnHapticFeedbackTrigger).toHaveBeenCalledWith(
        HapticFeedbackTypes.impactHeavy
      );
      expect(result.current.readState).toStrictEqual({
        status: ReadStatus.READING,
        progress: progress2
      });
    }
  );
  it.each([
    "TAG_LOST",
    "CANCELLED_BY_USER",
    "NOT_A_CIE",
    "GENERIC_ERROR"
  ] as Array<Exclude<NfcError["name"], "WRONG_PIN">>)(
    'should update the readState when an error occurs and invoke "CieManager.stopReading" (errorName: "%s")',
    errorName => {
      const errorPayload: Exclude<NfcError, { name: "WRONG_PIN" }> = {
        name: errorName
      };
      const spyOnAddListener = jest.spyOn(CieManager, "addListener");
      const spyOnStopReading = jest.spyOn(CieManager, "stopReading");

      const { result } = renderHook(() => useCieInternalAuthAndMrtdReading());

      expect(spyOnAddListener.mock.calls[1][0]).toBe("onError");
      expect(result.current.readState).toStrictEqual({
        status: ReadStatus.IDLE
      });

      const onErrorCallback = spyOnAddListener.mock.calls[1][1] as (
        error: NfcError
      ) => void;

      act(() => {
        onErrorCallback(errorPayload);
      });

      expect(spyOnStopReading).toHaveBeenCalledTimes(1);
      expect(result.current.readState).toStrictEqual({
        status: ReadStatus.ERROR,
        error: errorPayload
      });
    }
  );
  it("should update the readState when the reading process has been completed", () => {
    const successPayload: InternalAuthAndMrtdResponse = {
      nis_data: {
        nis: "",
        publicKey: "",
        sod: "",
        signedChallenge: ""
      },
      mrtd_data: {
        dg1: "",
        dg11: "",
        sod: ""
      }
    };
    const spyOnAddListener = jest.spyOn(CieManager, "addListener");

    const { result } = renderHook(() => useCieInternalAuthAndMrtdReading());

    expect(spyOnAddListener.mock.calls[2][0]).toBe(
      "onInternalAuthAndMRTDWithPaceSuccess"
    );
    expect(result.current.readState).toStrictEqual({ status: ReadStatus.IDLE });

    const onInternalAuthAndMRTDWithPaceSuccessCallback = spyOnAddListener.mock
      .calls[2][1] as (result: InternalAuthAndMrtdResponse) => void;

    act(() => {
      onInternalAuthAndMRTDWithPaceSuccessCallback(successPayload);
    });

    expect(result.current.readState).toStrictEqual({
      status: ReadStatus.SUCCESS,
      data: successPayload
    });
  });
  it.each([
    {
      platform: "ios",
      it: 'should invoke "CieManager.setAlertMessage" when platform is ios'
    },
    {
      platform: "android",
      it: 'shouldn\'t invoke "CieManager.setAlertMessage" when platform is android'
    }
  ] as Array<{ platform: typeof Platform.OS; it: string }>)(
    "$it",
    async ({ platform }) => {
      jest.replaceProperty(Platform, "OS", platform);
      const spyOnSetAlertMessage = jest.spyOn(CieManager, "setAlertMessage");

      const { result, rerender, unmount } = renderHook(() =>
        useCieInternalAuthAndMrtdReading()
      );

      act(() => {
        rerender(undefined);
      });

      await act(async () => {
        await result.current.startReading(
          TEST_CAN,
          TEST_CHALLENGE,
          "base64url"
        );
      });

      act(() => {
        result.current.stopReading();
      });

      act(unmount);

      switch (platform) {
        case "ios": {
          expect(spyOnSetAlertMessage).toHaveBeenCalledTimes(2);
          expect(spyOnSetAlertMessage).toHaveBeenCalledWith(
            "readingInstructions",
            expect.any(String)
          );
          expect(spyOnSetAlertMessage).toHaveBeenCalledWith(
            "readingSuccess",
            expect.any(String)
          );
          break;
        }
        default: {
          expect(spyOnSetAlertMessage).not.toHaveBeenCalled();
          break;
        }
      }
    }
  );
  it.each([
    {
      platform: "ios",
      it: 'should invoke "CieManager.setCurrentAlertMessage" when platform is ios and status is "ReadStatus.READING"'
    },
    {
      platform: "android",
      it: 'shouldn\'t invoke "CieManager.setCurrentAlertMessage" when platform is android'
    }
  ] as Array<{ platform: typeof Platform.OS; it: string }>)(
    "$it",
    ({ platform }) => {
      jest.replaceProperty(Platform, "OS", platform);
      const spyOnSetCurrentAlertMessage = jest.spyOn(
        CieManager,
        "setCurrentAlertMessage"
      );
      const spyOnAddListener = jest
        .spyOn(CieManager, "addListener")
        .mockReturnValue(jest.fn());

      const { result, rerender, unmount } = renderHook(() =>
        useCieInternalAuthAndMrtdReading()
      );

      const [onEventCb, onErrorCb, onSuccessCb] =
        spyOnAddListener.mock.calls.map(([, cb]) => cb) as [
          (e: NfcEvent) => void,
          (e: NfcError) => void,
          (r: InternalAuthAndMrtdResponse) => void
        ];

      expect(spyOnSetCurrentAlertMessage).not.toHaveBeenCalled();

      act(() => {
        onEventCb({ name: "ANY_EVENT", progress: 0.1 });
      });

      expect(result.current.readState).toHaveProperty(
        "status",
        ReadStatus.READING
      );

      switch (platform) {
        case "ios": {
          expect(spyOnSetCurrentAlertMessage).toHaveBeenCalledTimes(1);
          expect(spyOnSetCurrentAlertMessage).toHaveBeenCalledWith(
            expect.any(String)
          );
          break;
        }
        default: {
          expect(spyOnSetCurrentAlertMessage).not.toHaveBeenCalled();
          break;
        }
      }

      spyOnSetCurrentAlertMessage.mockRestore();

      act(() => {
        onErrorCb({ name: "TAG_LOST" });
      });

      expect(result.current.readState).toHaveProperty(
        "status",
        ReadStatus.ERROR
      );

      act(() => {
        onSuccessCb({} as InternalAuthAndMrtdResponse);
      });

      expect(result.current.readState).toHaveProperty(
        "status",
        ReadStatus.SUCCESS
      );

      act(() => {
        rerender(undefined);
      });

      act(unmount);

      expect(spyOnSetCurrentAlertMessage).not.toHaveBeenCalled();
    }
  );
  it('should keep the same instances of "startReading" and "stopReading" despite the hook re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useCieInternalAuthAndMrtdReading()
    );

    const startReadingFirstInstance = result.current.startReading;
    const stopReadingFirstInstance = result.current.stopReading;

    act(() => {
      rerender(undefined);
    });

    expect(startReadingFirstInstance).toBe(result.current.startReading);
    expect(stopReadingFirstInstance).toBe(result.current.stopReading);
  });
});
