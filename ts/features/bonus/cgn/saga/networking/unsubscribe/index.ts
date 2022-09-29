import * as E from "fp-ts/lib/Either";
import { call, put } from "typed-redux-saga/macro";
import { SagaCallReturnType } from "../../../../../../types/utils";
import {
  getGenericError,
  getNetworkError
} from "../../../../../../utils/errors";
import { readablePrivacyReport } from "../../../../../../utils/reporters"; // handle the request for CGN unsubscription
import { BackendCGN } from "../../../api/backendCgn";
import { cgnUnsubscribe } from "../../../store/actions/unsubscribe";

// handle the request for CGN unsubscription
export function* cgnUnsubscriptionHandler(
  startCgnUnsubscription: ReturnType<
    typeof BackendCGN
  >["startCgnUnsubscription"]
) {
  try {
    const unsubscriptionResult: SagaCallReturnType<
      typeof startCgnUnsubscription
    > = yield* call(startCgnUnsubscription, {});
    if (E.isRight(unsubscriptionResult)) {
      if (
        unsubscriptionResult.right.status === 201 ||
        unsubscriptionResult.right.status === 202
      ) {
        yield* put(cgnUnsubscribe.success());
        return;
      }
      throw new Error(
        `Response in status ${unsubscriptionResult.right.status}`
      );
    }
    yield* put(
      cgnUnsubscribe.failure(
        getGenericError(
          new Error(readablePrivacyReport(unsubscriptionResult.left))
        )
      )
    );
  } catch (e) {
    yield* put(cgnUnsubscribe.failure(getNetworkError(e)));
  }
}
