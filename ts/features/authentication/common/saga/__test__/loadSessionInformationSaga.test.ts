import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { loadSessionInformationSaga } from "../loadSessionInformationSaga";
import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";
import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../store/actions";

describe("loadSessionInformationSaga", () => {
  it("should emit the session on valid response from backend", () => {
    const getSession = jest.fn();
    const aPublicSession = { walletToken: "walletToken" } as PublicSession;
    return expectSaga(loadSessionInformationSaga, getSession)
      .provide([
        [
          matchers.call.fn(getSession),
          E.right({ status: 200, value: aPublicSession })
        ]
      ])
      .put(sessionInformationLoadSuccess(aPublicSession))
      .run();
  });

  it("should emit an error on invalid response from backend", () => {
    const getSession = jest.fn();
    return expectSaga(loadSessionInformationSaga, getSession)
      .provide([
        [
          matchers.call.fn(getSession),
          E.left([
            t.getValidationError(
              "some error occurred",
              t.getDefaultContext(t.null)
            )
          ])
        ]
      ])
      .put(
        sessionInformationLoadFailure(
          Error('value ["some error occurred"] at [root] is not a valid [null]')
        )
      )
      .run();
  });
});
