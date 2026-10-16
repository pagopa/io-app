import { fakerIT as faker } from "@faker-js/faker";
import { CreatedMessageWithContent } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "@io-app/api-types/generated/definitions/communication/FiscalCode";
import { MessageStatusAttributes } from "@io-app/api-types/generated/definitions/communication/MessageStatusAttributes";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as A from "fp-ts/lib/Array";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import fs from "fs";
import _ from "lodash";

import { ioDevServerConfig } from "./config";
import MessagesDB from "./features/messages/persistence/messagesDatabase";
import {
  createMessage,
  withContent,
  withDueDate,
  withPaymentData,
  withRemoteContent
} from "./features/messages/persistence/messagesPayload";
import {
  AggregatedMessage,
  productionMessagesFileRelativePath
} from "./features/messages/routers/productionCrawlerRouter";
import { LegacyGreenPass } from "./features/messages/types/LegacyGreenPass";
import { MessageTemplate } from "./features/messages/types/messageTemplate";
import { MessageTemplateWrapper } from "./features/messages/types/messageTemplateWrapper";
import {
  createSENDMessagesOnIO,
  createSENDOptInMessage
} from "./features/pn/services/dataService";
import ServicesDB from "./features/services/persistence/servicesDatabase";
import { initializeServiceLogoMap } from "./routers/services_metadata";
import { IoDevServerConfig } from "./types/config";
import { getRandomValue } from "./utils/random";
import {
  frontMatter1CTABonusCgn,
  frontMatter1CTAFims,
  frontMatter1CTAV2BonusCgnDetails,
  frontMatter2CTA2,
  frontMatterCTAFCISignatureRequest,
  frontMatterCTAFCISignatureRequestCancelled,
  frontMatterCTAFCISignatureRequestExpired,
  frontMatterCTAFCISignatureRequestNoFields,
  frontMatterCTAFCISignatureRequestRejected,
  frontMatterCTAFCISignatureRequestSigned,
  frontMatterCTAFCISignatureRequestSignedExpired,
  frontMatterCTAFCISignatureRequestWaitQtsp,
  messageFciMarkdown,
  messageFciSignedMarkdown,
  messageMarkdown
} from "./utils/variables";

const getServiceId = (): string => {
  const servicesSummaries = ServicesDB.getSummaries(true);
  if (servicesSummaries.length === 0) {
    throw new Error(
      "to create messages, at least one sender service must exist!"
    );
  }
  return getRandomValue(
    servicesSummaries[0].service_id,
    faker.helpers.arrayElement(servicesSummaries).service_id,
    "messages"
  );
};

export const getNewMessage = (
  customConfig: IoDevServerConfig,
  subject: string,
  markdown: string,
  legacyGreenPass?: LegacyGreenPass,
  serviceId?: string
): CreatedMessageWithContentAndAttachments =>
  withContent(
    createMessage(
      customConfig.profile.attrs.fiscal_code,
      serviceId ?? getServiceId()
    ),
    subject,
    markdown,
    legacyGreenPass
  );

const createMessagesWithCTA = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  pipe(
    customConfig.messages.withCTA,
    B.fold(
      () => [],
      () => [
        getNewMessage(
          customConfig,
          `2 nested CTA`,
          frontMatter2CTA2 + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA start CGN`,
          frontMatter1CTABonusCgn + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA v2 CGN details`,
          frontMatter1CTAV2BonusCgnDetails + messageMarkdown
        ),
        getNewMessage(
          customConfig,
          `1 CTA start FIMS SSO`,
          frontMatter1CTAFims + messageMarkdown
        )
      ]
    )
  );

const createMessagesWithLegacyGreenPass = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  pipe(
    customConfig.messages.generateLegacyGreenPassMessage,
    B.fold(
      () => [],
      () => [
        getNewMessage(customConfig, `🏥 Legacy Green Pass`, messageMarkdown, {
          auth_code: "auth1"
        })
      ]
    )
  );

const createMessagesWithFirmaConIOWaitForSignature = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.waitForSignatureCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_SIGNATURE] - ${index}`,
      frontMatterCTAFCISignatureRequest + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOExpired = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.expiredCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [EXPIRED] - ${index}`,
      frontMatterCTAFCISignatureRequestExpired + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOQTSP = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.waitForQtspCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WAIT_FOR_QTSP] - ${index} `,
      frontMatterCTAFCISignatureRequestWaitQtsp + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIOExpired90 = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.expired90Count, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [90 days expired] ${index} `,
      frontMatterCTAFCISignatureRequestSignedExpired + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIOSigned = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.signedCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [SIGNED] - ${index} `,
      frontMatterCTAFCISignatureRequestSigned + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIORejected = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.rejectedCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [REJECTED] - ${index} `,
      frontMatterCTAFCISignatureRequestRejected + messageFciSignedMarkdown
    )
  );

const createMessagesWithFirmaConIONoSignatureFields = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.noSignatureFieldsCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [WITH NO SIGNATURE FIELDS] - ${index} `,
      frontMatterCTAFCISignatureRequestNoFields + messageFciMarkdown
    )
  );

const createMessagesWithFirmaConIONCancelled = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.fci.canceledCount, index =>
    getNewMessage(
      customConfig,
      `Comune di Controguerra - Richiesta di Firma [CANCELLED] - ${index} `,
      frontMatterCTAFCISignatureRequestCancelled + messageFciMarkdown
    )
  );

const createMessagesWithStandard = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.standardMessageCount, index =>
    getNewMessage(customConfig, `standard message - ${index}`, messageMarkdown)
  );

const createMessagesWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.withValidDueDateCount, index =>
    withDueDate(
      getNewMessage(
        customConfig,
        `🕙✅ due date valid - ${index}`,
        messageMarkdown
      ),
      new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
    )
  );

const createMessagesWithInvalidDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.withInValidDueDateCount, index =>
    withDueDate(
      getNewMessage(
        customConfig,
        `🕙❌ due date invalid - ${index}`,
        messageMarkdown
      ),
      new Date(date.getTime() - 60 * 1000 * 60 * 24 * 8)
    )
  );

const createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(
    customConfig.messages.paymentInvalidAfterDueDateWithExpiredDueDateCount,
    index =>
      pipe(
        getNewMessage(
          customConfig,
          `💰🕙❌ payment - expired - invalid after due date - ${index}`,
          messageMarkdown
        ),
        createdMessageWithContentAndAttachments =>
          withPaymentData(createdMessageWithContentAndAttachments, true),
        E.fold(
          error => {
            throw error;
          },
          createdMessageWithContent =>
            withDueDate(
              createdMessageWithContent,
              new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
            )
        )
      )
  );

const createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(
    customConfig.messages.paymentInvalidAfterDueDateWithValidDueDateCount,
    index =>
      pipe(
        getNewMessage(
          customConfig,
          `💰🕙✅ payment - valid - invalid after due date - ${index}`,
          messageMarkdown
        ),
        createdMessageWithContentAndAttachments =>
          withPaymentData(createdMessageWithContentAndAttachments, true),
        E.fold(
          error => {
            throw error;
          },
          createdMessageWithContent =>
            withDueDate(
              createdMessageWithContent,
              new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
            )
        )
      )
  );

const createMessagesWithPaymentWithExpiredDueDateCount = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.paymentWithExpiredDueDateCount, index =>
    pipe(
      getNewMessage(
        customConfig,
        `💰🕙 payment - expired - ${index}`,
        messageMarkdown
      ),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, false),
      E.fold(
        error => {
          throw error;
        },
        createdMessageWithContent =>
          withDueDate(
            createdMessageWithContent,
            new Date(date.getTime() - 60 * 1000 * 60 * 24 * 3)
          )
      )
    )
  );

const createMessagesWithPaymentWithValidDueDate = (
  customConfig: IoDevServerConfig,
  date: Date
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.paymentWithValidDueDateCount, index =>
    pipe(
      getNewMessage(
        customConfig,
        `💰🕙✅ payment message - ${index}`,
        messageMarkdown
      ),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, true),
      E.fold(
        error => {
          throw error;
        },
        createdMessageWithContent =>
          withDueDate(
            createdMessageWithContent,
            new Date(date.getTime() + 60 * 1000 * 60 * 24 * 8)
          )
      )
    )
  );

const createMessagesWithPayments = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  A.makeBy(customConfig.messages.paymentsCount, index =>
    pipe(
      getNewMessage(customConfig, `💰✅ payment - ${index} `, messageMarkdown),
      createdMessageWithContentAndAttachments =>
        withPaymentData(createdMessageWithContentAndAttachments, true),
      E.fold(
        error => {
          throw error;
        },
        _ => _
      )
    )
  );

const createMessageWithRemoteContent = (
  template: MessageTemplate,
  fiscalCode: FiscalCode,
  templateIndex: number,
  messageIndex: number,
  markdown: string
): CreatedMessageWithContent | ThirdPartyMessageWithContent =>
  pipe(
    {
      sender: `Sender - ${templateIndex} / ${messageIndex}`,
      subject: "Message with remote content"
    },
    sharedData =>
      pipe(
        createMessage(fiscalCode, getServiceId()),
        createdMessageWithoutContent =>
          withContent(
            createdMessageWithoutContent,
            `${sharedData.sender}: ${sharedData.subject}`,
            markdown
          ),
        createdMessageWithContent =>
          pipe(
            template,
            O.fromPredicate(t => t.hasRemoteContent || t.attachmentCount > 0),
            O.fold(
              () => createdMessageWithContent,
              () =>
                withRemoteContent(template, createdMessageWithContent, markdown)
            )
          )
      )
  );

const createMessagesWithRemoteContent = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> =>
  pipe(
    customConfig.messages.messageTemplateWrappers,
    O.fromNullable,
    O.map(messageTemplateWrappers =>
      pipe(
        messageTemplateWrappers as Array<MessageTemplateWrapper>,
        A.mapWithIndex((templateIndex, messageTemplateWrapper) =>
          A.makeBy(messageTemplateWrapper.count, messageIndex =>
            createMessageWithRemoteContent(
              messageTemplateWrapper.template,
              customConfig.profile.attrs.fiscal_code,
              templateIndex,
              messageIndex,
              messageMarkdown
            )
          )
        ),
        A.flatten
      )
    ),
    O.getOrElse(() => [] as Array<CreatedMessageWithContentAndAttachments>)
  );

const createMessages = (
  customConfig: IoDevServerConfig
): Array<CreatedMessageWithContentAndAttachments> => {
  const now = new Date();

  return [
    /* with CTAs */
    ...createMessagesWithCTA(customConfig),

    /* with legacy Green Pass */
    ...createMessagesWithLegacyGreenPass(customConfig),

    /* Firma con IO */
    ...createMessagesWithFirmaConIOWaitForSignature(customConfig),
    ...createMessagesWithFirmaConIOExpired(customConfig),
    ...createMessagesWithFirmaConIOQTSP(customConfig),
    ...createMessagesWithFirmaConIOExpired90(customConfig),
    ...createMessagesWithFirmaConIOSigned(customConfig),
    ...createMessagesWithFirmaConIORejected(customConfig),
    ...createMessagesWithFirmaConIONoSignatureFields(customConfig),
    ...createMessagesWithFirmaConIONCancelled(customConfig),

    /* standard message */
    ...createMessagesWithStandard(customConfig),

    /* due date */
    ...createMessagesWithValidDueDate(customConfig, now),
    ...createMessagesWithInvalidDueDateCount(customConfig, now),

    /* payments */
    ...createMessagesWithPaymentInvalidAfterDueDateWithExpiredDueDate(
      customConfig,
      now
    ),
    ...createMessagesWithPaymentInvalidAfterDueDateWithValidDueDate(
      customConfig,
      now
    ),
    ...createMessagesWithPaymentWithExpiredDueDateCount(customConfig, now),
    ...createMessagesWithPaymentWithValidDueDate(customConfig, now),
    ...createMessagesWithPayments(customConfig),

    ...createSENDOptInMessage(customConfig),
    ...createSENDMessagesOnIO(customConfig),

    ...createMessagesWithRemoteContent(customConfig)
  ];
};

const loadProductionInboxAndArchive = (customConfig: IoDevServerConfig) => {
  const inboxProductionMessages = loadAndParseProductionMessages(
    false,
    customConfig
  );
  const archiveProductionMessages = loadAndParseProductionMessages(
    true,
    customConfig
  );
  MessagesDB.replaceMessages(true, archiveProductionMessages);
  MessagesDB.replaceMessages(false, inboxProductionMessages);
};

const loadAndParseProductionMessages = (
  archived: boolean,
  customConfig: IoDevServerConfig
): ReadonlyArray<CreatedMessageWithContentAndAttachments> => {
  const productionMessagesString = fs.readFileSync(
    productionMessagesFileRelativePath(archived),
    "utf-8"
  );
  const productionMessagesJSON = JSON.parse(
    productionMessagesString
  ) as ReadonlyArray<AggregatedMessage>;
  return productionMessagesJSON.map(({ message }, index) => {
    if (message == null) {
      throw Error(
        `loadAndParseProductionMessages ${
          archived ? "archive" : "inbox"
        }: expected property 'message' in array item at '${index}' but found a nullish value instead`
      );
    }
    const messageEither =
      CreatedMessageWithContentAndAttachments.decode(message);
    if (E.isLeft(messageEither)) {
      throw Error(
        `loadAndParseProductionMessages ${
          archived ? "archive" : "inbox"
        }: deconding error for array item at '${index}' ${readableReport(
          messageEither.left
        )}`
      );
    }

    return {
      ...getNewMessage(
        customConfig,
        message.content.subject,
        message.content.markdown
      ),
      content: {
        ...message.content
      },
      created_at: message.created_at,
      ...attributesFromCreatedMessageWithContentAndAttachments(message)
    };
  });
};

const attributesFromCreatedMessageWithContentAndAttachments = (
  message: CreatedMessageWithContentAndAttachments
): MessageStatusAttributes => {
  const statusAttributes = MessageStatusAttributes.decode(message);
  if (E.isLeft(statusAttributes)) {
    return {
      is_archived: false,
      is_read: false
    };
  }
  return {
    is_archived: statusAttributes.right.is_archived,
    is_read: statusAttributes.right.is_read
  };
};

/**
 * Initialize the services and messages persistence layer. Default on
 * config.json if custom config not defined.
 *
 * @param customConfig
 */
export default function init(customConfig = ioDevServerConfig) {
  initializeServiceLogoMap();
  ServicesDB.createServices(customConfig);

  if (customConfig.messages.useMessagesSavedUnderConfig) {
    loadProductionInboxAndArchive(customConfig);
  } else {
    const messages = createMessages(customConfig);
    MessagesDB.persist(messages);

    if (customConfig.messages.archivedMessageCount > 0) {
      const allInboxMessages = MessagesDB.findAllInbox();
      const archivableInboxMessages = allInboxMessages.filter(
        message => !ServicesDB.isSpecialService(message.sender_service_id)
      );
      _.shuffle(archivableInboxMessages)
        .slice(0, customConfig.messages.archivedMessageCount)
        .forEach(({ id }) => MessagesDB.archive(id));
    }
  }

  if (customConfig.messages.liveMode) {
    // if live updates is on, we prepend new messages to the collection
    const count = customConfig.messages.liveMode.count || 2;
    const interval = customConfig.messages.liveMode.interval || 2000;
    setInterval(() => {
      const nextMessages = createMessages(customConfig);
      const nextShuffledMessages = _.shuffle(nextMessages).slice(
        0,
        Math.min(count, nextMessages.length - 1)
      );
      MessagesDB.persist(nextShuffledMessages);
    }, interval);
  }
}
