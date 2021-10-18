import { getType } from "typesafe-actions";
import { mixpanel } from "../../mixpanel";
import { Action } from "../actions/types";
import { loadContextualHelpData, loadIdps } from "../actions/content";

export const trackContentAction =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(loadContextualHelpData.request):
      case getType(loadContextualHelpData.success):
      case getType(loadIdps.request):
      case getType(loadIdps.success):
        return mp.track(action.type);
      case getType(loadContextualHelpData.failure):
      case getType(loadIdps.failure):
        return mp.track(action.type, {
          reason: action.payload
        });
    }
    return Promise.resolve();
  };
