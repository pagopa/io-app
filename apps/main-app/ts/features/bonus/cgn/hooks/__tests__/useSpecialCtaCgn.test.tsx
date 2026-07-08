import { IOToast } from "@pagopa/io-app-design-system";
import { render } from "@testing-library/react-native";
import { Alert } from "react-native";
import {
  remoteLoading,
  remoteReady,
  remoteUndefined
} from "../../../../../common/model/RemoteValue";
import { loadServicePreference } from "../../../../services/details/store/actions/preference";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import { cgnActivationStart } from "../../store/actions/activation";
import { cgnUnsubscribe } from "../../store/actions/unsubscribe";
import { useSpecialCtaCgn } from "../useSpecialCtaCgn";

jest.mock("@pagopa/io-app-design-system", () => ({
  ...jest.requireActual("@pagopa/io-app-design-system"),
  IOToast: {
    success: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock("../../../../services/common/analytics", () => ({
  trackServicesCgnStartRequest: jest.fn(),
  trackSpecialServiceStatusChanged: jest.fn()
}));

import * as analytics from "../../../../services/common/analytics";

const mockDispatch = jest.fn();
const mockUseIOSelector = jest.fn();
const mockUseServicePreferenceByChannel = jest.fn();

jest.mock("../../../../../store/hooks", () => ({
  useIODispatch: () => mockDispatch,
  useIOSelector: (selector: unknown) => mockUseIOSelector(selector)
}));

jest.mock("../../../../services/details/hooks/useServicePreference", () => ({
  useServicePreferenceByChannel: (...args: ReadonlyArray<unknown>) =>
    mockUseServicePreferenceByChannel(...args)
}));

jest.mock("../../../../../store/reducers/backendStatus/remoteConfig", () => ({
  isCGNEnabledSelector: Symbol("isCGNEnabledSelector")
}));

jest.mock("../../store/reducers/unsubscribe", () => ({
  cgnUnsubscribeSelector: Symbol("cgnUnsubscribeSelector")
}));

const serviceId = "service-id" as never;

describe("useSpecialCtaCgn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIOSelector
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(remoteUndefined);
    mockUseServicePreferenceByChannel.mockReturnValue({
      isLoadingServicePreferenceByChannel: false,
      servicePreferenceByChannel: false
    });
  });

  const renderHook = () => {
    let latestAction: ReturnType<typeof useSpecialCtaCgn>;

    const Component = () => {
      latestAction = useSpecialCtaCgn(serviceId);
      return null;
    };

    const screen = render(<Component />);
    return {
      screen,
      getAction: () => latestAction,
      Component
    };
  };

  it("returns undefined when CGN is disabled", () => {
    mockUseIOSelector.mockReset();
    mockUseIOSelector
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(remoteUndefined);

    const { getAction } = renderHook();

    expect(getAction()).toBeUndefined();
  });

  it("returns activation CTA and dispatches start flow on press", () => {
    const trackSpy = jest
      .spyOn(analytics, "trackServicesCgnStartRequest")
      .mockImplementation(jest.fn());

    const { getAction } = renderHook();
    const action = getAction();

    expect(action?.testID).toBe("service-activate-bonus-button");
    action?.onPress();

    expect(trackSpy).toHaveBeenCalledWith(serviceId);
    expect(mockDispatch).toHaveBeenNthCalledWith(
      1,
      loadAvailableBonuses.request()
    );
    expect(mockDispatch).toHaveBeenNthCalledWith(2, cgnActivationStart());
  });

  it("returns deactivation CTA and dispatches unsubscribe after confirmation", () => {
    mockUseServicePreferenceByChannel.mockReturnValue({
      isLoadingServicePreferenceByChannel: false,
      servicePreferenceByChannel: true
    });
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    const trackSpy = jest
      .spyOn(analytics, "trackSpecialServiceStatusChanged")
      .mockImplementation(jest.fn());

    const { getAction } = renderHook();
    const action = getAction();

    expect(action?.testID).toBe("service-cgn-deactivate-bonus-button");
    action?.onPress();

    const buttons = alertSpy.mock.calls[0][2];
    expect(buttons?.[0].onPress).toBeDefined();
    buttons?.[0].onPress?.();

    expect(trackSpy).toHaveBeenCalledWith({
      is_active: false,
      service_id: serviceId
    });
    expect(mockDispatch).toHaveBeenCalledWith(cgnUnsubscribe.request());
  });

  it("shows success toast and reloads service preference after successful unsubscribe", () => {
    const successToast = IOToast.success as jest.Mock;
    mockUseIOSelector.mockReset();
    mockUseIOSelector
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(remoteUndefined)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(remoteReady(true));

    mockUseServicePreferenceByChannel.mockReturnValue({
      isLoadingServicePreferenceByChannel: false,
      servicePreferenceByChannel: true
    });

    const { screen, Component } = renderHook();
    screen.rerender(<Component />);

    expect(successToast).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      loadServicePreference.request(serviceId)
    );
  });

  it("exposes loading flag when unsubscribe is loading", () => {
    mockUseIOSelector.mockReset();
    mockUseIOSelector
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(remoteLoading);

    const { getAction } = renderHook();

    expect(getAction()?.loading).toBe(true);
  });
});
