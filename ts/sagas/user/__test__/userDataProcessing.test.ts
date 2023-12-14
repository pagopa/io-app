import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { UserDataProcessing } from "../../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../definitions/backend/UserDataProcessingChoice";
import { UserDataProcessingStatusEnum } from "../../../../definitions/backend/UserDataProcessingStatus";
import {
  deleteUserDataProcessing,
  loadUserDataProcessing,
  upsertUserDataProcessing
} from "../../../store/actions/userDataProcessing";
import {
  deleteUserDataProcessingSaga,
  loadUserDataProcessingSaga,
  upsertUserDataProcessingSaga
} from "../userDataProcessing";
import { withRefreshApiCall } from "../../../features/fastLogin/saga/utils";

describe("loadUserDataProcessingSaga", () => {
  const getUserDataProcessingRequest = jest.fn();
  const loadAction: ActionType<typeof loadUserDataProcessing.request> = {
    type: "LOAD_USER_DATA_PROCESSING_REQUEST",
    payload: UserDataProcessingChoiceEnum.DOWNLOAD
  };

  it("if response is 404, the user never submit the kind of request specified as the payload choice", () => {
    const get404Response = E.right({ status: 404 });
    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(
        withRefreshApiCall,
        getUserDataProcessingRequest({
          choice: loadAction.payload
        }),
        loadAction
      )
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
    const get200Response = E.right({ status: 200, value: mokedStatus });

    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(
        withRefreshApiCall,
        getUserDataProcessingRequest({
          choice: loadAction.payload
        }),
        loadAction
      )
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
    const get500Response = E.right({ status: 500, value: mokedError });
    testSaga(
      loadUserDataProcessingSaga,
      getUserDataProcessingRequest,
      loadAction
    )
      .next()
      .call(
        withRefreshApiCall,
        getUserDataProcessingRequest({
          choice: loadAction.payload
        }),
        loadAction
      )
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
  const requestAction: ActionType<typeof upsertUserDataProcessing.request> = {
    type: "UPSERT_USER_DATA_PROCESSING_REQUEST",
    payload: UserDataProcessingChoiceEnum.DOWNLOAD
  };

  const mokedNewStatus: UserDataProcessing = {
    choice: UserDataProcessingChoiceEnum.DOWNLOAD,
    status: UserDataProcessingStatusEnum.PENDING,
    version: 2
  };

  it("if response is 200, the requrest has been submitted", () => {
    const post200Response = E.right({ status: 200, value: mokedNewStatus });
    testSaga(
      upsertUserDataProcessingSaga,
      postUserDataProcessingRequest,
      requestAction
    )
      .next()
      .call(
        withRefreshApiCall,
        postUserDataProcessingRequest({
          body: { choice: requestAction.payload }
        }),
        requestAction
      )
      .next(post200Response)
      .put(upsertUserDataProcessing.success(mokedNewStatus))
      .next()
      .isDone();
  });

  it("return a generic error if the backend returns 500", () => {
    const choice = UserDataProcessingChoiceEnum.DOWNLOAD;
    const mokedError = new Error(
      `An error occurred while submitting a request to ${choice} the profile`
    );
    const get500Response = E.right({ status: 500 });

    testSaga(
      upsertUserDataProcessingSaga,
      postUserDataProcessingRequest,
      requestAction
    )
      .next()
      .call(
        withRefreshApiCall,
        postUserDataProcessingRequest({
          body: { choice: requestAction.payload }
        }),
        requestAction
      )
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

describe("deleteUserDataProcessingSaga", () => {
  const deleteUserDataProcessingRequest = jest.fn();
  const requestAction: ActionType<typeof deleteUserDataProcessing.request> = {
    type: "DELETE_USER_DATA_PROCESSING_REQUEST",
    payload: UserDataProcessingChoiceEnum.DELETE
  };

  const requestActionDownload: ActionType<
    typeof deleteUserDataProcessing.request
  > = {
    type: "DELETE_USER_DATA_PROCESSING_REQUEST",
    payload: UserDataProcessingChoiceEnum.DOWNLOAD
  };
  it("if response is 202, the request has been submitted", () => {
    const post202Response = E.right({ status: 202 });
    testSaga(
      deleteUserDataProcessingSaga,
      deleteUserDataProcessingRequest,
      requestAction
    )
      .next()
      .call(
        withRefreshApiCall,
        deleteUserDataProcessingRequest({
          choice: requestAction.payload
        }),
        requestAction
      )
      .next(post202Response)
      .put(deleteUserDataProcessing.success({ choice: requestAction.payload }))
      .next()
      .put(loadUserDataProcessing.request(UserDataProcessingChoiceEnum.DELETE))
      .next()
      .isDone();
  });

  it("return a generic error if the backend returns 409", () => {
    const choice = requestActionDownload.payload;
    const mokedError = new Error(
      `response status ${409} with choice ${choice}`
    );
    const get409Response = E.right({ status: 409 });

    testSaga(
      deleteUserDataProcessingSaga,
      deleteUserDataProcessingRequest,
      requestActionDownload
    )
      .next()
      .call(
        withRefreshApiCall,
        deleteUserDataProcessingRequest({
          choice
        }),
        requestActionDownload
      )
      .next(get409Response)
      .put(
        deleteUserDataProcessing.failure({
          choice,
          error: mokedError
        })
      )
      .next()
      .isDone();
  });
});
