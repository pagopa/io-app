import { call } from "redux-saga/effects";
import { SagaReturnType } from "@redux-saga/core/effects";
import { getError } from "../../../../utils/errors";
import { getTotalNewResponses } from "../../../../utils/supportAssistance";
import { RTron } from "../../../../boot/configureStoreAndPersistor";

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleGetTotalNewResponses() {
  try {
    const response: SagaReturnType<typeof getTotalNewResponses> = yield call(
      getTotalNewResponses
    );
    RTron.log(`Unread messages: ${response}`);
    // yield put(zendeskRequestTicketNumber.success(response));
  } catch (e) {
    // yield put(zendeskRequestTicketNumber.failure(getError(e)));
    RTron.log(getError(e));
  }
}
