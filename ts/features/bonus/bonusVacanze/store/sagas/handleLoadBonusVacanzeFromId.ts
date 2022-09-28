import * as E from "fp-ts/lib/Either";
import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { SagaCallReturnType } from "../../../../../types/utils";
import { convertUnknownToError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import { loadBonusVacanzeFromId } from "../actions/bonusVacanze";

// handle bonus list loading
export function* handleLoadBonusVacanzeFromId(
  getLatestBonusVacanzeFromId: ReturnType<
    typeof BackendBonusVacanze
  >["getLatestBonusVacanzeFromId"],
  action: ActionType<typeof loadBonusVacanzeFromId["request"]>
): SagaIterator {
  try {
    const bonusVacanzeResponse: SagaCallReturnType<
      typeof getLatestBonusVacanzeFromId
    > = yield* call(getLatestBonusVacanzeFromId, { bonus_id: action.payload });
    if (E.isRight(bonusVacanzeResponse)) {
      if (bonusVacanzeResponse.right.status === 200) {
        yield* put(
          loadBonusVacanzeFromId.success(bonusVacanzeResponse.right.value)
        );
        return;
      }
      throw Error(`response status ${bonusVacanzeResponse.right.status}`);
    } else {
      throw Error(readablePrivacyReport(bonusVacanzeResponse.left));
    }
  } catch (e) {
    yield* put(
      loadBonusVacanzeFromId.failure({
        error: convertUnknownToError(e),
        id: action.payload
      })
    );
  }
}
