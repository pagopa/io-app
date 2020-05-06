import { right } from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { UserDataProcessing } from "../../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus";
import {
  loadUserDataProcessing,
  upsertUserDataProcessing
} from "../../../store/actions/userDataProcessing";
import {
  loadUserDataProcessingSaga,
  upsertUserDataProcessingSaga
} from "../userDataProcessing";

describe("loadUserDataProcessingSaga", () => {
  const getUserDataProcessingRequest = jest.fn();
  const loadAction = {
    type: loadUserDataProcessing.request,
    payload: UserDataProcessingChoiceEnum.DOWNLOAD
  };

  it("if response is 404, the user never submit the kind of request specified as the payload choice", () => {
    const get404Response = right({ status: 404 });
    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(getUserDataProcessingRequest, {
        userDataProcessingChoiceParam: loadAction.payload
      })
      .next(get404Response)
      .put(
        loadUserDataProcessing.success({
          choice: loadAction.payload,
          value: undefined
        })
      )
      .next()
      .isDone();
  });

  it("if response is 200, the user previously submitted the kind of request specified as the payload choice ", () => {
    const mokedStatus: UserDataProcessing = {
      choice: UserDataProcessingChoiceEnum.DOWNLOAD,
      status: UserDataProcessingStatusEnum.PENDING,
      version: 2
    };
    const get200Response = right({ status: 200, value: mokedStatus });

    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(getUserDataProcessingRequest, {
        userDataProcessingChoiceParam: loadAction.payload
      })
      .next(get200Response)
      .put(
        loadUserDataProcessing.success({
          choice: loadAction.payload,
          value: mokedStatus
        })
      )
      .next()
      .isDone();
  });

  it("return a generic error if the backend returns 500", () => {
    const mokedError = new Error(
      "loadUserDataProcessingSaga response status 500"
    );
    const get500Response = right({ status: 500, value: mokedError });
    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(getUserDataProcessingRequest, {
        userDataProcessingChoiceParam: loadAction.payload
      })
      .next(get500Response)
      .put(
        loadUserDataProcessing.failure({
          choice: loadAction.payload,
          error: mokedError
        })
      )
      .next()
      .isDone();
  });
});

describe("upsertUserDataProcessingSaga", () => {
  const postUserDataProcessingRequest = jest.fn();
  const requestAction = {
    type: loadUserDataProcessing.request,
    payload: UserDataProcessingChoiceEnum.DOWNLOAD
  };

  const mokedNewStatus: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DOWNLOAD,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 2
  };

  it("if response is 200, the requrest has been submitted", () => {
    const post200Response = right({ status: 200, value: mokedNewStatus });
    testSaga(
      upsertUserDataProcessingSaga,
      postUserDataProcessingRequest,
      requestAction
    )
      .next()
      .call(postUserDataProcessingRequest, {
        userDataProcessingChoiceRequest: { choice: requestAction.payload }
      })
      .next(post200Response)
      .put(upsertUserDataProcessing.success(mokedNewStatus))
      .next()
      .isDone();
  });

  it("return a generic error if the backend returns 500", () => {
    const choice = UserDataProcessingChoiceEnum.DOWNLOAD;
    const mokedError = new Error(
      `Error: An error occurred while submitting a request to ${choice} the profile`
    );
    const get500Response = right({ status: 500 });

    testSaga(
      upsertUserDataProcessingSaga,
      postUserDataProcessingRequest,
      requestAction
    )
      .next()
      .call(postUserDataProcessingRequest, {
        userDataProcessingChoiceRequest: { choice: requestAction.payload }
      })
      .next(get500Response)
      .put(
        upsertUserDataProcessing.failure({
          choice: requestAction.payload,
          error: mokedError
        })
      )
      .next()
      .isDone();
  });
});
