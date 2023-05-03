import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import { FciClient } from "../../api/backendFci";
import { fciSignatureRequestFromId } from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { SessionToken } from "../../../../types/SessionToken";
import { SagaCallReturnType } from "../../../../types/utils";

/*
 * A saga to load a FCI signature request.
 */
export function* handleGetSignatureRequestById(
  getSignatureRequestById: FciClient["getSignatureRequestById"],
  bearerToken: SessionToken,
  action: ActionType<typeof fciSignatureRequestFromId["request"]>
): SagaIterator {
  try {
    const getSignatureDetailViewByIdResponse: SagaCallReturnType<
      typeof getSignatureRequestById
    > = yield* call(getSignatureRequestById, {
      id: action.payload,
      Bearer: `Bearer ${bearerToken}`
    });

    if (E.isLeft(getSignatureDetailViewByIdResponse)) {
      throw Error(
        readablePrivacyReport(getSignatureDetailViewByIdResponse.left)
      );
    }

    if (getSignatureDetailViewByIdResponse.right.status === 200) {
      yield* put(
        fciSignatureRequestFromId.success(
          getSignatureDetailViewByIdResponse.right.value
        )
      );
      return;
    }

    throw Error(
      `${JSON.stringify(getSignatureDetailViewByIdResponse.right.value)}`
    );
  } catch (e) {
    yield* put(fciSignatureRequestFromId.failure(getNetworkError(e)));
  }
}
