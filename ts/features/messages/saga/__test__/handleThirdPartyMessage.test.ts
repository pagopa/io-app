import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import {
  TagEnum,
  TagEnum as TEBASE
} from "../../../../../definitions/backend/MessageCategoryBase";
import { TagEnum as TEPAYMENT } from "../../../../../definitions/backend/MessageCategoryPayment";
import { TagEnum as TESEND } from "../../../../../definitions/backend/MessageCategoryPN";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { handleThirdPartyMessage, testable } from "../handleThirdPartyMessage";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import * as ANALYTICS from "../../analytics";
import * as SEND_ANALYTICS from "../../../pn/analytics";
import { loadThirdPartyMessage } from "../../store/actions";
import { ServiceId } from "../../../../../definitions/services/ServiceId";
import { serviceDetailsByIdSelector } from "../../../services/details/store/selectors";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";

describe("handleThirdPartyMessage", () => {
  const serviceDetails = {
    id: "01K80HY0HV1KP41F555A854HDG",
    name: "Service Name",
    organization: {
      name: "Organization Name",
      fiscal_code: "IT34655573020"
    }
  } as unknown as ServiceDetails;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("handleThirdPartyMessage saga", () => {
    it("should follow the proper flow when everything goes well", () => {
      const mockGetThirdPartyMessageRequest = jest.fn();
      const mockGetThirdPartyMessageFactory = () =>
        mockGetThirdPartyMessageRequest;
      const messageId = "01K813A7EVHP2W5ZAYDSTX9J0E";
      const serviceId = "01K813ACAMDW4DRVXK0CEGFHGM" as ServiceId;
      const action = loadThirdPartyMessage.request({
        id: messageId,
        serviceId,
        tag: TagEnum.GENERIC
      });
      const thirdPartyMessage = {};
      const result = E.right({ status: 200, value: thirdPartyMessage });
      testSaga(handleThirdPartyMessage, mockGetThirdPartyMessageFactory, action)
        .next()
        .select(serviceDetailsByIdSelector, serviceId)
        .next(serviceDetails)
        .call(
          withRefreshApiCall,
          mockGetThirdPartyMessageRequest({ id: messageId }),
          action
        )
        .next(result)
        .call(
          testable!.trackSuccess,
          thirdPartyMessage,
          serviceDetails,
          TagEnum.GENERIC
        )
        .next()
        .put(
          loadThirdPartyMessage.success({
            id: messageId,
            content: {
              kind: "TPM"
            } as ThirdPartyMessageUnion
          })
        );
    });
  });

  // eslint-disable-next-line sonarjs/cognitive-complexity
  describe("testable.trackSuccess", () => {
    const generateMessages = (attachmentCount: number | undefined) => {
      const thirdPartyMessage = {
        third_party_message: {
          attachments:
            attachmentCount != null
              ? [...Array(attachmentCount)].map(index => ({
                  id: `${index}`,
                  url: "https://an.url/path"
                }))
              : undefined
        }
      };
      const sendMessageNone = {
        third_party_message: {
          details: {}
        }
      };
      const sendMessageSomeNoTimeline = {
        third_party_message: {
          attachments:
            attachmentCount != null
              ? [...Array(attachmentCount)].map(index => ({
                  id: `${index}`,
                  url: "https://an.url/path"
                }))
              : undefined,
          details: {
            subject: "",
            iun: "",
            recipients: [],
            notificationStatusHistory: []
          }
        }
      };
      const sendMessageSome1ItemTimeline = {
        third_party_message: {
          attachments:
            attachmentCount != null
              ? [...Array(attachmentCount)].map(index => ({
                  id: `${index}`,
                  url: "https://an.url/path"
                }))
              : undefined,
          details: {
            subject: "",
            iun: "",
            recipients: [],
            notificationStatusHistory: [
              {
                activeFrom: new Date(),
                relatedTimelineElements: [],
                status: "ACCEPTED"
              }
            ]
          }
        }
      };
      const sendMessageSome2ItemsTimeline = {
        third_party_message: {
          attachments:
            attachmentCount != null
              ? [...Array(attachmentCount)].map(index => ({
                  id: `${index}`,
                  url: "https://an.url/path"
                }))
              : undefined,

          details: {
            subject: "",
            iun: "",
            recipients: [],
            notificationStatusHistory: [
              {
                activeFrom: new Date(),
                relatedTimelineElements: [],
                status: "ACCEPTED"
              },
              {
                activeFrom: new Date(),
                relatedTimelineElements: [],
                status: "CANCELLED"
              }
            ]
          }
        }
      };
      return [
        {
          message: thirdPartyMessage,
          isNone: false,
          isSend: false,
          timelineStatus: undefined
        },
        {
          message: sendMessageNone,
          isNone: true,
          isSend: true,
          timelineStatus: undefined
        },
        {
          message: sendMessageSomeNoTimeline,
          isNone: false,
          isSend: true,
          timelineStatus: undefined
        },
        {
          message: sendMessageSome1ItemTimeline,
          isNone: false,
          isSend: true,
          timelineStatus: "ACCEPTED"
        },
        {
          message: sendMessageSome2ItemsTimeline,
          isNone: false,
          isSend: true,
          timelineStatus: "CANCELLED"
        }
      ];
    };
    [undefined, serviceDetails].forEach(serviceDetail => {
      [
        TEBASE.EU_COVID_CERT,
        TEBASE.GENERIC,
        TEBASE.LEGAL_MESSAGE,
        TEPAYMENT.PAYMENT,
        TESEND.PN
      ].forEach(tagEnum => {
        [undefined, 0, 1, 2].forEach(attachmentCount => {
          generateMessages(attachmentCount).forEach(messageWrapper => {
            it(`should call proper analytics functions (service (${
              serviceDetail ? "undefined" : "defined"
            }) tag (${tagEnum}) attachment count (${attachmentCount}) is send (${
              messageWrapper.isSend
            }) is none (${messageWrapper.isNone}) timeline status (${
              messageWrapper.timelineStatus
            })`, () => {
              const spiedOnMockedTrackRemoteContentLoadSuccess = jest
                .spyOn(ANALYTICS, "trackRemoteContentLoadSuccess")
                .mockImplementation();
              const spiedOnMockedTrackPNNotificationLoadSuccess = jest
                .spyOn(SEND_ANALYTICS, "trackPNNotificationLoadSuccess")
                .mockImplementation();
              const spiedOnMockedTrackPNNotificationLoadError = jest
                .spyOn(SEND_ANALYTICS, "trackPNNotificationLoadError")
                .mockImplementation();
              const spiedOnMockedTrackThirdPartyMessageAttachmentCount = jest
                .spyOn(ANALYTICS, "trackThirdPartyMessageAttachmentCount")
                .mockImplementation();

              testable!.trackSuccess(
                messageWrapper.message as unknown as ThirdPartyMessageWithContent,
                serviceDetail,
                tagEnum
              );

              // trackRemoteContentLoadSuccess
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls.length
              ).toBe(1);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0].length
              ).toBe(5);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0][0]
              ).toBe(serviceDetail?.id);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0][1]
              ).toBe(serviceDetail?.name);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0][2]
              ).toBe(serviceDetail?.organization.name);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0][3]
              ).toBe(serviceDetail?.organization.fiscal_code);
              expect(
                spiedOnMockedTrackRemoteContentLoadSuccess.mock.calls[0][4]
              ).toBe(tagEnum);

              // trackPNNotificationLoadSuccess
              if (
                tagEnum === TESEND.PN &&
                !messageWrapper.isNone &&
                messageWrapper.isSend
              ) {
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls.length
                ).toBe(1);
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls[0]
                    .length
                ).toBe(4);
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls[0][0]
                ).toBe(attachmentCount !== undefined && attachmentCount > 0);
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls[0][1]
                ).toBe(messageWrapper.timelineStatus);
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls[0][2]
                ).toBe("message");
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls[0][3]
                ).toBe("not_set");
              } else {
                expect(
                  spiedOnMockedTrackPNNotificationLoadSuccess.mock.calls.length
                ).toBe(0);
              }

              // trackPNNotificationLoadError
              if (
                tagEnum === TESEND.PN &&
                (messageWrapper.isNone || !messageWrapper.isSend)
              ) {
                expect(
                  spiedOnMockedTrackPNNotificationLoadError.mock.calls.length
                ).toBe(1);
                expect(
                  spiedOnMockedTrackPNNotificationLoadError.mock.calls[0].length
                ).toBe(1);
                expect(
                  spiedOnMockedTrackPNNotificationLoadError.mock.calls[0][0]
                ).toBe(
                  "Unable convert the third party message to SEND message structure"
                );
              } else {
                expect(
                  spiedOnMockedTrackPNNotificationLoadError.mock.calls.length
                ).toBe(0);
              }

              // trackThirdPartyMessageAttachmentCount
              if (tagEnum !== TESEND.PN) {
                expect(
                  spiedOnMockedTrackThirdPartyMessageAttachmentCount.mock.calls
                    .length
                ).toBe(1);
                expect(
                  spiedOnMockedTrackThirdPartyMessageAttachmentCount.mock
                    .calls[0].length
                ).toBe(1);
                expect(
                  spiedOnMockedTrackThirdPartyMessageAttachmentCount.mock
                    .calls[0][0]
                ).toBe(
                  !messageWrapper.isNone && attachmentCount
                    ? attachmentCount
                    : 0
                );
              } else {
                expect(
                  spiedOnMockedTrackThirdPartyMessageAttachmentCount.mock.calls
                    .length
                ).toBe(0);
              }
            });
          });
        });
      });
    });
  });

  describe("testable.trackFailure", () => {
    [undefined, serviceDetails].forEach(serviceDetail => {
      [
        TEBASE.EU_COVID_CERT,
        TEBASE.GENERIC,
        TEBASE.LEGAL_MESSAGE,
        TEPAYMENT.PAYMENT,
        TESEND.PN
      ].forEach(tagEnum => {
        it(`should call proper analytics functions (service details (${
          serviceDetail != null ? "defined" : "undefined"
        }) tag (${tagEnum}))`, () => {
          const reason = "A reason";
          const spiedOnMockedTrackRemoteContentLoadFailure = jest
            .spyOn(ANALYTICS, "trackRemoteContentLoadFailure")
            .mockImplementation();
          const spiedOnMockedTrackPNNotificationLoadError = jest
            .spyOn(SEND_ANALYTICS, "trackPNNotificationLoadError")
            .mockImplementation();

          testable!.trackFailure(reason, serviceDetail, tagEnum);

          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls.length
          ).toBe(1);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0].length
          ).toBe(6);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][0]
          ).toBe(serviceDetail?.id);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][1]
          ).toBe(serviceDetail?.name);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][2]
          ).toBe(serviceDetail?.organization.name);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][3]
          ).toBe(serviceDetail?.organization.fiscal_code);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][4]
          ).toBe(tagEnum);
          expect(
            spiedOnMockedTrackRemoteContentLoadFailure.mock.calls[0][5]
          ).toBe(reason);

          if (tagEnum === TESEND.PN) {
            expect(
              spiedOnMockedTrackPNNotificationLoadError.mock.calls.length
            ).toBe(1);
            expect(
              spiedOnMockedTrackPNNotificationLoadError.mock.calls[0].length
            ).toBe(1);
            expect(
              spiedOnMockedTrackPNNotificationLoadError.mock.calls[0][0]
            ).toBe(reason);
          } else {
            expect(
              spiedOnMockedTrackPNNotificationLoadError.mock.calls.length
            ).toBe(0);
          }
        });
      });
    });
  });
});
