import { testSaga, expectSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as matchers from "redux-saga-test-plan/matchers";
import { CommonActions, StackActions } from "@react-navigation/native";
import NavigationService from "../../../../navigation/NavigationService";
import { FCI_ROUTES } from "../../navigation/routes";
import ROUTES from "../../../../navigation/routes";
import { identificationSuccess } from "../../../identification/store/actions";
import {
  fciClearStateRequest,
  fciStartRequest,
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciSignatureRequestFromId,
  fciSignatureRequestRetryFromId,
  fciDownloadPreview,
  fciDownloadPreviewClear,
  fciClearAllFiles,
  fciMetadataRequest
} from "../../store/actions";
import {
  fciQtspClausesMetadataSelector,
  fciQtspNonceSelector
} from "../../store/reducers/fciQtspClauses";
import { fciSignatureRequestSelector } from "../../store/reducers/fciSignatureRequest";
import { fciQtspFilledDocumentUrlSelector } from "../../store/reducers/fciQtspFilledDocument";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import { spidLevelFromSessionInfoSelector } from "../../../authentication/common/store/selectors";
import { fciSecurityLevelLocalFeatureFlagSelector } from "../../store/reducers/fciSecurityLevelReducer";
import { FciDownloadPreviewDirectoryPath } from "../networking/handleDownloadDocument";
import { mockQtspClausesMetadata } from "../../types/__mocks__/QtspClausesMetadata.mock";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import { testable } from "../index";

// Mock react-native-fs
jest.mock("react-native-fs", () => ({
  exists: jest.fn(() => Promise.resolve(true)),
  unlink: jest.fn(() => Promise.resolve())
}));

// Ensure testable is defined in test environment
if (!testable) {
  throw new Error("testable is not defined");
}

const {
  watchIdentificationPinResetSaga,
  watchFciQtspClausesSaga,
  standardFciFlowStartSaga,
  watchFciStartSaga,
  watchFciSignatureRequestRetrySaga,
  clearFciDownloadPreview,
  watchFciSigningRequestSaga,
  clearAllFciFiles,
  watchFciEndSaga
} = testable;

describe("FCI Saga Tests", () => {
  describe("watchIdentificationPinResetSaga", () => {
    it("should dispatch fciClearStateRequest", () => {
      testSaga(watchIdentificationPinResetSaga)
        .next()
        .put(fciClearStateRequest())
        .next()
        .isDone();
    });
  });

  describe("watchFciQtspClausesSaga", () => {
    it("should dispatch fciLoadQtspFilledDocument.request when qtsp clauses are available", () =>
      expectSaga(watchFciQtspClausesSaga)
        .provide([
          [
            matchers.select(fciQtspClausesMetadataSelector),
            pot.some(mockQtspClausesMetadata)
          ]
        ])
        .put(
          fciLoadQtspFilledDocument.request({
            document_url: Buffer.from(
              `${mockQtspClausesMetadata.document_url}`
            ).toString("base64") as NonEmptyString
          })
        )
        .run());

    it("should navigate to failure screen when qtsp clauses are not available", () =>
      expectSaga(watchFciQtspClausesSaga)
        .provide([[matchers.select(fciQtspClausesMetadataSelector), pot.none]])
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.navigate(ROUTES.MAIN, {
            screen: ROUTES.WORKUNIT_GENERIC_FAILURE
          })
        )
        .run());
  });

  describe("standardFciFlowStartSaga", () => {
    it("should navigate to documents screen and dispatch initial requests", () =>
      expectSaga(standardFciFlowStartSaga)
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.replace(FCI_ROUTES.MAIN, {
            screen: FCI_ROUTES.DOCUMENTS,
            params: {
              attrs: undefined
            }
          })
        )
        .put(fciLoadQtspClauses.request())
        .put(fciMetadataRequest.request())
        .run());
  });

  describe("watchFciStartSaga", () => {
    it("should start standard flow when l3LocalFlag is false", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L2"],
          [matchers.select(fciSecurityLevelLocalFeatureFlagSelector), false],
          [matchers.call.fn(standardFciFlowStartSaga), undefined]
        ])
        .call(standardFciFlowStartSaga)
        .run());

    it("should start standard flow when l3LocalFlag is true and spidLevel is L3", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L3"],
          [matchers.select(fciSecurityLevelLocalFeatureFlagSelector), true],
          [matchers.call.fn(standardFciFlowStartSaga), undefined]
        ])
        .call(standardFciFlowStartSaga)
        .run());

    it("should navigate to L3 login screen when l3LocalFlag is true and spidLevel is not L3", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L2"],
          [matchers.select(fciSecurityLevelLocalFeatureFlagSelector), true]
        ])
        .call(
          NavigationService.dispatchNavigationAction,
          StackActions.push(FCI_ROUTES.MAIN, {
            screen: FCI_ROUTES.FCI_LOGIN_L3
          })
        )
        .run());
  });

  describe("watchFciSignatureRequestRetrySaga", () => {
    const signatureRequestId = "test-signature-id" as NonEmptyString;
    const action = fciSignatureRequestRetryFromId(signatureRequestId);

    it("should retry signature request and start new flow on success", () =>
      expectSaga(watchFciSignatureRequestRetrySaga, action)
        .put(fciSignatureRequestFromId.request(signatureRequestId))
        .dispatch(
          fciSignatureRequestFromId.success({
            ...mockSignatureRequestDetailView,
            id: signatureRequestId
          })
        )
        .put(fciStartRequest())
        .run());

    it("should not start flow when signature request fails", () =>
      expectSaga(watchFciSignatureRequestRetrySaga, action)
        .put(fciSignatureRequestFromId.request(signatureRequestId))
        .dispatch(
          fciSignatureRequestFromId.failure({
            kind: "timeout"
          })
        )
        .not.put(fciStartRequest())
        .run());
  });

  describe("clearFciDownloadPreview", () => {
    const testPath = "/test/path/document.pdf";

    it("should delete file, cancel download and navigate back when path is provided", () => {
      const action = fciDownloadPreviewClear({ path: testPath });

      return expectSaga(clearFciDownloadPreview, action)
        .put(fciDownloadPreview.cancel())
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.goBack()
        )
        .run();
    });

    it("should cancel download and navigate back when path is not provided", () => {
      const action = fciDownloadPreviewClear({ path: "" });

      return expectSaga(clearFciDownloadPreview, action)
        .put(fciDownloadPreview.cancel())
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.goBack()
        )
        .run();
    });
  });

  describe("watchFciSigningRequestSaga", () => {
    const mockQtspClauses = mockQtspClausesMetadata;
    const mockSignatureRequest = mockSignatureRequestDetailView;
    const mockFilledDocumentUrl = "https://example.com/filled-doc";
    const mockNonce = "test-nonce" as NonEmptyString;
    const mockDocumentSignatures: ReadonlyArray<any> = [];

    it("should request identification and create signature on success", () =>
      expectSaga(watchFciSigningRequestSaga)
        .provide([
          [
            matchers.select(fciQtspClausesMetadataSelector),
            pot.some(mockQtspClauses)
          ],
          [
            matchers.select(fciSignatureRequestSelector),
            pot.some(mockSignatureRequest)
          ],
          [
            matchers.select(fciQtspFilledDocumentUrlSelector),
            mockFilledDocumentUrl
          ],
          [matchers.select(fciQtspNonceSelector), mockNonce],
          [
            matchers.select(fciDocumentSignaturesSelector),
            mockDocumentSignatures
          ]
        ])
        .put.like({
          action: {
            type: "IDENTIFICATION_REQUEST"
          }
        })
        .dispatch(identificationSuccess({ isBiometric: false }))
        .put.like({
          action: {
            type: "FCI_SIGNING_REQUEST"
          }
        })
        .run());
  });

  describe("clearAllFciFiles", () => {
    const testPath = FciDownloadPreviewDirectoryPath;

    it("should delete the specified path", () => {
      const action = fciClearAllFiles({ path: testPath });

      return expectSaga(clearAllFciFiles, action).run();
    });
  });

  describe("watchFciEndSaga", () => {
    it("should clear state, clear files and navigate to main", () =>
      expectSaga(watchFciEndSaga)
        .put(fciClearStateRequest())
        .put(fciClearAllFiles({ path: FciDownloadPreviewDirectoryPath }))
        .call(
          NavigationService.dispatchNavigationAction,
          CommonActions.navigate(ROUTES.MAIN)
        )
        .run());
  });
});
