import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { SagaCallReturnType } from "../../../../types/utils";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciSignatureRequestFromId } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

// handle bonus list loading
export function* handleGetSignatureRequestById(
  getSignatureDetailViewById: ReturnType<
    typeof BackendFciClient
  >["getSignatureDetailViewById"],
  action: ActionType<typeof fciSignatureRequestFromId["request"]>
): SagaIterator {
  try {
    const getSignatureDetailViewByIdResponse: SagaCallReturnType<
      typeof getSignatureDetailViewById
    > = yield* call(getSignatureDetailViewById, { id: action.payload });
    if (E.isLeft(getSignatureDetailViewByIdResponse)) {
      throw Error(
        readablePrivacyReport(getSignatureDetailViewByIdResponse.left)
      );
    }
    if (E.isRight(getSignatureDetailViewByIdResponse)) {
      if (getSignatureDetailViewByIdResponse.right.status === 200) {
        yield* put(
          fciSignatureRequestFromId.success(
            getSignatureDetailViewByIdResponse.right.value
          )
        );
        return;
      }
      throw Error(
        `response status ${getSignatureDetailViewByIdResponse.right.status}`
      );
    }
  } catch (e) {
    return fciSignatureRequestFromId.failure(getNetworkError(e));
  }
}
