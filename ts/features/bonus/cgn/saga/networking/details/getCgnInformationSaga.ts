import { ActionType } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnDetails } from "../../../store/actions/details";
import { withRefreshApiCall } from "../../../../../fastLogin/saga/utils";

export function* cgnGetInformationSaga(
  getCgnStatus: ReturnType<typeof BackendCGN>["getCgnStatus"],
  action: ActionType<(typeof cgnDetails)["request"]>
) {
  try {
    const cgnInformationRequest = getCgnStatus({});
    const cgnInformationResult = (yield* call(
      withRefreshApiCall,
      cgnInformationRequest,
      action
    )) as unknown as SagaCallReturnType<typeof getCgnStatus>;
    if (E.isLeft(cgnInformationResult)) {
      yield* put(
        cgnDetails.failure({
          kind: "generic",
          value: new Error(readableReport(cgnInformationResult.left))
        })
      );
    } else if (
      E.isRight(cgnInformationResult) &&
      cgnInformationResult.right.status === 200
    ) {
      yield* put(cgnDetails.success(cgnInformationResult.right.value));
    } else {
      yield* put(
        cgnDetails.failure({
          kind: "generic",
          value: new Error(
            `response status ${cgnInformationResult.right.status}`
          )
        })
      );
    }
  } catch (e) {
    yield* put(cgnDetails.failure(getNetworkError(e)));
  }
}
