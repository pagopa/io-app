import { getType } from "typesafe-actions";

import { mixpanelTrack } from "../../mixpanel";
import { loadContextualHelpData, loadIdps } from "../actions/content";
import { Action } from "../actions/types";

export const trackContentAction = (action: Action): void => {
  switch (action.type) {
    case getType(loadContextualHelpData.failure):
    case getType(loadIdps.failure):
      return mixpanelTrack(action.type, {
        reason: action.payload
      });
    case getType(loadContextualHelpData.request):
    case getType(loadContextualHelpData.success):
    case getType(loadIdps.request):
    case getType(loadIdps.success):
      return mixpanelTrack(action.type);
  }
};
