import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { left, right } from "fp-ts/lib/Either";
import { getNetworkError } from "../../../../../utils/errors";
import { handleGetSignatureRequestById } from "../handleGetSignatureRequestById";
import { mockSignatureRequestDetailView } from "../../../types/__mocks__/SignatureRequestDetailView.mock";
import { fciSignatureRequestFromId } from "../../../store/actions";
import { SignatureRequestDetailView } from "../../../../../../definitions/fci/SignatureRequestDetailView";
import { SessionToken } from "../../../../../types/SessionToken";

const mockId = "mockId";

const successResponse = {
  status: 200,
  value: mockSignatureRequestDetailView as SignatureRequestDetailView
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
  it("Should dispatch fciSignatureRequestFromId.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(mockBackendFciClient, {
        id: loadAction.payload,
        Bearer: "mockedToken"
      })
      .next(right(successResponse))
      .put(fciSignatureRequestFromId.success(successResponse.value))
      .next()
      .isDone();
  });
  it("Should dispatch fciSignatureRequestFromId.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(mockBackendFciClient, {
        id: loadAction.payload,
        Bearer: "mockedToken"
      })
      .next(right(failureResponse))
      .next(
        fciSignatureRequestFromId.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciSignatureRequestFromId.failure with a fixed message as payload if the response left", () => {
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(mockBackendFciClient, {
        id: loadAction.payload,
        Bearer: "mockedToken"
      })
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
    const mockedError = new Error("mockedErrorMessage");
    testSaga(
      handleGetSignatureRequestById,
      mockBackendFciClient,
      "mockedToken" as SessionToken,
      loadAction
    )
      .next()
      .call(mockBackendFciClient, {
        id: loadAction.payload,
        Bearer: "mockedToken"
      })
      .throw(mockedError)
      .next(fciSignatureRequestFromId.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
