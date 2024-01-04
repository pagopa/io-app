import { testSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { testable } from "../handleLoadMessageData";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { getPaginatedMessageById } from "../../../../store/reducers/entities/messages/paginatedById";
import {
  loadMessageById,
  loadMessageDetails,
  upsertMessageStatusAttributes
} from "../../../../store/actions/messages";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { serviceByIdSelector } from "../../../../store/reducers/entities/services/servicesById";
import { loadServiceDetail } from "../../../../store/actions/services";
import { messageDetailsByIdSelector } from "../../../../store/reducers/entities/messages/detailsById";
import { loadThirdPartyMessage } from "../../store/actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { thirdPartyFromIdSelector } from "../../../../store/reducers/entities/messages/thirdPartyById";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { isPnEnabledSelector } from "../../../../store/reducers/backendStatus";
import { getMessageDataAction } from "../../store/actions";
import * as config from "../../../../config";
import { isLoadingOrUpdatingInbox } from "../../../../store/reducers/entities/messages/allPaginated";
import { ThirdPartyMessage } from "../../../../../definitions/backend/ThirdPartyMessage";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";

// eslint-disable-next-line functional/immutable-data
Object.defineProperty(config, "euCovidCertificateEnabled", { value: true });

describe("getPaginatedMessage", () => {
  it("when no paginated message is in store, it should dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.none)
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when an error is in store, it should dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.noneError)
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when a paginated message with error is in store, it should dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.someError(paginatedMessage, new Error()))
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.success(paginatedMessage))
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when the paginated message is in store, it should return it", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when no paginated message is in store, it should dispatch a loadMessageById.request but return undefined if the related saga fails", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.none)
      .put(loadMessageById.request({ id: messageId }))
      .next()
      .take([loadMessageById.success, loadMessageById.failure])
      .next(loadMessageById.failure({ id: messageId, error: new Error() }))
      .returns(undefined);
  });
});

describe("getService", () => {
  it("when no service is in store, it should dispatch a loadServiceDetail.request and terminate", () => {
    const serviceId = "s1" as ServiceId;
    testSaga(testable!.getService, serviceId)
      .next()
      .select(serviceByIdSelector, serviceId)
      .next(pot.none)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .isDone();
  });
  it("when an error is in store, it should dispatch a loadServiceDetail.request and terminate", () => {
    const serviceId = "s1" as ServiceId;
    testSaga(testable!.getService, serviceId)
      .next()
      .select(serviceByIdSelector, serviceId)
      .next(pot.noneError)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .isDone();
  });
  it("when a service with error is in store, it should dispatch a loadServiceDetail.request and terminate", () => {
    const serviceId = "s1" as ServiceId;
    testSaga(testable!.getService, serviceId)
      .next()
      .select(serviceByIdSelector, serviceId)
      .next(pot.someError({}, new Error()))
      .put(loadServiceDetail.request(serviceId))
      .next()
      .isDone();
  });
  it("when a service is in store, it should terminate", () => {
    const serviceId = "s1" as ServiceId;
    testSaga(testable!.getService, serviceId)
      .next()
      .select(serviceByIdSelector, serviceId)
      .next(pot.some({}))
      .isDone();
  });
});

describe("getMessageDetails", () => {
  it("when no message details are in store, it should dispatch a loadMessageDetails.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const messageDetails = { id: messageId } as UIMessageDetails;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.none)
      .put(loadMessageDetails.request({ id: messageId }))
      .next()
      .take([loadMessageDetails.success, loadMessageDetails.failure])
      .next(loadMessageDetails.success(messageDetails))
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.some(messageDetails))
      .returns(messageDetails);
  });
  it("when an error is in store, it should dispatch a loadMessageDetails.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const messageDetails = { id: messageId } as UIMessageDetails;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.noneError)
      .put(loadMessageDetails.request({ id: messageId }))
      .next()
      .take([loadMessageDetails.success, loadMessageDetails.failure])
      .next(loadMessageDetails.success(messageDetails))
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.some(messageDetails))
      .returns(messageDetails);
  });
  it("when some message details with error are in store, it should dispatch a loadMessageDetails.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const messageDetails = { id: messageId } as UIMessageDetails;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.someError(messageDetails, new Error()))
      .put(loadMessageDetails.request({ id: messageId }))
      .next()
      .take([loadMessageDetails.success, loadMessageDetails.failure])
      .next(loadMessageDetails.success(messageDetails))
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.some(messageDetails))
      .returns(messageDetails);
  });
  it("when the message details are in store, it should return them", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const messageDetails = { id: messageId } as UIMessageDetails;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.some(messageDetails))
      .returns(messageDetails);
  });
  it("when no message details are in store, it should dispatch a loadMessageDetails.request but return undefined if the related saga fails", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.none)
      .put(loadMessageDetails.request({ id: messageId }))
      .next()
      .take([loadMessageDetails.success, loadMessageDetails.failure])
      .next(loadMessageDetails.failure({ id: messageId, error: new Error() }))
      .returns(undefined);
  });
});

describe("getThirdPartyDataMessage", () => {
  it("should dispatch a loadThirdPartyMessage.request and return the third party message when the related saga succeeds ", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const messageCategoryTag = "GENERIC";
    const thirdPartyMessage = { id: "1" } as ThirdPartyMessageWithContent;
    testSaga(
      testable!.getThirdPartyDataMessage,
      messageId,
      false,
      serviceId,
      messageCategoryTag
    )
      .next()
      .put(
        loadThirdPartyMessage.request({
          id: messageId,
          serviceId,
          tag: messageCategoryTag
        })
      )
      .next()
      .take([loadThirdPartyMessage.success, loadThirdPartyMessage.failure])
      .next(
        loadThirdPartyMessage.success({
          id: messageId,
          content: thirdPartyMessage
        })
      )
      .select(thirdPartyFromIdSelector, messageId)
      .next(pot.some(thirdPartyMessage))
      .call(
        testable!.decodeAndTrackThirdPartyMessageDetailsIfNeeded,
        false,
        thirdPartyMessage,
        serviceId,
        messageCategoryTag
      )
      .next(O.none)
      .returns(thirdPartyMessage);
  });
  it("should dispatch a loadThirdPartyMessage.request and return undefined when the related saga fails ", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const messageCategoryTag = "GENERIC";
    testSaga(
      testable!.getThirdPartyDataMessage,
      messageId,
      false,
      serviceId,
      messageCategoryTag
    )
      .next()
      .put(
        loadThirdPartyMessage.request({
          id: messageId,
          serviceId,
          tag: messageCategoryTag
        })
      )
      .next()
      .take([loadThirdPartyMessage.success, loadThirdPartyMessage.failure])
      .next(
        loadThirdPartyMessage.failure({ id: messageId, error: new Error() })
      )
      .returns(undefined);
  });
});

describe("setMessageReadIfNeeded", () => {
  it("should dispatch an upsertMessageStatusAttributes.request to tag the message as read (if not so already) and return true if such operation succeeds", () => {
    const paginatedMessage = { isRead: false } as UIMessage;
    testSaga(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next()
      .put(
        upsertMessageStatusAttributes.request({
          message: paginatedMessage,
          update: { tag: "reading" }
        })
      )
      .next()
      .take([
        upsertMessageStatusAttributes.success,
        upsertMessageStatusAttributes.failure
      ])
      .next(
        upsertMessageStatusAttributes.success({
          message: paginatedMessage,
          update: { tag: "reading" }
        })
      )
      .returns(true);
  });
  it("should return undefined after having dispatched an upsertMessageStatusAttributes.request to tag the message as read (if not so already) but with a failing result", () => {
    const paginatedMessage = { isRead: false } as UIMessage;
    testSaga(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next()
      .put(
        upsertMessageStatusAttributes.request({
          message: paginatedMessage,
          update: { tag: "reading" }
        })
      )
      .next()
      .take([
        upsertMessageStatusAttributes.success,
        upsertMessageStatusAttributes.failure
      ])
      .next(
        upsertMessageStatusAttributes.failure({
          payload: { message: paginatedMessage, update: { tag: "reading" } },
          error: new Error()
        })
      )
      .returns(undefined);
  });
  it("should return true is the message is read", () => {
    const paginatedMessage = { isRead: true } as UIMessage;
    testSaga(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next()
      .returns(true);
  });
});

describe("dispatchSuccessAction", () => {
  it("should properly report a PN message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: TagEnum.PN }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {
      third_party_message: {
        attachments: [{} as ThirdPartyAttachment]
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const expectedOutput = {
      containsAttachments: true,
      containsPayment: undefined,
      euCovidCerficateAuthCode: undefined,
      firstTimeOpening: !isRead,
      hasRemoteContent: true,
      isPNMessage: true,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      thirdPartyMessage
    )
      .next()
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {
      third_party_message: {
        attachments: [{} as ThirdPartyAttachment]
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const expectedOutput = {
      containsAttachments: true,
      containsPayment: false,
      euCovidCerficateAuthCode: undefined,
      firstTimeOpening: !isRead,
      hasRemoteContent: true,
      isPNMessage: false,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      thirdPartyMessage
    )
      .next()
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with no attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {
      third_party_message: {} as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      euCovidCerficateAuthCode: undefined,
      firstTimeOpening: !isRead,
      hasRemoteContent: true,
      isPNMessage: false,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      thirdPartyMessage
    )
      .next()
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message without Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      euCovidCerficateAuthCode: undefined,
      firstTimeOpening: !isRead,
      hasRemoteContent: false,
      isPNMessage: false,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message with Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = { paymentData: {} } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: true,
      euCovidCerficateAuthCode: undefined,
      firstTimeOpening: !isRead,
      hasRemoteContent: false,
      isPNMessage: false,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a EU Covid message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const isRead = true;
    const authCode = "authCode";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {
      euCovidCertificate: { authCode }
    } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      euCovidCerficateAuthCode: authCode,
      firstTimeOpening: !isRead,
      hasRemoteContent: false,
      isPNMessage: false,
      messageId,
      organizationName,
      serviceId,
      serviceName
    };
    testSaga(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
});

describe("loadMessageData", () => {
  it("should loop while isLoadingOrUpdatingInbox and dispatch a getMessageDataAction.failure if getPaginatedMessage returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(undefined)
      .put(getMessageDataAction.failure({ phase: "paginatedMessage" }))
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if getMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const paginatedMessage = { id: messageId, serviceId } as UIMessage;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(undefined)
      .put(getMessageDataAction.failure({ phase: "messageDetails" }))
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a PN message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: TagEnum.PN }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: true
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .put(
        getMessageDataAction.failure({
          blockedFromPushNotificationOpt: true,
          phase: "preconditions"
        })
      )
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a message with preconditions", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: true
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: true
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .put(
        getMessageDataAction.failure({
          blockedFromPushNotificationOpt: true,
          phase: "preconditions"
        })
      )
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if thirdPartyMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const messageDetails = { hasThirdPartyData: true } as UIMessageDetails;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceId,
        tag
      )
      .next(undefined)
      .put(getMessageDataAction.failure({ phase: "thirdPartyMessageDetails" }))
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if setMessageReadIfNeeded returns a failure (having retrieved third party data successfully)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const messageDetails = { hasThirdPartyData: true } as UIMessageDetails;
    const thirdPartyMessage = {} as ThirdPartyMessageWithContent;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceId,
        tag
      )
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(undefined)
      .put(getMessageDataAction.failure({ phase: "readStatusUpdate" }))
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if setMessageReadIfNeeded returns a failure (with no third party data)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const messageDetails = { hasThirdPartyData: false } as UIMessageDetails;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(undefined)
      .put(getMessageDataAction.failure({ phase: "readStatusUpdate" }))
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (having retrieved third party data successfully for a remoted content message)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const messageDetails = { hasThirdPartyData: true } as UIMessageDetails;
    const thirdPartyMessage = {} as ThirdPartyMessageWithContent;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceId,
        tag
      )
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (having retrieved third party data successfully for a PN message)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const tag = "PN";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: true
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {} as ThirdPartyMessageWithContent;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.getThirdPartyDataMessage, messageId, true, serviceId, tag)
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (with no third party data)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "s1" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const messageDetails = { hasThirdPartyData: false } as UIMessageDetails;
    testSaga(testable!.loadMessageData, {
      messageId,
      fromPushNotification: false
    })
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(true)
      .delay(500)
      .next()
      .select(isLoadingOrUpdatingInbox)
      .next(false)
      .call(testable!.getPaginatedMessage, messageId)
      .next(paginatedMessage)
      .call(testable!.getService, serviceId)
      .next()
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(testable!.dispatchSuccessAction, paginatedMessage, messageDetails)
      .next()
      .isDone();
  });
});
