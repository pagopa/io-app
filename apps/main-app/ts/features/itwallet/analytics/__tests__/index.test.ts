import * as Mixpanel from "../../../../mixpanel";
import { ITW_TECH_EVENTS } from "../enum";
import { trackItwIdAuthenticationCompleted } from "../index";

const authenticationScenarios = [
  {
    identification: { idpId: "test-idp", level: "L2", mode: "spid" },
    itwAuthLevel: "L2",
    itwIdMethod: "spid",
    name: "SPID L2"
  },
  {
    identification: { level: "L2", mode: "cieId" },
    itwAuthLevel: "L2",
    itwIdMethod: "cieId",
    name: "CieID L2"
  },
  {
    identification: { level: "L3", mode: "cieId" },
    itwAuthLevel: "L3",
    itwIdMethod: "cieId",
    name: "CieID L3"
  }
] as const;

describe("IT-Wallet analytics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it.each(authenticationScenarios)(
    "tracks authentication completed for $name",
    ({ identification, itwAuthLevel, itwIdMethod }) => {
      const spiedOnMixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();

      trackItwIdAuthenticationCompleted(identification);

      expect(spiedOnMixpanelTrack).toHaveBeenCalledTimes(1);
      expect(spiedOnMixpanelTrack).toHaveBeenCalledWith(
        ITW_TECH_EVENTS.ITW_ID_AUTHENTICATION_COMPLETED,
        {
          event_category: "TECH",
          event_type: undefined,
          flow: undefined,
          ITW_ID_method: itwIdMethod,
          itw_auth_level: itwAuthLevel
        }
      );
    }
  );
});
