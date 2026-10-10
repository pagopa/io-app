import * as Mixpanel from "../../../../../../mixpanel";
import { trackWalletCredentialOpportunities } from "../index";

const scenarios = [
  { name: "Documenti su IO", credential: "ITW_CED_V2" },
  { name: "IT-Wallet", credential: "ITW_CED_V3" }
] as const;

describe("trackWalletCredentialOpportunities", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test.each(scenarios)(
    "tracks the $name credential opportunities click",
    ({ credential }) => {
      const track = jest.spyOn(Mixpanel, "mixpanelTrack").mockImplementation();

      trackWalletCredentialOpportunities(credential);

      expect(track).toHaveBeenCalledTimes(1);
      expect(track).toHaveBeenCalledWith("ITW_CREDENTIAL_OPPORTUNITIES", {
        event_category: "UX",
        event_type: "action",
        flow: undefined,
        credential
      });
    }
  );
});
