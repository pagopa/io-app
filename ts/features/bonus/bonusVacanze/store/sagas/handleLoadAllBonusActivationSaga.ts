import { all, call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../types/utils";
import { convertUnknownToError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { BackendBonusVacanze } from "../../api/backendBonusVacanze";
import {
  loadAllBonusActivations,
  loadBonusVacanzeFromId
} from "../actions/bonusVacanze";

// handle all bonus activation load
export function* handleLoadAllBonusActivations(
  getAllBonusActivations: ReturnType<
    typeof BackendBonusVacanze
  >["getAllBonusActivations"]
) {
  try {
    const allBonusActivationsResponse: SagaCallReturnType<
      typeof getAllBonusActivations
    > = yield* call(getAllBonusActivations, {});
    if (allBonusActivationsResponse.isRight()) {
      if (allBonusActivationsResponse.value.status === 200) {
        // for each bonus load details
        const items = allBonusActivationsResponse.value.value.items;
        const ids = items.map(i => i.id);
        yield* all(ids.map(id => put(loadBonusVacanzeFromId.request(id))));
        yield* put(loadAllBonusActivations.success(items));
        return;
      }
      throw Error(
        `response status ${allBonusActivationsResponse.value.status}`
      );
    } else {
      throw Error(readablePrivacyReport(allBonusActivationsResponse.value));
    }
  } catch (e) {
    yield* put(loadAllBonusActivations.failure(convertUnknownToError(e)));
  }
}
