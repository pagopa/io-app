import { applicationChangeState } from "../../../../../../store/actions/application";
import { differentProfileLoggedIn } from "../../../../../../store/actions/crossSessions";
import { persistedDismissFseDiscoveryBanner } from "../../actions";
import {
  fseDiscoveryBannerInitialState,
  fseDiscoveryBannerReducer,
  FseDiscoveryBannerState
} from "..";

describe("fseDiscoveryBannerReducer", () => {
  it("should return the initial state", () => {
    expect(
      fseDiscoveryBannerReducer(undefined, applicationChangeState("active"))
    ).toEqual(fseDiscoveryBannerInitialState);
  });

  it("should set isDismissed when the banner is dismissed", () => {
    const state = fseDiscoveryBannerReducer(
      fseDiscoveryBannerInitialState,
      persistedDismissFseDiscoveryBanner()
    );

    expect(state).toEqual({
      isDismissed: true
    });
  });

  it("should reset isDismissed when a different profile logs in", () => {
    const baseState: FseDiscoveryBannerState = {
      isDismissed: true
    };

    const state = fseDiscoveryBannerReducer(
      baseState,
      differentProfileLoggedIn()
    );

    expect(state).toEqual(fseDiscoveryBannerInitialState);
  });
});
