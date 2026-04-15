import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

type TourGuideAction = "shown" | "next" | "back" | "close" | "conclude";

export const trackTourGuideAction = (
  tour_guide_id: string,
  action: TourGuideAction
) => {
  void mixpanelTrack(
    "TOUR_GUIDE",
    buildEventProperties("UX", "action", { action, tour_guide_id })
  );
};
