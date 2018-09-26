import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import {
  sessionInformationLoadFailure,
  sessionInformationLoadSuccess
} from "../../../store/actions/authentication";

import { PublicSession } from "../../../../definitions/backend/PublicSession";

import { loadSessionInformationSaga } from "../loadSessionInformationSaga";

describe("loadSessionInformationSaga", () => {
  it("should emit the session on valid response from backend", () => {
    const getSession = jest.fn();
    const aPublicSession = {} as PublicSession;
    return expectSaga(loadSessionInformationSaga, getSession)
      .provide([
        [matchers.call.fn(getSession), { status: 200, value: aPublicSession }]
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
          { status: 500, value: { title: "Error" } }
        ]
      ])
      .put(sessionInformationLoadFailure(Error("Error")))
      .run();
  });
});
