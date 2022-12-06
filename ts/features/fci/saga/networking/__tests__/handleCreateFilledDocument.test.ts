import { testSaga } from "redux-saga-test-plan";
import { ActionType } from "typesafe-actions";
import { left, right } from "fp-ts/lib/Either";
import { getNetworkError } from "../../../../../utils/errors";
import { qtspFilledDocument } from "../../../types/__mocks__/CreateFilledDocumentBody.mock";
import { fciLoadQtspFilledDocument } from "../../../store/actions";
import { CreateFilledDocumentBody } from "../../../../../../definitions/fci/CreateFilledDocumentBody";
import { handleCreateFilledDocument } from "../handleCreateFilledDocument";
import { FilledDocumentDetailView } from "../../../../../../definitions/fci/FilledDocumentDetailView";

const mockedPayload: CreateFilledDocumentBody = {
  document_url: "https://mockedUrl"
};

const successResponse = {
  status: 201,
  value: qtspFilledDocument as FilledDocumentDetailView
};

const failureResponse = {
  status: 403
};

describe("handleCreateFilledDocument", () => {
  const mockBackendFciClient = jest.fn();
  const loadAction: ActionType<typeof fciLoadQtspFilledDocument.request> = {
    type: "FCI_QTSP_FILLED_DOC_REQUEST",
    payload: mockedPayload
  };
  it("Should dispatch fciLoadQtspFilledDocument.success with the response payload if the response is right and the status code is 200", () => {
    testSaga(handleCreateFilledDocument, mockBackendFciClient, loadAction)
      .next()
      .call(mockBackendFciClient, {
        body: loadAction.payload
      })
      .next(right(successResponse))
      .put(fciLoadQtspFilledDocument.success(successResponse.value))
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with the response status code as payload if the response is right and the status code is different from 200", () => {
    testSaga(handleCreateFilledDocument, mockBackendFciClient, loadAction)
      .next()
      .call(mockBackendFciClient, { body: loadAction.payload })
      .next(right(failureResponse))
      .next(
        fciLoadQtspFilledDocument.failure(
          getNetworkError(new Error(failureResponse.status.toString()))
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with a fixed message as payload if the response left", () => {
    testSaga(handleCreateFilledDocument, mockBackendFciClient, loadAction)
      .next()
      .call(mockBackendFciClient, { body: loadAction.payload })
      .next(left(new Error()))
      .next(
        fciLoadQtspFilledDocument.failure(
          getNetworkError(
            new Error("Invalid payload from fciLoadQtspFilledDocument")
          )
        )
      )
      .next()
      .isDone();
  });
  it("Should dispatch fciLoadQtspFilledDocument.failure with the error message as payload if an exception is raised", () => {
    const mockedError = new Error("mockedErrorMessage");
    testSaga(handleCreateFilledDocument, mockBackendFciClient, loadAction)
      .next()
      .call(mockBackendFciClient, { body: loadAction.payload })
      .throw(mockedError)
      .next(fciLoadQtspFilledDocument.failure(getNetworkError(mockedError)))
      .next()
      .isDone();
  });
});
