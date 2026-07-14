import { act, render } from "@testing-library/react-native";
import { type ComponentType, createElement } from "react";
import { AppRegistry, AppState, type AppStateStatus, View } from "react-native";

const mockAppModuleLoaded = jest.fn();
const mockCurrentAppState = jest.fn((): AppStateStatus => "background");
const mockInitializePushNotifications = jest.fn();
const mockRemoveAppStateListener = jest.fn();
const mockSetJSExceptionHandler = jest.fn();
const mockSetNativeExceptionHandler = jest.fn();
const mockTaskModuleLoaded = jest.fn();

const MockApp = () => createElement(View, { testID: "mock-app" });

const mockAddAppStateListener = jest
  .spyOn(AppState, "addEventListener")
  .mockReturnValue({ remove: mockRemoveAppStateListener });
const mockRegisterComponent = jest.spyOn(AppRegistry, "registerComponent");
// eslint-disable-next-line functional/immutable-data
Object.defineProperty(AppState, "currentState", {
  configurable: true,
  get: mockCurrentAppState
});

jest.mock("../shim", () => ({}));
jest.mock("react-native-get-random-values", () => ({}));
jest.mock("react-native-quick-base64", () => ({}));
jest.mock("react-native-exception-handler", () => ({
  setJSExceptionHandler: mockSetJSExceptionHandler,
  setNativeExceptionHandler: mockSetNativeExceptionHandler
}));
jest.mock("../ts/mixpanel", () => ({
  isMixpanelInstanceInitialized: jest.fn(() => false),
  mixpanelTrack: jest.fn()
}));
jest.mock(
  "../ts/features/pushNotifications/utils/configurePushNotification",
  () => ({
    initializePushNotifications: mockInitializePushNotifications
  })
);
jest.mock("../ts/features/itwallet/statusList/tasks", () => {
  mockTaskModuleLoaded();
  return {};
});
jest.mock("../ts/App", () => {
  mockAppModuleLoaded();
  return { __esModule: true, default: MockApp };
});

it("keeps background inert and resolves foreground launches directly", () => {
  require("../index");

  expect(mockTaskModuleLoaded).toHaveBeenCalledTimes(1);
  expect(mockRegisterComponent).toHaveBeenCalledTimes(1);

  const rootProvider = mockRegisterComponent.mock
    .calls[0][1] as () => ComponentType;
  const Root = rootProvider();
  const backgroundView = render(createElement(Root));

  expect(mockAppModuleLoaded).not.toHaveBeenCalled();
  expect(mockInitializePushNotifications).not.toHaveBeenCalled();
  expect(mockSetJSExceptionHandler).not.toHaveBeenCalled();
  expect(mockSetNativeExceptionHandler).not.toHaveBeenCalled();
  expect(backgroundView.queryByTestId("mock-app")).toBeNull();

  backgroundView.unmount();
  expect(mockRemoveAppStateListener).toHaveBeenCalledTimes(1);

  mockCurrentAppState
    .mockReset()
    .mockReturnValueOnce("background")
    .mockReturnValue("active");

  const foregroundView = render(createElement(Root));

  expect(mockCurrentAppState).toHaveBeenCalledTimes(2);
  expect(mockAppModuleLoaded).toHaveBeenCalledTimes(1);
  expect(mockInitializePushNotifications).toHaveBeenCalledTimes(1);
  expect(mockSetJSExceptionHandler).toHaveBeenCalledTimes(1);
  expect(mockSetNativeExceptionHandler).toHaveBeenCalledTimes(1);
  expect(mockRemoveAppStateListener).toHaveBeenCalledTimes(2);
  expect(foregroundView.getByTestId("mock-app")).toBeTruthy();

  const onAppStateChange = mockAddAppStateListener.mock.calls[1][1] as (
    state: AppStateStatus
  ) => void;

  act(() => onAppStateChange("active"));

  expect(mockAppModuleLoaded).toHaveBeenCalledTimes(1);
  expect(mockInitializePushNotifications).toHaveBeenCalledTimes(1);

  foregroundView.unmount();

  mockCurrentAppState.mockReset().mockReturnValue("inactive");

  const inactiveView = render(createElement(Root));

  expect(inactiveView.getByTestId("mock-app")).toBeTruthy();
  expect(mockInitializePushNotifications).toHaveBeenCalledTimes(1);
  expect(mockAddAppStateListener).toHaveBeenCalledTimes(2);

  inactiveView.unmount();

  expect(rootProvider()).toBe(MockApp);
});
