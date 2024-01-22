import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../types/utils";
import { convertUnknownToError } from "../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../utils/reporters";
import { BackendBonusGeneric } from "../../utils/backend";
import { loadAllBonusActivations } from "../actions/availableBonusesTypes";

// handle all bonus activation load
export function* handleLoadAllBonusActivations(
  getAllBonusActivations: ReturnType<
    typeof BackendBonusGeneric
  >["getAllBonusActivations"]
) {
  try {
    const allBonusActivationsResponse: SagaCallReturnType<
      typeof getAllBonusActivations
    > = yield* call(getAllBonusActivations, {});
    if (E.isRight(allBonusActivationsResponse)) {
      if (allBonusActivationsResponse.right.status === 200) {
        // for each bonus load details
        const items = allBonusActivationsResponse.right.value.items;
        yield* put(loadAllBonusActivations.success(items));
        return;
      }
      throw Error(
        `response status ${allBonusActivationsResponse.right.status}`
      );
    } else {
      throw Error(readablePrivacyReport(allBonusActivationsResponse.left));
    }
  } catch (e) {
    yield* put(loadAllBonusActivations.failure(convertUnknownToError(e)));
  }
}
