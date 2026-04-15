import { IOToast } from "@pagopa/io-app-design-system";
import { createStore } from "redux";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { applicationChangeState } from "../../../../store/actions/application";
import * as HOOKS from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { openAppStoreUrl } from "../../../../utils/url";
import * as ANALYTICS from "../../analytics";
import { useSpecialCtaPn } from "../useSpecialCtaPn";

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  IOToast: {
    ...jest.requireActual("@pagopa/io-app-design-system").IOToast,
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock("../../../../utils/url", () => ({
  openAppStoreUrl: jest.fn()
}));

const mockServiceId = "service-id" as ServiceId;
// eslint-disable-next-line functional/no-let
let testingAction: ((...args: any) => void) | undefined;

describe("useSpecialCtaPn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    testingAction = undefined;
  });

  it("should return undefined when PN is not enabled", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);

    renderHook({
      isPnEnabled: false,
      isPnSupported: true,
      servicePreferenceByChannel: true,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(testingAction).toBeUndefined();
  });

  it("should return undefined when servicePreferenceByChannel is undefined", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);

    renderHook({
      isPnEnabled: true,
      isPnSupported: true,
      servicePreferenceByChannel: undefined,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(testingAction).toBeUndefined();
  });

  it("should return an update app action when PN is not supported", () => {
    const mockOpenAppStore = jest.mocked(openAppStoreUrl);

    renderHook({
      isPnEnabled: true,
      isPnSupported: false,
      servicePreferenceByChannel: false,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(testingAction).toBeDefined();
    testingAction!();
    expect(mockOpenAppStore).toHaveBeenCalledTimes(1);
  });

  it("should return an activation action when service is not active", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    const mockTrack = jest
      .spyOn(ANALYTICS, "trackPNServiceDeactivated")
      .mockImplementation(jest.fn());

    renderHook({
      isPnEnabled: true,
      isPnSupported: true,
      servicePreferenceByChannel: false,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(testingAction).toBeDefined();
    testingAction!();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          value: true
        }),
        type: "PN_ACTIVATION_UPSERT_REQUEST"
      })
    );
  });

  it("should return a deactivation action when service is active", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    const mockTrack = jest
      .spyOn(ANALYTICS, "trackPNServiceActivated")
      .mockImplementation(jest.fn());

    renderHook({
      isPnEnabled: true,
      isPnSupported: true,
      servicePreferenceByChannel: true,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(testingAction).toBeDefined();
    testingAction!();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          value: false
        }),
        type: "PN_ACTIVATION_UPSERT_REQUEST"
      })
    );
  });

  it("should automatically activate the service when activate flag is true", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);

    renderHook(
      {
        isPnEnabled: true,
        isPnSupported: true,
        servicePreferenceByChannel: false,
        isLoadingServicePreferenceByChannel: false,
        isLoadingPnActivation: false
      },
      true
    );

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          value: true
        }),
        type: "PN_ACTIVATION_UPSERT_REQUEST"
      })
    );
  });

  it("should show success toast when activation is successful", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    const mockSuccessToast = IOToast.success;

    renderHook({
      isPnEnabled: true,
      isPnSupported: true,
      servicePreferenceByChannel: false,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(testingAction).toBeDefined();
    testingAction!();

    // Extract the onSuccess callback from the dispatch call
    const onSuccess = mockDispatch.mock.calls[0][0].payload.onSuccess;
    onSuccess();

    expect(mockSuccessToast).toHaveBeenCalledTimes(1);
  });

  it("should show error toast when activation fails", () => {
    const mockDispatch = jest.fn();
    jest.spyOn(HOOKS, "useIODispatch").mockImplementation(() => mockDispatch);
    const mockErrorToast = IOToast.error;

    renderHook({
      isPnEnabled: true,
      isPnSupported: true,
      servicePreferenceByChannel: false,
      isLoadingServicePreferenceByChannel: false,
      isLoadingPnActivation: false
    });

    expect(testingAction).toBeDefined();
    testingAction!();

    // Extract the onFailure callback from the dispatch call
    const onFailure = mockDispatch.mock.calls[0][0].payload.onFailure;
    onFailure();

    expect(mockErrorToast).toHaveBeenCalledTimes(1);
  });
});

// ----------- UTILS -------------

type HookState = {
  isPnEnabled: boolean;
  isPnSupported: boolean;
  servicePreferenceByChannel: boolean | undefined;
  isLoadingServicePreferenceByChannel: boolean;
  isLoadingPnActivation: boolean;
};

const renderHook = (state: HookState, activateFlag: boolean = false) => {
  const Component = () => {
    const action = useSpecialCtaPn(mockServiceId, activateFlag);
    testingAction = action?.onPress;
    return <></>;
  };

  const globalState = appReducer(undefined, applicationChangeState("active"));

  // Mock the servicePreferenceByChannel hook
  jest.spyOn(HOOKS, "useIOSelector").mockImplementation(selector => {
    if (selector.name === "isPnRemoteEnabledSelector") {
      return state.isPnEnabled;
    }
    if (selector.name === "isPnAppVersionSupportedSelector") {
      return state.isPnSupported;
    }
    if (selector.name === "isLoadingPnActivationSelector") {
      return state.isLoadingPnActivation;
    }
    return undefined;
  });

  const mockHook = jest.requireActual(
    "../../../services/details/hooks/useServicePreference"
  );
  jest
    .spyOn(mockHook, "useServicePreferenceByChannel")
    .mockImplementation(() => ({
      isLoadingServicePreferenceByChannel:
        state.isLoadingServicePreferenceByChannel,
      servicePreferenceByChannel: state.servicePreferenceByChannel
    }));

  return renderScreenWithNavigationStoreContext(
    Component,
    "test",
    {},
    createStore(appReducer, globalState as any)
  );
};
