import { testSaga } from "redux-saga-test-plan";
import { delay, take } from "typed-redux-saga/macro";
import { testTotalNewResponsesFunction } from "../handleGetTotalNewResponses";
import {
  logoutRequest,
  sessionExpired,
  sessionInformationLoadSuccess,
  sessionInvalid
} from "../../../../../store/actions/authentication";
import { unreadTicketsCountRefreshRate } from "../../../../../utils/supportAssistance";

jest.useFakeTimers();

describe("setupZendesk", () => {
  it("", () => {
    if (testTotalNewResponsesFunction) {
      testSaga(testTotalNewResponsesFunction.refreshUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.getUnreadTicketsCount)
        .next()
        .call(testTotalNewResponsesFunction.getTicketsCount)
        .next()
        .race({
          wait: delay(unreadTicketsCountRefreshRate),
          signals: take([
            sessionInvalid,
            sessionExpired,
            logoutRequest,
            sessionInformationLoadSuccess
          ])
        });
    }
  });
});
