import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { StatusEnum } from "../../../../../../../definitions/cgn/CardActivated";
import { SagaCallReturnType } from "../../../../../../types/utils";
import { getNetworkError } from "../../../../../../utils/errors";
import { withRefreshApiCall } from "../../../../../authentication/fastLogin/saga/utils";
import { walletAddCards } from "../../../../../wallet/store/actions/cards";
import { BackendCGN } from "../../../api/backendCgn";
import { cgnDetails } from "../../../store/actions/details";

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
      const cgnInfo = cgnInformationResult.right.value;
      const expireDate =
        cgnInfo.status === StatusEnum.ACTIVATED
          ? cgnInfo.expiration_date
          : undefined;

      yield* put(
        walletAddCards([
          {
            type: "cgn",
            category: "cgn",
            key: "cgn_card",
            expireDate
          }
        ])
      );
      yield* put(cgnDetails.success(cgnInfo));
    } else if (cgnInformationResult.right.status === 404) {
      yield* put(cgnDetails.cancel());
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
