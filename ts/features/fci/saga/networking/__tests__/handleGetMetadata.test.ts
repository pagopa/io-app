import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { getNetworkError } from "../../../../../utils/errors";
import { mockFciMetadata } from "../../../types/__mocks__/Metadata.mock";
import { Metadata } from "../../../../../../definitions/fci/Metadata";
import { handleGetMetadata } from "../handleGetMetadata";
import { fciMetadataRequest } from "../../../store/actions";
import { SessionToken } from "../../../../../types/SessionToken";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";

const successResponse = {
  status: 200,
  value: mockFciMetadata as Metadata
};

const failureResponse = {
  status: 401
};

describe("handleGetMetadata", () => {
  const mockBackendFciClient = jest.fn();
  const loadAction: ActionType<typeof fciMetadataRequest.request> = {
    type: "FCI_METADATA_REQUEST",
    payload: undefined
  };
  const getMetadataRequest = mockBackendFciClient({
    Bearer: "mockedToken"
  });
  it("it should dispatch fciMetadataRequest.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getMetadataRequest, loadAction)
      .next(right(successResponse))
      .put(fciMetadataRequest.success(successResponse.value))
      .next()
      .isDone();
  });
  it("it should dispatch fciMetadataRequest.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getMetadataRequest, loadAction)
      .next(right(failureResponse))
      .next(
        fciMetadataRequest.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("it should dispatch fciMetadataRequest.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getMetadataRequest, loadAction)
      .next(left(new Error()))
      .next(
        fciMetadataRequest.failure(
          getNetworkError(new Error("Invalid payload from fciMetadataRequest"))
        )
      )
      .next()
      .isDone();
  });
  it("it should dispatch fciMetadataRequest.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleGetMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getMetadataRequest, loadAction)
      .throw(mockedError)
      .next(fciMetadataRequest.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
