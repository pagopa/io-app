import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import { Effect } from "redux-saga/effects";
import { call, take } from "typed-redux-saga/macro";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ThirdPartyMessage } from "../../../../../definitions/backend/ThirdPartyMessage";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ServiceDetails } from "../../../../../definitions/services/ServiceDetails";
import { isPnRemoteEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { trackMessageDataLoadFailure } from "../../analytics";
import {
  cancelGetMessageDataAction,
  getMessageDataAction,
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage,
  upsertMessageStatusAttributes
} from "../../store/actions";
import { isLoadingOrUpdatingInbox } from "../../store/reducers/allPaginated";
import { messageDetailsByIdSelector } from "../../store/reducers/detailsById";
import { MessageGetStatusFailurePhaseType } from "../../store/reducers/messageGetStatus";
import { getPaginatedMessageById } from "../../store/reducers/paginatedById";
import { thirdPartyFromIdSelector } from "../../store/reducers/thirdPartyById";
import { UIMessage, UIMessageDetails } from "../../types";
import { ThirdPartyMessageUnion } from "../../types/thirdPartyById";
import { handleLoadMessageData, testable } from "../handleLoadMessageData";
import { getServiceDetails } from "../../../services/common/saga/ getServiceDetails";

const fimsCTAFrontMatter =
  '---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "iosso://https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "iosso://https://relyingParty.url"\n---';

describe("getPaginatedMessage", () => {
  it("when no paginated message is in store, it should dispatch a loadMessageById.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const paginatedMessage = { id: messageId } as UIMessage;
    testSaga(testable!.getPaginatedMessage, messageId)
      .next()
      .select(getPaginatedMessageById, messageId)
      .next(pot.some(paginatedMessage))
      .returns(paginatedMessage);
  });
  it("when no paginated message is in store, it should dispatch a loadMessageById.request but return undefined if the related saga fails", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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

describe("getMessageDetails", () => {
  it("when no message details are in store, it should dispatch a loadMessageDetails.request and retrieve its result from the store if it succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const messageDetails = { id: messageId } as UIMessageDetails;
    testSaga(testable!.getMessageDetails, messageId)
      .next()
      .select(messageDetailsByIdSelector, messageId)
      .next(pot.some(messageDetails))
      .returns(messageDetails);
  });
  it("when no message details are in store, it should dispatch a loadMessageDetails.request but return undefined if the related saga fails", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
  it("should dispatch a loadThirdPartyMessage.request and return the third party message when the related saga succeeds", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const service = {
      id: "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId,
      name: "The name",
      organization: {
        fiscal_code: "OrgFisCod",
        name: "Org name"
      }
    } as ServiceDetails;
    const messageCategoryTag = "GENERIC";
    const thirdPartyMessage = {
      kind: "TPM",
      id: "1"
    } as ThirdPartyMessageUnion;
    testSaga(
      testable!.getThirdPartyDataMessage,
      messageId,
      false,
      service,
      messageCategoryTag
    )
      .next()
      .put(
        loadThirdPartyMessage.request({
          id: messageId,
          serviceId: service.id,
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
        service,
        messageCategoryTag
      )
      .next(O.none)
      .returns(thirdPartyMessage);
  });
  it("should dispatch a loadThirdPartyMessage.request and return undefined when the related saga fails ", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const service = {
      id: "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId,
      name: "The name",
      organization: {
        fiscal_code: "OrgFisCod",
        name: "Org name"
      }
    } as ServiceDetails;
    const messageCategoryTag = "GENERIC";
    testSaga(
      testable!.getThirdPartyDataMessage,
      messageId,
      false,
      service,
      messageCategoryTag
    )
      .next()
      .put(
        loadThirdPartyMessage.request({
          id: messageId,
          serviceId: service.id,
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
          payload: {
            message: paginatedMessage,
            update: { tag: "reading" }
          },
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: TagEnum.PN },
      createdAt
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
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: true,
      isLegacyGreenPass: false,
      isPNMessage: true,
      messageId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnRemoteEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
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
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: true,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnRemoteEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with no attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {
      third_party_message: {} as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: true,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnRemoteEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message without Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: false,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      undefined
    )
      .next()
      .select(isPnRemoteEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message with Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = { paymentData: {} } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: true,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: false,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      undefined
    )
      .next()
      .select(isPnRemoteEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a legacy EU Covid message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const authCode = "authCode";
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = {
      euCovidCertificate: { authCode }
    } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: false,
      hasRemoteContent: false,
      isLegacyGreenPass: !!authCode,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      undefined
    )
      .next()
      .select(isPnRemoteEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a standard message with the FIMS CTA", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = {
      markdown: fimsCTAFrontMatter
    } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: true,
      hasRemoteContent: false,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
      serviceId,
      serviceName
    };
    testSaga(
      testable!.dispatchSuccessAction,
      paginatedMessage,
      messageDetails,
      undefined
    )
      .next()
      .select(isPnRemoteEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with FIMS CTA", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const createdAt = new Date(2025, 0, 1, 10, 30, 26);
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" },
      createdAt
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const thirdPartyMessage = {
      third_party_message: {
        details: {
          markdown: fimsCTAFrontMatter,
          subject: "The subject"
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
      createdAt,
      firstTimeOpening: !isRead,
      hasFIMSCTA: true,
      hasRemoteContent: true,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnRemoteEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
});

describe("loadMessageData", () => {
  it("should loop while isLoadingOrUpdatingInbox and dispatch a getMessageDataAction.failure if getPaginatedMessage returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
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
      .call(testable!.commonFailureHandling, "paginatedMessage", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if getMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(undefined)
      .call(testable!.commonFailureHandling, "messageDetails", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a PN message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: TagEnum.PN }
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.commonFailureHandling, "preconditions", true, true)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a message with preconditions", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: true
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.commonFailureHandling, "preconditions", true, true)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if thirdPartyMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceDetails,
        tag
      )
      .next(undefined)
      .call(testable!.commonFailureHandling, "thirdPartyMessageDetails", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if setMessageReadIfNeeded returns a failure (having retrieved third party data successfully)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceDetails,
        tag
      )
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(undefined)
      .call(testable!.commonFailureHandling, "readStatusUpdate", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if setMessageReadIfNeeded returns a failure (with no third party data)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(undefined)
      .call(testable!.commonFailureHandling, "readStatusUpdate", false)
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (having retrieved third party data successfully for a remoted content message)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        false,
        serviceDetails,
        tag
      )
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(
        testable!.dispatchSuccessAction,
        paginatedMessage,
        messageDetails,
        thirdPartyMessage
      )
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (having retrieved third party data successfully for a PN message)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "PN";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: true
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(
        testable!.getThirdPartyDataMessage,
        messageId,
        true,
        serviceDetails,
        tag
      )
      .next(thirdPartyMessage)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(
        testable!.dispatchSuccessAction,
        paginatedMessage,
        messageDetails,
        thirdPartyMessage
      )
      .next()
      .isDone();
  });
  it("should call dispatchSuccessAction when it succeed (with no third party data)", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD";
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      id: serviceId
    } as ServiceDetails;
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
      .call(getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.setMessageReadIfNeeded, paginatedMessage)
      .next(true)
      .call(
        testable!.dispatchSuccessAction,
        paginatedMessage,
        messageDetails,
        undefined
      )
      .next()
      .isDone();
  });
});

describe("commonFailureHandling", () => {
  (
    [
      "none",
      "paginatedMessage",
      "serviceDetails",
      "messageDetails",
      "preconditions",
      "thirdPartyMessageDetails",
      "readStatusUpdate"
    ] as ReadonlyArray<MessageGetStatusFailurePhaseType>
  ).forEach(phase =>
    [false, true].forEach(startedFromPushNotification =>
      [undefined, false, true].forEach(blockedFromPushNotificationOpt => {
        it(`should track analytics and dispatch 'getMessageDataAction.failure', phase '${phase}' (from push notification '${startedFromPushNotification}', blocked on push notification '${!!blockedFromPushNotificationOpt}')`, () => {
          testSaga(
            testable!.commonFailureHandling,
            phase,
            startedFromPushNotification,
            blockedFromPushNotificationOpt
          )
            .next()
            .call(
              trackMessageDataLoadFailure,
              startedFromPushNotification,
              phase
            )
            .next()
            .put(
              getMessageDataAction.failure({
                blockedFromPushNotificationOpt,
                phase
              })
            )
            .next()
            .isDone();
        });
      })
    )
  );
});

describe("computeHasFIMSCTA", () => {
  const serviceId = "01JQ93ZCD00T8P131AT2ES102D" as ServiceId;
  const fimsCTA2FrontMatter = `---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "https://relyingParty.url"\n cta_2:\n  text: "Visualizza i requisiti"\n  action: "iosso://https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "https://relyingParty.url"\n cta_2:\n  text: "View requirements"\n  action: "iosso://https://relyingParty.url"\n---`;
  const unrelatedCTAFrontMatter =
    '---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "https://relyingParty.url"\n cta_1:\n  text: "Visualizza i requisiti"\n  action: "https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "https://relyingParty.url"\n cta_1:\n  text: "View requirements"\n  action: "https://relyingParty.url"\n---';
  it("should return true for a standard message with FIMS cta (cta1)", () => {
    const messageDetails = {
      markdown: `${fimsCTAFrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      undefined
    );

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return true for a standard message with FIMS cta (cta2)", () => {
    const messageDetails = {
      markdown: `${fimsCTA2FrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      undefined
    );

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return false for a standard message with no cta", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      undefined
    );

    expect(hasFIMSCTA).toBe(false);
  });
  it("should return false for a standard message with CTAs unrelated to FIMS", () => {
    const messageDetails = {
      markdown: `${unrelatedCTAFrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      undefined
    );

    expect(hasFIMSCTA).toBe(false);
  });
  it("should return true for a remote message with FIMS cta (cta1)", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {
        details: {
          subject: "The subject",
          markdown: `${fimsCTAFrontMatter}\nThis is the message body`
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      remoteMessage
    );

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return true for a remote message with FIMS cta (cta2)", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {
        details: {
          subject: "The subject",
          markdown: `${fimsCTA2FrontMatter}\nThis is the message body`
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      remoteMessage
    );

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return false for a remote message with no cta", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {
        details: {
          subject: "The subject",
          markdown: `This is the message body`
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      remoteMessage
    );

    expect(hasFIMSCTA).toBe(false);
  });
  it("should return false for a remote message with CTAs unrelated to FIMS", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {
        details: {
          subject: "The subject",
          markdown: `${unrelatedCTAFrontMatter}\nThis is the message body`
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(
      messageDetails,
      serviceId,
      remoteMessage
    );

    expect(hasFIMSCTA).toBe(false);
  });
});

describe("handleLoadMessageData", () => {
  it("should start a race between loadMessageData and cancellation, and handle successful polling", () => {
    const messageId = "01JP5D5R15CRAG7D1FHE5TEE24";
    const action = getMessageDataAction.request({
      fromPushNotification: false,
      messageId
    });
    const successPayload = {
      containsAttachments: false,
      containsPayment: false,
      createdAt: new Date(),
      firstTimeOpening: true,
      hasFIMSCTA: false,
      hasRemoteContent: false,
      isLegacyGreenPass: false,
      isPNMessage: false,
      messageId,
      organizationName: "Test Organization",
      organizationFiscalCode: "12345678901",
      serviceId: "service123" as ServiceId,
      serviceName: "Test Service"
    };
    testSaga(handleLoadMessageData, action)
      .next()
      .race({
        polling: call(testable!.loadMessageData, action.payload),
        cancelAction: take(cancelGetMessageDataAction)
      } as unknown as { [key: string]: Effect })
      .next({ polling: successPayload }) // Simulate loadMessageData completing first
      .isDone();
  });
  it("should start a race between loadMessageData and cancellation, and handle cancellation", () => {
    const messageId = "01JP5D5R15CRAG7D1FHE5TEE24";
    const action = getMessageDataAction.request({
      fromPushNotification: false,
      messageId
    });

    const cancelAction = cancelGetMessageDataAction();

    testSaga(handleLoadMessageData, action)
      .next()
      .race({
        polling: call(testable!.loadMessageData, action.payload),
        cancelAction: take(cancelGetMessageDataAction)
      } as unknown as { [key: string]: Effect })
      .next({ cancelAction }) // Simulate cancel action arriving first
      .isDone();
  });
});
