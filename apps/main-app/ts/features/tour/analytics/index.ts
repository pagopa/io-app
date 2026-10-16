import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";

type TourGuideAction = "back" | "close" | "conclude" | "next" | "shown";

export const trackTourGuideAction = (
  tour_guide_id: string,
  action: TourGuideAction
) => {
  void mixpanelTrack(
    "TOUR_GUIDE",
    buildEventProperties("UX", "action", { action, tour_guide_id })
  );
};
