import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciSigningRequest } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

/*
 * A saga to post signature data.
 */
export function* handleCreateSignature(
  postSignature: ReturnType<typeof BackendFciClient>["postSignature"],
  action: ActionType<typeof fciSigningRequest["request"]>
): SagaIterator {
  try {
    const postSignatureResponse = yield* call(postSignature, {
      body: action.payload
    });

    if (E.isLeft(postSignatureResponse)) {
      throw Error(readablePrivacyReport(postSignatureResponse.left));
    }

    if (postSignatureResponse.right.status === 201) {
      yield* put(fciSigningRequest.success(postSignatureResponse.right.value));
      return;
    }

    throw Error(`response status ${postSignatureResponse.right.status}`);
  } catch (e) {
    return fciSigningRequest.failure(getNetworkError(e));
  }
}
