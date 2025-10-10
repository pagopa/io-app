import { PublicKey } from "@pagopa/io-react-native-crypto";
import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import { Effect } from "redux-saga/effects";
import * as matchers from "redux-saga-test-plan/matchers";
import { call, take } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import {
  handleDownloadAttachment,
  testable
} from "../handleDownloadAttachment";
import { SessionToken } from "../../../../types/SessionToken";
import {
  cancelPreviousAttachmentDownload,
  downloadAttachment
} from "../../store/actions";
import { mockPdfAttachment } from "../../__mocks__/attachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { downloadAARAttachmentSaga } from "../../../pn/aar/saga/downloadAARAttachmentSaga";
import { thirdPartyMessageSelector } from "../../store/reducers/thirdPartyById";
import * as analytics from "../../analytics";

const messageId = "01JTT75QYSHWBTNTFM3CZZ17SH";
const savePath = "/tmp/attachment.pdf";
const serviceId = "service0000001" as ServiceId;
const sessionToken = "token" as SessionToken;
const keyTag = "a12e9221-c056-4bbc-8623-ca92df29361e";
const someKeyTag = O.some(keyTag);
const publicKey: PublicKey = {
  crv: "P-256",
  x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
  kty: "EC",
  y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
};
const somePublicKey = O.some(publicKey);
const keyInfo: KeyInfo = {
  keyTag,
  publicKey,
  publicKeyThumbprint: "w24n4sygj6zH-wLh0kGoQSl6QzA_LSQNRuKLUuJMYdo"
};
const downloadAttachmentRequest = downloadAttachment.request({
  attachment: mockPdfAttachment,
  messageId,
  skipMixpanelTrackingOnFailure: false,
  serviceId
});
const mandateId = "6f0beb96-d211-4861-94e8-03d6cc4e7c44";

jest.mock("react-native-blob-util", () => ({
  config: jest.fn().mockImplementation(() => ({
    fetch: jest.fn()
  }))
}));

describe("handleDownloadAttachment", () => {
  describe("handleDownloadAttachment", () => {
    it("should race 'downloadAttachmentWorker' if it is not an AAR Third Party message and terminate if the cancel action is received", () => {
      testSaga(
        handleDownloadAttachment,
        sessionToken,
        keyInfo,
        downloadAttachmentRequest
      )
        .next()
        .call(testable!.computeThirdPartyMessageData, messageId)
        .next({ ephemeralAARThirdPartyMessage: false, mandateId: undefined })
        .race({
          polling: call(
            testable!.downloadAttachmentWorker,
            sessionToken,
            keyInfo,
            downloadAttachmentRequest
          ),
          cancelAction: take(cancelPreviousAttachmentDownload)
        } as unknown as { [key: string]: Effect })
        .next(cancelPreviousAttachmentDownload())
        .isDone();
    });
    it("should race 'downloadAttachmentWorker' if it is not an AAR Third Party message and terminate when such saga is done", () => {
      testSaga(
        handleDownloadAttachment,
        sessionToken,
        keyInfo,
        downloadAttachmentRequest
      )
        .next()
        .call(testable!.computeThirdPartyMessageData, messageId)
        .next({ ephemeralAARThirdPartyMessage: false, mandateId: undefined })
        .race({
          polling: call(
            testable!.downloadAttachmentWorker,
            sessionToken,
            keyInfo,
            downloadAttachmentRequest
          ),
          cancelAction: take(cancelPreviousAttachmentDownload)
        } as unknown as { [key: string]: Effect })
        .next({ polling: true })
        .isDone();
    });
    it("should race 'downloadAARAttachmentSaga' if it is an AAR Third Party message and terminate if the cancel action is received", () => {
      testSaga(
        handleDownloadAttachment,
        sessionToken,
        keyInfo,
        downloadAttachmentRequest
      )
        .next()
        .call(testable!.computeThirdPartyMessageData, messageId)
        .next({ ephemeralAARThirdPartyMessage: true, mandateId })
        .race({
          polling: call(
            downloadAARAttachmentSaga,
            sessionToken,
            keyInfo,
            mandateId,
            downloadAttachmentRequest
          ),
          cancelAction: take(cancelPreviousAttachmentDownload)
        } as unknown as { [key: string]: Effect })
        .next(cancelPreviousAttachmentDownload())
        .isDone();
    });
    it("should race 'downloadAARAttachmentSaga' if it is an AAR Third Party message and terminate when such saga is done", () => {
      testSaga(
        handleDownloadAttachment,
        sessionToken,
        keyInfo,
        downloadAttachmentRequest
      )
        .next()
        .call(testable!.computeThirdPartyMessageData, messageId)
        .next({ ephemeralAARThirdPartyMessage: true, mandateId })
        .race({
          polling: call(
            downloadAARAttachmentSaga,
            sessionToken,
            keyInfo,
            mandateId,
            downloadAttachmentRequest
          ),
          cancelAction: take(cancelPreviousAttachmentDownload)
        } as unknown as { [key: string]: Effect })
        .next({ polling: true })
        .isDone();
    });
  });
  describe("computeThirdPartyMessageData", () => {
    it("should not identify an ephemeral AAR Third Party message if 'thirdPartyMessageSelector' returns undefined", () => {
      testSaga(testable!.computeThirdPartyMessageData, messageId)
        .next()
        .select(thirdPartyMessageSelector, messageId)
        .next(undefined)
        .returns({
          ephemeralAARThirdPartyMessage: false,
          mandateId: undefined
        });
    });
    it("should not identify an ephemeral AAR Third Party message if 'thirdPartyMessageSelector' returns a TPM third party message", () => {
      testSaga(testable!.computeThirdPartyMessageData, messageId)
        .next()
        .select(thirdPartyMessageSelector, messageId)
        .next({
          kind: "TPM"
        })
        .returns({
          ephemeralAARThirdPartyMessage: false,
          mandateId: undefined
        });
    });
    it("should identify an ephemeral AAR Third Party message if 'thirdPartyMessageSelector' returns an AAR third party message with undefined mandateId", () => {
      testSaga(testable!.computeThirdPartyMessageData, messageId)
        .next()
        .select(thirdPartyMessageSelector, messageId)
        .next({
          kind: "AAR"
        })
        .returns({
          ephemeralAARThirdPartyMessage: true,
          mandateId: undefined
        });
    });
    it("should identify an ephemeral AAR Third Party message if 'thirdPartyMessageSelector' returns an AAR third party message with a mandateId", () => {
      testSaga(testable!.computeThirdPartyMessageData, messageId)
        .next()
        .select(thirdPartyMessageSelector, messageId)
        .next({
          kind: "AAR",
          mandateId
        })
        .returns({
          ephemeralAARThirdPartyMessage: true,
          mandateId
        });
    });
  });
  describe("downloadAttachmentWorker", () => {
    const attachment = mockPdfAttachment;

    describe("when a download request succeeds", () => {
      it("then it puts a success action with the path of the saved attachment", () =>
        expectSaga(
          testable!.downloadAttachmentWorker,
          sessionToken,
          keyInfo,
          downloadAttachment.request({
            attachment,
            messageId,
            skipMixpanelTrackingOnFailure: false,
            serviceId
          })
        )
          .provide([
            [
              matchers.call.fn(ReactNativeBlobUtil.config),
              {
                fetch: jest.fn().mockReturnValue({
                  info: jest.fn().mockReturnValue({ status: 200 }),
                  path: jest.fn().mockReturnValue(savePath)
                })
              }
            ],
            [matchers.select(lollipopKeyTagSelector), someKeyTag],
            [matchers.select(lollipopPublicKeySelector), somePublicKey]
          ])
          .put(
            downloadAttachment.success({
              attachment,
              messageId,
              path: savePath
            })
          )
          .run());
    });

    describe("when a download request generically fails", () => {
      it("then it puts a failure action with the generic error message", () =>
        expectSaga(
          testable!.downloadAttachmentWorker,
          sessionToken,
          keyInfo,
          downloadAttachment.request({
            attachment,
            messageId,
            skipMixpanelTrackingOnFailure: false,
            serviceId
          })
        )
          .provide([
            [
              matchers.call.fn(ReactNativeBlobUtil.config),
              {
                fetch: jest.fn().mockReturnValue({
                  info: jest.fn().mockReturnValue({ status: 404 })
                })
              }
            ],
            [matchers.select(lollipopKeyTagSelector), someKeyTag],
            [matchers.select(lollipopPublicKeySelector), somePublicKey]
          ])
          .put(
            downloadAttachment.failure({
              attachment,
              messageId,
              error: new Error(
                I18n.t("messageDetails.attachments.downloadFailed")
              )
            })
          )
          .run());
    });

    describe("when a download request fails for a bad file format", () => {
      it("then it puts a failure action with the file format error", () =>
        expectSaga(
          testable!.downloadAttachmentWorker,
          sessionToken,
          keyInfo,
          downloadAttachment.request({
            attachment,
            messageId,
            skipMixpanelTrackingOnFailure: false,
            serviceId
          })
        )
          .provide([
            [
              matchers.call.fn(ReactNativeBlobUtil.config),
              {
                fetch: jest.fn().mockReturnValue({
                  info: jest.fn().mockReturnValue({ status: 415 })
                })
              }
            ],
            [matchers.select(lollipopKeyTagSelector), someKeyTag],
            [matchers.select(lollipopPublicKeySelector), somePublicKey]
          ])
          .put(
            downloadAttachment.failure({
              attachment,
              messageId,
              error: new Error(I18n.t("messageDetails.attachments.badFormat"))
            })
          )
          .run());
    });
  });
  describe("getDelayMilliseconds", () => {
    it("should return zero if the retry-after header does not exist", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({});
      expect(retryAfterMilliseconds).toBe(0);
    });
    it("should return zero if the retry-after header has a bad syntax", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        retryafter: "1"
      });
      expect(retryAfterMilliseconds).toBe(0);
    });
    it("should return zero if the retry-after header does not contain a valid number", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "never"
      });
      expect(retryAfterMilliseconds).toBe(0);
    });
    it("should return zero if the retry-after header contains a negative number", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "-3"
      });
      expect(retryAfterMilliseconds).toBe(0);
    });
    it("should return the lower bound integer if the retry-after header contains a float american number (3.5)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "3.5"
      });
      expect(retryAfterMilliseconds).toBe(3000);
    });
    it("should return the lower bound integer if the retry-after header contains a float italian number (3.5)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "3,5"
      });
      expect(retryAfterMilliseconds).toBe(3000);
    });
    it("should return the lower bound integer if the retry-after header contains a float american number (3.9)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "3.9"
      });
      expect(retryAfterMilliseconds).toBe(3000);
    });
    it("should return the lower bound integer if the retry-after header contains a float italian number (3,9)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "3,9"
      });
      expect(retryAfterMilliseconds).toBe(3000);
    });
    it("should return the value if the retry-after header contains a valid number (2)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "2"
      });
      expect(retryAfterMilliseconds).toBe(2000);
    });
    it("should return the value if the retry-after header contains a valid number (1000)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "1000"
      });
      expect(retryAfterMilliseconds).toBe(1000);
    });
    it("should return the upper limit if the retry-after header contains a value that is too big (25)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "25"
      });
      expect(retryAfterMilliseconds).toBe(24000);
    });
    it("should return the upper limit if the retry-after header contains a value that is too big (999)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "999"
      });
      expect(retryAfterMilliseconds).toBe(24000);
    });
    it("should return the upper limit if the retry-after header contains a value that is too big (24001)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "24001"
      });
      expect(retryAfterMilliseconds).toBe(24000);
    });
    it("should return the upper limit if the retry-after header contains a value that is too big (100000)", () => {
      const retryAfterMilliseconds = testable!.getDelayMilliseconds({
        "retry-after": "24000"
      });
      expect(retryAfterMilliseconds).toBe(24000);
    });
  });
  describe("trackFailureEvent", () => {
    const spiedOnMockedBadFormat = jest
      .spyOn(analytics, "trackThirdPartyMessageAttachmentBadFormat")
      .mockImplementation();
    const spiedOnMockedDownloadFailed = jest
      .spyOn(analytics, "trackThirdPartyMessageAttachmentDownloadFailed")
      .mockImplementation();
    const spiedOnMockedUnavailable = jest
      .spyOn(analytics, "trackThirdPartyMessageAttachmentUnavailable")
      .mockImplementation();
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it("should not do anything if 'skipMixpanelTrackingOnFailure' is set to true", () => {
      testable!.trackFailureEvent(true, 500, messageId, serviceId);
      expect(spiedOnMockedBadFormat.mock.calls.length).toBe(0);
      expect(spiedOnMockedDownloadFailed.mock.calls.length).toBe(0);
      expect(spiedOnMockedUnavailable.mock.calls.length).toBe(0);
    });
    it("should track 'unavailable' on a 500 server error", () => {
      testable!.trackFailureEvent(false, 500, messageId, serviceId);
      expect(spiedOnMockedBadFormat.mock.calls.length).toBe(0);
      expect(spiedOnMockedDownloadFailed.mock.calls.length).toBe(0);
      expect(spiedOnMockedUnavailable.mock.calls.length).toBe(1);
      expect(spiedOnMockedUnavailable.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedUnavailable.mock.calls[0][0]).toBe(messageId);
      expect(spiedOnMockedUnavailable.mock.calls[0][1]).toBe(serviceId);
    });
    it("should track 'bad format' on a 415 server error", () => {
      testable!.trackFailureEvent(false, 415, messageId, serviceId);
      expect(spiedOnMockedBadFormat.mock.calls.length).toBe(1);
      expect(spiedOnMockedBadFormat.mock.calls[0].length).toBe(2);
      expect(spiedOnMockedBadFormat.mock.calls[0][0]).toBe(messageId);
      expect(spiedOnMockedBadFormat.mock.calls[0][1]).toBe(serviceId);
      expect(spiedOnMockedDownloadFailed.mock.calls.length).toBe(0);
      expect(spiedOnMockedUnavailable.mock.calls.length).toBe(0);
    });
    [199, 400, 499, 501, 599].forEach(code => {
      it(`should track ' download failed' on a ${code} server error`, () => {
        testable!.trackFailureEvent(false, code, messageId, serviceId);
        expect(spiedOnMockedBadFormat.mock.calls.length).toBe(0);
        expect(spiedOnMockedUnavailable.mock.calls.length).toBe(0);
        expect(spiedOnMockedDownloadFailed.mock.calls.length).toBe(1);
        expect(spiedOnMockedDownloadFailed.mock.calls[0].length).toBe(2);
        expect(spiedOnMockedDownloadFailed.mock.calls[0][0]).toBe(messageId);
        expect(spiedOnMockedDownloadFailed.mock.calls[0][1]).toBe(serviceId);
      });
    });
    [200, 299, 300, 399].forEach(code => {
      it(`should not track anything on a ${code} server sttus code`, () => {
        testable!.trackFailureEvent(false, code, messageId, serviceId);
        expect(spiedOnMockedBadFormat.mock.calls.length).toBe(0);
        expect(spiedOnMockedDownloadFailed.mock.calls.length).toBe(0);
        expect(spiedOnMockedUnavailable.mock.calls.length).toBe(0);
      });
    });
  });
});
