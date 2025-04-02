import { getType } from "typesafe-actions";
import { Action } from "../actions/types";
import { loadContextualHelpData, loadIdps } from "../actions/content";
import { mixpanelTrack } from "../../mixpanel";

export const trackContentAction = (action: Action): void => {
  switch (action.type) {
    case getType(loadContextualHelpData.request):
    case getType(loadContextualHelpData.success):
    case getType(loadIdps.request):
    case getType(loadIdps.success):
      return mixpanelTrack(action.type);
    case getType(loadContextualHelpData.failure):
    case getType(loadIdps.failure):
      return mixpanelTrack(action.type, {
        reason: action.payload
      });
  }
};
