import { getMessageDataAction, requestAutomaticMessagesRefresh } from "..";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { UIMessageId } from "../../../types";
import { MessageListCategory } from "../../../types/messageListCategory";

describe("requestAutomaticMessagesRefresh", () => {
  it("should construct the acton with proper type and payload for 'INBOX' category", () => {
    const category: MessageListCategory = "INBOX";
    const requestAction = requestAutomaticMessagesRefresh(category);
    expect(requestAction.type).toStrictEqual(
      "REQUEST_AUOMATIC_MESSAGE_REFRESH"
    );
    expect(requestAction.payload).toStrictEqual(category);
  });
  it("should construct the acton with proper type and payload for 'ARCHIVE' category", () => {
    const category: MessageListCategory = "ARCHIVE";
    const requestAction = requestAutomaticMessagesRefresh(category);
    expect(requestAction.type).toStrictEqual(
      "REQUEST_AUOMATIC_MESSAGE_REFRESH"
    );
    expect(requestAction.payload).toStrictEqual(category);
  });
});

const messageId = "01JKAGGZTSQDR1GB5TYJ9PHXM6" as UIMessageId;
describe("getMessageDataAction.request", () =>
  [false, true].forEach(fromPushNotification =>
    it(`should construt the action with proper type and payload (fromPushNotification ${fromPushNotification})`, () => {
      const requestAction = getMessageDataAction.request({
        messageId,
        fromPushNotification
      });
      expect(requestAction.type).toBe("GET_MESSAGE_DATA_REQUEST");
      expect(requestAction.payload).toEqual({
        messageId,
        fromPushNotification
      });
    })
  ));

describe("getMessageDataAction.success", () =>
  [false, true].forEach(containsAttachments =>
    [undefined, false, true].forEach(containsPayment =>
      [false, true].forEach(firstTimeOpening =>
        [false, true].forEach(hasFIMSCTA =>
          [false, true].forEach(hasRemoteContent =>
            [undefined, false, true].forEach(isLegacyGreenPass =>
              [false, true].forEach(isPNMessage =>
                it(`should construt the action with proper type and payload (containsAttachments ${containsAttachments}) (containsPayment ${containsPayment}) (firstTimeOpening ${firstTimeOpening}) (hasFIMSCTA ${hasFIMSCTA}) (hasRemoteContent ${hasRemoteContent}) (isLegacyGreenPass ${isLegacyGreenPass}) (isPNMessage ${isPNMessage})`, () => {
                  const organizationName = "The organization name";
                  const organizationFiscalCode = "12345678901";
                  const serviceId = "01JKAGWVQRFE1P8QAHZS743M90" as ServiceId;
                  const serviceName = "The service name";
                  const createdAt = new Date(2025, 0, 1, 10, 30, 26);
                  const requestAction = getMessageDataAction.success({
                    containsAttachments,
                    containsPayment,
                    createdAt,
                    firstTimeOpening,
                    hasFIMSCTA,
                    hasRemoteContent,
                    isLegacyGreenPass,
                    isPNMessage,
                    messageId,
                    organizationFiscalCode,
                    organizationName,
                    serviceId,
                    serviceName
                  });
                  expect(requestAction.type).toBe("GET_MESSAGE_DATA_SUCCESS");
                  expect(requestAction.payload).toEqual({
                    containsAttachments,
                    containsPayment,
                    createdAt,
                    firstTimeOpening,
                    hasFIMSCTA,
                    hasRemoteContent,
                    isLegacyGreenPass,
                    isPNMessage,
                    messageId,
                    organizationFiscalCode,
                    organizationName,
                    serviceId,
                    serviceName
                  });
                })
              )
            )
          )
        )
      )
    )
  ));

describe("getMessageDataAction.failure", () =>
  (
    [
      "none",
      "paginatedMessage",
      "serviceDetails",
      "messageDetails",
      "preconditions",
      "thirdPartyMessageDetails",
      "readStatusUpdate"
    ] as const
  ).forEach(phase =>
    [undefined, false, true].forEach(blockedFromPushNotification =>
      it(`should construt the action with proper type and payload (phase ${phase}) (fromPushNotification ${blockedFromPushNotification})`, () => {
        const requestAction = getMessageDataAction.failure({
          blockedFromPushNotificationOpt: blockedFromPushNotification,
          phase
        });
        expect(requestAction.type).toBe("GET_MESSAGE_DATA_FAILURE");
        expect(requestAction.payload).toEqual({
          blockedFromPushNotificationOpt: blockedFromPushNotification,
          phase
        });
      })
    )
  ));
