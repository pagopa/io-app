/* eslint jest/expect-expect: ["error", { "assertFunctionNames": ["expect*", "testSaga*"] }] */

import * as pot from "@pagopa/ts-commons/lib/pot";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { CommonActions, StackActions } from "@react-navigation/native";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { appCurrentStateSelector } from "../../../../store/reducers/appState";
import { setActiveSessionLoginFlow } from "../../../authentication/activeSessionLogin/store/actions";
import { activeSessionLoginFlowSelector } from "../../../authentication/activeSessionLogin/store/selectors";
import { spidLevelFromSessionInfoSelector } from "../../../authentication/common/store/selectors";
import { identificationSuccess } from "../../../identification/store/actions";
import { FCI_ROUTES } from "../../navigation/routes";
import {
  fciClearAllFiles,
  fciClearStateRequest,
  fciDownloadPreview,
  fciDownloadPreviewClear,
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciMetadataRequest,
  fciSignatureRequestFromId,
  fciSignatureRequestRetryFromId,
  fciSignatureRequestRetrySuccess,
  fciStartRequest
} from "../../store/actions";
import { fciDocumentSignaturesSelector } from "../../store/reducers/fciDocumentSignatures";
import {
  fciQtspClausesMetadataSelector,
  fciQtspNonceSelector
} from "../../store/reducers/fciQtspClauses";
import { fciQtspFilledDocumentUrlSelector } from "../../store/reducers/fciQtspFilledDocument";
import {
  fciSignatureRequestIdSelector,
  fciSignatureRequestSelector
} from "../../store/reducers/fciSignatureRequest";
import { isFciSecurityLevelCheckRemoteFFEnabledSelector } from "../../store/selectors/remoteConfig";
import { mockQtspClausesMetadata } from "../../types/__mocks__/QtspClausesMetadata.mock";
import { mockSignatureRequestDetailView } from "../../types/__mocks__/SignatureRequestDetailView.mock";
import {
  navigateAfterFinishedFciActiveSessionLoginFlowSaga,
  testable
} from "../index";
import { FciDownloadPreviewDirectoryPath } from "../networking/handleDownloadDocument";

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
    it("should start standard flow when security level check is disabled", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L2"],
          [
            matchers.select(isFciSecurityLevelCheckRemoteFFEnabledSelector),
            false
          ],
          [matchers.call.fn(standardFciFlowStartSaga), undefined]
        ])
        .call(standardFciFlowStartSaga)
        .run());

    it("should start standard flow when security level check is enabled and spidLevel is L3", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L3"],
          [
            matchers.select(isFciSecurityLevelCheckRemoteFFEnabledSelector),
            true
          ],
          [matchers.call.fn(standardFciFlowStartSaga), undefined]
        ])
        .call(standardFciFlowStartSaga)
        .run());

    it("should navigate to L3 login screen when security level check is enabled and spidLevel is not L3", () =>
      expectSaga(watchFciStartSaga)
        .provide([
          [matchers.select(spidLevelFromSessionInfoSelector), "L2"],
          [
            matchers.select(isFciSecurityLevelCheckRemoteFFEnabledSelector),
            true
          ]
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

    it("should dispatch fciSignatureRequestRetrySuccess and fciStartRequest on success", () =>
      expectSaga(watchFciSignatureRequestRetrySaga, action)
        .put(fciSignatureRequestFromId.request(signatureRequestId))
        .dispatch(
          fciSignatureRequestFromId.success({
            ...mockSignatureRequestDetailView,
            id: signatureRequestId
          })
        )
        .put(
          fciSignatureRequestRetrySuccess({
            ...mockSignatureRequestDetailView,
            id: signatureRequestId
          })
        )
        .put(fciStartRequest())
        .not.put(fciDownloadPreview.cancel())
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
          ],
          [matchers.select(appCurrentStateSelector), "active"]
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

    it("should create signature immediately when app is in active state", () =>
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
          ],
          [matchers.select(appCurrentStateSelector), "active"]
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

    it("should wait for app to become active before creating signature when app is inactive", () => {
      // eslint-disable-next-line functional/no-let
      let pollCount = 0;
      return expectSaga(watchFciSigningRequestSaga)
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
          ],

          {
            call(effect: any) {
              if (effect.fn === NavigationService.dispatchNavigationAction) {
                return undefined;
              }
              return undefined;
            },
            select(selector: any) {
              if (selector === appCurrentStateSelector) {
                pollCount++;
                return pollCount === 1 ? "inactive" : "active";
              }
              return undefined;
            },
            delay() {
              return undefined;
            }
          } as any
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
        .run();
    });

    it("should wait for app to become active before creating signature when app is in background", () => {
      // eslint-disable-next-line functional/no-let
      let pollCount = 0;
      return expectSaga(watchFciSigningRequestSaga)
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
          ],

          {
            call(effect: any) {
              if (effect.fn === NavigationService.dispatchNavigationAction) {
                return undefined;
              }
              return undefined;
            },
            select(selector: any) {
              if (selector === appCurrentStateSelector) {
                pollCount++;
                return pollCount === 1 ? "background" : "active";
              }
              return undefined;
            },
            delay() {
              return undefined;
            }
          } as any
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
        .run();
    });
  });

  describe("clearAllFciFiles", () => {
    const testPath = FciDownloadPreviewDirectoryPath;

    it("should delete the specified path", async () => {
      const action = fciClearAllFiles({ path: testPath });
      const RNFS = require("react-native-fs");

      await expectSaga(clearAllFciFiles, action).run();

      expect(RNFS.exists).toHaveBeenCalledWith(testPath);
      expect(RNFS.unlink).toHaveBeenCalledWith(testPath);
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

  describe("navigateAfterFinishedFciActiveSessionLoginFlowSaga", () => {
    it("should resume FCI signature flow when all conditions are met", () => {
      const mockSignatureRequestId = "test-signature-id" as NonEmptyString;

      testSaga(navigateAfterFinishedFciActiveSessionLoginFlowSaga, true)
        .next()
        .select(fciSignatureRequestIdSelector)
        .next(mockSignatureRequestId)
        .select(activeSessionLoginFlowSelector)
        .next("FCI")
        .put(setActiveSessionLoginFlow(undefined))
        .next()
        .put(fciSignatureRequestRetryFromId(mockSignatureRequestId))
        .next()
        .isDone();
    });

    it("should not resume FCI flow when isActiveLoginSuccess is false", () => {
      const mockSignatureRequestId = "test-signature-id" as NonEmptyString;

      return expectSaga(
        navigateAfterFinishedFciActiveSessionLoginFlowSaga,
        false
      )
        .provide([
          [
            matchers.select(fciSignatureRequestIdSelector),
            mockSignatureRequestId
          ],
          [matchers.select(activeSessionLoginFlowSelector), "FCI"]
        ])
        .put(setActiveSessionLoginFlow(undefined))
        .not.put(fciSignatureRequestRetryFromId(mockSignatureRequestId))
        .run();
    });

    it("should not resume FCI flow when signatureRequestId is undefined", () =>
      expectSaga(navigateAfterFinishedFciActiveSessionLoginFlowSaga, true)
        .provide([
          [matchers.select(fciSignatureRequestIdSelector), undefined],
          [matchers.select(activeSessionLoginFlowSelector), "FCI"]
        ])
        .put(setActiveSessionLoginFlow(undefined))
        .not.put.actionType("FCI_SIGNATURE_REQUEST_RETRY_FROM_ID")
        .run());

    it("should not resume FCI flow when activeSessionLoginFlow is not FCI", () => {
      const mockSignatureRequestId = "test-signature-id" as NonEmptyString;

      return expectSaga(
        navigateAfterFinishedFciActiveSessionLoginFlowSaga,
        true
      )
        .provide([
          [
            matchers.select(fciSignatureRequestIdSelector),
            mockSignatureRequestId
          ],
          [matchers.select(activeSessionLoginFlowSelector), undefined]
        ])
        .put(setActiveSessionLoginFlow(undefined))
        .not.put(fciSignatureRequestRetryFromId(mockSignatureRequestId))
        .run();
    });
  });
});
