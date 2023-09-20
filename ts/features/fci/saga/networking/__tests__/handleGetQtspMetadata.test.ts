import { testSaga } from "redux-saga-test-plan";
import { left, right } from "fp-ts/lib/Either";
import { ActionType } from "typesafe-actions";
import { getNetworkError } from "../../../../../utils/errors";
import { mockQtspClausesMetadata } from "../../../types/__mocks__/QtspClausesMetadata.mock";
import { fciLoadQtspClauses } from "../../../store/actions";
import { handleGetQtspMetadata } from "../handleGetQtspMetadata";
import { QtspClausesMetadataDetailView } from "../../../../../../definitions/fci/QtspClausesMetadataDetailView";
import { SessionToken } from "../../../../../types/SessionToken";
import { fciIssuerEnvironmentSelector } from "../../../store/reducers/fciSignatureRequest";
import { withRefreshApiCall } from "../../../../fastLogin/saga/utils";

const successResponse = {
  status: 200,
  value: mockQtspClausesMetadata as QtspClausesMetadataDetailView
};

const failureResponse = {
  status: 403
};

describe("handleGetQtspMetadata", () => {
  const mockBackendFciClient = jest.fn();
  const loadAction: ActionType<typeof fciLoadQtspClauses.request> = {
    type: "FCI_QTSP_CLAUSES_REQUEST",
    payload: undefined
  };
  const getQtspClausesMetadataRequest = mockBackendFciClient({
    Bearer: "mockedToken",
    "x-iosign-issuer-environment": "mockedIssuerEnvironment"
  });
  it("Should dispatch fciLoadQtspClauses.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetQtspMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .select(fciIssuerEnvironmentSelector)
      .next("mockedIssuerEnvironment")
      .call(withRefreshApiCall, getQtspClausesMetadataRequest, loadAction)
      .next(right(successResponse))
      .put(fciLoadQtspClauses.success(successResponse.value))
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspClauses.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetQtspMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .select(fciIssuerEnvironmentSelector)
      .next("mockedIssuerEnvironment")
      .call(withRefreshApiCall, getQtspClausesMetadataRequest, loadAction)
      .next(right(failureResponse))
      .next(
        fciLoadQtspClauses.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspClauses.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetQtspMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .select(fciIssuerEnvironmentSelector)
      .next("mockedIssuerEnvironment")
      .call(withRefreshApiCall, getQtspClausesMetadataRequest, loadAction)
      .next(left(new Error()))
      .next(
        fciLoadQtspClauses.failure(
          getNetworkError(new Error("Invalid payload from fciLoadQtspClauses"))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspClauses.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleGetQtspMetadata,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .select(fciIssuerEnvironmentSelector)
      .next("mockedIssuerEnvironment")
      .call(withRefreshApiCall, getQtspClausesMetadataRequest, loadAction)
      .throw(mockedError)
      .next(fciLoadQtspClauses.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
