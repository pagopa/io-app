import { call, put } from "typed-redux-saga/macro";
import { SagaReturnType } from "@redux-saga/core/effects";
import { zendeskRequestTicketNumber } from "../../store/actions";
import { getError } from "../../../../utils/errors";
import { hasOpenedTickets } from "../../../../utils/supportAssistance";

// retrieve the number of ticket opened by the user from the Zendesk SDK
export function* handleHasOpenedTickets() {
  try {
    const response: SagaReturnType<typeof hasOpenedTickets> = yield* call(
      hasOpenedTickets
    );
    yield* put(zendeskRequestTicketNumber.success(response));
  } catch (e) {
    yield* put(zendeskRequestTicketNumber.failure(getError(e)));
  }
}
