import { renderHook } from "@testing-library/react-native";
import { useDerivedConnectivityState } from "../useStatusAlertProps";
import * as navigationSelectors from "../../store/reducers/navigation";
import * as connectivitySelectors from "../../features/connectivity/store/selectors";
import * as ingressSelectors from "../../features/ingress/store/selectors";
import * as startup from "../../store/reducers/startup";
import { OfflineAccessReasonEnum } from "../../features/ingress/store/reducer";
import { AUTHENTICATION_ROUTES } from "../../features/authentication/common/navigation/routes";

jest.mock("../../store/hooks", () => ({
  useIOSelector: (selector: any) => selector()
}));

describe("useDerivedConnectivityState", () => {
  it("should return `initial`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.SESSION_EXPIRED);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.INITIAL);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("initial");
  });

  it("should return `blacklisted`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue(AUTHENTICATION_ROUTES.LANDING);

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.SESSION_EXPIRED);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("blacklisted");
  });

  it("should return `mini_app_device_offline`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.DEVICE_OFFLINE);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("mini_app_device_offline");
  });

  it("should return `mini_app_back_online`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(OfflineAccessReasonEnum.DEVICE_OFFLINE);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("mini_app_back_online");
  });

  it.each([
    OfflineAccessReasonEnum.SESSION_EXPIRED,
    OfflineAccessReasonEnum.SESSION_REFRESH,
    OfflineAccessReasonEnum.TIMEOUT
  ])(`should return "mini_app_$reason"`, reason => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(true);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(reason);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe(`mini_app_${reason}`);
  });

  it("should return `offline`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("offline");
  });

  it("should return `back_online`", () => {
    jest
      .spyOn(navigationSelectors, "currentRouteSelector")
      .mockReturnValue("Home");

    const connectionSpy = jest
      .spyOn(connectivitySelectors, "isConnectedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(ingressSelectors, "offlineAccessReasonSelector")
      .mockReturnValue(undefined);

    jest
      .spyOn(startup, "isStartupLoaded")
      .mockReturnValue(startup.StartupStatusEnum.NOT_AUTHENTICATED);

    const { result, rerender } = renderHook(useDerivedConnectivityState);

    expect(result.current).toBe("offline");

    connectionSpy.mockReturnValue(true);

    rerender(undefined);

    expect(result.current).toBe("back_online");
  });
});
