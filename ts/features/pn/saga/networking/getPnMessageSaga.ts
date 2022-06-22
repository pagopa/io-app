import { ActionType } from "typesafe-actions";
import { call, put } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { getError } from "../../../../utils/errors";
import { loadThirdPartyMessage } from "../../../messages/store/actions";
import { BackendClient } from "../../../../api/backend";

export function* getPnMessageSaga(
  getThirdPartyMessage: ReturnType<
    typeof BackendClient
  >["getThirdPartyMessage"],
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const id = action.payload;
  try {
    const result = yield* call(getThirdPartyMessage, { id });
    if (result.isLeft()) {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(readableReport(result.value))
        })
      );
    } else if (result.isRight() && result.value.status === 200) {
      yield* put(
        loadThirdPartyMessage.success({ id, content: result.value.value })
      );
    } else {
      yield* put(
        loadThirdPartyMessage.failure({
          id,
          error: new Error(`response status ${result.value.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(loadThirdPartyMessage.failure({ id, error: getError(e) }));
  }
}
