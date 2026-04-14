import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { left, right } from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { getNetworkError } from "../../../../../utils/errors";
import { handleGetSignatureRequestById } from "../handleGetSignatureRequestById";
import {
  mockSignatureRequestDetailView,
  mockedError
} from "../../../types/__mocks__/SignatureRequestDetailView.mock";
import {
  fciEnvironmentSet,
  fciSignatureRequestFromId
} from "../../../store/actions";
import { SignatureRequestDetailView } from "../../../../../../definitions/fci/SignatureRequestDetailView";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { EnvironmentEnum } from "../../../../../../definitions/fci/Environment";

const mockId = "mockId";

const successResponse = {
  status: 200,
  value: mockSignatureRequestDetailView as SignatureRequestDetailView,
  headers: { map: { "x-io-sign-environment": "prod" } }
};

const failureResponse = {
  status: 403
};

describe("handleGetSignatureRequestById", () => {
  const mockBackendFciClient = jest.fn();
  const loadAction: ActionType<typeof fciSignatureRequestFromId.request> = {
    type: "FCI_SIGNATURE_DETAIL_REQUEST",
    payload: mockId
  };
  const getSignatureDetailByIdRequest = mockBackendFciClient({
    id: "mockedId",
    Bearer: "mock-token"
  });
  it("Should dispatch fciSignatureRequestFromId.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getSignatureDetailByIdRequest, loadAction)
      .next(right(successResponse))
      .put(
        fciEnvironmentSet(
          O.some(
            successResponse.headers.map[
              "x-io-sign-environment"
            ] as EnvironmentEnum
          )
        )
      )
      .next()
      .put(fciSignatureRequestFromId.success(successResponse.value))
      .next()
      .isDone();
  });
  it("Should dispatch fciSignatureRequestFromId.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getSignatureDetailByIdRequest, loadAction)
      .next(right(failureResponse))
      .next(fciSignatureRequestFromId.failure(getNetworkError(failureResponse)))
      .next()
      .isDone();
  });
  it("Should dispatch fciSignatureRequestFromId.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getSignatureDetailByIdRequest, loadAction)
      .next(left(new Error()))
      .next(
        fciSignatureRequestFromId.failure(
          getNetworkError(
            new Error("Invalid payload from fciSignatureRequestFromId")
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciSignatureRequestFromId.failure with the error message as payload if an exception is raised", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mock-token",
      loadAction
    )
      .next()
      .call(withRefreshApiCall, getSignatureDetailByIdRequest, loadAction)
      .throw(new Error(JSON.stringify(mockedError)))
      .next(fciSignatureRequestFromId.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
