import { fakerIT as faker } from "@faker-js/faker";
import { CreatedMessageWithContent } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithContent";
import { CreatedMessageWithoutContent } from "@io-app/api-types/generated/definitions/communication/CreatedMessageWithoutContent";
import { FiscalCode } from "@io-app/api-types/generated/definitions/communication/FiscalCode";
import { HasPreconditionEnum } from "@io-app/api-types/generated/definitions/communication/HasPrecondition";
import { NewMessageContent } from "@io-app/api-types/generated/definitions/communication/NewMessageContent";
import { PaymentAmount } from "@io-app/api-types/generated/definitions/communication/PaymentAmount";
import { PaymentNoticeNumber } from "@io-app/api-types/generated/definitions/communication/PaymentNoticeNumber";
import { ThirdPartyAttachment } from "@io-app/api-types/generated/definitions/communication/ThirdPartyAttachment";
import { ThirdPartyMessagePrecondition } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessagePrecondition";
import { ThirdPartyMessageWithContent } from "@io-app/api-types/generated/definitions/communication/ThirdPartyMessageWithContent";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as A from "fp-ts/lib/Array";
import * as B from "fp-ts/lib/boolean";
import * as E from "fp-ts/lib/Either";
import { constUndefined, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as S from "fp-ts/lib/string";
import * as path from "path";

import { assetsFolder } from "../../../config";
import { PaymentsDatabase } from "../../../persistence/payments";
import { contentTypeMapping, listDir } from "../../../utils/file";
import { getRandomIntInRange } from "../../../utils/id";
import { rptIdFromPaymentDataWithRequiredPayee } from "../../../utils/payment";
import { validatePayload } from "../../../utils/validator";
import ServicesDB from "../../services/persistence/servicesDatabase";
import { AttachmentCategory } from "../types/attachmentCategory";
import { LegacyGreenPass } from "../types/LegacyGreenPass";
import {
  MessageTemplate,
  MessageTemplatePreconditions
} from "../types/messageTemplate";
import { nextMessageIdAndCreationDate } from "../utils";

/**
 * Generate basic message data based on fiscal code, sender ID, and time to live
 * @param fiscalCode
 * @param senderServiceId
 * @param timeToLive
 */
export const createMessage = (
  fiscalCode: FiscalCode,
  senderServiceId: string,
  timeToLive = 3600
): CreatedMessageWithoutContent => {
  const { id, created_at } = nextMessageIdAndCreationDate();
  return validatePayload(CreatedMessageWithoutContent, {
    created_at,
    fiscal_code: fiscalCode,
    id,
    sender_service_id: senderServiceId,
    time_to_live: timeToLive
  });
};

export const withDueDate = (
  message: CreatedMessageWithContent,
  dueDate: Date
): CreatedMessageWithContent => ({
  ...message,
  content: { ...message.content, due_date: dueDate }
});

export const withRemoteContent = (
  template: MessageTemplate,
  message: CreatedMessageWithContent,
  markdown: string
): ThirdPartyMessageWithContent => ({
  ...message,
  content: {
    ...message.content,
    third_party_data: {
      ...message.content.third_party_data,
      id: message.id as NonEmptyString,
      has_attachments: template.attachmentCount > 0,
      has_remote_content: template.hasRemoteContent,
      has_precondition: fromTemplateHasPreconditionsToEnumHasPreconditions(
        template.hasPreconditions
      )
    }
  },
  third_party_message: {
    details: pipe(
      template.hasRemoteContent,
      B.fold(constUndefined, () => ({
        subject: faker.lorem.sentence(template.subjectWordCount),
        markdown
      }))
    ),
    attachments: pipe(
      template.attachmentCount > 0,
      B.fold(constUndefined, () =>
        getRemoteAttachments(template.attachmentCount)
      )
    )
  }
});

const serviceFromMessage = (
  message: CreatedMessageWithContent
): E.Either<Error, Readonly<ServiceDetails>> =>
  pipe(message.sender_service_id, serviceId =>
    pipe(
      serviceId,
      ServicesDB.getService,
      E.fromNullable(
        Error(
          `serviceFromMessage: unabled to find service with id (${serviceId})`
        )
      )
    )
  );

export const withPaymentData = (
  message: CreatedMessageWithContent,
  invalidAfterDueDate = false,
  noticeNumber = `0${faker.string.numeric(17)}`,
  amount: number = getRandomIntInRange(1, 10000)
): E.Either<Error, CreatedMessageWithContent> =>
  pipe(
    message,
    serviceFromMessage,
    E.chain(service =>
      pipe(
        PaymentsDatabase.createPaymentData(
          service.organization.fiscal_code,
          invalidAfterDueDate,
          noticeNumber as PaymentNoticeNumber,
          amount as PaymentAmount
        ),
        E.map(paymentDataWithRequiredPayee =>
          pipe(
            PaymentsDatabase.createProcessablePayment(
              rptIdFromPaymentDataWithRequiredPayee(
                paymentDataWithRequiredPayee
              ),
              amount as PaymentAmount,
              service.organization.fiscal_code,
              service.organization.name
            ),
            _ => ({
              ...message,
              content: {
                ...message.content,
                payment_data: paymentDataWithRequiredPayee
              }
            })
          )
        ),
        E.mapLeft(errors => Error(errors.join("\n")))
      )
    )
  );

export const withContent = (
  message: CreatedMessageWithoutContent,
  subject: string,
  markdown: string,
  legacyGreenPass?: LegacyGreenPass
): CreatedMessageWithContent => {
  const content = validatePayload(NewMessageContent, {
    subject,
    markdown,
    eu_covid_cert: legacyGreenPass
  });
  return { ...message, content };
};

export const defaultContentType = "application/octet-stream";

const thirdPartyAttachmentFromAbsolutePathArray =
  (count: number, idOffset = 0, category: AttachmentCategory = "DOCUMENT") =>
  (absolutePaths: Array<string>) =>
    pipe(
      absolutePaths,
      A.filter(absolutePath => absolutePath.endsWith("pdf")),
      pdfAbsolutePaths =>
        A.makeBy(count, attachmentIndex =>
          pipe(
            attachmentIndex % pdfAbsolutePaths.length,
            pdfIndex => pdfAbsolutePaths[pdfIndex],
            pdfAbsolutePath =>
              pipe(
                pdfAbsolutePath,
                path.parse,
                parsedPDFFile =>
                  ({
                    id: `${idOffset + attachmentIndex}`,
                    category,
                    name: parsedPDFFile.name,
                    content_type: contentTypeFromParsedFile(parsedPDFFile),
                    url: attachmentUrlFromAbsolutePath(pdfAbsolutePath)
                  }) as ThirdPartyAttachment
              )
          )
        )
    );

const contentTypeFromParsedFile = (parsedFile: path.ParsedPath) =>
  pipe(
    parsedFile.ext,
    extensionWithDot => extensionWithDot.slice(1),
    extension => contentTypeMapping[extension],
    O.fromNullable,
    O.getOrElse(() => defaultContentType)
  );

const attachmentUrlFromAbsolutePath = (absolutePath: string) =>
  pipe(path.resolve("."), executionDirectoryAbsolutePath =>
    pipe(absolutePath, S.replace(executionDirectoryAbsolutePath, ""))
  );

const getRemoteAttachments = (
  attachmentCount: number
): ReadonlyArray<ThirdPartyAttachment> =>
  pipe(
    path.join(assetsFolder, "messages", "remote", "attachments"),
    remoteAttachmentFolderAbsolutePath =>
      pipe(
        remoteAttachmentFolderAbsolutePath,
        listDir,
        A.map(fileNameWithExtension =>
          path.join(remoteAttachmentFolderAbsolutePath, fileNameWithExtension)
        ),
        thirdPartyAttachmentFromAbsolutePathArray(attachmentCount)
      )
  );

export const getThirdPartyMessagePrecondition =
  (): ThirdPartyMessagePrecondition => ({
    title: "Comunicazione a valore legale",
    markdown: `\nAprire il messaggio su IO equivale a firmare la ricevuta di ritorno di una raccomandata tradizionale.\n\n:u[Questo è il testo che non viene sottolineato con il nuovo markdown]\n\n**Mittente**: Comune di Inesistente\n**Oggetto**: Infrazione al codice della strada\n**Data e ora**: 12 Luglio 2022 - 12.36  \n**Codice ATTO**: YYYYMM-1-ABCD-EFGH-X`
  });

const fromTemplateHasPreconditionsToEnumHasPreconditions = (
  preconditions: MessageTemplatePreconditions | undefined
): HasPreconditionEnum => {
  switch (preconditions) {
    case "ALWAYS":
      return HasPreconditionEnum.ALWAYS;
    case "ONCE":
      return HasPreconditionEnum.ONCE;
    default:
      return HasPreconditionEnum.NEVER;
  }
};
