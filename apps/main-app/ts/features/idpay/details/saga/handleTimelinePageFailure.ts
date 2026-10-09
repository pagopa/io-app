import { call } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";

import { trackIDPayDetailTimelineError } from "../analytics";
import { idpayTimelinePageGet } from "../store/actions";

export function* handleTimelinePageFailure(
  action: ActionType<(typeof idpayTimelinePageGet)["failure"]>
) {
  const { initiativeId, error } = action.payload;

  yield* call(trackIDPayDetailTimelineError, {
    initiative_id: initiativeId,
    error
  });
}
