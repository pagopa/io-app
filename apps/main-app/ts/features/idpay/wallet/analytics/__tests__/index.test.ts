import { StatusEnum as InitiativeOnboardingStatus } from "@io-app/api-types/generated/definitions/idpay/UserOnboardingStatusDTO";

import { trackIDPayOnWaitingListInfoButtonTap } from "..";
import * as mixpanel from "../../../../../mixpanel";

describe("trackIDPayOnWaitingListInfoButtonTap", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      status: InitiativeOnboardingStatus.ON_WAITING_LIST,
      expected: "waiting_list"
    },
    {
      status: InitiativeOnboardingStatus.ON_EVALUATION,
      expected: "on_evaluation"
    }
  ])("should track $status as $expected", ({ status, expected }) => {
    const spy = jest
      .spyOn(mixpanel, "mixpanelTrack")
      .mockImplementation(jest.fn());

    trackIDPayOnWaitingListInfoButtonTap({ initiativeId: "1", status });

    expect(spy).toHaveBeenCalledWith("IDPAY_BONUS_STATUS_TAP", {
      event_category: "UX",
      event_type: "action",
      flow: undefined,
      initiativeId: "1",
      status: expected
    });
  });
});
