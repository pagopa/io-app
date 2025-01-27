jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  IOToast: {
    ...jest.requireActual("@pagopa/io-app-design-system").IOToast,
    success: jest.fn(),
    error: jest.fn()
  }
}));

import { IOToast } from "@pagopa/io-app-design-system";
import { Alert } from "react-native";
import { createStore } from "redux";
import {
  remoteError,
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import { applicationChangeState } from "../../../../../store/actions/application";
import * as USEIO from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { useFimsHistoryExport } from "../useFimsHistoryResultToasts";
import { resetFimsHistoryExportState } from "../../store/actions";

// eslint-disable-next-line functional/no-let
let testingHandleExportOnPress = () => {
  void null;
};

describe("useFimsHistoryResultToast", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("should display only a 'success' message, if the export was successful", () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(successState);
    expect(mockAlert).toHaveBeenCalledTimes(0);
    expect(mockFailureToast).toHaveBeenCalledTimes(0);
    expect(mockSuccessToast).toHaveBeenCalledTimes(1);
  });
  it("should display only an 'alreadyExporting' message, if the export has been throttled", () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(throttleState);
    expect(mockFailureToast).toHaveBeenCalledTimes(0);
    expect(mockSuccessToast).toHaveBeenCalledTimes(0);
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
  it("should display only an 'error' message, if the export was not successful", () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(errorState);
    expect(mockAlert).toHaveBeenCalledTimes(0);
    expect(mockSuccessToast).toHaveBeenCalledTimes(0);
    expect(mockFailureToast).toHaveBeenCalledTimes(1);
  });
  it('should not display anything in case of "loading" state', () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(loadingState);
    expect(mockSuccessToast).toHaveBeenCalledTimes(0);
    expect(mockFailureToast).toHaveBeenCalledTimes(0);
    expect(mockAlert).toHaveBeenCalledTimes(0);
  });
  it('should not display anything in case of "undefined" state', () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(undefinedState);
    expect(mockSuccessToast).toHaveBeenCalledTimes(0);
    expect(mockFailureToast).toHaveBeenCalledTimes(0);
    expect(mockAlert).toHaveBeenCalledTimes(0);
  });
  it("should display an alert before exporting", () => {
    const mockSuccessToast = IOToast.success;
    const mockFailureToast = IOToast.error;
    const mockAlert = jest.spyOn(Alert, "alert");

    renderHook(undefinedState);
    testingHandleExportOnPress();
    expect(mockSuccessToast).toHaveBeenCalledTimes(0);
    expect(mockFailureToast).toHaveBeenCalledTimes(0);
    expect(mockAlert).toHaveBeenCalledTimes(1);
  });
  it("should not display a new alert if is already processing before exporting", async () => {
    const mockAlert = jest.spyOn(Alert, "alert");
    jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => jest.fn());

    renderHook(loadingState);

    testingHandleExportOnPress(); // first export

    expect(mockAlert).toHaveBeenCalledTimes(1);

    // check for correct parameters of the alert
    const alert = mockAlert.mock.calls[0][2];
    expect(alert).toBeDefined();
    expect(alert![1]).toBeDefined();
    expect(alert![1].onPress).toBeDefined();

    alert![1].onPress!(); // start export

    testingHandleExportOnPress(); // second export, now throttling
    expect(mockAlert).toHaveBeenCalledTimes(1); // still one alert, because the second export is throttled
  });
  it("should dispatch a cleanup action on unmount", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(USEIO, "useIODispatch").mockImplementation(() => mockDispatch);

    const component = renderHook(successState);
    expect(mockDispatch).not.toHaveBeenCalled();
    component.unmount();
    expect(mockDispatch).toHaveBeenCalledWith(resetFimsHistoryExportState());
  });
});

// ----------- UTILS -------------

const successState = remoteReady("SUCCESS");
const throttleState = remoteReady("ALREADY_EXPORTING");
const errorState = remoteError(null);
const loadingState = remoteLoading;
const undefinedState = remoteUndefined;

const renderHook = (exportState: any) => {
  const Component = () => {
    const { handleExportOnPress } = useFimsHistoryExport();
    testingHandleExportOnPress = handleExportOnPress;
    return <></>;
  };
  const globalState = appReducer(
    {
      features: {
        fims: {
          history: {
            historyExportState: exportState
          }
        }
      }
    } as GlobalState,
    applicationChangeState("active")
  );
  return renderScreenWithNavigationStoreContext(
    Component,
    "TEST",
    {},
    createStore(appReducer, globalState as any)
  );
};
