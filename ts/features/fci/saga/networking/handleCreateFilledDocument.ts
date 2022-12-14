import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { BackendFciClient } from "../../api/backendFci";
import { fciLoadQtspFilledDocument } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";

/*
 * A saga to post filled Document.
 */
export function* handleCreateFilledDocument(
  postQtspFilledBody: ReturnType<typeof BackendFciClient>["postQtspFilledBody"],
  action: ActionType<typeof fciLoadQtspFilledDocument["request"]>
): SagaIterator {
  try {
    const postQtspFilledBodyResponse = yield* call(postQtspFilledBody, {
      documentToFill: action.payload
    });

    if (E.isLeft(postQtspFilledBodyResponse)) {
      throw Error(readablePrivacyReport(postQtspFilledBodyResponse.left));
    }

    if (postQtspFilledBodyResponse.right.status === 201) {
      yield* put(
        fciLoadQtspFilledDocument.success(
          postQtspFilledBodyResponse.right.value
        )
      );
      return;
    }

    throw Error(`response status ${postQtspFilledBodyResponse.right.status}`);
  } catch (e) {
    return fciLoadQtspFilledDocument.failure(getNetworkError(e));
  }
}
