import { IOToast } from "@io-app/design-system";
import { fireEvent, render } from "@testing-library/react-native";
import { Alert, Pressable, Text } from "react-native";

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

jest.mock("@io-app/design-system", () => ({
  ...jest.requireActual("@io-app/design-system"),
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
    const Component = () => {
      const action = useSpecialCtaCgn(serviceId);

      return (
        <>
          <Text testID="special-cgn-cta-testid">{action?.testID}</Text>
          <Text testID="special-cgn-cta-loading">
            {String(action?.loading)}
          </Text>
          {action ? (
            <Pressable
              accessibilityLabel="special-cgn-cta"
              accessibilityRole="button"
              onPress={action.onPress}
              testID={action.testID}
            />
          ) : null}
        </>
      );
    };

    const screen = render(<Component />);
    return {
      screen,
      Component
    };
  };

  it("returns undefined when CGN is disabled", () => {
    mockUseIOSelector.mockReset();
    mockUseIOSelector
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(remoteUndefined);

    const { screen } = renderHook();

    expect(
      screen.getByTestId("special-cgn-cta-testid").props.children
    ).toBeUndefined();
    expect(screen.queryByTestId("service-activate-bonus-button")).toBeNull();
  });

  it("returns activation CTA and dispatches start flow on press", () => {
    const trackSpy = jest
      .spyOn(analytics, "trackServicesCgnStartRequest")
      .mockImplementation(jest.fn());

    const { screen } = renderHook();

    expect(screen.getByTestId("special-cgn-cta-testid").props.children).toBe(
      "service-activate-bonus-button"
    );
    fireEvent.press(screen.getByTestId("service-activate-bonus-button"));

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

    const { screen } = renderHook();

    expect(screen.getByTestId("special-cgn-cta-testid").props.children).toBe(
      "service-cgn-deactivate-bonus-button"
    );
    fireEvent.press(screen.getByTestId("service-cgn-deactivate-bonus-button"));

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

    const { screen } = renderHook();

    expect(screen.getByTestId("special-cgn-cta-loading").props.children).toBe(
      "true"
    );
  });
});
