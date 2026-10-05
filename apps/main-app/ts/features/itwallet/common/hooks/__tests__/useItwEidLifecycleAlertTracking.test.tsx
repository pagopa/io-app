import { act, renderHook } from "@testing-library/react-native";

import {
  trackItwBannerTap,
  trackItwBannerVisualized
} from "../../../analytics";
import { ItwJwtCredentialStatus } from "../../utils/itwTypesUtils";
import { useItwEidLifecycleAlertTracking } from "../useItwEidLifecycleAlertTracking";

jest.mock("../../../analytics", () => ({
  trackItwBannerTap: jest.fn(),
  trackItwBannerVisualized: jest.fn()
}));

type Scenario = {
  bannerId: string;
  isItwCredential: boolean;
  name: string;
  status: ItwJwtCredentialStatus;
};

const scenarios: ReadonlyArray<Scenario> = [
  {
    name: "expiring PID",
    status: "jwtExpiring",
    isItwCredential: true,
    bannerId: "itwExpiringPidBanner"
  },
  {
    name: "expired PID",
    status: "jwtExpired",
    isItwCredential: true,
    bannerId: "itwExpiredPidBanner"
  },
  {
    name: "expiring eID",
    status: "jwtExpiring",
    isItwCredential: false,
    bannerId: "itwExpiringIdBanner"
  },
  {
    name: "expired eID",
    status: "jwtExpired",
    isItwCredential: false,
    bannerId: "itwExpiredIdBanner"
  }
];

describe("useItwEidLifecycleAlertTracking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each(scenarios)("tracks the $name banner", scenario => {
    const addListener = jest.fn().mockReturnValue(jest.fn());
    const navigation = { addListener } as any;
    const { result } = renderHook(() =>
      useItwEidLifecycleAlertTracking({
        isItwCredential: scenario.isItwCredential,
        maybeEidStatus: scenario.status,
        navigation
      })
    );
    const onFocus = addListener.mock.calls.find(
      ([event]) => event === "focus"
    )?.[1];

    act(() => {
      onFocus();
    });

    expect(trackItwBannerVisualized).toHaveBeenCalledWith(
      expect.objectContaining({ banner_id: scenario.bannerId })
    );

    act(() => result.current.trackAlertTap());

    expect(trackItwBannerTap).toHaveBeenCalledWith(
      expect.objectContaining({ banner_id: scenario.bannerId })
    );
  });
});
