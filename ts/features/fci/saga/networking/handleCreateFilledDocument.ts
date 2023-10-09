import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { SagaIterator } from "redux-saga";
import {
  call,
  put,
  race,
  cancelled,
  take,
  delay,
  select
} from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as E from "fp-ts/lib/Either";
import { readablePrivacyReport } from "../../../../utils/reporters";
import {
  fciLoadQtspFilledDocument,
  fciPollFilledDocument
} from "../../store/actions";
import { getNetworkError } from "../../../../utils/errors";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";
import { fciPollFilledDocumentReadySelector } from "../../store/reducers/fciPollFilledDocument";
import { FciClient } from "../../api/backendFci";
import { SessionToken } from "../../../../types/SessionToken";
import { withRefreshApiCall } from "../../../fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";

// Polling frequency timeout
const POLLING_FREQ_TIMEOUT = 2000 as Millisecond;

// Polling time threshold (10 seconds)
// If the polling time exceeds this threshold, the polling is stopped
const POLLING_TIME_THRESHOLD = (10 * 2000) as Millisecond;

/*
 * A saga to post filled Document.
 */
export function* handleCreateFilledDocument(
  postQtspFilledBody: FciClient["createFilledDocument"],
  bearerToken: SessionToken,
  action: ActionType<(typeof fciLoadQtspFilledDocument)["request"]>
): SagaIterator {
  try {
    const postQtspFilledBodyRequest = postQtspFilledBody({
      body: action.payload,
      Bearer: `Bearer ${bearerToken}`
    });
    const postQtspFilledBodyResponse = (yield* call(
      withRefreshApiCall,
      postQtspFilledBodyRequest,
      action
    )) as unknown as SagaCallReturnType<typeof postQtspFilledBody>;

    if (E.isLeft(postQtspFilledBodyResponse)) {
      throw Error(readablePrivacyReport(postQtspFilledBodyResponse.left));
    }

    if (postQtspFilledBodyResponse.right.status === 201) {
      yield* put(
        fciLoadQtspFilledDocument.success(
          postQtspFilledBodyResponse.right.value
        )
      );
      const qtspFilledDocumentUrl =
        postQtspFilledBodyResponse.right.value.filled_document_url;
      // if the url is present, we need to poll the document
      // to wait for the filled document ready
      if (qtspFilledDocumentUrl) {
        yield* call(filledDocumentPollWatcher, qtspFilledDocumentUrl);
      }
      return;
    }

    if (postQtspFilledBodyResponse.right.status === 401) {
      return;
    }

    throw Error(`response status ${postQtspFilledBodyResponse.right.status}`);
  } catch (e) {
    yield* put(fciLoadQtspFilledDocument.failure(getNetworkError(e)));
  }
}

/**
 * Handle the FCI polling saga
 * This saga is used to poll the QTSP filled_document to check if the
 * document is ready to be downloaded by the user. The polling is done
 * every POLLING_FREQ_TIMEOUT seconds and the polling is stopped when
 * the document is ready or when the polling is stopped if
 * the polling time exceeds POLLING_TIME_THRESHOLD.
 */
export function* watchFciPollSaga(
  qtspFilledDocumentUrl: FilledDocumentDetailView["filled_document_url"]
) {
  while (true) {
    try {
      yield* put(fciPollFilledDocument.request());
      const response = yield* call(fetch, qtspFilledDocumentUrl);
      const responseStatus = response.status;
      if (responseStatus === 200) {
        yield* put(
          fciPollFilledDocument.success({
            isReady: true
          })
        );
        yield* put(fciPollFilledDocument.cancel());
      }
      yield* delay(POLLING_FREQ_TIMEOUT);
    } catch (e) {
      yield* put(fciPollFilledDocument.failure(getNetworkError(e)));
      yield* put(fciPollFilledDocument.cancel());
    } finally {
      if (yield* cancelled()) {
        const isFilledDocumentReady: ReturnType<
          typeof fciPollFilledDocumentReadySelector
        > = yield* select(fciPollFilledDocumentReadySelector);
        if (!isFilledDocumentReady) {
          yield* put(
            fciPollFilledDocument.failure(
              getNetworkError(new Error("Polling cancelled"))
            )
          );
        }
      }
    }
  }
}

export function* filledDocumentPollWatcher(
  filledDocumentUrl: FilledDocumentDetailView["filled_document_url"]
) {
  yield* race({
    task: call(watchFciPollSaga, filledDocumentUrl),
    cancel: take(fciPollFilledDocument.cancel),
    delay: delay(POLLING_TIME_THRESHOLD)
  });
}
