import { testSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { testable } from "../handleLoadMessageData";
import { UIMessage, UIMessageDetails, UIMessageId } from "../../types";
import { getPaginatedMessageById } from "../../store/reducers/paginatedById";
import {
  getMessageDataAction,
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage,
  upsertMessageStatusAttributes
} from "../../store/actions";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { serviceByIdPotSelector } from "../../../services/details/store/reducers";
import { loadServiceDetail } from "../../../services/details/store/actions/details";
import { messageDetailsByIdSelector } from "../../store/reducers/detailsById";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { thirdPartyFromIdSelector } from "../../store/reducers/thirdPartyById";
import { TagEnum } from "../../../../../definitions/backend/MessageCategoryPN";
import { isPnEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isLoadingOrUpdatingInbox } from "../../store/reducers/allPaginated";
import { ThirdPartyMessage } from "../../../../../definitions/backend/ThirdPartyMessage";
import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import { ServicePublic } from "../../../../../definitions/backend/ServicePublic";
import { trackMessageDataLoadFailure } from "../../analytics";
import { MessageGetStatusFailurePhaseType } from "../../store/reducers/messageGetStatus";

const fimsCTAFrontMatter =
  '---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "iosso://https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "iosso://https://relyingParty.url"\n---';

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
  it("when no service is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { service_id: serviceId } as ServicePublic;
    testSaga(testable!.getServiceDetails, serviceId)
      .next()
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.none)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when an error is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { service_id: serviceId } as ServicePublic;
    testSaga(testable!.getServiceDetails, serviceId)
      .next()
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.noneError)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when a service with error is in store, it should dispatch a loadServiceDetail.request and retrieve its result from the store if it succeeds", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { service_id: serviceId } as ServicePublic;
    testSaga(testable!.getServiceDetails, serviceId)
      .next()
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.someError({}, new Error()))
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(loadServiceDetail.success(serviceDetails))
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when a service is in store, it should return its details", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = { service_id: serviceId } as ServicePublic;
    testSaga(testable!.getServiceDetails, serviceId)
      .next()
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.some(serviceDetails))
      .returns(serviceDetails);
  });
  it("when no service is in store, it should dispatch a loadServiceDetail.request but return undefined if the related saga fails", () => {
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    testSaga(testable!.getServiceDetails, serviceId)
      .next()
      .select(serviceByIdPotSelector, serviceId)
      .next(pot.none)
      .put(loadServiceDetail.request(serviceId))
      .next()
      .take([loadServiceDetail.success, loadServiceDetail.failure])
      .next(
        loadServiceDetail.failure({ service_id: serviceId, error: new Error() })
      )
      .returns(undefined);
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
    const service = {
      service_id: "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId,
      service_name: "The name",
      organization_name: "Org name",
      organization_fiscal_code: "OrgFisCod"
    } as ServicePublic;
    const messageCategoryTag = "GENERIC";
    const thirdPartyMessage = { id: "1" } as ThirdPartyMessageWithContent;
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
          serviceId: service.service_id,
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const service = {
      service_id: "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId,
      service_name: "The name",
      organization_name: "Org name",
      organization_fiscal_code: "OrgFisCod"
    } as ServicePublic;
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
          serviceId: service.service_id,
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with no attachments", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnEnabledSelector)
      .next(true)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message without Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {} as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
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
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a message with Payment", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = { paymentData: {} } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: true,
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
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a legacy EU Covid message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const authCode = "authCode";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
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
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a standard message with the FIMS CTA", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
    } as UIMessage;
    const messageDetails = {
      markdown: fimsCTAFrontMatter
    } as UIMessageDetails;
    const expectedOutput = {
      containsAttachments: false,
      containsPayment: false,
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
      .select(isPnEnabledSelector)
      .next(false)
      .put(getMessageDataAction.success(expectedOutput))
      .next()
      .isDone();
  });
  it("should properly report a Third Party message with FIMS CTA", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceName = "serName";
    const organizationName = "orgName";
    const organizationFiscalCode = "orgFisCod";
    const isRead = true;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      organizationName,
      organizationFiscalCode,
      serviceName,
      isRead,
      category: { tag: "GENERIC" }
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
      .select(isPnEnabledSelector)
      .next(true)
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
      .call(testable!.commonFailureHandling, "paginatedMessage", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if getMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(undefined)
      .call(testable!.commonFailureHandling, "messageDetails", false)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a PN message", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: TagEnum.PN }
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.commonFailureHandling, "preconditions", true, true)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if the action started from a Push Notification for a message with preconditions", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: true
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
      .next(serviceDetails)
      .call(testable!.getMessageDetails, messageId)
      .next(messageDetails)
      .call(testable!.commonFailureHandling, "preconditions", true, true)
      .next()
      .isDone();
  });
  it("should dispatch a getMessageDataAction.failure if thirdPartyMessageDetails returns a failure", () => {
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "GENERIC";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const tag = "PN";
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag },
      hasPrecondition: true
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
    const messageId = "01HGP8EMP365Y7ANBNK8AJ87WD" as UIMessageId;
    const serviceId = "01J5WS3X839BXX6R1CMM51AB8R" as ServiceId;
    const paginatedMessage = {
      id: messageId,
      serviceId,
      category: { tag: "GENERIC" },
      hasPrecondition: false
    } as UIMessage;
    const serviceDetails = {
      service_id: serviceId
    } as ServicePublic;
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
      .call(testable!.getServiceDetails, serviceId)
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
  const fimsCTA2FrontMatter = `---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "https://relyingParty.url"\n cta_2:\n  text: "Visualizza i requisiti"\n  action: "iosso://https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "https://relyingParty.url"\n cta_2:\n  text: "View requirements"\n  action: "iosso://https://relyingParty.url"\n---`;
  const unrelatedCTAFrontMatter =
    '---\nit:\n cta_1:\n  text: "Visualizza i documenti"\n  action: "https://relyingParty.url"\n cta_1:\n  text: "Visualizza i requisiti"\n  action: "https://relyingParty.url"\nen:\n cta_1:\n  text: "View documents"\n  action: "https://relyingParty.url"\n cta_1:\n  text: "View requirements"\n  action: "https://relyingParty.url"\n---';
  it("should return true for a standard message with FIMS cta (cta1)", () => {
    const messageDetails = {
      markdown: `${fimsCTAFrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(messageDetails, undefined);

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return true for a standard message with FIMS cta (cta2)", () => {
    const messageDetails = {
      markdown: `${fimsCTA2FrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(messageDetails, undefined);

    expect(hasFIMSCTA).toBe(true);
  });
  it("should return false for a standard message with no cta", () => {
    const messageDetails = {
      markdown: `This is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(messageDetails, undefined);

    expect(hasFIMSCTA).toBe(false);
  });
  it("should return false for a standard message with CTAs unrelated to FIMS", () => {
    const messageDetails = {
      markdown: `${unrelatedCTAFrontMatter}\nThis is the message body`
    } as UIMessageDetails;

    const hasFIMSCTA = testable!.computeHasFIMSCTA(messageDetails, undefined);

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
      remoteMessage
    );

    expect(hasFIMSCTA).toBe(false);
  });
});
