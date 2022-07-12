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
    if (bonusVacanzeResponse.isRight()) {
      if (bonusVacanzeResponse.value.status === 200) {
        yield* put(
          loadBonusVacanzeFromId.success(bonusVacanzeResponse.value.value)
        );
        return;
      }
      throw Error(`response status ${bonusVacanzeResponse.value.status}`);
    } else {
      throw Error(readablePrivacyReport(bonusVacanzeResponse.value));
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
