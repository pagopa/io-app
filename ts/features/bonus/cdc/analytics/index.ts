import { getType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { cdcEnabled } from "../../../../config";
import { mixpanel } from "../../../../mixpanel";
import { Action } from "../../../../store/actions/types";
import {
  cdcEnrollUserToBonus,
  cdcRequestBonusList
} from "../store/actions/cdcBonusRequest";

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
        return mp.track(action.type, { bonusYear: action.payload });
      case getType(cdcEnrollUserToBonus.success):
        const value = pipe(
          action.payload,
          O.fromNullable,
          O.map(p => {
            // eslint-disable-next-line sonarjs/no-nested-switch
            switch (p.kind) {
              case "success":
              case "partialSuccess":
                return p.value;
              case "wrongFormat":
                return p.reason;
              case "requirementsError":
              case "genericError":
                return undefined;
            }
          })
        );

        return mp.track(action.type, { status: action.payload.kind, value });
    }
    return Promise.resolve();
  };

const emptyTracking = (_: NonNullable<typeof mixpanel>) => (__: Action) =>
  Promise.resolve();

export default cdcEnabled ? trackCdc : emptyTracking;
