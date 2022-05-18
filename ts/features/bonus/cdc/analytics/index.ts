import { getType } from "typesafe-actions";
import { cdcEnabled } from "../../../../config";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import {
  cdcEnrollUserToBonus,
  cdcRequestBonusList
} from "../store/actions/cdcBonusRequest";

/**
 * numero richieste passate a sogei
 numero richieste con residenza estera
 numero richieste per anno
 * @param mp
 */
const trackCdc =
  (mp: NonNullable<typeof mixpanel>) =>
  (action: Action): Promise<void> => {
    switch (action.type) {
      case getType(cdcRequestBonusList.request):
      case getType(cdcRequestBonusList.success):
        return mp.track(action.type);
      case getType(cdcEnrollUserToBonus.failure):
      case getType(cdcRequestBonusList.failure):
        return mp.track(action.type, {
          reason: action.payload
        });
      case getType(cdcEnrollUserToBonus.request):
      case getType(cdcEnrollUserToBonus.success):
        return mp.track(action.type, { bonusYear: action.payload });
    }
    return Promise.resolve();
  };

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();

export default cdcEnabled ? trackCdc : emptyTracking;
