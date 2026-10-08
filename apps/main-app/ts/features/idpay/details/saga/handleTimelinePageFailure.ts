import * as pot from "@pagopa/ts-commons/lib/pot";
import { call, select, take } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { trackIDPayDetailTimelineError } from "../analytics";
import { idpayInitiativeDetailsSelector } from "../store";
import { idpayInitiativeGet, idpayTimelinePageGet } from "../store/actions";

export function* handleTimelinePageFailure(
  action: ActionType<(typeof idpayTimelinePageGet)["failure"]>
) {
  const { initiativeId, error } = action.payload;

  if (pot.isLoading(yield* select(idpayInitiativeDetailsSelector))) {
    yield* take([idpayInitiativeGet.success, idpayInitiativeGet.failure]);
  }

  const initiative = pot.toUndefined(
    yield* select(idpayInitiativeDetailsSelector)
  );

  yield* call(trackIDPayDetailTimelineError, {
    initiative_id: initiativeId,
    initiative_name:
      initiative?.initiativeId === initiativeId
        ? initiative.initiativeName
        : undefined,
    error
  });
}
