import { ActionType } from "typesafe-actions";
import { call, put } from "typed-redux-saga/macro";
import { readableReport } from "italia-ts-commons/lib/reporters";
import { BackendPN } from "../../api/backendPn";
import { loadPnContent } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

export function* getPnMessageSaga(
  getThirdPartyMessage: ReturnType<typeof BackendPN>["getThirdPartyMessage"],
  action: ActionType<typeof loadPnContent.request>
) {
  const id = action.payload;
  try {
    const result = yield* call(getThirdPartyMessage, { id });
    if (result.isLeft()) {
      yield* put(
        loadPnContent.failure({
          id,
          error: new Error(readableReport(result.value))
        })
      );
    } else if (result.isRight() && result.value.status === 200) {
      yield* put(loadPnContent.success({ id, content: result.value.value }));
    } else {
      yield* put(
        loadPnContent.failure({
          id,
          error: new Error(`response status ${result.value.status}`)
        })
      );
    }
  } catch (e) {
    yield* put(loadPnContent.failure({ id, error: getNetworkError(e) }));
  }
}
