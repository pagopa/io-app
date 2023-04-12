import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { getNetworkError } from "../../../../../utils/errors";
import { fciSignaturesListRequest } from "../../../store/actions";
import { SessionToken } from "../../../../../types/SessionToken";
import { handleGetSignatureRequests } from "../handleGetSignatureRequests";
import { mockedRandomSignatureRequestList } from "../../../types/__mocks__/SignaturesList.mock";
import { SignatureRequestList } from "../../../../../../definitions/fci/SignatureRequestList";

const successResponse = {
  status: 200,
  value: mockedRandomSignatureRequestList as SignatureRequestList
};

const failureResponse = {
  status: 401
};

describe("handleGetSignatureRequests", () => {
  const mockBackendFciClient = jest.fn();
  it("it should dispatch fciSignaturesListRequest.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetSignatureRequests,
      mockBackendFciClient,
      "mockedToken" as SessionToken
    )
      .next()
      .call(mockBackendFciClient, { Bearer: "Bearer mockedToken" })
      .next(right(successResponse))
      .put(fciSignaturesListRequest.success(successResponse.value))
      .next()
      .isDone();
  });
  it("it should dispatch fciSignaturesListRequest.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetSignatureRequests,
      mockBackendFciClient,
      "mockedToken" as SessionToken
    )
      .next()
      .call(mockBackendFciClient, { Bearer: "Bearer mockedToken" })
      .next(right(failureResponse))
      .next(
        fciSignaturesListRequest.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("it should dispatch fciSignaturesListRequest.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetSignatureRequests,
      mockBackendFciClient,
      "mockedToken" as SessionToken
    )
      .next()
      .call(mockBackendFciClient, { Bearer: "Bearer mockedToken" })
      .next(left(new Error()))
      .next(
        fciSignaturesListRequest.failure(
          getNetworkError(
            new Error("Invalid payload from fciSignaturesListRequest")
          )
        )
      )
      .next()
      .isDone();
  });
  it("it should dispatch fciSignaturesListRequest.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleGetSignatureRequests,
      mockBackendFciClient,
      "mockedToken" as SessionToken
    )
      .next()
      .call(mockBackendFciClient, { Bearer: "Bearer mockedToken" })
      .throw(mockedError)
      .next(fciSignaturesListRequest.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
